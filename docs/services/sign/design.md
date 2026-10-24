---
title: "Sentin8:Sign - Architecture (DDD)"
sidebar_label: "Architecture (DDD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-sign/edit/main/DESIGN.md
---
# DESIGN: Sentin8:Sign - Detailed Design Document

> Audience: maintainers, reviewers, and architects modifying the
> service. For the overview read `README.md`; for the business
> functionality read `BUSINESS.md`.

## 1. Scope & Context

Sentin8:Sign owns the **electronic signature ceremony**: request
lifecycle, signer ceremonies, provider dispatch, evidence retention,
and the `sentin8:sign:*` event family. It does NOT own identity
assurance (auth does), document bytes (storage does), message delivery
(post does), or authorization decisions (Shield does).

```mermaid
graph TD
    subgraph callers["Callers"]
        BFF["sentin8:bff (user-driven ceremonies)"]
        SVC["Any vertical service (M2M create + consume events)"]
    end
    subgraph sign["Sentin8:Sign"]
        API["/v1/requests + /v1/requests/{id}/..."]
        SM["Ceremony state machine"]
        GW["QTSP gateway seam"]
        DB[("sign schema - PG")]
    end
    AUTH["sentin8:auth (identity + consent)"]
    STOR["sentin8:storage (documents)"]
    BUS["sentin8:bus (durable events)"]
    CRON["sentin8:cron (expiry sweep)"]
    SEC["sentin8:secrets (provider credentials)"]
    QTSP["QTSP / QSCD provider (external)"]

    BFF -->|"user token / POST /v1/requests"| API
    SVC -->|"M2M token / events consumed"| BUS
    API --> SM --> DB
    SM -->|"session + approval consent / auth plane"| AUTH
    SM -->|"document refs only"| STOR
    SM -->|"credentials by secret_ref"| SEC
    GW -->|"remote sign / external gateway"| QTSP
    SM -->|"outbox → produce"| BUS
    CRON -->|"/v1/internal/schedules/run"| API
```

Container view (internal modules):

```mermaid
graph TD
    subgraph signsvc["sentin8-sign (service repo)"]
        subgraph api["API layer"]
            H["handlers.rs"]
            AUI["admin_ui.rs (RFW)"]
        end
        subgraph domain["Domain"]
            CER["Ceremony state machine (in handlers, tx-scoped)"]
            REG["registration.rs (scopes, roles, SQL, policies, schedules)"]
        end
        subgraph storage["Storage + producers"]
            SQLI["sql/init.sql (sign schema)"]
            OUT["local outbox (DBX)"]
            AUDJ["audit journal (DBX)"]
        end
        subgraph sdk["SDK (consumers)"]
            SC["sdk/crates/sign (contracts + verify client)"]
            SF["sdk/facade (mini-facade)"]
        end
    end
    H --> CER
    CER --> SQLI
    CER --> OUT
    CER --> AUDJ
    SC -. re-export .-> SF
```

## 2. Runtime Architecture

The service boots on the platform `sentin8-shell` crate (registration
flag, PQ provider, config, capped pool, state binding, OpenAPI merge,
middleware stack, PQ-TLS listener are shell-owned). This repo supplies
only its registration data, state, and routes - identical to every
other platform service.

Components:
- **Router** (`server.rs`): request CRUD + ceremony endpoints + admin
  (RFW) + Shield policy-admin surface.
- **Handlers** (`handlers.rs`): the ceremony state machine, executed
  inside explicit tenant transactions; events ride the outbox in the
  same transaction.
- **Gateway dispatch** (in `handlers.rs`): trait-object seam - stub
  dispatch by default; QTSP adapters behind the same interface,
  credentials by `secret_ref`.
- **Registration** (`registration.rs`): scopes, admin roles, RLS
  policy set, SQL migrations, Cron schedule declarations, M2M grants.
- **Relays** (shell-owned DBX): outbox pusher → Bus, audit journal
  pusher → Sys.

Request lifecycle (request creation - the 8-step pipeline):

```mermaid
sequenceDiagram
    participant BFF as sentin8:bff
    participant H as sign handler
    participant SH as Shield
    participant DB as PG (sign schema)
    participant OB as outbox relay
    participant BUS as sentin8:bus

    BFF->>H: POST /v1/requests (bearer, documents, signers, level)
    H->>H: verify token (auth client, JWKS cache)
    H->>SH: authorize sentin8:sign:request:write (live roles)
    SH-->>H: permit
    H->>DB: BEGIN + set_tenant_context(env_id)
    H->>DB: INSERT signature_requests + signers + outbox row
    H->>DB: COMMIT
    H-->>BFF: 201 request metadata
    Note over OB: post-commit relay
    OB->>BUS: POST /v1/produce (M2M, idempotency_key = outbox row id)
    BUS-->>OB: 200 ack
    Note over BFF: failure branch: any 4xx/5xx returns before the INSERT - no partial state
```

## 3. Data Model

```mermaid
erDiagram
    SIGNATURE_REQUESTS ||--o{ SIGNERS : "has"
    SIGNATURE_REQUESTS {
        uuid id PK
        text title
        text status
        text signature_level
        jsonb documents
        uuid env_id
        timestamptz expires_at
        text created_by
        timestamptz completed_at
    }
    SIGNERS {
        uuid id PK
        uuid request_id FK
        text user_id
        text status
        timestamptz viewed_at
        timestamptz signed_at
        text signature_value
        jsonb evidence
        uuid env_id
    }
    OUTBOX {
        uuid id PK
        uuid env_id
        text event_type
        jsonb payload
    }
    AUDIT_JOURNAL {
        uuid id PK
        uuid env_id
        text action
    }
```

Tables (all RLS env-scoped, `FORCE ROW LEVEL SECURITY`, standard
tenant-match policy):
- `sign.signature_requests` - the request: title, status, level
  (`ades`|`qes`), documents (JSON array of storage refs + names +
  hashes), expiry, evidence snapshot at completion.
- `sign.signers` - per-signer ceremony: user id, status
  (`pending`|`viewed`|`signed`|`declined`), viewed/signed timestamps,
  signature value + provider evidence, session binding recorded at
  approval time.
- `sign.outbox`, `sign.audit_journal` - the standard DBX producer
  tables (generated from the SDK helpers).

State machine (`signature_requests.status` + per-signer `status`):

```mermaid
stateDiagram-v2
    [*] --> open : created
    open --> open : signer viewed
    open --> completed : all signers signed
    open --> declined : any signer declined
    open --> expired : expiry sweep
    open --> failed : provider dispatch failed
    completed --> [*]
    declined --> [*]
    expired --> [*]
    failed --> [*]
```

## 4. API Surface

| Endpoint | Audience | Gate | Events |
|---|---|---|---|
| `POST /v1/requests` | public (BFF/M2M) | `sentin8:sign:request:write` | `sentin8:sign:request:created` |
| `GET /v1/requests` | public | `sentin8:sign:request:read` | - |
| `GET /v1/requests/{id}` | public | `sentin8:sign:request:read` | - |
| `POST /v1/requests/{id}/view` | public (signer) | `sentin8:sign:signer:read` | `sentin8:sign:request:viewed` |
| `POST /v1/requests/{id}/approve` | public (signer, session-bound) | `sentin8:sign:signer:write` | `sentin8:sign:request:signed` / `:declined` / `:completed` |
| `GET /v1/requests/{id}/evidence` | public | `sentin8:sign:request:read` | - |
| `POST /v1/admin/sign/...` | admin (RFW) | `sentin8:sign:admin` | - |
| `GET /v1/admin/ui/{page}` | admin (RFW) | `sentin8:sign:admin` | - |
| `POST /v1/internal/schedules/run` | cron proxy-back | internal (M2M) | `sentin8:sign:request:expired` |
| Shield policy-admin (`/v1/admin/policy-sets/...`) | admin | `sentin8:sign:policy:*` | - |

The signer approval sequence (multi-party):

```mermaid
sequenceDiagram
    participant U as Signer (browser via BFF)
    participant H as sign handler
    participant A as sentin8:auth
    participant GW as gateway seam
    participant DB as PG

    U->>H: POST /v1/requests/{id}/view
    H->>A: verify session token
    H->>DB: mark signer viewed (+event, same tx)
    H-->>U: document refs + level
    U->>H: POST /v1/requests/{id}/approve
    H->>A: verify session + approval consent (session-bound)
    H->>GW: dispatch sign (document hash, signer id, level)
    alt provider error
        GW-->>H: error
        H->>DB: status=failed (+event, same tx)
        H-->>U: 502 provider error
    else success
        GW-->>H: signature value + evidence
        H->>DB: signer signed + request completed when last (+events, same tx)
        H-->>U: 200 signature evidence
    end
```

Event flow (outbox → Bus → consumer):

```mermaid
sequenceDiagram
    participant H as handler
    participant TX as PG transaction
    participant R as relay
    participant BUS as sentin8:bus
    participant CONS as consumer (vertical)

    H->>TX: domain row + outbox row (same tx)
    TX->>R: post-commit wake (LISTEN/NOTIFY)
    R->>BUS: POST /v1/produce (M2M, idempotency_key)
    BUS-->>R: ack
    BUS->>CONS: XADD bus:{env}:sign → consume (consumer group)
    Note over BUS: at-least-once + idempotent consumer = effectively-once
    Note over R: failure branch: next_retry_at backoff, retries until ack, never drops
```

## 5. Cross-Cutting Concerns

- **Auth**: bearer verification via the shared auth-client (JWKS
  cache); M2M callers verify with the platform token pipeline; scope
  pre-filter + Shield decision (live roles).
- **Tenant resolution + RLS**: `env_id` from the token; explicit
  `WHERE env_id = $N` on every query + the RLS backstop; context set on
  the same transaction as the query.
- **Idempotency**: create carries an optional client idempotency key
  (stored on the request row, unique per env); Bus events carry the
  outbox row id as the idempotency key.
- **Rate limiting**: platform middleware (bot protection rides the
  shell defaults).
- **Audit**: every state transition writes the local journal + spills
  to Sys (`sentin8:sys:audit:write`); signature evidence is
  business-audit-grade (who/when/what seen).
- **Graceful drain**: shell-owned upgrade drain (10s) - in-flight
  ceremonies commit or roll back atomically.
- **TLS**: platform PQ-TLS in-process termination via `sentin8-tls`
  (X25519MLKEM768 / ML-DSA-65; no classical fallback).

## 6. Failure Modes & Recovery

```mermaid
flowchart TD
    A[provider dispatch error] --> B{retryable?}
    B -- yes --> C[backoff 1s 5s 30s 2m 10m max 3]
    C --> D{success?}
    D -- no --> E[status=failed + event, same tx]
    B -- no --> E
    E --> F[DLQ-style terminal row - admin replay reopens request]
    G[Bus produce fail] --> H[outbox retry next_retry_at]
    H --> I[relay keeps rows until acked - never drops]
    J[crash mid-tx] --> K[tx rollback - no partial ceremony]
    L[expiry sweep while open] --> M[status=expired + event]
```

- **Crash mid-transaction**: the ceremony row + event row commit or
  roll back together (single tx) - no half-signed state.
- **Provider outage**: retry curve mirrors Post (1s→5s→30s→2m→10m, max
  3); terminal `failed` state is admin-replayable (reopen).
- **Bus outage**: outbox rows accumulate; relay drains post-recovery -
  events never lost (durable outbox rule).
- **Credential rotation**: provider credentials resolve at dispatch
  time through Secrets; rotation needs no restart.

## 7. Concurrency & Performance Model

- Tokio multi-thread runtime (shell-owned); handler concurrency =
  axum's default; no custom task spawning in this service.
- Pool capped at 3 (`sentin8::config::pg_pool::connect`).
- Hot path: request read + evidence fetch are single-query; ceremony
  transitions are single-tx; JWKS and discovery cached (auth-client
  5-min TTL).
- Backpressure: the gateway seam awaits the provider call inside the
  request - provider latency is the ceremony's latency, bounded by
  the HTTP client timeout.

## 8. Invariants

1. A signature request and its signers are only visible inside their
   `env_id` (RLS + explicit WHERE).
2. Signer approval binds to the approving session; replayed or
   cross-session approvals are rejected.
3. Completed evidence is append-only - no mutation after completion.
4. Documents are storage refs, never inline bytes.
5. Provider credentials exist only as `secret_ref` values.
6. Every state transition emits its event in the same transaction.
7. No `unsafe` code; signing keys/tokens never logged.

## 9. Testing Strategy

```mermaid
graph TD
    E2E["E2E (fleet smoke - UI/BFF only)"] --> INT["Integration (DB-backed)"]
    INT --> UNIT["Unit (pure functions, state machine)"]
```

- Unit: state transitions, session binding, payload shapes, level
  validation.
- Integration: ceremony round-trip, RLS isolation, outbox emission
  shape, expiry sweep effect.
- Drift: OpenAPI covers every served route.
- NOT tested here: provider-format specifics (per-adapter concern),
  BFF routing (bff's own suite), fleet boot (nightly).

## 10. Open Questions

- Deep AdES container verification (PAdES/XAdES) rides the gateway
  seam behind provider adapters; the SDK client verifies the service's
  evidence record.
- Multi-document package semantics (sign once over N docs) - model
  supports it; single-signature-per-package semantics TBD.
- Callback push to requester apps on completion (today: Bus events
  only).

---

**Architecture & Design:** Sentin8:Sign and its underlying concepts were
designed by [Hamid Jahanzad](https://www.linkedin.com/in/hamidjahanzad/).
