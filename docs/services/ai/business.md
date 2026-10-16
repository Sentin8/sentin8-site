---
title: "Sentin8:AI — Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-ai/edit/main/BUSINESS.md
---
# Sentin8:AI — Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:AI **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:AI is the platform's **AI capability layer**. It gives every
vertical and app a single, governed AI surface — completions, chat,
embeddings, retrieval, and a controlled agent runtime — without any of
them embedding their own model-vendor SDKs or safety stacks. The business
value it delivers:

- **One AI surface for every vertical.** Verticals need completions, chat,
  embeddings, and retrieval without each embedding an SDK stack; the
  service centralizes the prompt lifecycle, provider routing, safety
  filtering, cost accounting, and audit behind one Shield-gated API.
- **Providers change; contracts don't.** Model vendors and their APIs
  churn (OpenAI, Anthropic, Ollama Cloud/Hosted, future providers); the
  adapter boundary isolates that churn behind two traits while the rest of
  the platform codes against prompt id + inference request/response.
- **Model output is untrusted.** The model emits *intent*, never
  execution: agent actions map to declaratively-allowed tools and execute
  as Flow workflows proxying back to the owning service, with the
  caller's authorization applied at execution time.
- **Cost must be governed, not just observed.** Token spend is the
  dominant operational risk of AI features; budgets are enforced as a
  pre-call gate (reject or degrade), not a post-hoc report.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Prompt registry | Versioned, immutable prompts (create, list, get, retire); named-latest resolution; platform-origin vs tenant-origin separation |
| Inference primitives | Completion, chat (buffered), chat streaming (SSE/ndjson), embeddings — routed over a pluggable provider layer |
| Provider routing | OpenAI, Anthropic, Ollama Cloud/Hosted adapters; primary→fallback chains per prompt; per-call timeouts and bounded retries |
| Hybrid retrieval | Document ingest (chunk→embed→store), hybrid search (pgvector cosine ∪ keyword index), optional reranker, permission-filtered results |
| Agent runtime | Intent-not-execution: model emits structured `AgentIntent` → resolved against the prompt's tool allowlist → executed as a Flow workflow with proxy-back to the owning service |
| Token budgets | Env-wide + per-feature monthly token caps; reject/degrade/queue enforcement modes; pre-call gating |
| Safety & moderation | Input and output filter chains (baseline prompt-injection rules + tenant-configurable rules); PII deny-list stripping on persisted payloads |
| Observability | Traces (every inference), Stat metrics (token/cost/latency/cache), cost rollups and queries, trace retention/archive |
| Evaluations | Synchronous per-test-case inference with assertion checks; score reporting |
| Async AI jobs | Embedding, summary, classification, and document-pipeline jobs consumed from the platform Bus (direct consumers, no Func hop) |
| Dead-letter queue | Failed-job capture with manual replay (`POST /v1/dlq/{id}/replay`) |
| Admin surfaces | RFW admin UI pages; shared Shield policy admin; budgets/filters/traces/costs/DLQ query surfaces |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Model credentials | Stored as secret **references** resolved at call time (Sentin8:Secrets / env backend) — material never lands in application tables |
| Workflow execution | Sentin8:Flow (agent workflows execute there) |
| Scheduling | Sentin8:Cron (trace archive + stale re-embedding + model-migration sweeps are cron schedules) |
| Document blobs | Sentin8:Storage (chunk text + trace archives live there) |
| Spend analytics | Sentin8:Stat (metric spend) |
| Identity | Sentin8:Auth |

## 3. Business Capabilities

### 3.1 Prompt Registry

| Capability | Business rule |
|---|---|
| Create prompt | New version per update — versions are immutable; 409 on duplicate `(env_id, name, version)` |
| Latest resolution | "Latest per name" resolves at call time; pinned versions supported |
| Retire (delete) | Platform-origin rows are retired, never hard-deleted; tenant rows may be removed |
| Tool declarations | Prompts carry tool allowlists and output schemas |
| Origin separation | `origin platform` rows are enroll-owned; `tenant` rows are never touched by enroll |

### 3.2 Inference

| Capability | Business rule |
|---|---|
| Completion / chat | `POST /v1/completions`, `POST /v1/chat` — Shield-gated; `target_env_id` REQUIRED (400 if missing — no silent cross-tenant fallback) |
| Streaming chat | `POST /v1/chat/stream` (ndjson/SSE) — accumulated buffer moderated per delta; mid-stream violation aborts with an error frame |
| Idempotency | `Idempotency-Key` honored on completion/chat; a completed response replays for a seen key (24h TTL) |
| Provider routing | Primary→fallback chain per prompt; transient errors (429/5xx/timeout) retry with backoff (max 2) then fall over; terminal errors (4xx/auth/schema) fail fast with 422 |
| Exact-match cache | Deterministic prompts hit a Valkey cache before any provider call; every inference journalled with `cache: "hit"\|"miss"` so provenance is auditable |
| Budget gate | Monthly token caps checked BEFORE the provider call — `reject` → 429, `degrade`/`queue` → cost-labelled traces |
| Output schema enforcement | Non-conforming responses rejected when a prompt declares an output schema |
| Moderation both directions | Input stage before the provider call; output stage before the response returns |
| PII stripping | Same deny-list keys as Stat (`email`, `pan`, `pin`, `ssn`, `token`…) strip persisted payload keys; traces flag when stripping occurred |

### 3.3 Retrieval

| Capability | Business rule |
|---|---|
| Document ingest | Chunk→embed→store pipeline; `POST /v1/documents/ingest` and the Bus `document:uploaded` consumer from ANY vertical |
| Hybrid search | pgvector cosine ∪ keyword (tsvector GIN) union — vector alone misses exact identifiers, keyword alone misses paraphrase |
| Permission-filtered results | Results are filtered by the caller's data scope before return — retrieval never leaks across tenant scopes |
| Reranker | Optional reranker pass |
| Registry | Embedding model registry with version pinning; mismatched embeddings rejected (422) rather than compared across incompatible spaces; model-version stamping on every write with a Cron sweep to re-embed stale rows |

### 3.4 Agent Runtime

| Capability | Business rule |
|---|---|
| Intent contract | The model emits structured `AgentIntent` (`action`, `params`, `requires_confirmation`) — the only output shape accepted; free-text execution is rejected fail-closed |
| Tool allowlist | Intent must resolve to a tool declared on the prompt's allowlist |
| Flow execution | Actions execute as Flow workflows proxying back to the owning service — the model never executes directly |
| Re-authorization | The caller's authorization is applied at execution time; human-in-the-loop escalation composes `ManualDecisionStep` (pauses the Flow; an approval event resumes it) |
| Audit | Agent executions land in the audit journal with the act chain preserved |

### 3.5 Operations

| Capability | Business rule |
|---|---|
| Budgets admin | Env-wide (`'*'`) + per-feature caps with `reject`/`degrade`/`queue` enforcement |
| DLQ | Failed summary/classification/document jobs land in `ai.dlq` for manual replay; embedding jobs retry via consumer redelivery; malformed payloads are acked (poison-pill guard) |
| Evaluations | `POST /v1/evaluations/run` — synchronous inference per test case with assertion checks and score reporting |
| Costs | `POST /v1/costs` — cost rollups attributed per `{env_id, feature, model}`; cost normalized per 1M tokens when the provider does not return explicit cost |
| Traces | `GET /v1/traces` — trace lists (1–500); retention via Cron-bound archive + delete (`/v1/internal/traces/archive` proxy-back) |
| Trace archive | Archive then delete cycle keeps the hot table bounded |
| Filters admin | Env rules (tenant-configurable, Shield-gated) with input/output stages and blocked-terms lists |

## 4. Business Events (Outbound)

Event family `ai`; names follow `sentin8:ai:{resource}:{operation}`.
Traces insert in the same transaction as the response decision — a trace
row exists for every completed or failed inference.

| Event | When |
|---|---|
| `sentin8:ai:prompt:updated` | Prompt registry change (same transaction) |
| `sentin8:ai:document:ready` | Document pipeline completed (chunks embedded + stored) |
| `sentin8:ai:{job_type}:job` | DLQ replay re-emits the job event |
| Stat envelopes | Token usage, latency, cache hits, cost — fire-and-forget (a Stat outage never blocks inference) |

**Inbound (consumed):** `*:document:uploaded` (any vertical) → document
pipeline; cron-triggered `sentin8:ai:trace:archive` (trace retention),
`sentin8:ai:embedding:stale` (stale re-embed scan), and the
model-migration sweep (`POST /v1/internal/schedules/run`).

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **Prompt versions are immutable** — an update creates a new version; duplicates 409.
2. **`target_env_id` is REQUIRED** on data endpoints — no silent fallback to the token env (cross-tenant read guard).
3. **Credential references only** — provider keys never stored in `ai.providers`; resolution order: Secrets ref → env backend; rotation requires no service restart.
4. **Filters run both directions** (input + output) with a persistent PII deny-list; output moderation cannot be skipped by model override.
5. **Budget checks precede provider spend** — a rejected request never reaches a provider.
6. **DLQ replay is manual** — failed jobs never auto-retry past consumer redelivery; malformed payloads are acked.
7. **Traces share the request's transaction** — a trace row exists for every inference, carrying cache provenance (`hit`/`miss` + prompt-hash).
8. **Shield (step 5) is the only gate** — no handler scope checks; the scope-mirror policy set denies fail-closed.
9. **Model output is untrusted** — intent-not-execution; tools must be declared on the allowlist; re-authorized at execution time.
10. **Retrieval is permission-filtered** — results never cross the caller's data scope.
11. **No `unsafe` blocks in the service.**
12. **Direct consumers over Func** — embedding/summary/document reactions are first-class concerns consumed from the service's own stream families; job envelopes are payload-complete (no callback fetches).

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:AI |
|---|---|
| Vertical developer | Calls completions/chat/embeddings/retrieval against prompt ids — never embeds vendor SDKs; composes domain behavior via prompts |
| Prompt author | Creates/versions/pins prompts; declares tool allowlists and output schemas; runs evaluations |
| Platform operator | Manages budgets, filters, DLQ replay, provider registry, admin UI pages |
| Compliance/audit | Reads traces (cache provenance, safety verdicts, spend), audit journal entries |
| Vertical service | Emits `document:uploaded` and lets the AI document pipeline ingest asynchronously |
| Business owner | Sees cost rollups per env/feature/model; budget enforcement modes govern spend |

## 7. KPIs / Success Criteria

- **Cost governance**: budgets gate before provider spend; cost attributed per `{env_id, feature, model}`; degradation visible in traces.
- **Safety**: both-direction moderation with PII stripping; prompt-injection baseline rules are code (unaffected by tenant config).
- **Auditability**: every inference traced (tokens, latency, cost, safety verdicts, cache provenance); agent executions journalled.
- **Reliability**: provider outages fail over via routing chains; a Stat/Flow/Cron/Storage outage never blocks inference (log-only degradations).
- **Tenant safety**: RLS + required `target_env_id` + permission-filtered retrieval — zero cross-tenant leakage.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:Auth | Bearer verification; JWKS |
| Shield (Sentin8:Policy) | Authorization decisions (live roles) on every route |
| Sentin8:Bus | Direct consumer groups for embedding/summary/document jobs; outbox event publishing |
| Sentin8:Flow | Agent workflow execution (intent → Flow with proxy-back steps) |
| Sentin8:Cron | Trace archive, stale re-embedding, model-migration sweeps (self-registered schedules, proxy-back) |
| Sentin8:Storage | Document chunk text + trace archives |
| Sentin8:Stat | Token/cost/latency/cache metrics (fire-and-forget) |
| Sentin8:Secrets | Provider credential resolution at call time |
| Valkey | Idempotency keys + exact-match response cache |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A vertical can call chat/completions/embeddings/retrieval with a prompt id — no vendor SDK, no safety stack of its own.
2. Prompt updates create immutable new versions; duplicates rejected; platform history is never hard-deleted.
3. A transient provider outage fails over to the fallback model; retries are bounded; terminal errors fail fast.
4. Budget enforcement blocks (or labels) spend BEFORE the provider call — a rejected request never reaches a provider.
5. Every inference is traced (tokens, latency, cost, safety verdict, cache hit/miss) in the same transaction as the response.
6. Agent execution requires a declared tool on the prompt's allowlist, runs as a Flow workflow, re-authorizes at execution time, and is audited end-to-end.
7. Retrieval results are permission-filtered to the caller's data scope.
8. Document ingest works both synchronously (API) and asynchronously (Bus `document:uploaded` from any vertical) — the job envelope is payload-complete.
9. Failed jobs land in the DLQ for manual replay; malformed payloads never poison the consumer.
10. Provider credentials exist only as secret references — no key material in any application table.
11. Evaluations run prompt versions against test cases with assertion checks and score reporting.
12. Trace retention (archive then delete) runs as a Cron-bound loop; the hot table stays bounded.

## 10. Open Business Questions

- Multi-provider fan-out is modeled as an agent workflow (Flow) with two parallel `LlmStep` branches.
- Cross-region provider routing is deferred deliberately — residency is a deployment-topology concern (env→provider mapping), not a service concern.
- Token-accurate streaming cost accounting rides the terminal-frame estimation the normalization already performs.


---

**Design attribution:** sentin8:ai and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

