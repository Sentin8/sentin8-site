---
title: "Sentin8:Bus - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-bus/edit/main/BUSINESS.md
---
# Sentin8:Bus - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Bus **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Bus is the platform's **durable event backbone**. It is how
services talk to each other without point-to-point APIs - one service
publishes a domain event, any number of others react to it, and nothing is
ever silently lost. The business value it delivers:

- **Event first, API second.** Service-to-service work is expressed as
  domain events wherever possible; the Bus is the durable substrate that
  makes fire-and-forget reliable (at-least-once delivery + idempotent
  consumers = effectively-once).
- **Producers never lose an event.** The local-outbox pattern writes
  `{service}.outbox` in the same transaction as the domain change; the
  post-commit relay pushes to the Bus, which persists to its own
  `bus.inbox` before streaming - a crash anywhere in the chain loses
  nothing.
- **Consumer semantics are explicit.** Consumer groups, explicit ACK,
  pending-entry redelivery (XAUTOCLAIM), and a DLQ are the delivery
  contract; silent drops are a defect.
- **Multi-tenant event routing.** Streams are per `{env}:{family}`;
  tenant isolation applies to event data as much as to table rows.
- **One bus for the whole platform.** One delivery semantic, one DLQ
  story; verticals own their event *types*, not their infrastructure.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Event publishing | `POST /v1/produce` (single) and `POST /v1/produce/batch` (N ≤ 100, per-row results) with idempotency keys, correlation ids, and stream-family routing |
| Durable inbox | Every accepted event persists to `bus.inbox` (dedupe on idempotency key) before streaming - the bus-side durability point |
| Consumption | HTTP pull (`POST /v1/consume`) and long-lived SSE push (`GET /v1/consume/sse`); consumer groups; dedicated connection per SSE consumer |
| Acknowledgment | Explicit `POST /v1/ack` / `POST /v1/nack`; NACK enqueues retry with backoff |
| Redelivery | XAUTOCLAIM sweep recovers entries abandoned by dead consumers (min-idle 60s) - at-least-once without per-entry heartbeats |
| Dead-letter queue | Failed deliveries land in `bus:dlq:{env}` after retry exhaustion; list + manual replay (`bus:admin` gated) |
| Delayed delivery | `POST /v1/schedule` + `GET /v1/scheduled` - future `deliver_at` events parked and released |
| Reaping | The 10s reaper drains `bus:retry:{env}` (bounded retries → DLQ) and `bus:delayed:{env}` (→ XADD) so the sorted-set surfaces self-drain |
| Observability | Stream listing, per-group lag metrics, `/v1/metrics`, traffic counters |
| Admin surfaces | RFW admin UI (overview, streams, consumers, metrics, DLQ, policy) + Shield policy-admin API |
| Replay guard | jti replay protection for non-M2M tokens |
| Audit | Structured audit emission on produce/ack/replay state changes; local audit journal |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Producers' outboxes | Each service owns its own schema's outbox table (Bus's produce API is the only write path) |
| Trigger registration | Verticals declare `event_triggers` in `vertical-registry.json` (runtime-registered) |
| Business payloads | Producers own their event shapes (Bus validates routing, not business meaning) |
| WebSocket chat | BFF (WebSocket is the chat-only tier; the unrouted consume handler is removed) |
| Recurring scheduling | Sentin8:Cron (the Bus handles one-shot delayed events only) |

## 3. Business Capabilities

### 3.1 Publishing (Produce)

| Capability | Business rule |
|---|---|
| Single produce | `POST /v1/produce` - 200 `{message_id, stream}`; body `env_id` must equal the token env (403 otherwise) |
| Batch produce | `POST /v1/produce/batch` - up to 100 events in one call; per-row results in request order; a failed row carries its `error` without rolling back siblings |
| Event naming | `vertical:service:resource:operation` - all colons, no dots; produce rejects anything else |
| Idempotency | Every produce carries an idempotency key; duplicates within the dedupe window return the original response (no double-stream) |
| Durability | Inbox insert (dedupe) → XADD → 202/200; the relay re-pushes any missed rows - an accepted event is never lost |
| Family validation | Stream families validated (charset, length, reserved prefixes) - fail-closed rejection |

### 3.2 Consumption & Delivery

| Capability | Business rule |
|---|---|
| Consumer groups | Groups created idempotently (`{sub}.{group}` namespacing - cross-tenant collision impossible) |
| HTTP pull | `POST /v1/consume` - one-shot reads of new entries |
| SSE push | `GET /v1/consume/sse` - dedicated connection per consumer, 5s XAUTOCLAIM sweep, 15s heartbeats, pending-depth warnings |
| Acknowledgment | Explicit `POST /v1/ack`; ACK for an unknown entry is idempotent (200) |
| Nack / retry | `POST /v1/nack` enqueues `bus:retry:{env}` with `retry_after_secs` (default 30); the reaper drains it with bounded retries |
| Redelivery | Entries pending beyond min-idle 60s are claimed and redelivered - a dead consumer never strands its entries |
| At-least-once | PEL + XAUTOCLAIM + ack-by-id; consumers dedupe on `idempotency_key` → effectively-once |
| Lag visibility | Per-group consumer lag metrics for capacity monitoring |

### 3.3 Failure Handling (DLQ, Delayed, Replay)

| Capability | Business rule |
|---|---|
| Dead-letter queue | Retry exhaustion lands in `bus:dlq:{env}` with the original envelope + failure reason - never silently dropped |
| Manual replay | `POST /v1/dlq/replay` re-emits as `{event_type}.replayed` with a `replayed_from_dlq` marker (a replay can never be mistaken for the original) |
| Delayed delivery | `POST /v1/schedule` parks future events in `bus:delayed:{env}`; the reaper releases them at `deliver_at` |
| Retry drain | The 10s reaper self-drains the retry and delayed sorted sets - the manual-replay contract stays unchanged |

### 3.4 Administration & Observability

| Capability | Business rule |
|---|---|
| Admin UI (RFW) | Overview, streams, consumers, metrics, DLQ, policy pages; `target_env_id` required on data reads (no token-env fallback) |
| Stream listing | SCAN-based (never KEYS - protects Valkey latency) |
| Metrics | `/v1/metrics`, traffic counters, error-metrics publisher |
| Policy hot-reload | Direct SSE consumer reloads Shield policies on `sentin8:sys:policy:updated`; invalidates the RoleResolver cache on identity events |
| Audit | Produce/ack/replay state changes are audit-emitted |

## 4. Business Events (Outbound)

The Bus is the transport, not a business producer - it emits only
observability/audit signals from its own service events. The platform's
domain events (`{vertical}:{service}:{resource}:{operation}`) flow
*through* it.

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **Stream keys are `bus:{env_id}:{family}`** - tenant isolation by key; family names validated against a strict charset with reserved prefixes.
2. **`bus.inbox` is bus-internal** - no producer role holds grants on it; the only producer path is `POST /v1/produce` with a verified token.
3. **RLS context is transaction-local** and always set on the same connection/transaction as the write; the relay reads env-by-env.
4. **Consumer groups are namespaced `{sub}.{group}`** - cross-tenant group collision is impossible.
5. **Delivery is at-least-once** - PEL + XAUTOCLAIM + ack-by-id; dedupe by `idempotency_key` downstream.
6. **Token `env_id` is authoritative** - a body `env_id` mismatch is a 403; admin data requires explicit `target_env_id`.
7. **Listing paths use SCAN, never KEYS.**
8. **DLQ replay always re-emits with the `.replayed` event type** and a `replayed_from_dlq` marker.
9. **Failed messages are never silently dropped** - retry exhaustion lands in the DLQ with the failure reason.
10. **Every accepted event is durable** - inbox insert before XADD; the relay re-pushes missed rows.
11. **No `unsafe` code anywhere in the service.**

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Bus |
|---|---|
| Producing service | Writes its own outbox (same tx as the domain change) and calls the produce API - never touches Bus tables |
| Direct consumer service | Subscribes via SSE/HTTP consumer groups, filters, processes, ACKs; dedupes on idempotency keys |
| Sentin8:Func / Flow | Event-triggered functions and workflows consume the same streams |
| Platform operator | Monitors streams, consumer lag, and metrics via the RFW admin UI |
| Operator on failure | Inspects the DLQ, replays messages manually (admin-gated) |
| Compliance/audit | Reads the Bus's own audit trail for produce/ack/replay state changes |

## 7. KPIs / Success Criteria

- **Durability**: an accepted produce survives a crash anywhere in the chain (outbox → relay → inbox → stream).
- **Delivery**: at-least-once with explicit ACK; redelivery recovers dead-consumer entries; consumer lag is visible.
- **No silent loss**: retry exhaustion always lands in the DLQ with the failure reason.
- **Tenant isolation**: stream keys and RLS keep environments from reading each other's events.
- **Operability**: SCAN-safe listings; heartbeats; bounded backpressure.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Valkey | Streams, consumer groups, DLQ/retry/delayed sorted sets, jti replay guard |
| Sentin8:DB (PostgreSQL) | `bus.inbox` durability, outbox/audit journal tables |
| Sentin8:Auth | Bearer verification (JWKS), token-type filtering, delegated-token cross-check exemption |
| Shield (Sentin8:Policy) | Produce/consume/admin gates; policy hot-reload (SSE consumer) |
| Shell outbox relay (platform) | Drains each producer's outbox to the produce API (single or batch, idempotency keys = row ids) |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A producer can publish single or batched events with idempotency keys; duplicates never double-deliver to deduping consumers.
2. Every accepted event persists to the inbox and reaches the stream; a crash mid-chain loses nothing.
3. Consumers can subscribe via HTTP pull or SSE with dedicated connections; entries are redelivered when a consumer dies.
4. ACK is explicit and idempotent; NACK retries with backoff.
5. Failed messages land in the DLQ (never silently dropped); admins can list and replay them; replays are distinguishable from originals.
6. Delayed events are scheduled and released at their `deliver_at`; the retry/delayed surfaces self-drain via the reaper.
7. Stream families and event names are validated fail-closed; tenant isolation holds by key and RLS.
8. Consumer lag, streams, and metrics are visible in the admin UI (SCAN-safe).
9. Policy hot-reload works without restart; identity events invalidate the role cache.
10. The Bus's own state changes are audit-emitted.

## 10. Open Business Questions

- Cross-region event replication is deferred to the multi-region bucket (replication rides the same pattern as the regional issuer).
- A schema registry would adopt the registration-declared pattern (producers declare payload contracts at enroll time).
- Exactly-once processing stays at-least-once + idempotent consumers as the contract.


---

**Design attribution:** sentin8:bus and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

