---
sidebar_position: 16
---

# Sentin8:App — App Store & Instance Management

Third-party applications: listings, installs, instance management, and
the runtime-context bootstrap every app shell fetches before any user
signs in. The platform never hardcodes app→backend mappings — the
listing's metadata carries the developer's backend URL; hostnames
derive from the app's domain at runtime.

## Use cases

- **App marketplace** — a fintech installs a budgeting app into its
  bank instance; a hotel group installs a housekeeping app.
- **Instance provisioning** — each installed app gets a runtime context
  (auth domain, branding, feature flags) resolved from its own origin
  — the SDK fails closed without it.
- **Tenant branding** — app surfaces inherit org/env branding through
  the platform chain.

## API surface

| Group | Endpoints | Gate |
|---|---|---|
| Listings | `GET/POST /v1/listings`, `GET /v1/listings/{slug}` | Shield app scopes |
| Installs | `POST /v1/instances`, `GET /v1/instances` | `sentin8:app:instances:*` |
| Runtime context | `GET /v1/app/runtime/context` | origin-bound (pre-login) |
| Admin (RFW) | `/v1/admin/ui/{page}` | Shield admin scopes |

## Deep dive

[App reference section](/docs/reference/app/) — harvested from
`Sentin8/sentin8-app`.