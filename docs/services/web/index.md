---
sidebar_position: 18
---

# Sentin8:Web — Flutter Web Static Host

One process serves every Flutter web app in the platform: app
locations are discovered at request time from runtime-registered
Valkey keys (`captain:app_dir:{slug}`), so the host holds zero
compile-time knowledge of any app or vertical. Every request is
PQ-TLS-terminated in-process; the hostname picks the app; static
assets stream from the app's built `build/web` directory with SPA
fallback.

## Use cases

- **Multi-app hosting** — dozens of app instances (dash, vertical
  admin apps, tenant apps) behind one process, one certificate
  surface, one monitor.
- **Deploy without restarts** — a newly enrolled app is served the
  moment its registry key exists.
- **Same-origin bootstrap** — the `/v1/app/runtime/context` call is
  proxied to Sentin8:App on the app's own origin, so pre-login
  bootstrap works with TLS-injected instance headers.
- **Browser runtime hygiene** — COOP/COEP for WASM threads,
  service-worker stripping for in-app webviews, SPA route fallback.

## API surface

| Endpoint | Method | Gate |
|---|---|---|
| `/{app-slug}/**` | GET | hostname-derived; PQ-TLS in-process |
| `/v1/app/runtime/context` (proxied) | GET | origin-bound |

## Full documentation

The complete detail lives in this product's sub-pages:

- [Architecture (DDD)](design) — the full document, harvested from the unit's repository at build time.
- [Business rules (BRD)](business) — the full document, harvested from the unit's repository at build time.
- [Security](security) — the full document, harvested from the unit's repository at build time.
- [Overview (repo README)](/docs/reference/web/) — the maintainer's README in the consolidated reference section.

