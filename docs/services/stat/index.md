---
sidebar_position: 10
---

# Sentin8:Stat — Metrics & Analytics Service

Operational truth: every service publishes telemetry through MemBus
(`stat:telemetry` Pub/Sub family) — request metrics, Shield policy
decisions, service health — and Stat aggregates, stores, and serves
it. No direct cross-service HTTP telemetry calls exist anywhere.

## Use cases

- **Fleet health dashboards** — per-service request rates, latencies,
  error classes, and instance status across every machine.
- **Authorization analytics** — Shield decision rates and denial
  reasons feed security monitoring.
- **KPI rollups** — per-vertical business counters (postings per day,
  reservations per property) aggregate through the same pipeline.

## API surface

| Endpoint | Method | Gate |
|---|---|---|
| `/v1/health` | GET | none |
| `/v1/metrics` | POST | MemBus telemetry ingest (`stat:telemetry`) — no HTTP surface |
| `/v1/metrics` | GET | Shield `sentin8:stat:read` — query aggregated series |
| `/v1/admin/ui/{page}` | GET | RFW admin pages |

## Full documentation

The complete detail lives in this product's sub-pages:

- [Architecture (DDD)](design) — the full document, harvested from the unit's repository at build time.
- [Business rules (BRD)](business) — the full document, harvested from the unit's repository at build time.
- [Security](security) — the full document, harvested from the unit's repository at build time.
- [Overview (repo README)](/docs/reference/stat/) — the maintainer's README in the consolidated reference section.

