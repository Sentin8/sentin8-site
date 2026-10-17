---
title: "Sentin8:BFF - Architecture (DDD)"
sidebar_label: "Architecture (DDD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-bff/edit/main/DESIGN.md
---
# Sentin8:BFF - Detailed Design Document

## 1. Scope & Context

Sentin8:BFF is the **Delegation Gateway and token guardian**: the single
backend-for-frontend through which every browser app reaches platform
services. It owns the web session lifecycle (encrypted server-side token
storage), the `/proxy/{service}/...` data path, the three transport tiers
(HTTP/2 mutations + SSE subscriptions + chat WebSocket), the two delegation
paths (platform-admin RFC 8693 delegation to a target env, and customer
CIBA delegation for assisted login / decoupled approval), and the SCIM
proxy.

- **Owns** (schema `bff`): `dcr_clients` (per-auth-domain DCR client
  registry for app-instance OAuth clients). Session state is deliberately
  **not** in PostgreSQL - sessions live in Valkey (`bff:session:{session_id}`)
  as AES-256-GCM envelopes. Stat tagging configuration rides
  `sys.app_instances` (sys-owned; read context-first).
- **Does NOT own**: identity (Sentin8:Auth issues/verifies every token),
  tenant records (`sys.environments`/`sys.organizations` - read-only,
  context-first), app instances and scope whitelists (`sys.app_instances`),
  domain events (the BFF produces none - it consumes and relays), Shield
  policy storage (it boots an engine and evaluates only the
  `/bff/action/{action}` registry surface).

```mermaid
graph TD
    subgraph CLIENTS["Browser clients (no tokens)"]
        DASH["dash (Flutter web)"]
        APPS["App-store Flutter apps"]
    end

    subgraph BFF["sentin8:bff"]
        SESS["Session mgmt<br/>/auth/login · callback · session ·<br/>sign-out · refresh (AES-GCM @ Valkey)"]
        PROXY["Proxy data path<br/>/proxy/{service}/*"]
        SUBS["SSE /subscribe<br/>Bus consumer + stat pub/sub"]
        CHAT["WS /ws<br/>chat rooms"]
        CIBA["CIBA delegation<br/>/delegate/*"]
        SCIM["SCIM proxy<br/>/delegate/scim/*"]
        DELEG["Delegation Gateway<br/>RFC 8693 + downscope"]
    end

    subgraph PLATFORM["Platform services"]
        AUTH["sentin8:auth (issuer)"]
        SYS["sentin8:sys (tenant data)"]
        APPSVC["sentin8:app (instances)"]
        BUS["sentin8:bus (SSE consume)"]
        STAT["sentin8:stat"]
        DOWN["Downstream services<br/>(auth · db · ledger · …)"]
    end

    DASH & APPS -- "cookies + csrf (HTTP/2)" --> BFF
    SESS["SSE clients"] -- "GET /subscribe" --> SUBS
    DASH -- "GET /ws" --> CHAT
    SESS_SSE["SSE clients"] -- "GET /subscribe" --> SUBS
    SESS_WS["WS clients"] -- "GET /ws" --> CHAT
    BFF -- "PKCE auth code + PAR" --> AUTH
    DELEG -- "cert-bound M2M<br/>POST /mtls/oauth/token" --> AUTH
    CIBA -- "bc-authorize + CIBA grant (DPoP)" --> AUTH
    PROXY & DELEG -- "bearer (delegated)" --> DOWN
    PROXY -- "tenant reads" --> SYS
    SUBS -- "bus-client SSE + ACK<br/>M2M sentin8:bus:consume" --> BUS
    SUBS -- "pub/sub stat:rollups:minute" --> STAT
    SCIM -- "delegator M2M" --> AUTH
```

Trust boundaries: everything inside `sentin8:BFF` holds session secrets
and cert-bound M2M identities; the browser holds only opaque cookies and
never receives a token (the CIBA delegation token response is the one
contractual exception - it is the customer's own delegated credential,
delivered to the delegating staff app).

## 2. Runtime Architecture

| Component | File | Role |
|---|---|---|
| Config | `config.rs` | Port, Valkey URL, encryption key, session TTLs (idle 7d / absolute 30d), CSRF toggle, OAuth client id, shared Auth SDK client. |
| Session store | `session.rs` | AES-256-GCM encrypt/decrypt, Valkey `bff:session:{id}`, cookie builders, app-binding check. |
| Auth flow | `handlers.rs` | PKCE login/sign-up/callback, session metadata, sign-out, refresh, multi-session listing/revocation (`/v1/auth/sessions`), Shield-gated service actions, health/readiness. |
| Proxy | `proxy.rs` | Catch-all `/proxy/{service}/*`: session validation → CSRF → token resolution (transparent refresh / delegation / RFC 8693 exchange) → forward. |
| CIBA + SCIM | `ciba.rs` | `POST /delegate/start|poll|status|send-link`; six SCIM handlers with the delegator M2M token. |
| Subscription tier | `subscribe/*` | SSE handler, Bus consumer per session, subscription mutations, delegation poll push, stat pub/sub,
session-reaper Bus subscription (`auth` family, group `bff-session-reaper` -
kills cached sessions on `sentin8:auth:session:revoked`), telemetry stub. |
| Chat tier | `chat/*` | `/ws` WebSocket, conversation rooms, ping loop. |
| Tenant resolution | `tenant.rs` | Header-first context, service identity + backend URL resolution, scope whitelist cache (5-min TTL). |
| Stat tagging | `tagging.rs` | `ServerTagger` trait (`NoopTagger` default / `StatTagger`), fire-and-forget. |
| Key rotation | `key_rotation.rs` | KeyRing blob format `v1:{key_id}:{hex}` with retained old keys. |
| DCR client | `dcr.rs` | RFC 7591 register/update/delete client (compiled, available for future wiring - boot-time DCR rides `sentin8::auth::m2m`). |

```mermaid
graph TD
    subgraph EDGE["Edge"]
        MW["middleware: traffic counter → TLS context → logging → correlation → CORS"]
    end
    subgraph API["API layer"]
        H["handlers.rs (auth/session/action)"]
        C["ciba.rs (delegation + SCIM)"]
        S["subscribe/* (SSE + WS)"]
        P["proxy.rs (fallback)"]
    end
    subgraph DOMAIN["Domain services"]
        SESS["SessionStore (AES-GCM @ Valkey)"]
        DELEG["Delegation engine (8693 + CIBA)"]
        TEN["TenantContext + AppScopeCache"]
        TAG["StatTagger"]
    end
    subgraph STORAGE["Storage / transport"]
        VALKEY[("Valkey<br/>bff:session:* · bff:delegated:* · bff:delegation_*")]
        POOL[("PG pool ≤ 3<br/>schema bff")]
        CLIENTS["Sentin8HttpClient (pooled)"]
    end
    MW --> H & C & S & P
    H --> SESS
    C --> SESS
    P --> SESS & DELEG & TEN
    SESS --> VALKEY
    TEN --> POOL
    P --> CLIENTS
```

### Request lifecycles

**Proxy mutation (the dominant family):**

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant P as proxy.rs
    participant V as Valkey
    participant A as sentin8:auth
    participant D as Downstream service

    B->>P: POST /proxy/auth/v1/o<br/>Cookie bff-session + x-bff-csrf
    P->>V: GET bff:session:{id}
    V-->>P: Session (encrypted tokens)
    P->>P: D2 binding check (fail-closed 401)
    P->>P: CSRF check (403 on mismatch)
    alt access token expired
        P->>A: POST /oauth/token (refresh)
        A-->>P: new access token
        P->>V: put session (updated tokens)
    end
    opt platform admin + x-bff-target-env-id
        P->>A: RFC 8693 delegate (cert-bound M2M, downscoped)
        A-->>P: delegated token (cached in Valkey)
    end
    P->>D: GET/POST with bearer<br/>x-sentin8-* forwarded
    alt upstream 2xx
        D-->>P: response
        P-->>B: status + body (hop-by-hop stripped)
    else upstream 401
        D-->>P: 401 passthrough
        P-->>B: 401 (session preserved)
    else transport error
        P-->>B: 502 upstream error
    end
```

**OAuth login → session establishment:**

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant F as /auth/login
    participant A as sentin8:auth
    participant C as /auth/callback
    participant V as Valkey

    B->>F: GET /auth/login (app instance from TLS headers)
    F->>F: resolve app instance + auth domain + DCR client
    F-->>B: 302 authorize + PKCE cookie (Max-Age 300)
    B->>A: authorize (user signs in / MFA)
    A-->>B: 302 callback?code
    B->>C: GET /auth/callback
    C->>A: POST /oauth/token (code + PKCE)
    A-->>C: tokens (access, refresh, id)
    C->>C: D4 claims decode fail-closed → D3 auth-env match → F-A group gate
    C->>V: create session (AES-GCM tokens)
    C-->>B: Set-Cookie bff-session (app-instance domain)
```

**SSE subscription family:**

```mermaid
sequenceDiagram
    participant B as Browser
    participant S as /subscribe (GET)
    participant BUS as sentin8:bus
    participant R as Valkey

    B->>S: GET /subscribe (session cookie)
    S->>S: D2 check → SubscriptionState (types + resource_id)
    S->>BUS: sse_consume (consumer group sse-{session_prefix})
    loop per matching event
        BUS-->>S: event (XADD stream)
        S->>S: filter (user_id / stat.traffic RBAC)
        S->>BUS: POST /v1/ack
        S-->>B: event: {type} / data: {json}<br/>publisher_id_token stripped
    end
    loop 15s
        S-->>B: : heartbeat
    end
    B->>S: POST /subscribe (change types, 409 if no stream)
    B->>S: DELETE /subscribe (stream ends)
```

## 3. Data Model

The BFF's own schema is minimal - the session store is deliberately in
Valkey, and the tenant/app-instance data it reads belongs to sys.

```mermaid
erDiagram
    BFF_DCR_CLIENTS {
        uuid id PK
        text sentin8_auth_domain UK "one per env-scoped auth"
        text client_id
        text client_name
        text[] redirect_uris
        text[] scopes
        bytea registration_access_token_enc
        uuid env_id
        text app_slug
        timestamptz created_at
        timestamptz updated_at
    }
```

- `bff.dcr_clients` - per `sentin8_auth_domain` OAuth client used by the
  CIBA backchannel (app-instance client, public PKCE). `env_id` scopes the
  row; the proxy's per-app scope/service whitelists live on
  `sys.app_instances` and are read context-first.
- **Valkey keys** (not tables, but part of the durable model):
  `bff:session:{session_id}` (session JSON, TTL = idle TTL),
  `bff:delegated:{session_id}:{env_id}:{service}` (RFC 8693 token cache,
  TTL = token expiry), `bff:delegation_authreq:{delegation_id}`
  (`auth_req_id`, TTL = `expires_in`),
  `bff:delegation_token:{id}` + `bff:delegation_token:{id}:meta`
  (approved customer delegation + metadata).

```mermaid
stateDiagram-v2
    [*] --> Created: /auth/callback (D4+D3+F-A passed)
    Created --> Active: session stored, cookie set
    Active --> Active: transparent refresh / explicit refresh
    Active --> Expired: idle TTL or absolute TTL exceeded
    Expired --> [*]: token rejected, client re-login
    Active --> Destroyed: /auth/sign-out (refresh revoked)
    Destroyed --> [*]
```

## 4. API Surface

### Public (pre-login)

| Endpoint | Gate | Notes |
|---|---|---|
| `GET /auth/login`, `GET /auth/sign-up` | none | Redirect to env-scoped Auth authorize, PKCE verifier cookie. |
| `GET /auth/callback` | code exchange | D4 fail-closed claims decode, D3 auth-env match, F-A app-group gate. |
| `GET /v1/health`, `GET /readiness`, `GET /metrics` | none | Liveness (build hash), Valkey ping, static gauges. |

### Session (cookie + D2 binding)

| Endpoint | Gate | Emits |
|---|---|---|
| `GET /auth/session` | session cookie | metadata + csrf token only - never tokens. |
| `POST /auth/sign-out` | session cookie | refresh revoked at `/oauth/revoke`; session destroyed; both cookies cleared. |
| `POST /auth/refresh` | session cookie | token/scope/expiry updated in place. |
| `POST /bff/action/{action}` | session + Shield `evaluate_full` + `service_actions` registry lookup | registry-defined downstream call. |
| `ANY /proxy/{service}/{*rest}` | session + D2 + CSRF (mutations) + delegation logic | upstream call; transparent refresh; Stat tagging. |
| `GET /v1/auth/sessions` | session cookie | caller's active sessions (same `user_id`): `{session_id, created_at, last_seen, current}`; bounded SCAN (`list_session_ids(1000)`). |
| `GET /v1/auth/sessions/{id}` | session cookie | one session detail; 404 when missing or owned by another user (no existence oracle). |
| `DELETE /v1/auth/sessions/{id}` | session cookie + CSRF | destroy record + revoke its stored refresh token at Auth `/oauth/revoke`; 404 predicate as above. |
| `DELETE /v1/auth/sessions` | session cookie + CSRF | revoke all the caller's sessions **except the current one** (destroy + refresh revoke each). |

### Delegation (staff → customer/env)

| Endpoint | Gate | Flow |
|---|---|---|
| `POST /delegate/start` | staff BFF session | `POST /oauth/bc-authorize` at the customer auth; `act` claims from the session, never the body. |
| `POST /delegate/poll` | - | CIBA grant + DPoP proof; caches the approved customer token. |
| `GET /delegate/status` | - | cached token + meta. |
| `POST /delegate/send-link` | - | stub (logs + acknowledges). |
| `/delegate/scim/users…` (6 verbs) | delegator M2M (`sentin8:scim:read/write`) | proxied to `{auth}/scim/v2/Users`. |

### Subscriptions

`GET /subscribe` (SSE; session + D2), `POST /subscribe` (change; 409 when
no live stream), `DELETE /subscribe`; `GET /ws` (chat WebSocket; session +
D2 on upgrade). The BFF emits the internal push types
`sentin8:delegation:result`, `sentin8:delegation:expired`,
`sentin8:bff:session:expired` and relays convention-valid Bus events
(`{vertical}:{service}:{resource}:{operation}`) through the per-service
stream-family map.

### Event flow (consume path - the BFF produces no domain events)

```mermaid
sequenceDiagram
    participant BUS as sentin8:bus stream
    participant C as bus.rs consumer<br/>(group sse-{session_prefix})
    participant S as SubscriptionState
    participant B as Browser

    BUS-->>C: stream message (family ledger|payments|auth|…)
    alt convention-valid event type
        S->>S: user_id filter / stat.traffic RBAC
        alt passes
            S-->>B: SSE data (publisher_id_token stripped)
            S->>BUS: POST /v1/ack
        else filtered out
            S->>BUS: POST /v1/ack (skip)
        end
    else invalid type
        S->>BUS: POST /v1/ack (dropped)
    end
```

## 5. Cross-Cutting Concerns

- **Authentication**: the browser holds only the `bff-session` cookie
  (`HttpOnly; Secure; SameSite=None`, domain scoped to the app instance by
  stripping the leading `bff.`; ≥4 labels required, otherwise exact-host).
  The BFF verifies nothing from the client except the session - bearer
  verification of the stored tokens happens server-side when forwarded.
- **Tenant resolution + RLS context**: TLS-injected `X-Sentin8-*` headers
  first (hostname fallback only behind `SENTIN8_BFF_HOSTNAME_FALLBACK`);
  `org_id` is never accepted from clients - it is derived from `env_id` in
  a context-first transaction (`sentin8_set_tenant_context` → query →
  rollback, one connection).
- **CSRF**: mutations require `x-bff-csrf` equal to the session's stored
  token (toggle `csrf_enabled`, default on) → 403 on mismatch.
- **Cert-bound M2M**: the delegator identity is minted via DCR at boot
  (fast path loads the credential file; failure spawns a 30×/3s retry
  task); every delegation call goes to `/mtls/oauth/token` with the
  client-cert thumbprint presented - RFC 8705 sender-constraining is
  enforced by auth, not by the BFF.
- **Idempotency**: session writes are keyed by `session_id` (last-write
  wins); delegation caches are keyed by
  `{session_id}:{env_id}:{service}` / `{delegation_id}` - re-polls reuse
  the same key without duplicate side effects downstream.
- **Audit journaling**: `/audit` is a P0 log-only sink; the BFF writes no
  `audit_events` rows itself (all domain audit rides the owning services).
- **TLS posture**: PQ provider installed before any outbound call;
  inbound termination in-process via `Sentin8Tls` (same posture as every
  service); the proxy forwards a fixed header allowlist - arbitrary client
  headers are not re-emitted by construction.
- **Graceful drain**: `Sentin8Tls::serve` handles shutdown; background
  tasks (Bus consumers, stat pub/sub, delegation polls) are spawned
  fire-and-forget and die with the process.

## 6. Failure Modes & Recovery

```mermaid
flowchart TD
    A[Boot: delegator DCR] -->|credential file loads| OK[serve traffic]
    A -->|fast path fails| R1[retry task: 30 × 3s]
    R1 -->|registered| OK
    R1 -->|30 failures| LOG[error log; service still serves]
    B[Bus SSE consumer] -->|stream error| R2[2s backoff → reconnect]
    R2 --> BUS
    C[stat pub/sub] -->|connection lost| R3[3s retry loop]
    R3 --> C
    D[Delegation Gateway call] -->|403| DENY[403 to client - fail closed]
    D -->|transient error| E502[502 - no admin fallback token]
    P[Proxy refresh] -->|refresh fails| FWD[forward expired token<br/>upstream 401 decides]
    S[Session GET] -->|missing/decryption failure| R401[401 - no session]
```

- **Session loss** (Valkey restart): the cookie points at a missing
  session → 401; the browser re-runs the login flow. No server-side
  re-materialization exists.
- **Delegation expiry**: cached CIBA tokens carry `expires_at`; an expired
  or absent delegation on the proxy path → 403
  ("delegation expired or not approved"), never a fallthrough to the
  staff token.
- **Delegation poll task**: bounded (60 polls × interval); terminal states
  (`approved`/`denied`/`expired`/`failed`) are pushed over SSE once.
- **Upstream failures**: unresolved backend → 502
  ("could not resolve backend for service"); transport error → 502 with
  detail; everything else passes through untouched.
- **Readiness** reflects Valkey health (`not_ready` on ping failure) while
  the service keeps serving; captain-level readiness gates registration.

## 7. Concurrency & Performance Model

```mermaid
graph LR
    REQ[Request] --> CTR[RequestCounter<br/>flush loop 10s]
    subgraph TASKS["Spawned tasks"]
        DCR["DCR retry (30×3s)"]
        BUS1["Bus consumer ×session<br/>group sse-{prefix}"]
        STATPS["stat pub/sub loop"]
        CIBAP["CIBA poll ×delegation"]
        PING["chat ping 30s ×conn"]
        PUB["error-metrics publisher"]
    end
    VALKEY[("Valkey<br/>ConnectionManager (1, cloned)")]
    POOL[("PgPool cap 3<br/>SENTIN8_PG_POOL_MAX")]
    HC["Sentin8HttpClient (pooled)"]
    BUS1(("broadcast 256<br/>SSE")) 
    CH(("broadcast 64<br/>chat rooms ×conversation"))
    BUS1 --> BUS
    CTR --> VALKEY
    SESS["SessionStore"] --> VALKEY
    TEN["tenant reads"] --> POOL
    PROXYF["proxy forwards"] --> HC
```

- **One Valkey connection manager** shared by sessions, delegation caches,
  SSE consumer, and stat pub/sub (cloned per use); session get/put are
  O(1) `get`/`set_ex`.
- **Pool cap 3** (platform rule) - the BFF's DB reads are small
  (tenant resolution, whitelist cache, SSE RBAC, service-action registry).
- **Shared pooled HTTP client** for all proxy forwards (a per-request
  client caused socket-exhaustion 502s); body cap 10 MB.
- **Backpressure**: SSE broadcast channel 256 (`Lagged` skips events
  rather than disconnecting the session), chat rooms channel 64; Bus
  consume uses per-family loops so a slow family cannot starve others.
- **Hot caches**: scope whitelist (5-min TTL), delegated tokens (TTL =
  token expiry), JWKS/discovery inside the shared Auth SDK (5-min).

## 8. Invariants, Insecure-Defaults Rejected, Unsafe Rationale

1. **Tokens never reach the browser.** Sessions store encrypted token
   blobs; `/auth/session` returns metadata + CSRF token only; the Bus
   relay strips `publisher_id_token` before forwarding. (The CIBA
   delegation token response is the delegated customer credential itself -
   delivered once to the delegating staff app, cached only in Valkey.)
2. **Fail-closed binding.** D2 (session ↔ application) must match or both
   be absent; D3 (token auth-env ↔ app instance) mismatches reject at the
   callback; D4 (undecodable claims) yields no session. A request that
   cannot resolve a tenant context is rejected, never defaulted.
3. **Delegation has no fallback.** Gateway 403 → 403 to the client;
   transient errors → 502; a failed delegation never silently forwards
   the staff token.
4. **Cert-bound M2M only.** The delegator token source is always
   `/mtls/oauth/token`; the RFC 8705 thumbprint must be presented or auth
   rejects the mint. `DELEGATOR_SCOPES`
   (`sentin8:delegate:read sentin8:scim:read sentin8:scim:write
   sentin8:sys:instances:read`) is the single source of truth shared by
   the DCR registration and the token request (debug-asserted equal).
5. **App-BFF service blocklist.** App BFFs never proxy `auth`, `app`,
   `sys`, or `tls` (those surfaces are reached by the browser through the
   platform flows, not the generic proxy).
6. **org_id never trusted from the wire** - always resolved server-side
   from `env_id` under a context-first transaction.
7. **Cookie scoping.** The session cookie domain is the app instance's
   domain (never the platform root), preventing cross-app replay;
   non-conforming hosts get an exact-host cookie.
8. **No `unsafe` code.** Encryption is AES-256-GCM via the shared crypto
   crate; key material comes from `SENTIN8_BFF_ENCRYPTION_KEY` (the
   built-in development default is rejected operationally - production
   must set a real key; the KeyRing rotation module exists for re-wraps).
9. **Multi-session revocation keeps the current session.**
   `DELETE /v1/auth/sessions` and `/sessions/{id}` destroy only records
   whose `user_id` equals the caller's (`user_id` ownership predicate,
   404 otherwise - no cross-user destroy) and always preserve the
   caller's current session id; each destroyed record's encrypted
   refresh token is revoked at Auth so no orphaned live grant survives
   the store delete.
9. **RLS on `bff.dcr_clients` is a current gap** (no ENABLE/FORCE policy in
   `init.sql`); access is single-role server-side only, and the platform's
   mandatory-RLS rule requires the policy to be added.

## 9. Testing Strategy

```mermaid
graph TD
    U["Unit tests (in-module)<br/>session crypto + cookie shape · keyring ·<br/>tenant context · scope cache · tagging · CIBA contracts"]
    I["Integration tests (tests/integration.rs)<br/>session roundtrip · tenant isolation ·<br/>wrong-key rejection · PKCE roundtrip"]
    E["E2E (e2e-ts/tests/ui)<br/>login → callback → session → proxy flows<br/>through the real TLS + fleet"]
    U --> I --> E
```

- **Unit layer** (46 tests across modules): encryption roundtrips, wrong-key
  rejection, cookie builders, tenant header parsing, whitelist semantics,
  KeyRing blobs, CIBA request/response contracts, Stat tagging behavior.
- **Integration layer**: session lifecycle against Valkey, tenant
  isolation, deterministic key derivation. DB/Valkey-backed tests
  self-skip when the services are unreachable (platform testing strategy).
- **Deliberately NOT tested here**: full OAuth dance (needs the live auth
  issuer), Bus SSE delivery (e2e), TLS termination (platform TLS suite),
  delegation end-to-end (lifecycle e2e).

## 10. Open Questions

- The telemetry fan-out task implements its consumer against
  `stat:rollups:minute` (Valkey pub/sub) instead of per-session Stat SSE -
  fewer connections, same data, reusing the existing subscribe spawn pattern.
- Transparent refresh converges on the shared FAPI client with DPoP (the
  process DPoP key already exists); the plain-POST path remains only as the
  pre-DPoP-bootstrap fallback.
- `bff.dcr_clients` gains the standard ENABLE/FORCE RLS policy set on
  `env_id`, generated the same way the other tenant tables' policies are.
- The session path wires the KeyRing at session-write time (encrypt with the
  current `date_key_id`, decrypt trying `all_keys` - both implemented) plus a
  background re-wrap task (batch 100, mark by key id).

---

**Design attribution:** sentin8:bff and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

