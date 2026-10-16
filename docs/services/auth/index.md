---
sidebar_position: 2
---

# Sentin8:Auth — Identity, OAuth/OIDC & Authorization Issuer

The single identity plane: the only token issuer, the only JWKS
authority, the only authentication authority in the platform. OAuth
2.1, OIDC, FAPI profiles, SCIM provisioning, wallet credentials,
lockout and bot protection — every authenticated request in every
service verifies tokens minted here.

## Use cases

- **Sign-up & sign-in for any vertical's users** — a bank customer, a
  hotel guest, an exchange trader all authenticate through the same
  issuer with the same lockout, rate limits, and branding.
- **Machine-to-machine identity** — workloads present Acme-issued
  certificates; Auth authorizes scope grants from the enroll-published
  registry (no tokens on the platform workload path at all).
- **Third-party client onboarding (DCR)** — out-of-band tenant clients
  register dynamically and receive client credentials bound to their
  declared scopes.
- **Cross-tenant delegation** — the BFF mints delegated tokens
  (`token_tp: "delegated"`, cert-bound via `cnf`) for system→env
  access, with the originating user claimed in `act`.
- **Directory sync (SCIM)** — HR systems provision users/groups into
  any vertical without touching service code.
- **Wallet credentials** — SD-JWT key binding + status list for
  privacy-preserving re-usable credentials.

## API surface

| Group | Endpoints | Gate |
|---|---|---|
| Discovery | `/.well-known/openid-configuration`, `/.well-known/jwks.json` | public |
| OAuth flows | `/oauth/authorize` (+`/authorize/continue`), `/oauth/par`, `/oauth/token`, `/oauth/device` + `/device/verify`, `/oauth/userinfo`, `/oauth/logout` | session/cookie or client auth per flow; bot protection + lockout on sign-in |
| Sessions | `/v1/sign-in`, `/v1/sign-up`, `/v1/sign-out`, `/v1/branding`, `/v1/health` | session; lockout after failures |
| Workload mTLS | `/mtls/oauth/token`, `/mtls/oauth/revoke` | cert-presence guard — out-of-band tenant clients only |
| DCR | `POST /oauth/register` | interactive clients open; client_credentials requires mTLS cert |
| Delegation | `POST /delegate/access-token` | verified M2M bearer + `sentin8:delegate:read` + `cnf` match |
| Wallet | `/oauth/credentials*`, `/oauth/vp/response`, `/v1/auth/wallet/metadata` | bearer / VP verified |
| Admin (RFW + API) | `/v1/admin/{users,roles,groups,oauth-clients,api-keys,sessions,memberships,invitations,audit}` | Shield admin scopes |
| Provisioning | `POST /v1/admin/provision/{role,role_nesting,group,group_member,user_role}` | admin bearer + target env header; idempotent upserts |
| SCIM | `/scim/v2/Users`, `/scim/v2/Groups` | `sentin8:scim:read`/`write` |

## Token families

| Family | Purpose |
|---|---|
| User | all authenticated user access |
| ID | identity claims for clients |
| Refresh | rotated, revocable sessions |
| M2M | `client_credentials`, certificate-bound by default (RFC 8705 `cnf`) |
| API-client | programmatic first-party clients |
| Actor | time-boxed, audited impersonation |
| Delegated | BFF-issued, `token_tp: "delegated"`, `act` claims the originating user |

No `realm` exists: a platform operator, a bank teller, and a retail
customer differ only by their RBAC assignments. Authorization is decided
by Shield against live-resolved roles; the JWT `scope` claim pre-filters
and feeds RLS — never decides.

## Full documentation

The complete detail lives in this product's sub-pages:

- [Architecture (DDD)](design) — the full document, harvested from the unit's repository at build time.
- [Business rules (BRD)](business) — the full document, harvested from the unit's repository at build time.
- [Security](security) — the full document, harvested from the unit's repository at build time.
- [Overview (repo README)](/docs/reference/auth/) — the maintainer's README in the consolidated reference section.

