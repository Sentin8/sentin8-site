---
sidebar_position: 15
---

# Sentin8:Sys — Platform Control Plane

Domain truth for the platform: organizations, environments, the
vertical registry, service enablement, branding, and the central
audit journal. Org and env creation is **synchronous and in-process**
— a 200 means the caller's next request already carries its
membership (read-your-writes on the fundamental path).

## Use cases

- **Tenant onboarding** — sign-up creates the org, provisions the
  access model through auth's membership API (idempotent upserts),
  seeds the env's policy template, and returns 200 only when fully
  provisioned; failures compensate by deleting the record.
- **Vertical enrollment** — `sentin8-cli vertical enroll` registers
  services, scopes, admin UIs, triggers, and app listings from each
  vertical's own declarative `vertical-registry.json` — the platform
  holds zero compile-time vertical knowledge.
- **Service enablement** — `service:updated` events over Bus let each
  vertical service perform its own per-tenant initialization.
- **Audit ingestion** — every service's local `audit_journal` relays
  to Sys's ingest API; a Sys outage never drops audit (journals
  retry).

## API surface

| Group | Endpoints | Gate |
|---|---|---|
| Orgs | `POST/GET /v1/o`, `GET /v1/org/{id}`, members, branding | Shield org scopes |
| Envs | `POST/GET /v1/e`, `GET /v1/env/{id}` | Shield env scopes |
| Resolve | `GET /v1/resolve/hostname` | cert-bound M2M (`sentin8:sys:instances:read`) |
| Audit | `POST /v1/audit`, `GET /v1/audit` | `sentin8:sys:audit:write` / read |
| Admin (RFW) | `/v1/admin/ui/{page}`, `POST /v1/admin/{resource}` | Shield admin scopes |

## Full documentation

The complete detail lives in this product's sub-pages:

- [Architecture (DDD)](design) — the full document, harvested from the unit's repository at build time.
- [Business rules (BRD)](business) — the full document, harvested from the unit's repository at build time.
- [Security](security) — the full document, harvested from the unit's repository at build time.
- [Overview (repo README)](/docs/reference/sys/) — the maintainer's README in the consolidated reference section.

