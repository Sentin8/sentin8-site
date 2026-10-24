---
title: "Sentin8:BFF - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-bff/edit/main/BUSINESS.md
---
# Sentin8:BFF - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:BFF **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:BFF is the platform's **backend-for-frontend and delegation
gateway**. Every browser/app interaction with the platform flows through
it. The business value it delivers:

- **Tokens never reach the client.** Browsers and mobile apps cannot be
  trusted with access/refresh tokens (XSS, storage exfiltration). The BFF
  holds them server-side in an encrypted session store; the client
  authenticates with a session cookie plus a CSRF token for mutations.
- **Per-app tenant resolution.** Every proxied request resolves
  (env, app, org) before forwarding; the platform's TLS layer injects
  authoritative context headers the BFF consumes - hostname parsing is
  only a loudly-warned fallback for non-TLS local dev.
- **Delegation without a token in the middle.** Cross-tenant trust
  (system→env, user→app) is brokered by cert-bound M2M tokens; the BFF
  issues delegated tokens (`act` claims the originating user) and
  downscopes them per service - never broad-scope passthrough.
- **Session lifetime independent from token lifetime.** Idle-timeout
  sessions with transparent token refresh let the SPA stay valid across
  provider outages without exposing refresh logic to the client.
- **Three transport tiers.** Queries/mutations over HTTP/2, one-way
  subscriptions over SSE, bidirectional chat over WebSocket - each tier
  used for what it is semantically right for.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| OAuth login flows | PKCE authorization-code login/sign-up with PAR, callback exchange, session establishment - per-app-instance auth domains and DCR clients |
| Session management | Server-side encrypted session store (Valkey, AES-256-GCM at rest); idle 7d / absolute 30d TTLs; sign-out with refresh revocation; multi-session listing/revocation per device; key rotation with re-wrap |
| Proxy data path | `ANY /proxy/{service}/{*rest}` - session validation, CSRF on mutations, transparent token refresh, header hygiene, forwarding; upstream errors surfaced verbatim (401 passthrough, 502 on transport) |
| Delegation Gateway | Platform-admin RFC 8693 token exchange to a target env (downscoped, cached); customer CIBA delegation (assisted login / decoupled approval) with start/poll/status/send-link |
| SCIM proxy | Delegated SCIM user management (`/delegate/scim/*`) via the delegator M2M |
| Subscriptions | SSE `/subscribe` - Bus consumer per session with per-event authorization (user/RBAC filters), heartbeat, subscription mutations; stat rollup push |
| Chat | WebSocket `/ws` rooms - the only bidirectional tier; session-authenticated upgrade |
| Session-reaper | Bus subscription (`auth` family) killing cached sessions on `sentin8:auth:session:revoked` - revocations take effect immediately |
| Service actions | Shield-gated `/bff/action/{action}` registry surface |
| Mobile push bridge | `POST /subscribe/push` session-bound device tokens; SSE fan-out enqueues into the local `post_outbox` → Post's send API |
| Health | Liveness, readiness (Valkey ping), metrics |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Identity / token issuance | Sentin8:Auth (issues and verifies every token) |
| Tenant records (`sys.environments`, `sys.organizations`) | Sentin8:Sys (read-only, context-first) |
| App instances / scope whitelists | Sentin8:App (`sys.app_instances` - read context-first) |
| Domain events | the BFF produces none - it consumes and relays |
| Business logic | Delegation, tenant resolution, downscoping live in shared SDKs/backend services; the BFF stays a transport guardian |
| Session persistence in SQL | sessions deliberately live in Valkey (`bff:session:{id}`), not PostgreSQL |

## 3. Business Capabilities

### 3.1 Sign-in & Session Lifecycle

| Capability | Business rule |
|---|---|
| Login / sign-up | Redirect to the env-scoped Auth authorize with a PKCE verifier cookie (Max-Age 300); per-app-instance auth domain + DCR client resolution |
| Callback | Code exchange; fail-closed claims decode (D4), auth-env match (D3), app-group gate (F-A) - a failure yields no session |
| Session cookie | `HttpOnly; Secure; SameSite=None`, domain scoped to the app instance (never the platform root) - cookies never leak across sibling apps |
| Session metadata | `/auth/session` returns metadata + CSRF token only - never tokens |
| Sign-out | Refresh token revoked at Auth `/oauth/revoke`; session destroyed; cookies cleared |
| Refresh | Transparent on-expiry refresh inside the proxy; explicit `POST /auth/refresh` updates tokens/scope/expiry in place |
| Multi-session management | `GET /v1/auth/sessions` lists the caller's sessions (bounded scan); `DELETE /v1/auth/sessions/{id}` destroys one (404 predicate - no cross-user destroy, no existence oracle); `DELETE /v1/auth/sessions` revokes all except the current one |
| Session lifetime | Idle 7d / absolute 30d TTLs (configurable); idle timeout sessions with transparent refresh |
| Key rotation | KeyRing blob format with retained old keys; sessions re-wrapped (decrypt-old, encrypt-new) so rotation never strands users |
| Session-reaper | `sentin8:auth:session:revoked` events kill cached sessions immediately (continuous access evaluation) |

### 3.2 Proxy Data Path

| Capability | Business rule |
|---|---|
| Proxy | Session validation → D2 app-binding check (fail-closed 401) → CSRF (mutations) → token resolution → forward with bearer |
| Transparent refresh | Expired tokens refresh automatically; the rotated pair replaces the old in one atomic session write |
| Delegation on proxy | Platform admins target a specific env (`x-bff-target-env-id`): RFC 8693 exchange via cert-bound M2M, downscoped per service, cached per `{session}:{env}:{service}` |
| Tenant resolution | TLS-injected `X-Sentin8-*` headers primary; `org_id` never trusted from the wire - always resolved server-side from `env_id` |
| Header hygiene | Client-supplied `X-Sentin8-*` headers stripped; only TLS-injected context is forwarded upstream |
| Scope whitelist | Per-app scope/service whitelists (from `sys.app_instances`, 5-min cache) - the BFF refuses to proxy scopes outside the app's grant |
| App-BFF blocklist | App BFFs never proxy `auth`, `app`, `sys`, `tls` |
| Error semantics | Upstream 401 passthrough (session preserved); unresolved backend / transport error → 502; everything else passes through untouched |
| Stat tagging | Server-tagged upstream responses for observability (which instance served which call) |

### 3.3 Delegation & CIBA

| Capability | Business rule |
|---|---|
| Delegation start | `POST /delegate/start` - `bc-authorize` at the customer auth; `act` claims from the session, never the body |
| Poll | `POST /delegate/poll` - CIBA grant + DPoP proof; the approved customer token is cached |
| Status | `GET /delegate/status` - cached token + metadata |
| Send link | `POST /delegate/send-link` - decoupled approval link (stub acknowledges) |
| No fallback | Delegation 403 → 403 to the client; transient errors → 502; a failed delegation never silently forwards the staff token |
| Poll bounds | Bounded (60 polls × interval); terminal states pushed over SSE once |
| SCIM proxy | Six delegated SCIM verbs via the delegator M2M (`sentin8:scim:read/write`) |

### 3.4 Subscriptions, Chat, Push

| Capability | Business rule |
|---|---|
| SSE subscriptions | Per-session Bus consumer with per-event filters (user id / stat.traffic RBAC); heartbeats every 15s; subscription mutations (409 when no live stream) |
| Event hygiene | `publisher_id_token` stripped before any event reaches the browser |
| Chat | `/ws` rooms per env/app; session-authenticated upgrade; ping loop |
| Stat rollups | Telemetry fan-out via Valkey pub/sub `stat:rollups:minute` multiplexed to subscribed SSE sessions |
| Mobile push | Session-bound device tokens; SSE fan-out enqueues into the local `post_outbox` (relayed to Post's send API - no direct `post.inbox` writes) |

## 4. Business Events (Outbound)

The BFF **produces no domain events** (it consumes and relays). It emits
internal push types only: `sentin8:delegation:result`,
`sentin8:delegation:expired`, `sentin8:bff:session:expired`, and relays
convention-valid Bus events through the per-service stream-family map.

**Inbound (consumed):** all platform Bus stream families (per-session
SSE consumers, group `sse-{session_prefix}`), the `auth` family
(session-reaper, group `bff-session-reaper`), and `stat:rollups:minute`
(Valkey pub/sub).

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **Tokens never reach the browser.** Sessions store encrypted token blobs; `/auth/session` returns metadata + CSRF only. (The CIBA delegation token response is the one contractual exception - the customer's own delegated credential, delivered once to the delegating staff app.)
2. **Fail-closed binding.** D2 (session↔application), D3 (token auth-env↔app instance), D4 (undecodable claims) - a request that cannot resolve a tenant context is rejected, never defaulted.
3. **Delegation has no fallback.** A failed delegation never silently forwards the staff token.
4. **Cert-bound M2M only.** The delegator token source is always `/mtls/oauth/token` with the RFC 8705 thumbprint presented.
5. **App-BFF service blocklist** - `auth`, `app`, `sys`, `tls` are never proxied by app BFFs.
6. **`org_id` never trusted from the wire** - always resolved server-side from `env_id` under a context-first transaction.
7. **Cookie scoping** - the session cookie domain is the app instance's domain (never the platform root).
8. **Encrypted sessions at rest** (AES-256-GCM); a stolen Valkey snapshot yields ciphertext only; the built-in dev encryption key is rejected operationally - production must set a real key.
9. **Multi-session revocation keeps the current session** and destroys only records owned by the caller; each destroyed refresh token is revoked at Auth (no orphaned live grants).
10. **Transparent refresh is atomic per session** - the rotated pair replaces the old pair in one write; a failed refresh terminates the session.
11. **Proxied requests strip client-supplied `X-Sentin8-*` headers** - only TLS-injected context is trusted upstream.
12. **No `unsafe` code.**

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:BFF |
|---|---|
| End user (browser) | Signs in via the OAuth flow; uses the SPA whose every backend call rides the proxy; manages their own sessions/devices; subscribes to live updates; chats |
| Platform admin | Targets a specific env through the delegation gateway (downscoped, audited); uses Shield-gated service actions |
| Staff operator (bank/hotel teller) | Starts a customer CIBA delegation (assisted login), polls status, manages the customer via delegated SCIM |
| App developer | Ships a Flutter app that authenticates through the BFF and consumes `/proxy/*`, `/subscribe`, `/ws` - never handles tokens |
| Compliance/audit | Verifies tokens never reach clients; reads delegation audit trails (riding the owning services) |
| Mobile user | Registers a push device token; receives push notifications via the Post bridge |

## 7. KPIs / Success Criteria

- **Security**: zero tokens in the browser; CSRF enforced on mutations; fail-closed tenant resolution; delegation never falls back.
- **Availability**: BFF availability is critical (horizontal scale); readiness reflects Valkey health while the service keeps serving.
- **Session quality**: sessions survive token expiry via transparent refresh; survive key rotation via re-wrap; die immediately on revocation (session-reaper).
- **Correct routing**: every proxied request resolves the right tenant and honors the app's scope whitelist; blocklisted services are unreachable.
- **Real-time UX**: subscriptions deliver authorized events only, with heartbeats and bounded backpressure (lag skips, not disconnects).

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:Auth | OAuth flows (PKCE + PAR), token refresh, RFC 8693 exchange, CIBA backchannel, SCIM delegation, JWKS |
| Valkey | Session store, delegation caches, SSE consumer state, stat pub/sub |
| Sentin8:Sys | Tenant records, app instances, scope whitelists, service-action registry (read-only) |
| Sentin8:Bus | SSE event streams (consume + ACK) |
| Sentin8:Stat | Rollup push (Valkey pub/sub), server tagging |
| Sentin8:Post | Mobile push delivery (local `post_outbox` → Post send API) |
| Shield (Sentin8:Policy) | `/bff/action/{action}` registry evaluation |
| Sentin8:Proxy / TLS | Ingress, PQ-TLS termination, context header injection |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A user can log in through the BFF (PKCE + PAR) and use the SPA with every backend call proxied - without the browser ever holding a token.
2. Sessions survive token expiry (transparent refresh) and key rotation (re-wrap); sign-out revokes the refresh token at Auth.
3. A user can list and revoke their own sessions (per-device), keeping the current one; revocation at Auth kills cached BFF sessions immediately.
4. A platform admin can operate on a target env through downscoped delegated tokens; the staff token is never forwarded when delegation fails.
5. A staff operator can run a CIBA assisted-login (start/poll/status) and manage the customer through delegated SCIM.
6. SSE subscriptions deliver only events the user is authorized for; heartbeats keep connections alive; `publisher_id_token` is stripped.
7. Chat works over `/ws` with session-authenticated upgrade.
8. The proxy honors per-app scope whitelists and never proxies `auth`/`app`/`sys`/`tls` for app BFFs.
9. Tenant resolution always comes from TLS-injected headers; `org_id` never from the wire; unresolvable context is rejected.
10. Mobile push registration works and rides Post for delivery.
11. Health/readiness/metrics surfaces exist for fleet operations.

## 10. Open Business Questions

- Multi-region session affinity keeps the regional store (correct for a regional issuer topology); stickiness is added when multi-region lands.
- Per-request token minting (high-security actor tokens per request via the token-exchange pattern) is the escalation path.
- Large uploads route through the Storage presigned-PUT pattern (the BFF mints the presigned URL).
- Post's `push` gateway is a stub today; real FCM/APNs adapters drop in behind the same contract.


---

**Architecture & Design:** sentin8:bff and its underlying concepts were designed by [Hamid Jahanzad](https://www.linkedin.com/in/hamidjahanzad/).

