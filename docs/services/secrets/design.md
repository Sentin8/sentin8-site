---
title: "Sentin8:Secrets - Architecture (DDD)"
sidebar_label: "Architecture (DDD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-secrets/edit/main/DESIGN.md
---
# DESIGN.md: Sentin8:Secrets - Detailed Design Document

## 1. Scope & Context

Sentin8:Secrets is the platform's secret-reference store: provider
credentials, API keys, and webhook signing secrets are envelope-encrypted
at rest (AES-256-GCM under a 32-byte master key), addressed by name
(`stripe/api_key`), versioned on rotation, and revealed only through two
audited paths - the programmatic `POST /v1/secrets/resolve` and the
admin `reveal` - with an append-only reveal audit trail that is never
pruned.

- **Owns** (schema `secrets`): `secrets` (current values), `versions`
  (append-only rotation history), `reads` (reveal audit), `outbox`
  (DBX producer), `audit_journal`.
- **Does NOT own**: the secrets' lifecycle decisions (callers rotate and
  disable), provider connectivity, or key rotation scheduling (the daily
  version-prune sweep is a Sentin8:Cron schedule; re-encrypt stays
  manual).

```mermaid
graph TD
    subgraph CALLERS["Consumers"]
        AI["sentin8:ai (provider creds)"]
        POST["sentin8:post (gateway creds)"]
        FDX["bank8:fdx (provider tokens by ref)"]
        CRON["sentin8:cron (daily version-prune)"]
        ADM["Admins (RFW)"]
    end
    subgraph SEC["sentin8:secrets"]
        API["/v1/secrets (CRUD · rotate · reveal · resolve · reads)"]
        MAINT["/v1/secrets/maintenance/prune · re-encrypt"]
        ENC["AES-256-GCM envelope<br/>v2: + nonce + ct (raw BYTEA)"]
        MK["MasterKey (Zeroizing)"]
        S[("secrets.secrets<br/>RLS FORCE")]
        V[("secrets.versions<br/>append-only")]
        RD[("secrets.reads<br/>append-only, never pruned")]
        OB[("secrets.outbox → bus")]
    end
    AI & POST & FDX -- "M2M · Shield secret:read<br/>POST /v1/secrets/resolve" --> API
    API -- "resolve_internal" --> ENC --> S
    API -- "record_reveal (m2m)" --> RD
    ADM -- "admin reveal (user)" --> API
    CRON -- "Shield secret:admin" --> MAINT
    API -- "emit_event (publisher = caller JWT)" --> OB
    OB -- "relay" --> BUS["sentin8:bus"]
```

Trust boundary: plaintext exists only inside a request's scope -
`SecretValue` zeroizes on drop, the master key is a `Zeroizing` wrapper
that never prints, logs, or persists, and metadata surfaces are
value-free by construction.

## 2. Runtime Architecture

| Module | Role |
|---|---|
| `handlers.rs` | Secret CRUD (`PUT/GET/DELETE`), rotate, history, reveal, resolve (`secrets://` / `sentin8-secrets://` / bare name), reads audit, maintenance (prune/re-encrypt), cron proxy-back (`/v1/internal/schedules/run`: expiry-scan + version-prune); `emit_event` (outbox with the caller's publisher identity); inline SQL (no separate store module). |
| `admin_ui.rs` | RFW pages + admin CRUD + cross-env reveal/rotate (`resolve_env_id` requires admin roles for foreign envs). |
| `config.rs` | Master key load (fail-closed panic; dev-mode ephemeral key with loud warning), prune window, dev mode flag. |
| `auth.rs` / `policy.rs` / `server.rs` / `registration.rs` | Verify + raw-bearer extraction (publisher identity); Shield bridge; routes; self-description. |

```mermaid
graph TD
    subgraph EDGE["Edge (shell middleware)"]
        MW["counter · TLS context · logging · correlation · CORS"]
    end
    subgraph API["API layer"]
        H["handlers.rs"]
        ADMU["admin_ui.rs + Shield admin"]
    end
    subgraph DOMAIN["Secret domain"]
        MK["MasterKey (Zeroizing)"]
        ENC["seal/open (AES-256-GCM, fresh nonce)"]
        RV["record_reveal (append-only)"]
        EV["emit_event (publisher = caller)"]
    end
    subgraph STORAGE["Storage"]
        S[("secrets.secrets")]
        V[("secrets.versions")]
        RD2[("secrets.reads")]
        OB[("outbox / audit_journal")]
        POOL[("PgPool ≤ 3")]
    end
    MW --> H & ADMU
    H --> MK & ENC
    H --> S & V & RD
    H --> EV --> OB
    H --> POOL
```

**Reveal lifecycle (the security-critical family):**

```mermaid
sequenceDiagram
    autonumber
    participant C as Caller (M2M or admin)
    participant H as resolve/reveal handler
    participant P as Shield (secret:read|admin)
    participant S as secrets.secrets (RLS)
    participant RD as secrets.reads
    participant Z as SecretValue (zeroize on drop)

    C->>H: GET /v1/secrets/{name}/reveal or POST /v1/secrets/resolve
    H->>P: require_policy
    alt deny
        P-->>H: Deny → 403
    end
    H->>S: SELECT (name, status='active') under tenant context
    alt disabled / missing
        H-->>C: 404 (no existence leak for disabled)
    end
    H->>H: open envelope (key_version → current master key)
    alt decrypt failure
        H-->>C: 500 decrypt failed
    end
    H->>RD: INSERT reads row (reader_subject, service, type)
    Note over H: audit failure logs "deny-by-design triage required"<br/>(response still returns - best-effort audit)
    H->>Z: wrap plaintext (zeroized after response)
    H-->>C: value (never logged, never in metadata)
```

## 3. Data Model

```mermaid
erDiagram
    SECRETS ||--o{ VERSIONS : "secret_id"
    SECRETS ||--o{ READS : "secret_id"
    SECRETS {
        uuid id PK
        text name "stripe/api_key"
        text value_cipher "v2: raw BYTEA"
        int key_version "master-key epoch"
        int version "rotation counter"
        text status "active|disabled"
        timestamptz expires_at "nullable; T-14d expiring event"
        text created_by
        uuid env_id
    }
    VERSIONS {
        uuid id PK
        uuid secret_id FK
        int version
        bytea value_cipher
        int key_version
        text created_by
    }
    READS {
        uuid id PK
        uuid secret_id FK
        int version
        text reader_subject
        text reader_service
        text reader_type "user|m2m"
    }
    OUTBOX {
        uuid id PK
        uuid env_id
        text event_type
        text stream_family "secrets"
        text publisher_id_token "caller JWT"
        text publisher_subject
        boolean relayed
    }
```

- `secrets.secrets` - `UNIQUE (env_id, name)`; RLS FORCE with 4
  env-scoped policies; no plaintext column - `value_cipher` only.
- `secrets.versions` - append-only (`UNIQUE (secret_id, version)`; select
  + insert + delete policies, no update); previous versions survive the
  prune window so consumers mid-rotation keep resolving.
- `secrets.reads` - append-only and **never pruned**: every reveal (m2m
  resolve, user reveal, admin reveal) lands here with the reader's
  subject/service/type.
- `secrets.outbox` / `secrets.audit_journal` - generated DBX tables.

```mermaid
stateDiagram-v2
    direction LR
    [*] --> active: PUT (version 1)
    active --> active: PUT / rotate (version++)
    active --> disabled: DELETE (soft) / admin disable
    disabled --> active: PUT / rotate re-activates
    disabled --> disabled: resolve/reveal refuse (404)
```

## 4. API Surface

| Endpoint | Method | Gate | Notes |
|---|---|---|---|
| `/v1/health` | GET | none | liveness. |
| `/v1/secrets/{name}` | PUT | Shield `secret:write` + name validation | create/upsert (version++; history row). |
| `/v1/secrets` · `/v1/secrets/{name}` · `/history` | GET | Shield `secret:read` | metadata only (`?status=active|all`). |
| `/v1/secrets/{name}/rotate` | POST | Shield `secret:write` | 404 if absent; version++ + history. |
| `/v1/secrets/{name}` | DELETE | Shield `secret:admin` | soft-disable (404-equivalent at resolve). |
| `/v1/secrets/{name}/reveal` | GET | Shield `secret:admin` | audited reveal. |
| `/v1/secrets/resolve` | POST | Shield `secret:read` | audited resolve; accepts `secrets://`, `sentin8-secrets://`, bare name. |
| `/v1/secrets/{name}/reads` | GET | Shield `secret:admin` | reveal audit trail (LIMIT 100). |
| `/v1/secrets/maintenance/prune` · `/re-encrypt` | POST | Shield `secret:admin` | Cron proxy-back targets (idempotent, per-env). |
| `/v1/internal/schedules/run` | POST | cron M2M + Shield `secret:admin` | Sentin8:Cron proxy-back: `schedule_type` `expiry-scan` / `version-prune` (the version-prune sweep is registered at boot, 05:30). |
| `/v1/admin/ui/{page}`, `/v1/admin/{resource}` | GET/POST | `READ_SCOPES` / `WRITE_SCOPES` (+admin subset for reveal) | cross-env via `resolve_env_id` (admin roles required). |
| Shield admin API | mixed | policy-admin surface | shared bridge. |
| `/openapi.json` | GET | shell | 12 paths. |

Event flow (producer; family `secrets`):

```mermaid
flowchart LR
    W["put/rotate/delete (metadata-only payloads)"] --> EV["emit_event<br/>(pool conn, context, publisher = caller JWT + sub)"] --> OB[("secrets.outbox")]
    OB -- "shell relay<br/>LISTEN secrets_outbox_changed · batch 100 · 5s poll" --> BUS["bus: bus:{env}:secrets"]
```

Event types: `sentin8:secrets:secret:created` (`{secret_id, name,
version}`), `:updated` / `:rotated` (`{secret_id, name, version,
previous_version}`), `:disabled` (`{secret_id, name}`) - values never.

## 5. Cross-Cutting Concerns

- **Authentication**: bearer verify (JWKS); Shield enforced scope-mirror
  (`secret:read|write|admin`); admin reveal narrows to the admin subset.
- **Tenant resolution + RLS**: RLS context must accompany every tenant
  query; cross-env admin paths check platform/env-admin roles before
  addressing the foreign env (403 otherwise).
- **Idempotency**: PUT is a natural idempotent upsert (version++ on
  repeat); produce idempotency by outbox row id.
- **Audit journaling**: reveal audit (`secrets.reads`, never pruned) +
  `audit_journal` for shared decisions.
- **Graceful drain / TLS posture**: shell-owned; the master key lives
  only in process memory (Zeroizing) - a restart re-loads it from env.

## 6. Failure Modes & Recovery

```mermaid
flowchart TD
    BOOT[boot: master key load] -->|missing/invalid non-dev| PANIC[panic - refuse to start]
    BOOT -->|dev mode| DEV[ephemeral OsRng key + loud warning<br/>values unreadable after restart]
    RES[resolve] -->|disabled| R404[404 secret disabled]
    RES -->|decrypt fail| R500[500 decrypt failed]
    AUD[reveal audit INSERT fails] --> ERRLOG[error: deny-by-design triage required]
    PRUNE[prune] -->|prune_days ≤ 0| OFF[disabled: pruned 0]
    PRUNE --> DEL[delete versions older than window<br/>within caller env only]
    RE[re-encrypt] -->|per-row failure| CONT[failed++ + continue<br/>row keeps old key_version until success]
    REL[relay / SSE / metrics] --> LOOP[platform-standard retry loops]
```

- **Key rotation never bricks readers**: rows carry `key_version`;
  `maintenance/re-encrypt` lazily re-wraps old-key rows (per-row
  continue-on-failure, resumable); the previous-version history row is
  re-wrapped when it is the current version.
- **Version rotation keeps previous values** through the prune window -
  consumers mid-upgrade keep resolving.
- **Event emission failure** only warns (metadata-only events are
  re-derivable from the row).
- **Master key absence** fails closed (panic) in production; dev mode is
  an explicit, loud escape hatch.

## 7. Concurrency & Performance Model

```mermaid
graph LR
    REQ[resolve/reveal] --> CTX["pool conn + tenant context"]
    CTX --> S[("secrets.secrets")]
    REQ --> AUD["record_reveal (same flow)"] --> RD[("secrets.reads")]
    EV["emit_event (pool acquire)"] --> OB[("secrets.outbox")]
    REL["shell outbox relay<br/>(secrets_outbox_changed · 5s poll · batch 100)"] --> OB
    HOT["policy hot-reload SSE (2s)"]
    EM["metrics publishers 10s ×2"]
    POOL[("PgPool ≤ 3")]
```

- No service-owned background tasks - the daily version-prune sweep is
  a Sentin8:Cron schedule registered at boot next to the expiry scan;
  outbox relay, policy hot-reload, and metrics publishers
  are shell-owned.
- Hot path: resolve (one SELECT by `(env_id, name)` + one envelope open);
  reveal adds one audit INSERT.
- Pool cap 3; no caching of decrypted values (zeroize-on-drop; each
  resolve decrypts once).

## 8. Invariants, Insecure-Defaults Rejected, Unsafe Rationale

1. **Plaintext only in request scope**: decrypted values live in
   `SecretValue` (zeroize-on-drop); the master key is `Zeroizing` and its
   Debug never prints material.
2. **Metadata is value-free by construction**: `SecretRow::metadata()`
   serializes id/name/description/version/key_version/status/created_by/
   env_id/timestamps/ref - `value_cipher` never leaves the resolve path.
3. **Every reveal is audited** (m2m / user / admin) into the append-only
   `reads` table, which is never pruned.
4. **Envelope discipline**: `v2:` prefix + fresh 12-byte nonce per seal +
   AES-256-GCM; raw BYTEA form at rest; fresh nonce per seal means
   non-deterministic ciphertext.
5. **Names fail closed**: non-empty, ≤256 chars, `[a-zA-Z0-9/_-]`, no
   empty segments (traversal refused).
6. **Disabled refusal**: disabled secrets resolve/reveal as 404 -
   disabled state cannot be distinguished from absence by callers.
7. **Rotation via versioning, not overwrite**: history rows + version
   counters are append-only; delete is soft-disable only (hard delete is
   not exposed).
8. **Key-version epochs**: rotation re-encrypts lazily; rows keep their
   `key_version` until success (idempotent, resumable).
9. **Master key fail-closed**: absent/invalid key panics in production;
   dev mode is explicit and loudly warned.
10. No `unsafe` code; crypto is the shared envelope crate; the master
    key env var is `SENTIN8_SECRETS_MASTER_KEY` (the README's reference
    to `SENTIN8_AUTH_MASTER_KEY` is drift).

## 9. Testing Strategy

```mermaid
graph TD
    U["Crypto unit<br/>envelope roundtrip · is_envelope · fresh-nonce non-determinism"]
    I["Integration (DB-gated)<br/>upsert versioning + history · cross-env RLS isolation ·<br/>disabled refusal · reveal audit row"]
    E["E2E<br/>resolve path exercised by consumers (ai/post/fdx)"]
    U --> I --> E
```

- The DB-backed suite connects with the service role (RLS real),
  provisions the schema, and pins versioning, history, isolation,
  refusal, and audit behavior; runtime-skip without PostgreSQL.
- **Deliberately NOT tested here**: key-rotation re-encrypt sweep
  (manual ops path), relay mechanics (platform), TLS.

## 10. Open Questions

- The RLS context hardening gap is closed by wiring the
  `begin_tenant_tx`-style helper (explicit tx + context on the same
  connection, transaction-local `set_config`) into every handler, plus a
  `sec_`-prefixed fail-closed test mirroring db's pinned test
  (testing-strategy §3.3 reserves `sec_` for exactly this class).
- Audit-before-response is enforced: the `{service}.audit_journal` INSERT
  (reveal row) runs inside the same transaction as the value SELECT;
  audit-INSERT failure → 500, the value is never returned unaudited.
- The README adopts `SENTIN8_SECRETS_MASTER_KEY` (the design §4.3 name is
  authoritative).

---

**Design attribution:** sentin8:secrets and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

