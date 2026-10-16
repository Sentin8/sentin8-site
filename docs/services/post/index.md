---
sidebar_position: 8
---

# Sentin8:Post — Multi-Channel Message Delivery

Outbound messaging: email, SMS, push notifications, and webhooks —
templated, tenant-branded, idempotent, retry-scheduled. One send API,
every channel; delivery failures queue and retry, never silently drop.

## Use cases

- **Transactional notifications** — a payment confirmation, a
  reservation reminder, a trade alert: one `send` call, the channel
  routes per tenant preference.
- **Webhooks for third parties** — signed webhook delivery with retry
  and DLQ semantics for external consumers.
- **Branded templates** — per-org/per-env branding resolves through the
  platform's branding chain (org base → env override).
- **SSE inbox feed** — apps subscribe to live notification streams
  over `/subscribe` (the one-way tier).

## API surface

| Endpoint | Method | Gate |
|---|---|---|
| `/v1/health` | GET | none |
| `/v1/send` | POST | Shield `sentin8:post:send` — idempotent per key |
| `/v1/templates` | GET/POST | Shield `sentin8:post:templates:write` |
| `/v1/messages` | GET | Shield `sentin8:post:read` — delivery status |
| `/v1/inbox` | GET (SSE) | session — live feed for the signed-in subject |

## Full documentation

The complete detail lives in this product's sub-pages:

- [Architecture (DDD)](design) — the full document, harvested from the unit's repository at build time.
- [Business rules (BRD)](business) — the full document, harvested from the unit's repository at build time.
- [Security](security) — the full document, harvested from the unit's repository at build time.
- [Overview (repo README)](/docs/reference/post/) — the maintainer's README in the consolidated reference section.

