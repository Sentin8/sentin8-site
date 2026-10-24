---
title: "Sentin8:Cron - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-cron/edit/main/BUSINESS.md
---
# Sentin8:Cron - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Cron **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Cron is the platform's **standalone distributed scheduler**. It is
the single clock of the fleet: services delegate recurring work (statement
regeneration, maintenance sweeps, trace archiving, renewals) here instead
of running embedded schedulers. The business value it delivers:

- **One clock for the fleet.** Embedded schedulers drift, double-fire
  across replicas, and are invisible in operations. A single scheduler
  owns all timing, retry policy, and schedule inspection.
- **Callbacks, not coupling.** Cron never imports domain logic; each
  schedule carries its callback target and calls back the owning service
  - the owner's data access stays with the owner.
- **Idempotent execution.** Missed/duplicate ticks happen; schedules
  carry a retry budget, consumers must be idempotent, and exhausted
  retries land in a DLQ with manual replay - matching the platform's
  at-least-once + idempotent-consumer posture.
- **No shadow clocks.** The ticker is one loop with advisory locking;
  schedule state changes (pause/delete) take effect before the next tick.
- **Timezone-correct scheduling.** Schedules can declare IANA timezones;
  wall-clock fields match local time, DST-safe, with results mapped back
  to UTC.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Schedule management | Create/list/get/patch/delete schedules - 5-field cron expressions (aliases `@hourly`…, lists, ranges, steps, Vixie dom/dow semantics) and one-shot schedules |
| Timezone support | Per-schedule IANA `timezone` (default UTC, validated at create); DST-safe local-wall evaluation mapped to UTC `next_run_at` |
| Pause/resume | PATCH status-based pause/resume; resume recomputes the next fire from now |
| Execution | Single ticker loop (60s default): due-schedule scan (≤50), claim-conditional execution, authenticated proxy-back to the owner's internal API |
| Retry policy | Per-schedule `max_retries` (default 3); exponential backoff 60s × 2^retry capped at 1h; proxy-back wrapped in a per-job timeout |
| Dead-letter queue | Retry exhaustion lands in `cron.dlq` with the failure reason; manual republish (fresh pending job, same-transaction DLQ removal) |
| Job records | Execution history per schedule (status, timing, result, error); failed → retry path; job retry endpoint |
| Events | Outbox-first domain events (same transaction as the change) for schedule/job/DLQ lifecycles |
| Admin surfaces | RFW admin UI (overview, jobs, schedules with row actions, new-schedule form); Shield admin API |
| Observability | Ticker liveness (last-tick window) + counts on `/v1/health`; ticker metrics |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| The scheduled work itself | the owning service (Cron proxy-calls its internal `/schedules/run`; the owner enforces its own authorization) |
| Business retry semantics | the owner (Cron provides mechanical backoff only) |
| Domain data | tenant data stays in the owner's schema - Cron's rows are execution bookkeeping |
| Database/table creation | `vertical init` applies the schema (Cron starts on an existing schema) |

## 3. Business Capabilities

### 3.1 Schedule Management

| Capability | Business rule |
|---|---|
| Create | Expression validated at registration (400 on malformed or no future fire); callback target (`base_url` + `internal_path`), per-schedule `max_retries`, optional IANA timezone (default UTC, 400 on bad zone) |
| Cron expressions | Full 5-field support with aliases, lists, ranges, steps, wildcards; Vixie dom/dow OR semantics (`7` == Sunday); DST-safe timezone evaluation |
| One-shot schedules | `schedule_type: one_shot` fires once |
| Soft delete | Deletes are status-based so audit trails and DLQ references stay resolvable |
| Pause/resume | Status PATCH (RFW row-action alias); resume recomputes `next_run_at` from now |
| Listing | Schedules and jobs listable with filters (excludes deleted; jobs LIMIT 100) |

### 3.2 Execution & Delivery

| Capability | Business rule |
|---|---|
| Ticker | One loop per process (60s default): due schedules (≤50) + retryable-pending drain (≤50) per pass |
| Mutual exclusion | Advisory lock per schedule + unique open-job index + claim-conditional UPDATE - a schedule never runs concurrently with itself |
| Proxy-back | Authenticated M2M POST to the owner's internal path with a payload-complete envelope; `idempotency_key = "schedule:{schedule_id}:{job_id}"` (the owner dedupes) |
| Job timeout | Proxy-back wrapped in a per-job timeout; timeout → failure → retry path (a hung callback never holds its claim) |
| Advancement | `next_run_at` advances on success, retry, and DLQ landing - a persistently failing schedule never hot-loops; `retry_count` resets on success/DLQ |
| Misfire | Missed ticks are skipped, never back-filled; `next_fire` is strictly after the reference time |

### 3.3 Failure Handling

| Capability | Business rule |
|---|---|
| Retry | Failure with retries remaining → pending with backoff (60s × 2^retry, cap 1h); schedule delayed, `retry_count++` |
| DLQ | Exhausted retries → DLQ row + job failed; the schedule itself advances to its next fire (DLQ landing never stops the schedule) |
| Replay | `POST /v1/dlq/{id}/republish` creates a fresh pending job and removes the DLQ row in one transaction; failed jobs also have a retry endpoint |
| Precise errors | Proxy-back failures map to precise reasons (missing target config, upstream status, decode failure, missing token source) |

## 4. Business Events (Outbound)

Event family `cron`; outbox-first (same transaction as the change - a
failed emission aborts the domain write).

| Event | When |
|---|---|
| `sentin8:cron:schedule:created/deleted/paused/resumed` | Schedule lifecycle |
| `sentin8:cron:schedule:completed/failed` | Tick outcome (failed = DLQ landing) |
| `sentin8:cron:job:retried` | A failed attempt returned to the retry path |
| `sentin8:cron:dlq:republished` | Manual replay |

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **Every tenant write sets the RLS context in the same transaction**; the ticker's cross-tenant read goes only through the SECURITY DEFINER `cron.due_schedules()`.
2. **`target_env_id` is required** wherever an env is addressed - 400 when missing, never a token-env fallback.
3. **Exactly one open job per schedule** (unique partial index + advisory lock + claim-conditional UPDATE).
4. **`next_run_at` always advances** - no hot-looping; retry counters reset on success and DLQ landing.
5. **Events are outbox-first and commit-atomic** - a failed emission aborts the domain write (fail-closed).
6. **Soft-delete retention** - DLQ and audit references always resolve.
7. **Cron math is UTC-based** with per-schedule IANA timezone evaluation (DST-safe, earliest-fold mapping); bad zones are rejected at create.
8. **DLQ landing never stops the schedule** - republish is manual.
9. **No static auth tokens in `target_config`** - the M2M token source is the only proxy-back bearer; the dev static token is a fallback real deployments must not rely on.
10. **Cron does not create its own database/tables** - the schema is applied by `vertical init`.
11. **No `unsafe` code.**

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Cron |
|---|---|
| Owning service | Registers schedules (callback target + retry budget), implements the internal `/schedules/run` endpoint idempotently |
| Platform operator | Views schedules/jobs/DLQ in the RFW admin UI; pauses/resumes schedules; republishes DLQ entries |
| Vertical developer | Delegates recurring domain work (statement regeneration, sweeps, renewals) instead of building an embedded scheduler |
| Compliance/audit | Reads schedule/job lifecycle events and the audit journal |

## 7. KPIs / Success Criteria

- **Punctuality**: schedules fire at their expression-defined times (timezone-correct, DST-safe); missed ticks skip rather than pile up.
- **Reliability**: failed callbacks retry with bounded backoff; exhaustion always lands in the DLQ with the reason; nothing silently drops.
- **Safety**: a schedule never double-fires (mutual exclusion); the proxy-back is idempotent by contract.
- **Operability**: schedule state changes take effect before the next tick; DLQ depth and ticker liveness are visible.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:Auth | M2M identity (DCR TokenSource) for proxy-back bearers; bearer verification on the API |
| Sentin8:DB (PostgreSQL) | Schedules/jobs/DLQ/outbox/audit tables (RLS-enforced) |
| Sentin8:Bus | Event publication via the local outbox relay |
| Owning services | The actual scheduled work (proxy-back internal APIs) |
| Shield (Sentin8:Policy) | Write/admin gates on schedule management |
| Shell (platform) | Outbox relay, middleware, TLS listener |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A service can register a recurring schedule with a validated cron expression and timezone; it fires at the right local wall-clock time, DST-safe.
2. At each due tick, exactly one job runs: the owner's internal API receives an authenticated, idempotent-keyed envelope.
3. A failed callback retries with exponential backoff up to the per-schedule budget; exhaustion lands in the DLQ with the failure reason while the schedule advances.
4. An operator can pause/resume a schedule (effective before the next tick), retry a failed job, and republish a DLQ entry - all from the admin UI or API.
5. Every schedule/job/DLQ lifecycle change emits a payload-complete event in the same transaction as the change.
6. Cross-tenant access is denied; `target_env_id` is always explicit.
7. A hung callback cannot hold its claim (per-job timeout).
8. Ticker liveness and counts are visible on `/v1/health`; DLQ depth in the admin UI.

## 10. Open Business Questions

- The single in-process ticker is the documented concurrency contract; a distributed lease is the open question if multi-instance cron arrives.
- Schedule versioning is an update-in-place with an audit event (effective on the next tick) - version tables are a non-goal.
- Callback result capture retains status + duration per tick; response-body capture is capped to the failure path.


---

**Architecture & Design:** sentin8:cron and its underlying concepts were designed by [Hamid Jahanzad](https://www.linkedin.com/in/hamidjahanzad/).

