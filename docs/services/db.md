---
sidebar_position: 6
---

# Sentin8:DB — SQL Execution & Data Service

The SQL execution service: apps and third-party code run queries
through an authorized, tenant-scoped data API instead of direct
database connections. The database itself is reachable only by
enrolled services holding certificate identities.

## Use cases

- **Authorized app queries** — a third-party app store application
  queries tenant data through the BFF with downscoped tokens, never a
  raw DSN.
- **Schema introspection** — clients discover table shape through the
  same authorized surface.
- **Row-level visibility** — every query rides the RLS context the
  authorization pipeline stamps; a compromised app sees only its
  tenant's rows.

## API surface

| Endpoint | Method | Gate |
|---|---|---|
| `/v1/health` | GET | none |
| `/v1/query` | POST | Shield `sentin8:db:query` — statement execute |
| `/v1/schema` | GET | Shield `sentin8:db:schema` — introspection |
| `/v1/tables/{name}` | GET | Shield `sentin8:db:query` — describe |

## Deep dive

[DB reference section](/docs/reference/db/) — harvested from
`Sentin8/sentin8-db`.