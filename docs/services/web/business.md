---
title: "Sentin8:Web - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-web/edit/main/BUSINESS.md
---
# Sentin8:Web - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Web **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Web is the platform's **single static host for every Flutter web
app**. One process serves all apps across all verticals - the dash, vertical
admin apps, and tenant apps - with app locations discovered at request
time. The business value it delivers:

- **One process per machine for all app shells.** The platform hosts
  dozens of app instances; a per-app static server would multiply
  processes, certificates, and monitoring. A single multi-app host with
  runtime discovery keeps the fleet small and apps deployable without
  restarts.
- **Zero compile-time vertical knowledge.** App directories exist in
  every workspace (`sentin8/apps/`, `bank8/apps/`, `hotel8/apps/`…);
  hardcoding those paths would couple the platform to its verticals.
  Registry-key discovery keeps the host generic - a newly enrolled app
  is served the moment its key exists.
- **Same-origin bootstrap.** Flutter apps must fetch their runtime
  context (auth domain, branding, feature flags) before any user signs
  in. Web proxies that call to Sentin8:App on the app's own origin so
  the TLS-injected instance headers establish the caller identity.
- **Browser runtime constraints, solved once.** Flutter WASM with
  threads needs cross-origin isolation headers; service-worker
  registration must be stripped for in-app webviews; SPA routes need an
  index fallback. The host centralizes these instead of every app
  rebuilding them.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Multi-app hosting (default) | Hostname decides the app (first DNS label = slug, e.g. `ebank.prod.ibank.local` → `ebank`); `captain:app_dir:{slug}` Valkey key → built web directory; on-the-fly discovery (no restart for new apps) |
| Single-app mode (dash) | `--web-root` / `SENTIN8_WEB_ROOT` serves one fixed directory for all requests; fail-fast without `index.html` |
| Static/SPA serving | Path traversal protection (canonicalize containment), SPA fallback (extensionless → index.html; missing-with-extension → 404), MIME handling, streamed asset bodies |
| Flutter bootstrap patching | In-memory `serviceWorkerSettings → {}` patch (brace-depth scanner, string-safe), served `no-store, must-revalidate` |
| Cross-origin isolation | `COOP: same-origin` + `COEP: require-corp` on the bootstrap, `main.dart.js`, and `.wasm` files - required for multi-threaded WASM |
| Runtime-context proxy | `GET /v1/app/runtime/context` → Sentin8:App (public, pre-login; forwards only `x-sentin8-*` + `host` headers; relays response; 502 on app outage) |
| Health | `/v1/health` with status + build hash (bypasses the traffic counter) |
| TLS posture | In-process PQ-TLS termination, on-demand SNI cert resolution, context middleware (strip client `X-Sentin8-*`, inject authoritative ones) |
| Traffic metrics | Request counter (excluding health) flushed to Valkey every 10s |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| App binaries | Each vertical's app (built `build/web` directories) |
| The app registry | `vertical enroll` writes the `captain:app_dir:{slug}` keys (web only reads) |
| Runtime context data | Sentin8:App (web relays it) |
| TLS certificates | Resolved per-SNI via `sentin8-tls` (Acme issues) |
| Persistent state | None - no tables, no outbox, no Bus events, no DB role |
| User authentication | None - static assets are the app shell; the context proxy is public pre-login by contract |

## 3. Business Capabilities

### 3.1 App Discovery & Serving

| Capability | Business rule |
|---|---|
| Hostname → app | Slug = first DNS label before `.{env}.{org}.{domain}`; app slugs cannot contain dots (enforced at registration) |
| Discovery | `captain:app_dir:{slug}` lookup per request - O(1), no sys API hop, no restart for newly built/registered apps |
| Unresolvable app | 404 naming the hostname - never a wrong app's content (empty hostname, missing key, missing index, or no Valkey all 404) |
| Dash mode | Single fixed web root for all requests; boot fails fast without `index.html` (run `flutter build web` first) |
| One code path | Both modes share `serve_from_web_root`: decode → canonicalize → containment → stream / SPA fallback → 404 |

### 3.2 Browser Runtime Guarantees

| Capability | Business rule |
|---|---|
| Traversal protection | Canonicalize-based containment - encoded `..%2F` sequences decoded first; escapes 404, never served (test-pinned) |
| SPA fallback | Extensionless paths serve `index.html` (client-side routing); missing files WITH an extension 404 |
| Bootstrap patch | Service-worker settings replaced in memory; `no-store` guarantees a rebuilt app is never shadowed by a cached bootstrap |
| WASM isolation | COOP/COEP on the three wasm-thread-critical file kinds |
| Streaming | Large WASM bundles stream (`ReaderStream`); content-length from metadata - never fully buffered |

### 3.3 Bootstrap Proxy & Operations

| Capability | Business rule |
|---|---|
| Context proxy | Public, pre-login (instance metadata only - same trust basis as the app shell itself; a bearer gate would 401 every first paint) |
| Header hygiene | Only `x-sentin8-*` + `host` forwarded; arbitrary client headers are not re-emitted by construction |
| Host fallback | Under the L4 proxy (no header injection), the `Host` header (port stripped) is the hostname source |
| Degradation | Valkey outage → app-hostname 404s only (dash mode + health unaffected); app outage → 502 |
| Graceful drain | In-flight requests drain before exit; health bypasses the traffic counter |

## 4. Business Events (Outbound)

Web emits **no domain events**. Its output is transport-level metrics
only: the traffic counter (every request except health) and error
metrics, flushed to Valkey every 10s.

**Inbound (consumed):** the `policy` family SSE stream (Shield hot-reload,
M2M `sentin8:web-policy` - the uniform enforced posture even with no
token-bearing handler to gate).

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **Zero compile-time vertical knowledge** - app directories resolve from Valkeys at request time; a newly enrolled app is served without a restart.
2. **Canonicalize-based traversal protection** - escapes are 404s, never served.
3. **Tokens never to the client** - web holds no tokens and forwards none; the proxy forwards only the instance headers.
4. **The context proxy stays public** by contract - its response carries only instance metadata (nothing user-scoped).
5. **The bootstrap patch is string-safe** (brace-depth counter - a literal `}` inside a string cannot end the object) and served `no-store`.
6. **WASM-thread headers (COOP/COEP) on the three critical file kinds.**
7. **Single-app mode fails fast** without `index.html`; unresolvable apps 404 - never wrong-app content.
8. **No tables, no migrations, no outbox** - the policy boot opens a read-only connection under web's OWN declared service role; deployments never authenticate web to the database with another service's shared role.
9. **No `unsafe` code**; TLS termination rides the platform TLS crate.

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Web |
|---|---|
| App visitor | Loads any installed app's shell (SPA) from its own hostname; the app bootstraps via the same-origin context proxy |
| Vertical developer | Builds a Flutter web app and enrolls it - it is served immediately, no host restart |
| Platform operator | Runs the dash in single-app mode; monitors health + traffic metrics; relies on fleet-wide TLS posture |
| Compliance | Verifies traversal protection, no-token posture, and header hygiene |

## 7. KPIs / Success Criteria

- **App availability**: every enrolled app serves from its own hostname immediately after enrollment (zero-restart deploys).
- **Safety**: zero traversal escapes; zero token exposure; zero wrong-app content.
- **First-paint reliability**: the runtime-context bootstrap always answers (public by contract; 502 only on a real app outage).
- **Browser correctness**: multi-threaded WASM works (COOP/COEP); in-app webviews work (service-worker stripped); SPA deep links work.
- **Fleet economy**: one process for all app shells - minimal processes, certificates, monitoring.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Valkey | App-directory registry keys (`captain:app_dir:{slug}`); traffic metrics channel |
| Sentin8:App | The runtime-context data the proxy relays |
| `vertical enroll` (CLI) | Writing the app-directory keys at enrollment |
| sentin8-tls (library) | In-process PQ-TLS termination, on-demand SNI certs, context middleware |
| Sentin8:Proxy | The single ingress in front (L4 pipe / L7 bridge) |
| Shield (Sentin8:Policy) | Uniform boot + hot-reload posture (no gated handlers) |
| PostgreSQL (shared db) | Read-only policy load at boot under web's own declared service role (provisioned by the platform bootstrap) |
| Sentin8:Bus | The policy hot-reload SSE stream |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A newly enrolled Flutter app serves from `{app}.{env}.{org}.{domain}` with no host restart.
2. The dash serves in single-app mode and fails fast if its build output is missing.
3. SPA deep links work (extensionless → index.html); missing assets 404.
4. Traversal attempts (including percent-encoded) never serve anything outside the app root.
5. Multi-threaded WASM apps run (COOP/COEP present on the critical files).
6. In-app webviews work (service-worker registration stripped from the bootstrap).
7. The `/v1/app/runtime/context` bootstrap answers pre-login on the app's origin (relayed from Sentin8:App), with 502 only on a genuine app outage.
8. Unresolvable app hostnames 404 naming the hostname - never another app's content.
9. Health reports status + build hash; traffic metrics publish every 10s.
10. Zero tokens reach any client.

## 10. Open Business Questions

- Long-lived immutable asset caching (`main.dart.js`, `.wasm`, fonts served with 1-year immutable headers; bootstrap stays `no-store`) is a pure header change plus test.
- ETag/If-None-Match support (`{size}-{mtime}` ETag → 304) rides the same handler change.
- A CDN/object-store backend would slot behind the same adapter seam as storage's - a recorded non-goal until needed.


---

**Design attribution:** sentin8:web and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

