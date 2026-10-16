---
title: "Sentin8:AI — Architecture (DDD)"
sidebar_label: "Architecture (DDD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-ai/edit/main/DESIGN.md
---
# DESIGN.md: Sentin8:AI — Detailed Design Document

## 1. Scope & Context

Sentin8:AI owns the platform's AI plane: prompt assets (versioned,
immutable), provider routing (openai / anthropic / ollama adapters),
synchronous inference (buffered + streamed), vector + keyword retrieval,
async AI jobs (embeddings, summaries, classifications, document
pipelines), budgets, evaluations, output filters, traces/costs, and its
dead-letter queue.

- **Owns** (schema `ai`, database `sentin8`): `prompts`, `providers`,
  `embeddings`, `traces`, `embedding_registry`, `dlq`, `budgets`,
  `evaluations`, `filters`, `outbox` (DBX), `audit_journal` (DBX); the
  stream family `ai`; the three direct-consumer groups on it.
- **Does NOT own**: model credentials (secret **references** resolved via
  Sentin8:Secrets / env backend), workflow execution (Sentin8:Flow),
  scheduling (Sentin8:Cron), document blobs (Sentin8:Storage), spend
  analytics (Sentin8:Stat), identity (Sentin8:Auth).

```mermaid
graph TD
    subgraph callers["Callers (user tokens via BFF/CLI)"]
        DASH["Dash / apps"]
        VERT["Vertical services"]
    end

    subgraph AI["sentin8:ai"]
        API["/v1/prompts, /v1/chat(+stream),<br/>/v1/completions, /v1/embeddings,<br/>/v1/retrieval, /v1/agent/execute,<br/>/v1/budgets, /v1/dlq, /v1/evaluations,<br/>/v1/documents/ingest, /v1/filters,<br/>/v1/costs, /v1/traces"]
        ROUTER["ProviderRouter<br/>openai / anthropic / ollama"]
        SAFETY["safety.rs<br/>input/output filters + PII deny-list"]
        AGENT["agent.rs<br/>intent → allowlist → Flow"]
        JOBS["jobs.rs<br/>3 direct consumers"]
    end

    subgraph EXT["Platform services"]
        AUTH["sentin8:auth"]
        BUS["sentin8:bus"]
        FLOW["sentin8:flow"]
        CRON["sentin8:cron"]
        ST["sentin8:storage"]
        STAT["sentin8:stat"]
        SEC["sentin8:secrets"]
        DB["PostgreSQL schema ai"]
    end

    VERT["Vertical services"] -- "document:uploaded event" --> BUS
    BUS -- "SSE consume / sentin8:bus:consume" --> JOBS
    JOBS --> DB
    JOBS -- "fetch/put chunks" --> ST
    VERT -- "HTTP / POST /v1/chat" --> API
    API --> SAFETY --> ROUTER
    API -- "verify bearer" --> AUTH
    API -- "agent workflow" --> FLOW
    AI -- "cron self-registration" --> CRON
    AI -- "traces/costs metrics" --> STAT
    AI -- "credential_ref resolve" --> SEC
```

## 2. Runtime Architecture

```mermaid
graph TD
    subgraph API["API layer"]
        R["routes()<br/>Shell-mounted axum router"]
    end
    subgraph HANDLERS["Handlers (verify + Shield per request)"]
        PROMPTS["prompts / providers / filters"]
        INFER["chat / completions / stream"]
        EMB["embeddings / retrieval / documents"]
        OPS["budgets / dlq / evaluations / registry / costs / traces"]
        INTERNAL["/v1/internal/traces/archive<br/>/v1/internal/schedules/run"]
    end
    subgraph JOBSX["Job execution (tokio::spawn loops)"]
        EMB["embedding consumer<br/>group sentin8-ai-embedding"]
        SUM["summary consumer<br/>group sentin8-ai-summary"]
        DOC["document consumer<br/>group sentin8-ai-document"]
    end
    subgraph INFRA["Infra"]
        POOL["capped PG pool"]
        VALKEY["Valkey: idem + response cache"]
        OUTBOX["ai.outbox → relay"]
    end

    R --> PROMPTS & INFER & EMB & OPS & INTERNAL
    INFER --> SAFETY --> ROUTER
    EMB --> POOL
    JOBSX --> POOL
    POOL --> OUTBOX
```

**Request lifecycle — buffered inference (`POST /v1/chat`):**

```mermaid
sequenceDiagram
    autonumber
    participant C as caller
    participant H as handlers::chat
    participant A as auth + Shield
    participant V as Valkey
    participant DB as ai schema
    participant P as ProviderRouter

    C->>H: POST /v1/chat (Idempotency-Key?)
    H->>A: verify bearer → require_policy(sentin8:ai:chat:write)
    A-->>H: AuthContext / 403
    H->>H: resolve target_env_id (REQUIRED — 400 if missing)
    H->>H: input moderation (filters + PII)
    alt Idempotency-Key present
        H->>V: GET ai:idem:{env}:{key}
        V-->>H: cached response? → replay 200
    end
    H->>DB: resolve_prompt (pinned → active latest)
    H->>DB: check_budget (monthly tokens vs cap)
    alt budget reject
        H-->>C: 429
    end
    H->>V: exact-match cache ai:cache:{env}:{model}:{messages}
    alt miss
        H->>P: complete(route primary)
        P --x H: Transient error
        H->>P: retry (backoff, max 2) → fallback route
        P-->>H: CompletionResponse
    end
    H->>H: output moderation + schema check
    H->>DB: INSERT ai.traces (same tx)
    H-->>C: 200 response (+ idem store, Stat emit)
```

Error branches: terminal provider error (4xx/auth/schema) → 422; retries
exhausted → 502; moderation failure → 422 with filter name.

## 3. Data Model

```mermaid
erDiagram
    PROMPTS ||--o{ TRACES : "logged per call"
    PROVIDERS ||--o{ TRACES : "routes"
    PROMPTS ||--o{ EVALUATIONS : "evaluated by"
    BUDGETS ||--o{ TRACES : "gates feature"
    FILTERS ||--o{ TRACES : "applied"
    EMBEDDINGS ||--o{ DLQ : "failed retries"

    PROMPTS {
        uuid id PK
        string name
        int version "immutable"
        string status "active|pinned|retired"
        string origin "platform|tenant"
        string model_primary
        string model_fallback
        jsonb tools
        jsonb output_schema
    }
    PROVIDERS {
        string provider "openai|anthropic|ollama"
        string credential_ref "secret reference ONLY"
        string status
    }
    EMBEDDINGS {
        uuid env_id
        string source_id
        int chunk_index
        vector embedding "pgvector(1536)"
        text chunk_text "tsvector-indexed"
        jsonb metadata "data_scope"
    }
    TRACES {
        string prompt_name
        int prompt_version
        string model
        int input_tokens
        numeric cost_usd
        string status "ok|error"
    }
    DLQ {
        string job_type
        jsonb payload
        int retry_count
    }
    BUDGETS {
        string feature "'*' = env-wide"
        int monthly_token_cap
        string enforcement "reject|degrade|queue"
    }
    EVALUATIONS {
        string status "running|completed|failed"
        numeric score
        jsonb results
    }
    FILTERS {
        string stage "input|output"
        text[] blocked_terms
    }
```

- **RLS**: every table `ENABLE`+`FORCE`, per-op policies keyed on
  `sentin8_current_env_id() = env_id`; outbox/journal policies additionally
  require `sentin8_context_initialized()`.
- **State machines**: prompt lifecycle —

```mermaid
stateDiagram-v2
    [*] --> active: create (new version)
    active --> pinned: pin version
    active --> retired: DELETE /v1/prompts/{name}/{version}
    pinned --> retired: DELETE
    retired --> [*]
    note right of retired: versions are immutable<br/>409 on duplicate (name, version)
```

- **Secrets**: `providers.credential_ref` holds a secret *reference* —
  material never lands in application tables (resolved via Secrets or the
  env backend `SENTIN8_AI_PROVIDER_KEY_*`).
- **Indexes**: HNSW cosine on `ai.embeddings.embedding` (pgvector-guarded),
  GIN on `to_tsvector('simple', chunk_text)`, partial unrelayed indexes on
  `outbox`/`audit_journal`; helper `ai.ai_monthly_tokens(env, feature)`.

## 4. API Surface

Groups (every route: bearer verify → Shield `require_policy`, target env
required for data surfaces, no in-handler scope checks):

| Group | Endpoints | Gate action | Events |
|-------|-----------|-------------|--------|
| prompts | `POST/GET /v1/prompts`, `DELETE /v1/prompts/{name}/{version}` | `ai:prompt:write` / `ai:prompt:read` | `sentin8:ai:prompt:updated` |
| inference | `POST /v1/chat`, `/v1/completions`, `/v1/chat/stream` (ndjson) | `ai:chat:write` / `ai:completion:write` | trace rows + Stat |
| vectors | `POST /v1/embeddings`, `POST /v1/retrieval`, `/v1/documents/ingest`, `GET/PUT /v1/registry` | `ai:embedding:write` / `ai:retrieval:read` | `sentin8:ai:document:ready` |
| ops | `/v1/budgets/{feature}`, `/v1/dlq[/replay]`, `/v1/evaluations/run`, `/v1/costs`, `/v1/traces` | prompt scopes | `sentin8:ai:{job_type}:job` (replay) |
| agents | `POST /v1/agent/execute` | `ai:chat:write` | Flow workflow + audit journal |
| internal | `/v1/internal/traces/archive` (Cron proxy-back), `/v1/internal/schedules/run` (stale re-embed scan) | `ai:embedding:write` | archive events |
| admin/RFW | `/v1/admin/ui/{page}`, `/v1/admin/{resource}`, shared policy admin | Shield | — |
| health | `GET /v1/health` | none | — |

**Event flow (outbox → Bus → trigger):**

```mermaid
sequenceDiagram
    autonumber
    participant V as Vertical producer
    participant B as sentin8:bus stream ai
    participant AI as sentin8:ai consumers
    participant DB as ai schema
    participant O as ai.outbox

    V--)B: document:uploaded envelope
    AI->>B: XREADGROUP (group sentin8-ai-document)
    B-->>AI: event
    AI->>AI: parse DocumentJobEnvelope<br/>(self-contained)
    AI->>ST: fetch document text
    AI->>DB: idempotent upsert embeddings per chunk
    AI->>O: INSERT outbox event sentin8:ai:document:ready
    O-->>B: relay → POST /v1/produce
    alt processing failed
        AI->>DB: INSERT ai.dlq (summary/classification/document)
        Note over AI: embedding jobs: non-ack → redelivery<br/>malformed payload → ack (poison guard)
    end
```

Registration-declared triggers: `*:document:uploaded` → document-pipeline;
`sentin8:ai:trace:archive` (cron `ai-trace-archive`); 
`sentin8:ai:embedding:stale` (cron `ai-reembed-stale`).

## 5. Cross-Cutting Concerns

- **Auth**: every route `verify_bearer_token` → Shield `require_policy`
  (live roles/scopes from auth); step 5 is the only gate — no handler
  scope checks.
- **Tenant resolution**: `target_env_id` query REQUIRED on admin/data
  endpoints (no fallback to token env — rejects with 400).
- **RLS context**: transaction-local `sentin8_set_tenant_context` on the
  caller's env inside each write transaction; trace insert shares the
  request's transaction.
- **Idempotency**: `ai:idem:{env}:{key}` (24h TTL) replays full response
  for retried inference calls; job consumers dedupe on `job_id`.
- **Moderation**: input stage before provider call; buffered output stage
  after; streaming moderation on an accumulated buffer per delta
  (mid-stream violation aborts with an error frame).
- **Budgets**: env-wide `'*'` fallback + per-feature caps; `reject` →
  429, `degrade`/`queue` → cost-labelled traces (`{feature}:cost-{mode}`).
- **Audit journaling**: agent executions, DLQ writes, and every inference
  land in `ai.audit_journal` (pushed to the shared audit ingest). The
  inference row carries cache provenance — `cache: "hit"|"miss"` plus the
  prompt-hash key that produced it — so a cache replay is distinguishable
  from a fresh generation in audit.
- **Graceful drain**: shell-owned graceful shutdown; relay fail-open.

## 6. Failure Modes & Recovery

```mermaid
flowchart TD
    A[Provider call] --> B{Transient? 429/5xx/timeout}
    B -- yes --> C[retry backoff 100ms·2^n, max 2]
    C --> D{retries left?}
    D -- yes --> B
    D -- no --> E[fallback route model_fallback]
    E -- fails --> F[502 to caller]
    B -- terminal 4xx/auth/schema --> G[422 no retry]
    J[Async job failure] --> K{job kind}
    K -- embedding --> L[non-ack → redelivery]
    K -- summary/classification/document --> M[ai.dlq row]
    M --> N[manual POST /v1/dlq/{id}/replay]
    N --> O[re-emit job event + delete row]
```

- **Valkey down**: idempotency + cache degrade to direct execution
  (best-effort paths never fail the request).
- **Bus down**: outbox relay persists rows in `ai.outbox` (5s safety
  poll); consumer loops retry their connections.
- **Stat/Flow/Cron/Storage outages**: log-only degradations (trace row
  still carries spend; agent returns `workflow_id: None`; cron
  registration skipped; archive retains hot rows).
- **Credential loss**: secret ref unresolvable → provider disabled at
  routing time (422 to caller, no crash loop).

## 7. Concurrency & Performance Model

```mermaid
graph LR
    SHELL["shell boot task"] --> RELAY["outbox relay (shell-owned)"]
    subgraph CONSUMERS["3 direct consumers (5s poll, max_count 10)"]
        E1[embedding consumer]
        S1[summary consumer]
        D1[document consumer]
    end
    BUS(("stream ai")) --> E1 & S1 & D1
    E1 --> POOL[("capped PG pool")]
    S1 --> POOL
    D1 --> POOL
    INFER["inference requests"] --> CACHE["Valkey idem + cache"]
    INFER --> POOL
```

- Pool capped (`sentin8_config::pg_pool::connect`, max 3 default) —
  inference trace writes and job upserts share the cap; budget check runs
  once per logical request.
- Retrieval `top_k` clamped 1–100; archives bounded (`LIMIT 10000`);
  trace lists 1–500; DLQ listing 200.
- Hot paths cached: exact-match response cache (1h TTL; the key covers env,
  model, messages, temperature, max_tokens, and the tool set — hashed to a
  bounded sha256 prompt-hash, so a near-hit can never replay a response
  generated under different sampling params); embeddings via HNSW; keyword
  via GIN tsvector.

## 8. Invariants, Insecure-Defaults Rejected, Unsafe Rationale

1. **Prompt versions immutable** — an update creates a new version; 409 on
   duplicate `(env_id, name, version)`; `origin platform` rows are
   enroll-owned, `tenant` rows never touched by enroll.
2. **`target_env_id` REQUIRED** on data endpoints — no silent fallback to
   the token env (cross-tenant read guard).
3. **Credential references only** — provider keys never stored in
   `ai.providers`; resolution order: Secrets ref → env backend.
4. **Filters run both directions** (input + output) with a persistent PII
   deny-list; output moderation cannot be skipped by model_override.
5. **Budget checks precede provider spend** — a rejected request never
   reaches a provider.
6. **DLQ replay is manual** — failed jobs never auto-retry past the
   consumer redelivery; malformed payloads are acked (poison-pill guard).
7. Traces insert in the same transaction as the response decision — a
   trace row exists for every completed or failed inference.
8. No `unsafe` blocks in the service.

## 9. Testing Strategy

```mermaid
graph TD
    U[Unit — pure seams<br/>agent intent parse, allowlist,<br/>safety filters, PII strip]
    I[Integration — runtime-skip<br/>provider adapters via mock HTTP,<br/>router retry/fallback,<br/>RLS isolation, prompt immutability,<br/>secret-ref resolution, registration]
    E[E2E — e2e-ts<br/>dash AI surface through BFF]
    U --> I --> E
```

- `tests/integration.rs` (14 tests): adapters (openai/anthropic/ollama
  mock round-trips), error taxonomy (429 transient, 401 terminal), retry +
  fallback routing, DB RLS isolation, version immutability, filter load
  per env, chunk persistence, credential-ref resolution, registration
  identity/scopes, policy boot.
- Deliberately not unit-tested: provider HTTP correctness (mocked), Stat
  emission, cron registration (e2e/platform layer).

## 10. Open Questions

- SSE transport for `POST /v1/chat/stream` is already aligned: the transport
  rule (principles §4.7a) governs, not a per-endpoint choice.
- Token-accurate streaming accounting adopts the approximation the
  normalization already performs (estimate from the terminal frame).
- Embedding model versioning is live (AI-2): `ai.embeddings.model_version`
  stamps every write with the registry-active version (`ai_version_for`);
  the Cron `model_migration` sweep (`POST /v1/internal/schedules/run`)
  re-enqueues jobs for rows trailing the registry — the dual-read
  discriminator. Per-model DIMENSIONS remain a pgvector-typmod concern:
  changing the pinned dimension is a greenfield re-init (the registry row
  + version sweep govern which rows are current).

---

**Design attribution:** sentin8:ai and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

