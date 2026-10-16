---
sidebar_position: 20
---

# sentin8-cli - Platform Bootstrap & Enrollment

The operator's starter: database bootstrap, vertical initialization
and enrollment, captain control, catalog plumbing. Everything the
platform's greenfield lifecycle needs, in one binary.

## Use cases

- **First boot** - `sentin8-cli db bootstrap` creates the platform
  database and applies `platform.sql`.
- **Vertical bring-up** - `vertical init` creates the vertical's
  PostgreSQL database from its own SQL; `vertical enroll` registers
  services, scopes, admin UIs, triggers, app listings, PG ident maps,
  and Valkey ACL users from the vertical's declarative registry.
- **Fleet control** - `captain start/upgrade/restart/status` through
  the captain's guarded API.

## Lifecycle

```bash
make infra-up                       # TLS-only PG 18 + Valkey
sentin8-cli db bootstrap           # platform database
vertical init                       # {vertical} database + SQL
vertical enroll                     # registry: services, scopes, apps, ident maps
make start                          # captain spawns the fleet
```

No migration code exists anywhere: this is a greenfield platform;
schema changes rewrite the init SQL and re-run `init`.

## Full documentation

The complete detail lives in this product's sub-pages:

- [Architecture (DDD)](design) - the full document, harvested from the unit's repository at build time.
- [Business rules (BRD)](business) - the full document, harvested from the unit's repository at build time.
- [Security](security) - the full document, harvested from the unit's repository at build time.
- [Overview (repo README)](/docs/reference/cli/) - the maintainer's README in the consolidated reference section.

