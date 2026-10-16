---
sidebar_position: 12
---

# Sentin8:Flow — Durable Workflow Engine

Multi-step business workflows with durable state, compensation, and
declarative triggers: payment settlement chains, statement
regeneration, onboarding sagas. Each step executes as a proxy-back to
the owning service's internal contract; failures retry, compensate,
or park for operator action.

## Use cases

- **Payment orchestration** — Bank8:Payments runs scheme flows
  (instruction → scheme → settlement) as Flow workflows with step
  profiles and compensation.
- **Statement regeneration** — per-account-period workflows
  regenerate ledger documents with a proxy-back step.
- **Cross-service sagas** — any multi-service sequence that must not
  partially complete: each step's failure has a defined compensation.

## API surface

| Endpoint | Method | Gate |
|---|---|---|
| `/v1/workflows` | POST | Shield `sentin8:flow:write` — insert + spawn engine |
| `/v1/workflows` | GET | Shield `sentin8:flow:read` — filters, LIMIT 100 |
| `/v1/workflows/{id}` | GET | Shield `sentin8:flow:read` |
| `/v1/workflows/{id}/retry` | POST | Shield `sentin8:flow:write` — failed only |
| `/v1/internal/steps/execute` | POST | cert-bound owner workload — step proxy-back |

## Full documentation

The complete detail lives in this product's sub-pages:

- [Architecture (DDD)](design) — the full document, harvested from the unit's repository at build time.
- [Business rules (BRD)](business) — the full document, harvested from the unit's repository at build time.
- [Security](security) — the full document, harvested from the unit's repository at build time.
- [Overview (repo README)](/docs/reference/flow/) — the maintainer's README in the consolidated reference section.

