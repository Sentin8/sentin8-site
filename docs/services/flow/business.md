---
title: "Sentin8:Flow - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-flow/edit/main/BUSINESS.md
---
# Sentin8:Flow - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Flow **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Flow is the platform's **standalone durable workflow engine**. It
runs multi-step, multi-service business processes that must survive
crashes, wait on humans, and be repairable when something goes wrong.
The business value it delivers:

- **Compensable multi-step work needs durability.** Provisioning,
  statement regeneration, and payment orchestration span minutes and
  cross services; an in-process state machine dies with the process.
  Flow persists every step result, so a crash resumes where it left.
- **One step engine, many domains.** Every service defines logic
  templates; Flow executes them uniformly (state machine, retries,
  audit) instead of each service embedding its own.
- **Human-in-the-loop is a first-class step.** Approvals park a workflow
  (`Waiting`) and `resume` injects the decision - approval applies the
  approver's authorization at execution time.
- **Event-triggered and API-triggered.** Workflows start from explicit
  API calls (with declarative event-triggered starts as the registered
  mechanism); both paths pin the same logic version, so a re-run months
  later replays a stable template.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Workflow lifecycle | Create (with idempotency dedupe), list, get, retry, repair (rewind), cancel, resume (decision injection) |
| Logic definitions | Versioned, per-instance-pinned `LogicVersion` templates with named steps, `next_step` chaining, `on_error` jumps, branch targets |
| Built-in executors | 8 generic step kinds: basic, http, http_async, manual decision, schedule, wait, initiate (sub-workflow), sequence |
| Domain steps | Proxy-back to the owning service's internal API (tenant context from the workflow record - never the caller) |
| WASM hooks | Steps delegate logic to Sentin8:Func modules (import name → proxy-back mapping) |
| Scheduled resumes | `waiting` workflows with `scheduled_at` are resumed by Sentin8:Cron (≤50 due per call) |
| Async callbacks | `/v1/internal/callbacks/async` completes a waiting async step |
| Handler registry | Domain-keyed step-handler profiles (boot-seeded + runtime registration) |
| Persistence | Every transition persisted before the next step; inline `logic` copy per instance (crash-resumable) |
| Events | Lifecycle events through the durable outbox (same transaction as the transition) |
| Admin surfaces | RFW admin UI (overview, workflows, new, steps pages) + Shield policy-admin API |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Domain logic inside steps | the owning service (proxy-back; it re-verifies and enforces its own gate) |
| Schedule due-ness | Sentin8:Cron (drives resumes) |
| WASM modules | Sentin8:Func (executes them) |
| Saga orchestration logic | Sentin8:Sys (delegates sagas to Flow) |
| Event-triggered starts | declared per-vertical in `event_triggers` (Flow's registration declares none today - starts are API-triggered) |

## 3. Business Capabilities

### 3.1 Workflow Lifecycle

| Capability | Business rule |
|---|---|
| Create | `LogicVersion` + input + optional correlation id + callback config; idempotency via unique partial index `(env_id, logic_id, correlation_id) WHERE state='pending'` |
| State machine | `pending → processing → completed / failed / waiting / cancelled`; `failed → pending` on retry; `waiting → processing` on resume/callback/Cron |
| Retry | Only from `failed`; resumes from `current_step` |
| Repair | Rewind to a step with optional replacement input - truncates step results deliberately (recorded `workflow:repaired`); does NOT auto-spawn the engine |
| Cancel | Terminal cancel; step results retained |
| Resume | Only from `waiting`; the decision becomes the last step's output |
| Waiting durability | `scheduled_at` + due index - a parked workflow survives restarts; undated waits get a default deadline (7d config default) |

### 3.2 Step Execution

| Capability | Business rule |
|---|---|
| Sequential loop | One engine task per run; steps run in order; every transition persisted in its own transaction before the next step |
| Built-in executors | basic · http · http_async (park until callback) · manual decision (park for a human) · schedule (park until a time) · wait · initiate (spawn a child workflow inheriting correlation) · sequence (PG-sequence numbers) |
| `on_error` policies | `fail` (workflow failed) / `continue` (next step) / `branch:<step>` (jump); unknown targets → failed - no silent skips |
| Proxy-back | Domain steps call the owner's internal API with the DCR-issued cert-bound M2M token; `ProxyBackRequest.env_id` carries the tenant from the record |
| Optimistic concurrency | `update_workflow` guarded by `WHERE state = $expected AND updated_at = $last_seen` - concurrent lifecycle verbs cannot clobber each other |
| Crash recovery | Inline `logic` + `current_step` + step results: a crash mid-run resumes on retry/resume; step-level idempotency dedupes side effects |

### 3.3 Failure Handling

| Capability | Business rule |
|---|---|
| No in-service DLQ | Failure is an operator path: retry from the failed step, or repair to rewind further |
| Step-result audit | Failed/cancelled workflows keep all step results |
| Proxy-back fallback | M2M failure → warn + static profile token fallback (scope-verifying owners reject it - surfaced as a failed step) |
| Cron outage | Delays scheduled resumes, never loses them (rows stay `waiting`) |
| Deadline expiry | Expired waits move to `failed` with the timeout reason |

## 4. Business Events (Outbound)

Event family `flow`; outbox-first (same transaction as the transition -
commit-atomic).

| Event | When |
|---|---|
| `sentin8:flow:workflow:created/started/completed/failed` | State machine transitions |
| `sentin8:flow:workflow:waiting/updated` | Parks and updates |
| `sentin8:flow:workflow:retried/repaired/cancelled` | Operator verbs |
| `sentin8:flow:workflow:schedule:resumed` | Cron-driven resume |

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **Every state transition is persisted in its own transaction** with tenant context set transaction-local on the same connection; a crash resumes from `current_step`.
2. **The proxy-back tenant context comes from the workflow record's `env_id`** - never from the caller's token.
3. **Logic versions are pinned per instance** - re-runs replay a stable template (no silent template drift).
4. **Failed/cancelled workflows keep their step results** (audit trail); repair truncates deliberately and is event-recorded.
5. **Branch targets must exist** - no silent skips.
6. **`completed_at` is stamped once** for terminal states.
7. **Waiting is durable** - `scheduled_at` + the due index; parked workflows survive restarts.
8. **Create is idempotent** via the pending-state unique index; the outbox rides row-id keys.
9. **No static auth tokens in production paths** - the static profile token is a fallback that scope-verifying owners reject.
10. **No `unsafe` code.**

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Flow |
|---|---|
| Owning service | Defines logic templates (steps, on_error, branches); implements proxy-back step endpoints idempotently; registers handler profiles |
| Platform operator | Watches workflow state in the RFW admin UI; retries failed runs; repairs with rewind; cancels; resumes waiting approvals |
| Approver (human) | Makes the manual decision that resumes a `waiting` workflow - their authorization applies at execution time |
| Compliance/audit | Reads lifecycle events and retained step results (even for failed/cancelled runs) |

## 7. KPIs / Success Criteria

- **Durability**: a crash mid-workflow never loses progress; retries resume from the failed step; waiting workflows survive restarts.
- **Correctness**: pinned logic versions; no silent skips; tenant context always from the record.
- **Operability**: every stuck state is visible and actionable (retry / repair / cancel / resume); waiting deadlines surface expired runs.
- **Auditability**: all step results retained; lifecycle events commit-atomic with the transitions.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:DB (PostgreSQL) | `flow.workflows`, outbox, audit journal (RLS-enforced) |
| Sentin8:Auth | M2M identity for proxy-back (per-caller workload); bearer verification |
| Sentin8:Cron | Scheduled resumes of due `waiting` workflows |
| Sentin8:Func | WASM hook execution inside steps |
| Sentin8:Bus | Lifecycle event publication via the local outbox relay |
| Owning services | The domain logic each step proxy-calls |
| Shield (Sentin8:Policy) | `flow:read`/`flow:write` gates on lifecycle verbs |
| Shell (platform) | Outbox relay, middleware, TLS listener, pool cap |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A service can create a workflow from a versioned logic template and receive a workflow id; duplicate creates (same correlation, pending state) dedupe.
2. The engine advances step by step, persisting each transition; a crash mid-run resumes from `current_step` on retry.
3. Domain steps proxy-back to the owner's internal API with tenant context from the record - the owner re-verifies and enforces its own gate.
4. A manual-decision step parks the workflow in `waiting`; the approver's resume decision re-enters the state machine deterministically; their authorization applies.
5. `on_error` policies (fail/continue/branch) behave exactly as declared; unknown branch targets fail loudly.
6. Operators can retry failed runs, repair (rewind + replace input), cancel, and list/filter workflows from the admin UI or API.
7. Scheduled waits are resumed by Cron (≤50 per call); async steps complete via the callback endpoint; undated waits get a default deadline.
8. Every lifecycle transition emits a payload-complete event in the same transaction.
9. Sub-workflows spawn from an initiate step, inheriting the parent's correlation id.
10. Failed and cancelled runs retain their full step-result audit trail.

## 10. Open Business Questions

- Sub-workflow result aggregation composes from the parent's completion step (spawn semantics are live).
- Parallel steps model fan-out as N child workflows (the sub-workflow mechanism is the fan-out primitive).
- Workflow-level SLA tracking derives from the deadline mechanism (a stuck instance is one whose waiting deadline expired).


---

**Architecture & Design:** sentin8:flow and its underlying concepts were designed by [Hamid Jahanzad](https://www.linkedin.com/in/hamidjahanzad/).

