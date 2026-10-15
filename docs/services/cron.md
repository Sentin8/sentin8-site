---
sidebar_position: 13
---

# Sentin8:Cron — Distributed Scheduler

Recurring and deferred work: schedules are declared at enrollment time
(`schedules` registration section — `vertical enroll` upserts them
into `cron.schedules`), executed via proxy-back to the owning
service's internal contract. Services never run their own schedulers.

## Use cases

- **Filing calendars** — Bank8:Reporting's regulatory filing schedule
  runs as declarative cron work.
- **Maintenance sweeps** — secrets expiry checks, AI archive
  rotations, statement generation windows.
- **Deferred one-shots** — any service can enqueue a future tick with
  idempotency guarantees.

## API surface

| Endpoint | Method | Gate |
|---|---|---|
| `/v1/schedules` | POST | Shield `sentin8:cron:write` — expression-validated |
| `/v1/schedules` | GET | verify_token — list |
| `/v1/schedules/{id}` | GET | verify_token |
| `/v1/schedules/{id}` | DELETE | Shield `sentin8:cron:write` — soft delete |
| `/v1/schedules/{id}` | PATCH | Shield `sentin8:cron:write` — pause/resume |
| `/v1/internal/schedules/run` | POST | cert-bound owner workload — proxy-back execution |

## Deep dive

[Cron reference section](/docs/reference/cron/) — harvested from
`Sentin8/sentin8-cron`.