---
title: "Sentin8:AI - API (OpenAPI)"
sidebar_label: "API (OpenAPI)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-ai/edit/main/docs/openapi.json
---
Sentin8 Sentin8:AI - platform AI capability layer.

> Generated from the service’s OpenAPI 3.1 spec (`docs/openapi.json`,
> served live at `GET /openapi.json`) - the source of truth is the
> service’s own `#[utoipa::path]` annotations.

**47 endpoints** across 2 groups.

## policy

### `GET /v1/admin/attributes`

Gate: `sentin8:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Principal attributes of this service | -[] |
| 403 | Caller lacks the admin scope | - |

### `PUT /v1/admin/attributes`

Gate: `sentin8:admin`

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Attribute stored | - |
| 400 | Invalid attribute definition | - |
| 403 | Caller lacks the admin scope | - |

### `DELETE /v1/admin/attributes`

Gate: `sentin8:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Attribute deleted | - |
| 403 | Caller lacks the admin scope | - |

### `GET /v1/admin/policy-sets`

Gate: `sentin8:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Policy sets of this service | -[] |
| 403 | Caller lacks the admin scope | - |

### `POST /v1/admin/policy-sets/disable`

Gate: `sentin8:admin`

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Sets disabled | - |
| 403 | Caller lacks the admin scope | - |

### `POST /v1/admin/policy-sets/enforce`

Gate: `sentin8:admin`

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Sets switched to enforce mode | - |
| 403 | Caller lacks the admin scope | - |

### `POST /v1/admin/policy-sets/shadow`

Gate: `sentin8:admin`

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Sets switched to shadow mode | - |
| 403 | Caller lacks the admin scope | - |

### `GET /v1/admin/policy-sets/{name}`

Gate: `sentin8:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The policy set | - |
| 403 | Caller lacks the admin scope | - |
| 404 | Unknown policy set name | - |

### `PUT /v1/admin/policy-sets/{name}`

Gate: `sentin8:admin`

**Request body** (`application/json`):


**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Policy set stored | - |
| 400 | Invalid policy set definition | - |
| 403 | Caller lacks the admin scope | - |

### `DELETE /v1/admin/policy-sets/{name}`

Gate: `sentin8:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Policy set deleted | - |
| 403 | Caller lacks the admin scope | - |

### `POST /v1/admin/policy-sets/{name}/test`

Gate: `sentin8:admin`

**Request body** (`application/json`):


**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Dry-run decision trace | - |
| 403 | Caller lacks the admin scope | - |

### `GET /v1/admin/relations`

Gate: `sentin8:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | ReBAC relations of this service | -[] |
| 403 | Caller lacks the admin scope | - |

### `PUT /v1/admin/relations`

Gate: `sentin8:admin`

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Relation stored | - |
| 400 | Invalid relation definition | - |
| 403 | Caller lacks the admin scope | - |

### `DELETE /v1/admin/relations`

Gate: `sentin8:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Relation deleted | - |
| 403 | Caller lacks the admin scope | - |

### `GET /v1/admin/relations/check`

Gate: `sentin8:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `subject` | query | yes | string |
| `relation` | query | yes | string |
| `object` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The check verdict | - |
| 403 | Caller lacks the admin scope | - |


## ai

### `GET /v1/admin/ui/{page}`

`GET /v1/admin/ui/&#123;page&#125;` - RFW definition for the page.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `page` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | RFW page definition | - |

### `GET /v1/admin/{resource}`

`GET /v1/admin/&#123;resource&#125;` - RFW data endpoint (env-scoped, RLS on the same connection; `target_env_id` REQUIRED - Fix A).

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `resource` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Admin data rows | - |

### `POST /v1/agent/execute`

`POST /v1/agent/execute` - controlled agent execution. The model emits intent only; this endpoint maps an allowed intent to a Sentin8:Flow workflow whose domain steps proxy-back to the owning service. `requires_confirmation` intents pause in a ManualDecisionStep.

Gate: `sentin8:ai:chat:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `callback_base_url` | string,null | no | Flow callback base URL override (defaults to this service's URL). |
| `feature` | string | no |  |
| `prompt_name` | string | yes | Prompt registry name - its `tools` array is the ALLOWLIST of actions the model may emit (mapped to Flow logics via `sentin8.ai_tools`). |
| `prompt_version` | integer,null | no |  |
| `target_env_id` | string,null | no |  |
| `task` | string | yes | The user's task (merged with the prompt's system text). |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Agent intent processed | `AgentResponse` |
| 403 | Action not in the prompt's tool allowlist | - |
| 422 | Model output is not a valid intent | - |

### `PUT /v1/budgets/{feature}`

`PUT /v1/budgets/&#123;feature&#125;` - create/update a token budget.

Gate: `sentin8:ai:prompt:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `enforcement` | string | yes |  |
| `feature` | string | yes | '*' = env-wide budget. |
| `monthly_token_cap` | integer | yes |  |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `feature` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Budget saved | - |

### `DELETE /v1/budgets/{feature}`

`DELETE /v1/budgets/&#123;feature&#125;` - disable/remove a budget.

Gate: `sentin8:ai:prompt:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `feature` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Budget removed | - |

### `POST /v1/budgets/{feature}/delete`

`POST /v1/budgets/&#123;feature&#125;/delete` - RFW alias of `DELETE /v1/budgets/&#123;feature&#125;`.

Gate: `sentin8:ai:prompt:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `feature` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Budget removed (same contract as DELETE /v1/budgets/&#123;feature&#125;) | - |

### `POST /v1/chat`

`POST /v1/chat` - chat inference through the prompt registry + provider router. Idempotency-Key honored; trace emitted.

Gate: `sentin8:ai:chat:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `feature` | string | no | Feature label for cost attribution `&#123;env_id, feature, model&#125;`. |
| `input` | string,null | no | Inline override (completion-style single input). |
| `max_tokens` | integer,null | no |  |
| `messages` | `ChatMessage`[] | no | Inline messages (chat) - merged after the prompt's system/user text. |
| `model_override` | string,null | no |  |
| `prompt_name` | string,null | no | Prompt registry name - config (models, temperature, schema) resolves from the named-latest/pinned version unless overridden inline. |
| `prompt_version` | integer,null | no |  |
| `target_env_id` | string,null | no |  |
| `temperature` | number,null | no |  |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Chat completion | `InferenceResponse` |
| 404 | Prompt not found | - |
| 422 | Provider/schema failure | - |

### `POST /v1/chat/stream`

 `POST /v1/chat/stream` - streaming chat over a chunked HTTP body . NOT the SSE subscription tier - synchronous inference streams  the response body directly (transport-tier rule).  Content is emitted as newline-delimited JSON chunks; the final chunk  carries the token accounting.

Gate: `sentin8:ai:chat:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `feature` | string | no |  |
| `messages` | `ChatMessage`[] | no |  |
| `model` | string | yes |  |
| `target_env_id` | string,null | no |  |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Streamed completion (ndjson chunks) | - |

### `POST /v1/completions`

`POST /v1/completions` - completion inference. Same pipeline as chat; the action scope differs.

Gate: `sentin8:ai:completion:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `feature` | string | no | Feature label for cost attribution `&#123;env_id, feature, model&#125;`. |
| `input` | string,null | no | Inline override (completion-style single input). |
| `max_tokens` | integer,null | no |  |
| `messages` | `ChatMessage`[] | no | Inline messages (chat) - merged after the prompt's system/user text. |
| `model_override` | string,null | no |  |
| `prompt_name` | string,null | no | Prompt registry name - config (models, temperature, schema) resolves from the named-latest/pinned version unless overridden inline. |
| `prompt_version` | integer,null | no |  |
| `target_env_id` | string,null | no |  |
| `temperature` | number,null | no |  |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Completion | `InferenceResponse` |
| 404 | Prompt not found | - |
| 422 | Provider/schema failure | - |

### `GET /v1/costs`

`GET /v1/costs` - per-feature/model spend rollup for the env, reading the AI's own trace aggregates (Stat cross-service rollup lands with the Dash integration).

Gate: `sentin8:ai:prompt:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Per-feature/model spend rollup | - |

### `GET /v1/dlq`

`GET /v1/dlq` - list dead-lettered AI jobs.

Gate: `sentin8:ai:prompt:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Dead-lettered jobs | `DlqRecord`[] |

### `POST /v1/dlq/{id}/replay`

`POST /v1/dlq/&#123;id&#125;/replay` - re-enqueue a dead-lettered job (cron republish pattern: re-insert the pending job, delete the DLQ row, emit the republished event inbox-first).

Gate: `sentin8:ai:prompt:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Job re-enqueued | - |

### `POST /v1/documents/ingest`

`POST /v1/documents/ingest` - chunk → embed → store (/). Chunk text lives in Sentin8:Storage (object per chunk under the document key), vectors + metadata in `ai.embeddings` with source refs. RLS env match + the caller's data_scope on chunk metadata.

Gate: `sentin8:ai:embedding:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `chunk_size` | integer | no |  |
| `data_scope` | string[] | no | Caller's data scope attached to the chunks' metadata (retrieval permission filter). |
| `model` | string | yes |  |
| `source_id` | string,null | no |  |
| `storage_key` | string | yes | Sentin8:Storage object key holding the document text. |
| `target_env_id` | string,null | no |  |
| `text` | string | yes | Already-extracted text (extract step happens upstream or in this request - v1 accepts the plain text; PDF extraction is a Func WASM module concern). |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Document ingested (chunks + vectors stored) | - |
| 422 | Embedding failure | - |

### `POST /v1/embeddings`

`POST /v1/embeddings` - batch embedding via the provider router.

Gate: `sentin8:ai:embedding:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `feature` | string | no |  |
| `inputs` | string[] | yes |  |
| `model` | string | yes |  |
| `target_env_id` | string,null | no |  |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Embedding vectors (input order) | `EmbeddingHttpResult` |
| 422 | Provider failure / dimension mismatch | - |

### `POST /v1/evaluations/run`

 `POST /v1/evaluations/run` - score a prompt version against a golden set . Each case runs a synchronous inference and checks the  expectation; the aggregate score lands in `ai.evaluations`.

Gate: `sentin8:ai:prompt:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cases` | -[] | yes | Golden set: `[&#123; "input": ". ", "expected_contains": ". " &#125;,. ]`. |
| `feature` | string | no |  |
| `prompt_name` | string | yes |  |
| `prompt_version` | integer,null | no |  |
| `target_env_id` | string,null | no |  |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Evaluation run completed | - |

### `GET /v1/filters`

`GET /v1/filters` - list env filter rules.

Gate: `sentin8:ai:prompt:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Filter rules | `FilterRecord`[] |

### `PUT /v1/filters/{name}`

 `PUT /v1/filters/&#123;name&#125;` - create/update an env safety filter rule . The baseline prompt-injection rule is code and unaffected.

Gate: `sentin8:ai:prompt:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `blocked_terms` | string[] | yes | Substrings that trip the rule (case-insensitive). |
| `enabled` | boolean | no |  |
| `stage` | string | yes | `input` (pre-provider) or `output` (pre-client). |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Filter rule saved | - |
| 422 | Invalid stage | - |

### `DELETE /v1/filters/{name}`

`DELETE /v1/filters/&#123;name&#125;` - remove an env filter rule. The baseline injection rule is code and cannot be removed.

Gate: `sentin8:ai:prompt:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Filter rule removed | - |

### `POST /v1/filters/{name}/delete`

`POST /v1/filters/&#123;name&#125;/delete` - RFW alias of `DELETE /v1/filters/&#123;name&#125;`.

Gate: `sentin8:ai:prompt:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Filter rule removed (same contract as DELETE /v1/filters/&#123;name&#125;) | - |

### `GET /v1/health`

`GET /v1/health` - service health (custom payload; shell health suppressed).

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Service healthy | - |

### `POST /v1/internal/schedules/run`

 `POST /v1/internal/schedules/run` - Sentin8:Cron proxy-back target . Runs stale-index maintenance: re-enqueue embedding jobs for  sources whose embedding is older than the freshness window. Authenticated  by the cron ticker's M2M token (verified the same way as user tokens -  `token_tp: m2m` principals evaluate like any other under Shield).

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Maintenance run completed | - |

### `POST /v1/internal/traces/archive`

`POST /v1/internal/traces/archive` - age out hot traces older than the per-env retention window to Sentin8:Storage (Stat pattern). Called by the cron proxy-back (`/v1/internal/schedules/run` maintenance) - never by clients directly.

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Archive run completed | - |

### `GET /v1/prompts`

`GET /v1/prompts` - list prompts (latest or all versions).

Gate: `sentin8:ai:prompt:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |
| `name` | query | no | string |
| `all_versions` | query | no | boolean |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Prompt versions | `PromptRecord`[] |

### `POST /v1/prompts`

`POST /v1/prompts` - create a new prompt version (immutable per version).

Gate: `sentin8:ai:prompt:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `max_tokens` | integer,null | no |  |
| `model_fallback` | string,null | no |  |
| `model_primary` | string | yes |  |
| `name` | string | yes |  |
| `origin` | string | no | `platform` rows are overwritten by enroll; `tenant` rows never are. |
| `output_schema` | - | no |  |
| `system_text` | string | yes |  |
| `temperature` | number,null | no |  |
| `tools` | - | no |  |
| `user_text` | string | no |  |
| `version` | integer,null | no | Explicit version; omit = next version for the name. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Created prompt version | `PromptRecord` |
| 422 | Validation failed | - |

### `DELETE /v1/prompts/{name}/{version}`

`DELETE /v1/prompts/&#123;name&#125;/&#123;version&#125;` - retire a version (never hard-delete platform history; tenant rows may be removed).

Gate: `sentin8:ai:prompt:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |
| `version` | path | yes | integer |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Prompt version retired | - |

### `GET /v1/providers`

`GET /v1/providers` - list provider configs (credential refs only).

Gate: `sentin8:ai:prompt:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Provider configs | `ProviderRecord`[] |

### `PUT /v1/providers/{provider}`

`PUT /v1/providers/&#123;provider&#125;` - upsert a provider config (secret ref only).

Gate: `sentin8:ai:prompt:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `base_url` | string | yes |  |
| `credential_ref` | string | yes | Secret reference - NEVER the credential material itself. |
| `models` | - | no |  |
| `provider` | string | yes | 'openai' \| 'anthropic' \| 'ollama' (v1 set -). |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `provider` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Provider config saved | - |

### `DELETE /v1/providers/{provider}`

`DELETE /v1/providers/&#123;provider&#125;` - remove a provider config.

Gate: `sentin8:ai:prompt:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `provider` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Provider config removed | - |

### `GET /v1/registry`

`GET /v1/registry` - list pinned model→dimension mappings.

Gate: `sentin8:ai:embedding:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Pinned dimensions | - |

### `PUT /v1/registry/{model}`

`PUT /v1/embedding-registry/&#123;model&#125;` - pin a model→dimension mapping for the env. Mismatched embeddings are rejected with 422.

Gate: `sentin8:ai:prompt:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `dims` | integer | yes |  |
| `model` | string | yes |  |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `model` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Dimension pinned | - |

### `POST /v1/retrieval`

`POST /v1/retrieval` - hybrid retrieval: vector similarity (pgvector) + keyword (tsvector, when pgvector is absent) + metadata filters + permission filter from the caller's `data_scope`. Standard RLS env_id match is the backstop; the data_scope filter is defense-in-depth.

Gate: `sentin8:ai:retrieval:read`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `data_scope` | string[] | no | Caller's Shield-resolved data scope - applied as an explicit metadata filter IN THE QUERY (the LLM never sees out-of-scope chunks). |
| `metadata_filters` | - | no | Metadata filters: `&#123;"key": "value",. &#125;` - each becomes `metadata->'key' == value` in the SQL (AND-composed). |
| `query` | string | yes |  |
| `rerank_model` | string,null | no | When the prompt config declares a reranker model (`openai/rerank-x`), the vector/keyword union is re-scored by it before returning. |
| `target_env_id` | string,null | no |  |
| `top_k` | integer | no |  |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Retrieved chunks (permission-filtered) | `RetrievalHttpResult` |
| 503 | pgvector unavailable in this deployment | - |

### `GET /v1/traces`

`GET /v1/traces` - recent inference traces (env-scoped).

Gate: `sentin8:ai:prompt:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |
| `feature` | query | no | string |
| `limit` | query | no | integer |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Inference traces | `TraceRecord`[] |

