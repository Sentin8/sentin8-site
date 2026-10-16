---
title: "Sentin8:Proxy — Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-proxy/edit/main/BUSINESS.md
---
# Sentin8:Proxy — Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Proxy **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Proxy is the platform's **single ingress** — the one door every
external connection enters through. It routes traffic to the right
service without ever seeing application plaintext, enforces the
platform's TLS posture at the edge, and guarantees clients can never
spoof tenant identity. The business value it delivers:

- **One door, one guard.** A single ingress means one place to enforce
  TLS posture (post-quantum key exchange exclusively, ML-DSA
  signatures), one place to observe every inbound connection, and one
  place to protect (WAF, rate limiting, header hygiene).
- **Services own their TLS.** The proxy routes encrypted bytes to the
  backend, which terminates TLS in-process with its own certificate —
  the proxy never sees application plaintext, and keys stay with their
  owners.
- **Context headers are authoritative.** Backends read `X-Sentin8-*`
  for tenant resolution; the proxy strips all client-supplied copies
  and injects authoritative ones — no header spoofing, enforced at
  one place instead of N.
- **Domain data is live.** Service DNS names resolve through the
  membus → bus → owner-API chain with a 30s safety poll — a stale
  mapping never strands traffic during a resolver outage.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| L4 SNI routing | Non-destructive ClientHello peek → hostname resolution → backend registry lookup → raw TCP pipe (internal traffic; the backend terminates TLS) |
| L7 bridge | External traffic: TLS termination at the edge, HTTP parsing, WAF/rate-limit evaluation, header injection, forwarding (offload plain-TCP / bridge TLS+mTLS) |
| Backend registry | Valkey-backed instance map (only `Active` + health-fresh instances); round-robin with suspect-marking failover |
| Domain resolution | Hostname → backend deduction from sys lifecycle tables (orgs/envs/app instances/vertical services); MemBus subscription + 30s safety poll |
| Header hygiene | Strip all client-supplied `X-Sentin8-*` headers (11 names) → inject env-id, app-id, service, hostname, correlation-id, caller-service |
| Edge protection | WAF (SQLi/XSS/path traversal), per-IP token-bucket rate limiting, header-count cap (431) |
| ACME passthrough | `/.well-known/acme-challenge/*` bypasses policy and header injection (CA requirement) |
| Bootstrap certificate | Self-signed 24h leaf at first boot (chicken-and-egg breaker), hot-swapped once Acme is healthy |
| Drain signal | `active_connections` L7 in-flight gauge — the rolling-upgrade drain signal captain polls |
| Observability | Per-(service, status) request counts, latency aggregates, handshake errors, policy blocks, upstream warm/cold/stale-retry counters — counts/statuses/timings only, never payload bytes |
| Management API | Shield-gated backends/mappings listing, health, shared policy-admin surface |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Tenant data | Read-only `sys.*` caches (declared cross-schema grants — the hostname deduction feeds) |
| TLS certificates | Resolved per-SNI via `sentin8-tls` (Acme issues; the proxy only presents) |
| Data-plane authorization | The backend services (transport only here — Shield gates only the management API) |
| Persistent state | None — no tables, no outbox, no Bus producer; runtime state is caches and the registry |
| Domain events | The proxy produces none (transport-level metrics only) |

## 3. Business Capabilities

### 3.1 Routing (L4 + L7)

| Capability | Business rule |
|---|---|
| Single ingress | No service binds a public port; port 443 is the only data-plane entry; SNI is the routing key; the optional :80 plain-HTTP listener carries upstream-certificate HTTP-01 validation only (every other request 404) |
| Traffic split | Internal (loopback/private source IP) traffic pipes raw TLS bytes (L4, never decrypted); external traffic bridges at L7 |
| L4 passthrough | Raw TCP pipe, timeout-free by design (SSE/WebSocket safe); the backend terminates in-process PQ-TLS |
| L7 bridge | TLS terminate → HTTP parse (64KB header cap) → policy → header inject → forward → response pipe (16KB chunks) |
| Backend selection | Round-robin over `Active` + health-fresh (<30s) instances; connect failures mark suspects (30s TTL) and try alternates; all-suspect falls back to plain round-robin |
| Fail-closed resolution | An unresolvable hostname is rejected (L4 close / L7 421 MISDIRECTED) — never defaulted to a system mapping |
| ACME passthrough | Handled before registry lookup (the challenge target may not be registered yet); bypasses policy and header injection by contract |

### 3.2 Protection & Hygiene

| Capability | Business rule |
|---|---|
| Anti-spoofing | All eleven client-supplied `X-Sentin8-*` header names stripped before injecting the resolved context (test-pinned) |
| WAF | SQLi/XSS/path-traversal detection (403; default off in v1 posture) |
| Rate limiting | Per-IP token bucket (429; default 100 rps configurable, off by default) |
| Header cap | >100 request headers → 431 |
| Correlation | Client correlation-id propagated or minted (`proxy-{uuid}`) |
| TLS posture | PQ-exclusive: X25519MLKEM768 key exchange, ML-DSA-65 signatures — no classical fallback; the L4 path never decrypts |
| mTLS | Bridge-mode backends receive client-certificate mTLS when configured |

### 3.3 Operations & Observability

| Capability | Business rule |
|---|---|
| Management API | Plain HTTP on the mgmt port, Shield-gated (`proxy:backends:read`, `proxy:mappings:read`, policy-admin) |
| Health | Status, version/build, mapping stats, service counts, and the `active_connections` L7 gauge (the drain signal) |
| Metrics | Connection counters + L7 metrics flushed every 10s to the shared metrics channel; never payload bytes |
| Drain | Graceful shutdown: accept loop stops, mgmt API shuts down, in-flight pipes complete naturally; the L7 gauge lets captain drain to zero before stopping the old instance |
| Resolver resilience | MemBus loss degrades to the 30s poll — routing continues (stale mappings) instead of failing closed; seed retries 10×3s at boot |

## 4. Business Events (Outbound)

The proxy produces **no domain events**. Its output is transport-level
metrics only: traffic counters (`proxy.traffic.external`), status-code
counts, latency aggregates, handshake errors, upstream warm/cold/stale-retry
metrics, and policy blocks —
flushed to the shared `stat:metrics` channel every 10s.

**Inbound (consumed):** `captain:changed` pub/sub (backend registry
refresh, debounced 1s) and MemBus `sentin8:sys:domain:changed`
(domain-resolver reload), each with a 30s safety poll backstop.

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **Single ingress** — port 443 is the only data-plane entry; SNI is the routing key.
2. **Client-supplied `X-Sentin8-*` headers are ALWAYS stripped** before injection — clients can never spoof tenant identity.
3. **Only `Active` + health-fresh instances receive traffic**; the L4 path never decrypts.
4. **PQ-exclusive TLS** — no classical fallback, ever; the bootstrap cert is a deliberate, time-boxed (24h) management-plane bridge.
5. **ACME challenge passthrough bypasses policy and header injection** (CA requirement).
6. **Metrics carry counts/statuses/latency only** — never payload bytes.
7. **The data plane performs no authorization** — transport, not policy; Shield gates the management API only.
8. **Fail-closed tenant resolution** — unresolvable hostnames are rejected, never defaulted.
9. **Cross-schema reads are declared, not implicit** — the four `sys.*` grants are listed in `registration.rs`.
10. **No `unsafe` code**; the SNI peek is non-destructive (`TcpStream::peek`).

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Proxy |
|---|---|
| External user | Reaches any platform domain through the single ingress — TLS terminates at the edge, context is injected, the request reaches the right service |
| Platform service | Receives only proxied traffic with authoritative `X-Sentin8-*` headers; terminates its own TLS in-process |
| Platform operator | Monitors backends/mappings/health via the Shield-gated mgmt API; watches traffic and handshake metrics; relies on the drain gauge for zero-downtime upgrades |
| Compliance/security | Verifies the anti-spoofing boundary, PQ-only posture, and that no payload bytes are ever collected |

## 7. KPIs / Success Criteria

- **Availability**: a backend failure fails over to siblings within the request; all-suspect falls back rather than failing; resolver outages degrade (30s poll), never strand traffic.
- **Security**: zero spoofed tenant headers possible; PQ-only TLS; edge WAF/rate-limit available when enabled.
- **Operability**: first boot works without Acme (bootstrap cert); ACME challenges always complete; drain is gauge-driven (zero dropped connections in upgrades).
- **Transparency**: traffic counts, latency, handshake errors, and policy blocks observable without payload exposure.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:Captain | The instance registry (`captain:svc:*` hashes + `captain:changed` notifications) |
| Sentin8:Sys | Domain deduction source (orgs/envs/app instances/vertical services — declared SELECT grants) |
| Sentin8:Acme | Real TLS certificates (bootstrap cert bridges until healthy) |
| Sentin8:Auth | Shield-gated management API (bearer verify) |
| Valkey | Backend registry, metrics channel |
| MemBus | Domain-change subscriptions (newest-wins reloads) |
| sentin8-tls (library) | PQ provider, cert resolution, edge acceptor |
| Shield (Sentin8:Policy) | Management-plane gates + route-path policy engine |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. Every external connection enters through the proxy; no service is reachable on a public port.
2. Internal traffic pipes raw TLS bytes to backends (L4) without decryption; external traffic is bridged at L7 with full header hygiene.
3. Client-supplied `X-Sentin8-*` headers never reach a backend — only proxy-injected context does.
4. Unresolvable hostnames are rejected fail-closed (L4 close / L7 421), never silently routed.
5. A failing backend is skipped (suspect-marked) and alternates serve the request; when all are suspect, round-robin continues rather than failing.
6. The domain map updates live on sys domain-change events (membus) with a 30s safety-poll backstop.
7. ACME challenges always pass through (bypassing policy/headers) so certificate issuance never breaks.
8. First boot works with the self-signed bootstrap cert; the real Acme cert hot-swaps in.
9. The management API lists backends and mappings behind Shield gates; health exposes the drain gauge.
10. Traffic metrics (counts/statuses/latency/handshake errors/policy blocks, plus upstream pool warm/cold/stale-retry counters) publish every 10s with zero payload bytes.

## 10. Open Business Questions

- WAF and rate limiting default off is the deliberate v1 posture; cluster-wide defaults close it.
- The internal second listener (`:8443` guaranteed-L4) is a designed future enhancement; source-IP detection is the stated acceptable alternative today.
- HTTP/3 (QUIC) ingress is a non-goal until the PQ TLS stack has mature QUIC support.
- mTLS client-certificate forwarding sends the verified client cert as a base64 header.
- Per-domain rate limiting reuses the existing token bucket with a per-host key.


---

**Design attribution:** sentin8:proxy and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

