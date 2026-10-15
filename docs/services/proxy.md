---
sidebar_position: 5
---

# Sentin8:Proxy — Single Ingress (L4 SNI Router + L7 Bridge)

The one ingress for the whole fleet: a raw-TCP L4 SNI router that
terminates or pipes TLS per hostname, plus an L7 bridge for HTTP
routes. Every client connection — web, API, app — enters through the
proxy and is round-robined across healthy instances via the Valkey
registry.

## Use cases

- **Single entry point** — one hostname hierarchy
  (`{service}.{env}.{org}.{tld}`) for the entire platform; the proxy
  resolves hostnames to services with zero hardcoded knowledge.
- **TLS termination or pass-through** — SNI-based routing pipes
  post-quantum TLS to services that terminate in-process
  (sentin8-tls), and bridges L7 for HTTP routing.
- **Zero-downtime upgrades** — Sentin8:Captain's rolling upgrade swaps
  instances while the proxy drains old ones only after the new
  registers `Active`.
- **Ingress context injection** — the proxy injects `X-Sentin8-*`
  context headers so services never resolve tenants from hostnames
  themselves.

## API surface (management plane)

| Endpoint | Method | Gate |
|---|---|---|
| `/v1/health` | GET | none — status, version, build, mapping stats |
| `/v1/prox/backends` | GET | Shield `sentin8:proxy:backends:read` |
| `/v1/prox/mapping` | GET/PUT | Shield admin — live hostname→service mapping |

The data plane is a raw TCP accept loop — no routes, no tokens: the TLS
handshake *is* the identity.

## Deep dive

[Proxy reference section](/docs/reference/proxy/) — harvested from
`Sentin8/sentin8-proxy`.