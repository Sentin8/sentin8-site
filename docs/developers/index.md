---
sidebar_position: 1
---

# Developer guide

The Sentin8 dev story is deliberately small: **clone one repo, build**.

## The single-repo dev story

Every repository is independent and builds alone. The SDKs arrive as
pinned git dependencies; committed `.sqlx` caches mean no live database
is needed to compile:

```bash
git clone https://github.com/Sentin8/sentin8-auth.git
cd sentin8-auth
cargo build            # fetches the SDK pin, builds, done
cargo test             # offline (SQLX_OFFLINE)
```

Vertical repos work identically — clone any service from its vertical
org and build.

## The full tree (aggregation)

To develop across the tree, clone the group folders (or the
`Sentin8/verticals` aggregation root) and use the per-group Makefiles:

```bash
make infra-up          # TLS-only PG 18 + Valkey (the single compose)
make build             # DAG order: sdk → starters → services → verticals
make status            # fleet status (KEY=<ip:port>)
```

Lifecycle: `db bootstrap` → `vertical init` → `vertical enroll` →
`start`. No migration code exists — schema changes rewrite the init
SQL and re-run init (greenfield platform).

## Restart discipline

Restart services only through Sentin8:Captain (never `pkill` or
Ctrl+C — stale registry entries break TLS round-robin):

```bash
make status                          # find KEY=<ip:port>
make upgrade-instance KEY=<ip:port>  # rolling, zero-downtime
```

## Debug iterations

```bash
make build-debug                     # dev profile
make start-debug                     # captain spawns debug binaries
make upgrade-instance-debug KEY=…    # swap one instance
```

## Testing

| Layer | What it covers |
|---|---|
| Unit | per-crate Rust tests, offline |
| Integration | per-repo `tests/` against local infra |
| E2E (UI-only) | Playwright suites through the browser + BFF proxy — no direct SQL or backend calls, ever |

## CI

Every repo runs the shared `sentin8-ci` reusable workflows
(`rust.yml` / `flutter-app.yml` / `e2e-repo.yml` / `docs-group.yml`)
with blocking build/test and advisory fmt/clippy — plus the nightly
aggregation build and e2e sweep across the whole public tree.

## Further reading

- [Remote UI](/docs/developers/remote-ui) — the RFW contract
- [Samples](/docs/samples) — first calls against the platform
- [Security](/docs/security) — what your code inherits by construction