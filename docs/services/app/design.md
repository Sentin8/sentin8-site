---
title: "Sentin8:App - Architecture (DDD)"
sidebar_label: "Architecture (DDD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-app/edit/main/DESIGN.md
---
# DESIGN.md: Sentin8:App - Detailed Design Document

## 1. Scope & Context

Sentin8:App owns the app marketplace and the app-instance runtime surface:

- **Owns** (schema `app`): `store_listings` (visibility-tiered store
  catalog), `audit_events`, plus the DBX producer tables `outbox` and
  `audit_journal`. It also owns **instance lifecycle writes** to
  `sys.app_instances` (declared cross-schema DML grant - app is the
  instance owner by design; sys owns the table and reads it for the
  resolver).
- **Does NOT own**: identity/roles/groups (provisioning verbs ride auth's
  API), OAuth clients (DCR registration with auth, `oauth_client_id`
  stored), hostname→instance resolution (sys's resolver + TLS read
  `sys.app_instances`), branding truth (merged read from `sys.branding`),
  analytics properties (Stat's API), workflow execution (Flow).

```mermaid
graph TD
    subgraph users["Principals"]
        ADMIN["Store admin (Shield store:admin)"]
        OPERATOR["Env operator (instances:write)"]
        BROWSER["Browser (no token)"]
    end

    subgraph APP["sentin8:app"]
        STORE["Store API<br/>/v1/app/store/listings"]
        SETUP["Install API<br/>POST /v1/app/setup"]
        RUNTIME["Runtime context<br/>GET /v1/app/runtime/context"]
        ADMIN["Instance admin API<br/>domain / env-vars / flags / status"]
        STEPS["Flow proxy-back<br/>/v1/internal/steps/execute"]
    end

    AUTH["sentin8:auth<br/>(verify + DCR + provision)"]
    SYS["sys.app_instances<br/>(hosted DML)"]
    STAT["sentin8:stat"]
    BUS["sentin8:bus"]
    ST["sentin8:secrets"]

    ADMIN --> ADMIN
    OPERATOR --> SETUP
    BROWSER -- "X-Sentin8-App-Id" --> RUNTIME
    SETUP -- "DCR register client" --> AUTH
    SETUP -- "provision role/group" --> AUTH
    SETUP -- "INSERT/UPDATE app_instances" --> SYS
    APP -- "daily telemetry + aggregates" --> STAT
    APP -- "outbox relay + SSE listen" --> BUS
    ADMIN -- "env-vars resolve" --> ST
```

## 2. Runtime Architecture

```mermaid
graph TD
    subgraph API["API layer"]
        R["routes() (shell axum)"]
    end
    subgraph H["Handlers"]
        STORE["store listings CRUD<br/>(emit_event_tx in-tx)"]
        SETUPH["setup_instance<br/>(install saga, atomic)"]
        CTX["runtime_context<br/>(header-identity, public)"]
        ADM["instance admin<br/>(domain/env-vars/flags/status)"]
        UI["RFW admin UI + data<br/>(target_env_id REQUIRED)"]
        PB["execute_internal_step"]
    end
    subgraph BG["Background tasks (tokio::spawn)"]
        SEL["StatEventListener<br/>(SSE stat-pipeline → update_listing_metrics<br/>via POST /v1/m/metric → ACK)"]
        TELE["daily telemetry loop (24h)"]
        REG["one-shot Flow handler-profile register"]
    end
    subgraph ST["State"]
        POOL["capped PG pool"]
        OB["app.outbox (DBX)"]
        AJ["app.audit_journal (DBX)"]
    end

    R --> STORE & SETUPH & CTX & ADM & UI & PB["PB"]
    SETUPH --> AUTH2["AuthProvisioner + DCR"]
    SEL --> BUS2["bus SSE + ack"]
    SEL --> ING["stat ingest (POST /v1/m/metric,<br/>sentin8:stat:measure M2M)"]
    TELE --> STAT2["stat:measure"]
    STORE --> ST2["outbox/audit"]
```

**Request lifecycle - install (`POST /v1/app/setup`, the atomic path):**

```mermaid
sequenceDiagram
    autonumber
    participant OP as operator (instances:write)
    participant H as setup_instance
    participant SYS as sys.app_instances
    participant AUTH as sentin8:auth
    participant OUT as app.outbox

    OP->>H: POST /v1/app/setup {listing_id, env_id?}
    H->>H: verify + Shield + require_target_env_access
    alt no target env membership
        H-->>OP: 403 "no role or group in target env"
    end
    H->>SYS: INSERT app_instances status='provisioning'<br/>group_gate='strict', hostnames derived
    H->>SYS: SELECT listing oauth_defaults (allow-list check)
    alt oauth_defaults.redirect_uris present AND derived callback off-list
        H-->>OP: 400 (install FAILS - no off-list callback registered)
    end
    H->>AUTH: DCR register_oauth_client_with_grants<br/>(public PKCE, auth_code+refresh,<br/>redirect_uri = derived bff.{hostname}/auth/callback)
    Note over H: DCR failure = warn + continue<br/>(BFF fallback client)
    H->>AUTH: provision role + group + binding<br/>(sentin8:app:{instance_id}:*)
    alt provisioning fails
        H-->>OP: 500 (instance stays provisioning, retryable)
    end
    H->>SYS: UPDATE status='active'
    H--)OUT: outbox event sentin8:app:instance:created
    H-->>OP: 200 RFW redirect → instances
```

Failure branches: missing target env → 400; no RBAC membership → 403;
listing not published → 404; duplicate hostname → 409; derived
`https://bff.{hostname}/auth/callback` not in the listing's
`oauth_defaults.redirect_uris` allow-list → 400 (the listing
author decides where post-login redirects may land; without the key the
derived callback is the default first-party posture). `oauth_defaults`
lives on `app.store_listings`, not on `sys.app_instances`.

**Runtime context (public, header-identity):**

```mermaid
sequenceDiagram
    autonumber
    participant B as browser (via BFF)
    participant W as web proxy
    participant H as runtime_context
    participant DB as sys schema

    B->>W: GET /v1/app/runtime/context
    W->>H: forwards (TLS-injected X-Sentin8-App-Id/Hostname/Env-Id)
    H->>SYS: SELECT instance by app id/hostname + env
    alt instance not found
        H-->>W: 404
    else found
        H->>SYS: fetch merged branding (org base → env override)
        H-->>W: 200 {auth_domain, bff_domain, feature_flags,<br/>oauth_client_id, allow_signup, branding}
    end
```

## 3. Data Model

```mermaid
erDiagram
    STORE_LISTINGS ||--o{ APP_INSTANCES : "installed into"
    STORE_LISTINGS ||--o{ APP_AUDIT : "audited"
    APP_INSTANCES ||--o{ APP_OUTBOX : "emits via"
    STORE_LISTINGS {
        uuid id PK
        string app_slug
        string channel "stable|beta|dev - release train"
        string version "advisory release version"
        jsonb media "typed by-reference entries (bytes in Storage)"
        string status "draft|published|disabled|archived"
        string visibility "usr|env|public"
        uuid usr_id "usr tier owner"
        uuid env_id "env tier (NULL for public/usr)"
        string backend_url "developer metadata"
        jsonb oauth_defaults
        jsonb roles "includes-graph validated"
        string default_signup_role
        bool supports_dcr
    }
    LISTING_CATEGORIES {
        uuid id PK
        text category
        string app_slug
    }
    APP_INSTANCES {
        uuid id PK
        string hostname UK
        string sentin8_bff_hostname UK
        string status "provisioning|active|maintenance|offline"
        string group_gate "strict|self_service"
        text[] allowed_scopes
        text[] allowed_services
        string env_vars_ref "secret reference"
        jsonb feature_flags
        string oauth_client_id
    }
    APP_OUTBOX {
        uuid id PK
        uuid env_id
        string event_type
        string stream_family
        bool relayed
    }
```

- **Visibility-scoped RLS on `store_listings`** (visibility tiers):
  `public` → everyone; `env` → `env_id = current`; `usr` → owner subject
  or env-admin; all gated on `sentin8_context_initialized()`. Writes:
  owner or bypass. The `org` tier does not exist - org-wide reach is
  achieved via `public` or per-env installs.
- **Instance state machine** (`sys.app_instances.status`, maintained by
  app):

```mermaid
stateDiagram-v2
    [*] --> provisioning: install INSERT
    provisioning --> active: provisioning complete
    active --> maintenance: admin PUT status
    active --> offline: admin PUT status
    maintenance --> active: admin PUT status
    offline --> provisioning: reinstall path
    [*] --> deleted: uninstall (org+env scoped DELETE)
```

- **Listing state machine**: `draft → published → (disabled | archived)`;
  `visibility` immutable once published/disabled; delete is soft archive.
- **Secrets**: `env_vars_ref` stored by reference; the resolve endpoint
  returns the value once and never logs it.
- **Ownership note**: `sys.app_instances` is Sys-owned DDL with app as the
  declared DML owner - the only sanctioned cross-schema write grant
  (instance provisioning is app's domain by design).

## 4. API Surface

| Audience | Endpoint | Gate | Emits |
|----------|----------|------|-------|
| store | `POST/GET/PUT/DELETE /v1/app/store/listings[/{id}]` | Shield `app:store:admin` / `app:store:read` (RLS visibility under read) | `sentin8:app:listing:created\|updated\|archived` |
| setup | `POST /v1/app/setup`, `GET /v1/app/setup/{id}/status` | `app:instances:write` / read | `sentin8:app:instance:created` |
| runtime | `GET /v1/app/runtime/context` | **public** (TLS-injected instance headers) | - |
| admin | `/v1/app/admin/instances/{id}/(domain\|env-vars\|feature-flags\|status)`, `GET …/oauth-client`, `GET …/env-vars/resolve` | `app:instances:admin` | `instance:domain:updated`, `envvars:updated/resolved`, `featureflags:updated`, `status:updated` |
| uninstall | `POST /v1/admin/instances/uninstall` | Shield + target env RBAC | `sentin8:app:instance:uninstalled` |
| RFW | `GET /v1/admin/ui/{page}`, `GET /v1/admin/{resource}` | any of `store:read/store:admin/sys:admin/org:admin/env:admin` | - |
| internal | `POST /v1/internal/steps/execute` | Flow M2M bearer (`sentin8:app:steps:execute`-profile) | - |
| health | `GET /v1/health` | none | - |

**Event flow (outbox → Bus → trigger):**

```mermaid
sequenceDiagram
    autonumber
    participant H as handler tx
    participant O as app.outbox
    participant R as relay (shell)
    participant B as sentin8:bus stream app
    participant SEL as StatEventListener

    H->>O: INSERT event (same tx as domain write)
    alt tx rolls back
        Note over O: event row vanishes with the write<br/>(no orphan events)
    end
    R->>B: POST /v1/produce (M2M, idempotency_key)
    B-->>SEL: SSE sentin8:stat:aggregate:updated (stat-pipeline)
    SEL->>STAT: POST /v1/m/metric (M2M sentin8:stat:measure,<br/>property = event's property_id)
    SEL->>B: POST /v1/ack
    Note over SEL: payload-complete event → no callback fetch needed
```

## 5. Cross-Cutting Concerns

- **Auth**: shared `AuthClient` (5-min JWKS/discovery caches) + Shield on
  every guarded route; runtime context is intentionally unauthenticated -
  the TLS-injected instance headers are the caller identity.
- **Tenant resolution + RLS**: context set on the same connection inside
  one explicit transaction; uninitialized context sees nothing
  (fail-closed).
- **Idempotency**: install is retryable (provisioning verbs are
  idempotent); DCR re-registers on retry. Aggregate events are
  at-least-once (Bus SSE) - a redelivered event may double-apply a
  metric within the day-bucket (accepted for usage analytics; Stat's
  ingest dedupes per event id).
- **Rate limiting**: none (BFF/edge responsibility).
- **Audit journaling**: `app.audit_journal` rows written same-tx, pushed
  to the shared audit ingest; pushed flag marks completion; retries never
  drop rows.
- **Graceful drain**: shell-owned (SIGTERM → drain in-flight).
- **TLS**: in-process PQ termination via `sentin8-tls`; callbacks use the
  derived platform hostname.

## 6. Failure Modes & Recovery

```mermaid
flowchart TD
    A[install request] --> B[INSERT provisioning]
    B --> C{DCR register}
    C -- fail --> D[warn + continue<br/>BFF fallback client]
    C -- ok --> E[provision role+group via auth API]
    E -- fail --> F[500 - instance stays provisioning<br/>retry re-runs whole saga]
    E -- ok --> G[status=active + emit + audit]
    H[Bus SSE down] --> I[listener retries 2s backoff]
    I --> H
    J[Stat down] --> K[telemetry skipped, next 24h]
    L[sys unreachable] --> M[audit_journal rows queue<br/>pusher retries, never drops]
```

- Install is atomic in `sys.app_instances` but the HTTP provisioning calls
  are intentionally NOT transaction-wrapped (auth's tables) - retry
  resumption is idempotency-based.
- Event emission: in-tx for listing mutations (commit-atomic); best-effort
  post-tx for instance events.
- Runtime-context proxy target down → 502 surfaced to the app shell (web
  maps it verbatim).

## 7. Concurrency & Performance Model

```mermaid
graph LR
    REQ["request tasks"] --> POOL[("capped pool (3)")]
    SEL["StatEventListener task"] --> BUS1(("bus SSE"))
    TELE["telemetry loop (24h tick)"] --> STAT[("stat ingest")]
    RELAY["outbox relay (shell)"] --> PRODUCE["bus produce"]
    O[("app.outbox")] --> RELAY
    OJ[("app.audit_journal")] --> PUSH["audit push loop"]
```

- Pool shared by store reads, install saga, RFW data; heavy paths (listing
  lists) are single-query + RLS filtered.
- The stat listener is the only continuously consuming task; reconnect
  backoff 2s; ACK per message.
- Runtime context is read-per-request (no cache) - it is the app's
  first-paint call; single indexed hostname lookup.

## 8. Invariants, Insecure-Defaults Rejected, Unsafe Rationale

1. **Tokens never reach the client** - runtime context returns metadata
   only; OAuth flows ride the BFF.
2. **Visibility tiers enforced by RLS, not handler filters** - a
   `usr`/`env` listing is invisible (404) outside its tier; env-admin
   override is explicit (`sentin8_is_env_admin()`).
3. **`visibility` immutable after publish** - 400 on change (listing
   audience can't be silently widened).
4. **Role graph integrity** - `default_signup_role` must be a declared
   role; includes-graph is cycle-checked before save.
5. **Env vars are references** - resolved values are returned once, never
   logged, never stored plaintext.
6. **target_env_id required + RBAC-in-target check** on admin/setup
   surfaces - no cross-env writes without membership.
7. **Install hostnames derived deterministically** - default
   `{app_slug}.{env_slug}.{org_domain}`, BFF always `bff.{hostname}`;
   custom domains verified via TXT token before activation.
8. `group_gate='strict'` is fixed at install (fail-closed app-group gate;
   platform surfaces use self_service explicitly).
9. No `unsafe` blocks in the service.

## 9. Testing Strategy

```mermaid
graph TD
    U["Unit (shape + rules)<br/>listing validation, role graph cycles,<br/>domain token/verify, step executors,<br/>stat payload parse, DCR serialization"]
    DB["DB-backed integration<br/>(runtime-skip; service role DSN)<br/>RLS tier matrix, hostname roundtrip,<br/>outbox transactionality, audit RLS"]
    E["E2E (e2e-ts)<br/>store → install → runtime context<br/>through browser + BFF"]
    U --> DB --> E
```

- ~69 tests across 8 files; integration connects as the real
  `sentin8_app_service` role (NOBYPASSRLS) with sys-role fixtures -
  RLS tier assertions include the uninitialized-context fail-closed case.
- Deliberately not covered in-service: Stat property creation against the
  live service (error-path tests only), full Flow saga execution
  (platform e2e), browser flows.

## 10. Open Questions

- KYC/document Flow steps are stubs by contract; the delegation is: capture =
  Storage upload (presigned PUT + `X-Content-Sha256`), verification = a Flow
  workflow whose step proxy-calls the app's internal verify endpoint. The stub
  step definitions stay; only the target wiring changes.
- `stat_integration` property/M2M creation is library surface not yet wired;
  call the helper from `setup_instance`'s provision path.

---

**Design attribution:** sentin8:app and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

