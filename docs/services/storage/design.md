---
title: "Sentin8:Storage - Architecture (DDD)"
sidebar_label: "Architecture (DDD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-storage/edit/main/DESIGN.md
---
# DESIGN.md: Sentin8:Storage - Detailed Design Document

## 1. Scope & Context

Sentin8:Storage is the platform's object storage service: all file/blob
persistence for every vertical flows through it. It owns the adapter
abstraction (local FS today, pluggable backends), the HMAC signed-URL
codec for browser-direct transfers, the public read surface (images for
branding/logos), and the DBX event emission for object lifecycle. The
service holds no object metadata of its own - owning services store
references (keys) in their schemas.

- **Owns** (schema `storage`): `outbox` (DBX producer), `audit_journal`
  (generated; no code path writes it today), plus every physical object
  under the adapter root (`org/{org_id}/env/{env_id}/{object_path}`).
- **Does NOT own**: object semantics (callers decide what a key means),
  the bucket registry (admin buckets are marker-based - `.keep`), and
  tenant identity (env from the verified token; org resolved server-side).

```mermaid
graph TD
    subgraph CALLERS["Callers"]
        SVCS["Services (M2M: func · ai · app · …)"]
        BROWSER["Browsers (via BFF /proxy/storage or signed URLs)"]
        ADM["Admins (RFW buckets)"]
    end
    subgraph STOR["sentin8:storage"]
        API["/v1/storage/objects · /signed · /public"]
        ADP["StorageAdapter trait<br/>LocalFsAdapter (safe_path + canonicalize)"]
        SIGN["SignedUrlCodec<br/>HMAC-SHA256 · method-scoped · TTL 3600s"]
        ORG["resolve_org_id<br/>(context-first tx, fail-closed)"]
        EV["emit_event (publisher = caller)"]
        T[("storage.outbox")]
        ROOT[("local FS root<br/>{state_dir}/storage")]
    end
    AUTH["sentin8:auth (JWKS)"]
    BUS["sentin8:bus POST /v1/produce"]
    SVCS -- "M2M · Shield env:read|write" --> API
    BROWSER -- "GET /v1/storage/signed/{token}" --> API
    ADM -- "admin scopes · target_env_id" --> API["admin"]
    API --> ADP["StorageAdapter"] --> ROOT
    API -- "resolve_org_id (tx)" --> SYS2[("sys.environments")]
    API -- "emit_event" --> T
    T -- "relay (shell)" --> BUS
```

Trust boundary: keys never embed tenant segments in URLs (env from the
token, org resolved server-side); signed URLs are tamper-proof HMAC
tokens scoped to one method with expiry checked before any IO.

## 2. Runtime Architecture

| Module | Role |
|---|---|
| `storage.rs` | `StorageAdapter` trait (put/get/delete/list + defaulted exists/size/copy/move), `LocalFsAdapter` (traversal defense: component-level `ParentDir` rejection + canonicalize-deepest-existing + containment), `SignedUrlCodec` (issue/verify, GET/PUT methods). |
| `handlers.rs` | Object CRUD (PUT/HEAD/GET/DELETE/list), signed dispatch (serve/upload), copy/move, public reads (platform + per-env), health; `emit_event` with the caller's publisher identity. |
| `admin_ui.rs` | RFW overview/buckets pages + bucket admin (create/delete/upload/download/link) with cross-env authority checks. |
| `server.rs` / `config.rs` / `registration.rs` / `openapi.rs` | State (adapter + codec + pool), routes, self-description (9 admin scopes, 10-permit scope-mirror set). |
| `auth.rs` / `policy.rs` | Verify wrappers + raw-bearer extraction (publisher context); Shield bridge. |

```mermaid
graph TD
    subgraph EDGE["Edge (shell middleware)"]
        MW["counter · TLS context · logging · correlation · CORS"]
    end
    subgraph API["API layer"]
        H["handlers.rs"]
        ADMU["admin_ui.rs + Shield admin"]
    end
    subgraph DOMAIN["Storage domain"]
        PIPE["verify → Shield → resolve_org_id (tx) → adapter"]
        CODEC["SignedUrlCodec (issue/verify)"]
        PUB["public read (image allowlist)"]
        EV2["emit_event → outbox"]
    end
    subgraph STORAGE["Storage"]
        ADP["Arc<dyn StorageAdapter>"]
        ROOT[("local FS root")]
        OB[("outbox / audit_journal")]
        POOL[("PgPool ≤ 3")]
    end
    MW --> H & ADMU
    H & ADMU --> PIPE
    PIPE --> ADP
    H --> CODEC
    H --> EV2 --> OB
    PIPE --> POOL
```

**Signed-URL upload/download lifecycle:**

```mermaid
sequenceDiagram
    autonumber
    participant C as Caller (write scope)
    participant H as object_action
    participant K as SignedUrlCodec
    participant B as Browser
    participant S as /v1/storage/signed/{token}
    participant A as adapter

    C->>H: POST …/sign-upload (key)
    H->>K: issue(key, 3600s, PUT)
    H-->>C: signed URL
    B->>S: PUT /v1/storage/signed/{token} (body)
    S->>K: verify(token)
    alt expired / tampered / malformed
        S-->>B: 403 / 400
    else method mismatch
        S-->>B: 405
    else ok
        S->>A: put under embedded key
        S-->>B: 200
    end
    Note over S: serving and signed flows emit NO events
```

## 3. Data Model

```mermaid
erDiagram
    OUTBOX {
        uuid id PK
        uuid env_id
        text event_type
        text stream_family "storage"
        text publisher_id_token "caller JWT"
        text publisher_subject
        boolean relayed
    }
    AUDIT_JOURNAL {
        uuid id PK
        uuid env_id
        text action
        boolean pushed
    }
    OBJECT_SPACE {
        text key "org/{org_id}/env/{env_id}/{path}"
    }
```

- No domain tables - objects live in the adapter; the two shared-helper
  tables are the DBX surfaces (`outbox` with NOTIFY trigger
  `storage_outbox_changed`; `audit_journal`, unwired).
- **Key layout**: `org/{org_id}/env/{env_id}/{object_path}`;
  admin-UI buckets add `{bucket}/{object}` (buckets are `.keep` marker
  objects, name sanitized to `[alnum_-]`).
- **Signed tokens**: `base64url("{key}|{expiry}|{METHOD}")` +
  `.` + `base64url(HMAC-SHA256)`; TTL 3600s; method-scoped; expired or
  mismatched tokens rejected before IO; unsigned legacy tokens rejected.

```mermaid
stateDiagram-v2
    direction LR
    state OBJECT {
        [*] --> Stored: PUT (dedup optional)
        Stored --> Deleted: DELETE (admin)
        Deleted --> [*]
        Stored --> Stored: copy/move (moved event)
    }
    state SECRET_VERSION {
        [*] --> Token: issue(key, ttl, method)
        Token --> VALID: HMAC + expiry + method OK
        Token --> REJECTED: expired/mismatch/malformed
        Token --> [*]
    }
```

## 4. API Surface

**Object API** (tenant routes: verify → Shield):

| Endpoint | Method | Gate | Notes |
|---|---|---|---|
| `/v1/storage/objects/{*path}` | PUT / HEAD / GET / DELETE / POST | `env:write` / `env:read` / `env:read` / `env:admin` / dispatch | dedup via `X-If-Absent` → `X-Storage-Deduped: true`; POST dispatches sign-read/sign-upload/copy/move (405 otherwise). |
| `/v1/storage/objects` | GET | `env:read` | `?prefix=`; 403 propagates (never masked as empty). |
| `/v1/storage/signed/{token}` | GET / PUT | HMAC token (no bearer) | method-scoped; expired → 403; wrong method → 405. |
| `/v1/public/objects/{*path}` | GET | none | image extensions only (svg/png/jpg/jpeg/gif/webp/ico); platform org/env; `Cache-Control: public, max-age=3600`. |
| `/v1/public/env/{env_id}/objects/{*path}` | GET | none | per-env variant; org resolved from env_id. |

**Admin/RFW** (cross-env requires `sentin8:sys:admin|sys:env:admin|sys:org:admin`):

| Endpoint | Method | Gate |
|---|---|---|
| `/v1/admin/ui/{page}`, `/v1/admin/{resource}` | GET | read set. |
| `/v1/admin/buckets` (GET/POST), `/upload`, `/objects`, `/{id}/delete`, `/{id}/objects/{o}/delete`, `/{id}/download`, `/{id}/link` | mixed | read/write sets. |
| `/v1/admin/policy-sets|relations|attributes…` | mixed | shared Shield admin. |
| `/v1/health`, `/openapi.json` | GET | none/shell. |

Event flow (producer; family `storage`):

```mermaid
flowchart LR
    W["put (created) · delete (deleted) · copy/move (moved)"] --> EV["emit_event<br/>(pool conn, context, publisher = caller JWT + sub)"] --> OB[("storage.outbox")]
    OB -- "shell relay<br/>LISTEN storage_outbox_changed · batch 100 · 5s poll" --> BUS["bus: bus:{env}:storage"]
```

Event types: `sentin8:storage:object:created` (`{key, content_type,
size}`), `:deleted` (`{key}`), `:moved` (`{from_key, to_key}`) - copy and
move both emit `moved`.

## 5. Cross-Cutting Concerns

- **Authentication**: Bearer-first, certificate fallback. Tenant routes
  verify the bearer (JWKS) + Shield enforced scope-mirror; when no
  Authorization header is present, the TLS-injected client-certificate
  workload identity (`x-sentin8-client-cert-subject`, CA-verified by the
  TLS layer, client-supplied copies stripped) resolves against the
  boot-loaded registry map (`m2m:workloads`) - the certificate IS the
  authentication and the map IS the authorization record (auth DESIGN
  §4.3f). The `func-storage` workload (func's WASM-binary PUT, cert-
  presenting `StorageClient::with_workload_identity`, no bearer) rides
  this path; signed-URL and public routes remain bearer-free by
  contract (token-authenticated / image-allowlist).
- **Tenant resolution + RLS**: `resolve_org_id` runs inside one explicit
  transaction with the context set on the same connection
  (fail-closed: 500/404 - never a system-org fallback, test-pinned);
  `org_id` never appears in client-facing paths.
- **Idempotency**: `X-If-Absent: true` / `If-None-Match: *` dedup hit
  returns 200 + `X-Storage-Deduped: true` without byte verification
  (caller opted in; content-addressing makes collisions negligible).
- **Path safety**: component-level traversal rejection pre-IO +
  canonicalize-deepest-existing + `starts_with(root)` containment -
  symlink escapes rejected.
- **Audit journaling**: lifecycle events carry the publisher token +
  subject; `audit_journal` exists but is unwired in this service.
- **Graceful drain / TLS posture**: shell-owned (PQ provider, pool cap,
  PG18 check, TLS serve).

## 6. Failure Modes & Recovery

```mermaid
flowchart TD
    A[resolve_org_id] -->|pool/context/DB error| E500[500 fail-closed]
    A -->|unknown env| E404[404 never system fallback]
    B[signed token] -->|expired| F403[403]
    B -->|signature mismatch| F403
    B -->|malformed| F400[400]
    B -->|method mismatch| F405[405]
    C[adapter] -->|NotFound| E404X[404]
    C -->|PathTraversal| REJ[rejected pre-IO]
    C -->|Io| E500X[500]
    D[outbox emit] -->|fail| W[warn + continue]
    E[signing key unset] --> EPH[ephemeral random key<br/>URLs reset on restart - logged]
    REL[relay] -->|Bus down| RT[rows unrelayed; 5s retry; 2s backoff]
    MOVE[move] --> CP[copy] --> DELE[delete original<br/>no partial state]
```

- **Tenant resolution failure** never defaults (system-org fallback
  explicitly rejected).
- **Signed-URL validation** happens before any IO (expiry, signature,
  method, body presence).
- **Signing key reset**: an ephemeral key on restart invalidates issued
  URLs (deliberately loud in logs); production sets
  `SENTIN8_STORAGE_SIGNING_KEY`.
- **Copy/move** is copy-then-delete - no partial state; both emit
  `object:moved`.

## 7. Concurrency & Performance Model

```mermaid
graph LR
    REQ[object request] --> ADP["Arc<dyn StorageAdapter><br/>LocalFs: put/get/delete/list"]
    REQ --> ORGTX["resolve_org_id tx<br/>(context on same connection)"]
    ORGTX --> POOL[("PgPool ≤ 3")]
    EV3["emit_event (best-effort)"] --> OB[("storage.outbox")]
    REL["shell outbox relay<br/>(storage_outbox_changed · 5s poll · batch 100)"] --> OB
    HOT["policy hot-reload SSE (2s)"]
    EM["metrics publishers 10s ×2"]
```

- All spawned tasks are shell-owned (relay, hot-reload, two metrics
  publishers) - storage spawns none itself.
- Hot path: adapter get/put (streamed), one `sys.environments` lookup per
  request (short tx), one outbox insert per lifecycle mutation.
- Local FS root: `{SENTIN8_STATE_DIR:-/var/lib/sentin8}/storage`;
  `LocalFsAdapter` validates the path pre-IO (component scan +
  canonicalized containment).
- No caching layer: signed-URL verification is O(1) HMAC; public reads
  rely on `Cache-Control` for browser-side caching.

## 8. Invariants, Insecure-Defaults Rejected, Unsafe Rationale

1. **Key containment validated pre-IO** (component-level + canonicalized
   existing base + `starts_with(root)`) - traversal and symlink escapes
   are rejected before any filesystem IO.
2. **Fail-closed tenant resolution** - unknown env → 404 (never the
   system org), pool/context errors → 500; context and lookup share one
   transaction on one connection.
3. **Signed URLs are token-embedded** (not path-embedded), HMAC-tamper-
   proof, method-scoped, expiry-checked before IO; unsigned legacy
   tokens rejected.
4. **Dedup semantics opt-in**: a dedup hit never verifies bytes - safe
   because keys are content-addressed by callers who opt in.
5. **Public reads are image-only** (extension allowlist) - arbitrary
   object leakage through the public route is impossible; the platform
   variant is pinned to the system org/env.
6. Move is copy-then-delete (no partial state); copy/move require the
   admin scope.
7. `org_id` never appears in URL paths - resolved server-side from
   `env_id`.
8. Step 5 (Shield `require_policy`) is the only access gate; the
   `require_*_scope` JWT re-checks are trivially `Ok(())` (kept for
   call-site stability).
9. No `unsafe` code; the FS adapter is the only IO surface (adapter
   trait isolates future backends).

## 9. Testing Strategy

```mermaid
graph TD
    U["Unit<br/>traversal defense · codec issue/verify · dedup semantics ·<br/>copy/move · DTOs"]
    I["Integration<br/>lifecycle rides the shared DB-gated suite"]
    E["E2E<br/>upload → signed serve → public read (UI suite)"]
    U --> I --> E
```

- Module tests pin the adapter (path safety), codec (issue/verify/expiry/
  method), and handler contracts.
- **Deliberately NOT tested here**: S3-compatible backends (only the
  local adapter ships), relay mechanics (platform), TLS.

## 10. Open Questions

- Only the `LocalFsAdapter` backend exists by design (storage design §7 lists
  S3-compatible as future); the trait is the seam.
- `storage.audit_journal` is wired: journal Shield-decision audits + admin
  actions (the write sites exist in the design).
- The ephemeral signing key fallback fails fast in production (require the var
  at boot when `SENTIN8_ENV=production`).
- Dedup trusts the caller's key content-addressing; the `X-Content-Sha256`
  header contract verifies a dedup hit when the header is present.

---

**Design attribution:** sentin8:storage and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

