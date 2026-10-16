---
title: "Sentin8:Auth - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-auth/edit/main/BUSINESS.md
---
# Sentin8:Auth - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Auth **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Auth is the platform's **single identity plane**. It is the only
issuer of every credential the platform trusts - no other service can mint
tokens or publish signing keys. The business value it delivers:

- **One sign-in plane for every product.** A single user identity works
  across the platform dashboard, native apps, CLI, and every vertical -
  users sign in once, tokens are issued per product with the exact
  permissions that user holds.
- **Regulatory-grade security posture by default.** Financial-grade
  (FAPI 2.0) security profiles, sender-constrained tokens (DPoP, mTLS
  certificate binding), and post-quantum signing keys are the default
  posture - not add-ons.
- **Zero-trust authorization.** A user's actual permissions are resolved
  live at request time; demoting an employee takes effect on their next
  request, not at token expiry. Revoking a session kills downstream cached
  access immediately (push-based invalidation).
- **Enterprise-ready workforce identity.** SCIM 2.0 provisioning, OIDC/SAML
  enterprise federation, and passkey/MFA authentication out of the box.
- **Digital wallet credentials.** Issuance and verification of SD-JWT
  wallet credentials (EUDI-style) for regulated use cases.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Identity & credentials | User accounts (sign-up, sign-in, sign-out, email verification, password reset), sessions, app passwords, MFA factors (TOTP, backup codes), passkeys (WebAuthn), recovery flows |
| OAuth / OIDC | Authorization-code + PKCE, refresh rotation with replay detection, device code flow, CIBA (decoupled approval), token exchange, client credentials (M2M), PAR, JARM, JAR, introspection, revocation, userinfo, back-channel logout |
| RBAC substrate | Roles (with hierarchy/nesting), groups, memberships, role assignment, API keys, OAuth client registry (including DCR), M2M scope grants |
| Consent grants | FAPI 2.0 standing consent records; tokens embed a grant id so revocation cascades |
| Enterprise federation | OIDC and SAML connections for enterprise single sign-on |
| Provisioning | Membership provisioning API (roles/groups/users into a target environment) used by Sentin8:Sys for org/env/app provisioning |
| Wallet credentials | OID4VCI-style credential issuance, SD-JWT with selective disclosure, key binding, status lists (revocation), presentation handling |
| Actor tokens | Time-boxed, fully audited delegated-actor tokens for admin-assistant (sentin8or) flows |
| Webhooks | Webhook endpoint registry, signed (HMAC) delivery with retries, delivery attempt history |
| Security profiles | Per-platform / per-org / per-env security profile configuration (FAPI 2.0 default) |
| Brandable sign-in | Per-tenant branded sign-in experience via branding metadata |
| Notification emails | Transactional email (via Sentin8:Post) - sign-up, reset, and MFA emails |
| Audit | Local audit journal with spill-to-Sys; admin audit query surface |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Organization/environment/app records | Sentin8:Sys |
| Authorization policy storage & decisions | Shield (Sentin8:Policy - storage substrate in Sys) |
| Sending emails | Sentin8:Post (auth only enqueues + pushes `post_outbox`) |
| E-signature / QES ceremonies | delegated to the bank8 vertical (returns NOT IMPLEMENTED until then) |
| Invitations records | Sentin8:Sys (auth proxies to sys) |

## 3. Business Capabilities

### 3.1 User Authentication

| Capability | Business rule |
|---|---|
| Sign-up | Self-service registration with email verification; per-environment user uniqueness (email unique per env) |
| Sign-in | Password sign-in with anti-enumeration protection (uniform login failure; dummy bcrypt compare on unknown accounts) |
| Sessions | Server-verified sessions with expiry; sign-out and admin termination; every revocation pushes immediate invalidation events |
| Password reset | Self-service reset tokens with expiry and one-time use |
| MFA | TOTP enrollment, verify, disable; secrets encrypted at rest |
| Passkeys | WebAuthn enrollment + verification (passwordless login) |
| App passwords | Per-app passwords for apps without OAuth support |
| Enterprise SSO | OIDC and SAML connections to enterprise IdPs; federated credentials |
| Bot protection | IP 10/min + email 5/min rate limits; 5 failures → durable account lockout |
| Branding | Tenant-branded sign-in pages |

### 3.2 Token Issuance (all families)

| Capability | Business rule |
|---|---|
| User access tokens | 900s lifetime (FAPI default), grant-bound |
| Refresh tokens | 30-day, rotated on use, replay detection (consumed jti denylist) |
| ID tokens | OIDC ID token issuance (with JARM when profile demands) |
| M2M (client_credentials) | Certificate-bound by default (RFC 8705 `cnf`); mTLS-only registration path |
| API-client tokens | API keys for non-OAuth programmatic access |
| Actor tokens | Time-boxed (≤3600s), fully audited, revocable by jti |
| Delegated tokens | BFF-issued delegated access via `/delegate/access-token` (M2M + `sentin8:delegate:read` + cnf match) |
| Authorization grants | Standing consent records per (env, user, client); idempotent - widened/narrowed not duplicated; grant_id embedded in tokens |
| CIBA | Decoupled approval bound to the approving user's session (body user/org/env ids ignored) |
| Device flow | CLI and device-based sign-in with verification page |
| Token exchange | OAuth token exchange grant |
| Introspection | Honest introspection - `none`-auth clients hard-rejected; signed JWT responses per profile |
| Revocation | OAuth refresh/access revocation with family cascade |
| Token binding | DPoP proof validation with jti replay protection; mTLS cert thumbprint binding; HTTP message signatures (RFC 9421) |
| Wallet/SD-JWT | SD-JWT issuance, selective disclosure, key binding (embedded jwk + sd_hash), status-list revocation enforcement |

### 3.3 RBAC & Client Administration

| Capability | Business rule |
|---|---|
| Users | Full CRUD, status (active/suspended/archived/locked), role and group assignment |
| Roles | Full CRUD, nesting (hierarchy), platform role catalog seeding |
| Groups | Full CRUD, membership + role binding |
| OAuth clients | Full CRUD, authentication method, grant types, TLS subject DN/thumbprint, consent requirement, DPoP exemption |
| API keys | Issuance and lifecycle management |
| Sessions admin | Listing, inspection, termination of any user's session |
| Provisioning API | `POST /v1/admin/provision/*` - idempotent upserts of roles, role nesting, groups, group roles, group members, user roles into a target environment (env-scoped header) |
| Admin UI (RFW) | Remote UI pages for all admin surfaces |
| Security profiles admin | Platform/org/env-level security profile configuration |
| Audit | Admin-facing audit query surface |

### 3.4 Notifications & Events

| Capability | Business rule |
|---|---|
| Event emission | Every identity lifecycle change (user/role/group/client/apikey/session/membership/dcr/connection/mfa/passkey/actortoken/securityprofile/webhook/grant/ciba) emits a payload-complete domain event via the local outbox, in the same transaction as the change |
| Webhooks | Signed (HMAC-SHA256) delivery to registered endpoints with retry (30s exponential backoff ×5) and attempt history |
| Emails | Transactional emails (verification, reset, MFA) delivered via Sentin8:Post |
| Session invalidation | `sentin8:auth:session:revoked` pushed for every revocation path; the BFF session-reaper consumes them so cached sessions die immediately |

## 4. Business Events (Outbound)

Event family `auth`; names follow `sentin8:auth:{resource}:{operation}`.

| Event | When |
|---|---|
| `sentin8:auth:user:created/updated/deleted` | User lifecycle |
| `sentin8:auth:role:created/updated/deleted` | Role lifecycle |
| `sentin8:auth:group:created/updated/deleted` | Group lifecycle |
| `sentin8:auth:client:created/updated/deleted` | OAuth client lifecycle |
| `sentin8:auth:credential:issued/revoked` | Wallet credential lifecycle |
| `sentin8:auth:apikey:created/revoked` | API key lifecycle |
| `sentin8:auth:session:revoked/terminated` | Session end; `session:revoked` carries a payload-complete envelope so BFF kills cached sessions immediately |
| `sentin8:auth:membership:changed` | Group/role membership provisioning |
| `sentin8:auth:dcr:registered` | Dynamic client registration |
| `sentin8:auth:connection:created/updated/deleted` | Enterprise connection lifecycle |
| `sentin8:auth:mfa:enabled/disabled` | MFA factor changes |
| `sentin8:auth:passkey:enrolled/removed` | Passkey lifecycle |
| `sentin8:auth:actortoken:issued/revoked` | Actor token lifecycle |
| `sentin8:auth:securityprofile:updated` | Security profile changes |
| `sentin8:auth:webhook:created/updated/deleted` | Webhook endpoint lifecycle |
| `sentin8:auth:grant:recorded/revoked` | Consent grant lifecycle |
| `sentin8:auth:ciba:created` | CIBA flow creation |

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **Single issuer.** No other service mints tokens or publishes JWKS.
2. **M2M tokens are certificate-bound by default** - a stolen token without the private key is useless.
3. **Authorization decisions are live** - no roles/groups embedded in JWTs; Shield resolves per request.
4. **Refresh token replay is detectable and denied** - rotation + jti denylist.
5. **No existence oracles** - uniform error responses prevent email enumeration.
6. Tenant-scoped uniqueness - emails/roles/groups unique per `(env_id, …)`.
7. Actor tokens are time-boxed (≤ 3600s) and fully audited; revocable by jti.
8. **Signing keys are encrypted at rest**; a wrong/rotated master key refuses boot.
9. No `unsafe` code in the service.
10. Sessions, grants, and admin listings always resolve the tenant inside one transaction (RLS context is transaction-local).
11. Webhook deliveries and audit events ride the durable outbox - never fire-and-forget HTTP.
12. CIBA approval binds to the session; approval cannot be replayed across sessions.
13. DCR for `client_credentials` requires an mTLS client certificate - there is no plaintext M2M credential path.
14. **No per-pass identity churn in background pushers** - long-lived pushers bind their M2M identity for the process lifetime (token-source self-heal on 401, not per-pass rebuilds).

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Auth |
|---|---|
| End user | Signs in/out, manages own MFA, passkeys, app passwords, sessions, consents, password reset |
| Platform / org admin | Creates users, assigns roles/groups, manages OAuth clients, API keys, security profiles, webhooks, sessions |
| Enterprise IdP / directory | SCIM provisioning of users and groups; OIDC/SAML enterprise federation |
| Developer / CLI user | Device flow sign-in; API keys for programmatic access |
| Native app | OAuth flows for mobile/desktop apps; app passwords for non-OAuth legacy |
| Wallet holder | Receives/holds SD-JWT wallet credentials; presents them for verification |
| Backend service (M2M) | Registers via DCR with a certificate; sources cert-bound tokens |
| Admin assistant (sentin8or) | Operates via time-boxed actor tokens |

## 7. KPIs / Success Criteria

- **Security**: zero plaintext M2M credentials anywhere; refresh-token replay attempts denied; no account-enumeration oracles; TOTP secrets encrypted at rest.
- **Availability**: identity plane outage = platform outage - health endpoint up, JWKS continuously available, boot fails closed on missing master key.
- **Authorization freshness**: role/consent changes take effect on the next request; session revocation kills cached access immediately.
- **Compliance**: FAPI 2.0 posture by default; post-quantum-signed keys; status-list revocation enforced.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:DB | PostgreSQL persistence (schema `auth`) |
| Sentin8:Bus | Publishing identity lifecycle events (local outbox → Bus produce) |
| Sentin8:Post | Transactional email delivery (verification/reset/MFA) |
| Sentin8:Sys | Audit spill; provisioning callbacks; invitations proxy |
| Valkey | Auth codes, PAR, CIBA, device codes, denylists, rate/lockout counters |
| Shield (Sentin8:Policy) | Authorization decisions on admin endpoints (roles resolved live) |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A brand-new user can self-register, verify email, sign in, enroll MFA and passkeys, and recover access via self-service reset.
2. An admin can create users/roles/groups/clients, assign permissions, and see the effect on the next request (no token-expiry wait).
3. A backend workload can register via DCR with a certificate and source cert-bound tokens; a stolen token alone grants nothing.
4. Revoking a session kills cached downstream access immediately (BFF session-reaper via `sentin8:auth:session:revoked`).
5. Every OAuth/OIDC flow works per profile: PKCE, refresh rotation with replay detection, device, CIBA, introspection, revocation, userinfo, back-channel logout.
6. Wallet credential issuance + SD-JWT verification with key binding and status-list revocation works end-to-end.
7. SCIM directory sync provisions users/groups without bespoke connectors.
8. Enterprise SSO works via OIDC federation (SAML beyond metadata/ACS is a declared non-goal).
9. Every lifecycle change emits a payload-complete domain event; a Bus outage never loses events (outbox durability).
10. Emails (verification/reset/MFA) arrive via Sentin8:Post.
11. All admin surfaces are exposed via RFW admin UI pages.
12. Build clean, zero warnings; all service tests pass.

## 10. Open Business Questions

- QES e-signature ceremonies stay delegated to the bank8 vertical - the `signature_request` endpoint returns NOT IMPLEMENTED until that integration lands.
- Webhook deliveries gain a DLQ replay surface mirroring post's `replay_dlq` shape.
- Automated JWKS rotation scheduling delegates to Sentin8:Cron (a recurring schedule targeting the internal rotation endpoint).
- Continuous access evaluation: risk-signal gating of new token issuance layers on top of the live authorization already implemented.


---

**Design attribution:** sentin8:auth and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

