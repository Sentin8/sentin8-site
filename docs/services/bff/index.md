---
sidebar_position: 17
---

# Sentin8:BFF - Backend-for-Frontend & Delegation Gateway

The token guardian: every client-to-backend request flows through the
BFF, which holds OAuth tokens **server-side** - clients hold only
session cookies. The BFF downscopes per target service, enforces CSRF,
and issues delegated tokens for system→env access.

## Use cases

- **Web/mobile app traffic** - all Flutter apps (Dash, eBank, eGuest,
  eTrader, …) call `/proxy/{service}/v1/...`; no token ever reaches
  the browser bundle.
- **Three transport tiers** - queries/mutations over HTTP/2
  (`/proxy/*`), subscriptions over SSE (`/subscribe`), chat over
  WebSocket (`/ws`, the only bidirectional tier).
- **Delegation** - platform-admin tooling accesses tenant envs via
  delegated tokens (`act` claims the originating user, `cnf` binds
  the certificate).

## API surface

| Group | Endpoints | Gate |
|---|---|---|
| Proxy | `ANY /proxy/{service}/{path}` | session cookie + CSRF; downscoped per target |
| Subscribe | `GET /subscribe` | session (SSE, one-way server→client) |
| Chat | `GET /ws` | session (WebSocket, bidirectional) |
| Sign-in | session establishment via Auth redirect flows | public |
| Delegation | `POST /delegate/access-token` | M2M + `sentin8:delegate:read` |

## Full documentation

The complete detail lives in this product's sub-pages:

- [Architecture (DDD)](design) - the full document, harvested from the unit's repository at build time.
- [Business rules (BRD)](business) - the full document, harvested from the unit's repository at build time.
- [Security](security) - the full document, harvested from the unit's repository at build time.
- [Overview (repo README)](/docs/reference/bff/) - the maintainer's README in the consolidated reference section.

