---
title: "Sentin8:Func - API (OpenAPI)"
sidebar_label: "API (OpenAPI)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-func/edit/main/docs/openapi.json
---
Sentin8 Sentin8:Func - standalone WebAssembly execution service.

> Generated from the service’s OpenAPI 3.1 spec (`docs/openapi.json`,
> served live at `GET /openapi.json`) - the source of truth is the
> service’s own `#[utoipa::path]` annotations.

**28 endpoints** across 4 groups.

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


## admin-ui

### `GET /v1/admin/ui/{page}`

Fetch admin ui.

Gate: `sentin8:func:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `page` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | RFW page definition (rendered by Sentin8:Dash) | - |
| 403 | Caller lacks a func read/admin scope | - |
| 404 | Unknown page | - |

### `GET /v1/admin/{resource}`

`GET /v1/admin/&#123;resource&#125;` - returns a JSON array of admin data rows. Fetch admin data.

Gate: `sentin8:func:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `resource` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The resource's rows for the RFW table | - |
| 403 | Caller lacks a func read/admin scope | - |
| 404 | Unknown resource | - |


## meta

### `GET /v1/health`

Handle health.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Liveness (version, build, runtime, cache size) | - |


## func

### `GET /v1/modules`

`GET /v1/modules` List it.

Gate: `sentin8:func:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `domain` | query | no | string |
| `product_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of modules | `ModuleRecord`[] |
| 400 | Invalid target_env_id | - |

### `POST /v1/modules`

`POST /v1/modules` - upload a new WASM module. Handle upload.

Gate: `sentin8:func:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `description` | string,null | no | The description. |
| `domain` | string | yes | The domain. |
| `hooks` | string[] | no | The hooks. |
| `parameters` | - | no | The parameters. |
| `product_id` | string | yes | product identifier. |
| `version_label` | string | yes | The version label. |
| `wasm_binary` | string | yes | base64-encoded WASM binary. The wasm binary. |
| `wasm_hash` | string,null | no | Optional client-provided hash (``sha256:hex`…`); verified server-side. The wasm hash. |
| `wasm_language` | string | yes | The wasm language. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Module uploaded | `ModuleRecord` |
| 400 | Invalid binary, hash mismatch, unknown hook, or bad target_env_id | - |
| 403 | Missing `func:write` scope | - |
| 409 | Module version already exists | - |

### `POST /v1/modules/product/{product_id}/execute`

`POST /v1/modules/product/&#123;product_id&#125;/execute` - execute a hook on the product's currently-ACTIVE version (the `latest` pointer; func DESIGN §4). The pinned-by-id route is the exact-version surface; this is the convenience route for callers that track products, not versions. Execute on product.

Gate: `sentin8:func:execute`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `callback_config` | null \\| `CallbackConfig` | no |  |
| `context` | - | yes | The context. |
| `hook` | string | yes | The hook. |
| `idempotency_key` | string,null | no | Optional idempotency key (principles §4.14 - every trigger dedupes on the event's key): a replayed execution with the same key returns the cached response instead of re-running the hook. The idempotency key. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Execution result | `ExecuteResponse` |
| 403 | Missing `func:execute` scope | - |
| 404 | No active module for the product | - |

### `GET /v1/modules/{id}`

`GET /v1/modules/&#123;id&#125;` Fetch it.

Gate: `sentin8:func:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Module metadata | `ModuleRecord` |
| 404 | Module not found | - |

### `DELETE /v1/modules/{id}`

`DELETE /v1/modules/&#123;id&#125;` Delete it.

Gate: `sentin8:func:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Module deleted | - |
| 403 | Missing `func:write` scope | - |
| 404 | Module not found or is active | - |

### `POST /v1/modules/{id}/activate`

`POST /v1/modules/&#123;id&#125;/activate` Handle activate.

Gate: `sentin8:func:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Module activated | - |
| 403 | Missing `func:write` scope | - |
| 404 | Module not found | - |

### `POST /v1/modules/{id}/delete`

`POST /v1/modules/&#123;id&#125;/delete` - RFW alias of `DELETE /v1/modules/&#123;id&#125;`.

Gate: `sentin8:func:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Module deleted (same contract as DELETE /v1/modules/&#123;id&#125;) | - |
| 401 | Caller authentication failed | - |
| 403 | Missing `func:write` scope | - |
| 404 | Unknown module | - |
| 409 | Module is ACTIVE - deprecate first | - |

### `POST /v1/modules/{id}/execute`

`POST /v1/modules/&#123;id&#125;/execute` Execute it.

Gate: `sentin8:func:execute`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `callback_config` | null \\| `CallbackConfig` | no |  |
| `context` | - | yes | The context. |
| `hook` | string | yes | The hook. |
| `idempotency_key` | string,null | no | Optional idempotency key (principles §4.14 - every trigger dedupes on the event's key): a replayed execution with the same key returns the cached response instead of re-running the hook. The idempotency key. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Execution result | `ExecuteResponse` |
| 400 | Invalid module or hook | - |
| 403 | Missing `func:execute` scope | - |
| 404 | Module not found | - |
| 500 | Execution failure (fuel/timeout/trap) | - |
| 502 | Proxy-back or Storage failure | - |

### `POST /v1/modules/{id}/validate`

`POST /v1/modules/&#123;id&#125;/validate` - re-validate the stored binary. Validate it.

Gate: `sentin8:func:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Validation result | `ValidateResponse` |
| 404 | Module not found | - |
| 502 | Binary unavailable in Storage | - |

### `GET /v1/modules/{id}/wasm`

`GET /v1/modules/&#123;id&#125;/wasm` - download the raw WASM binary from Storage. Fetch wasm.

Gate: `sentin8:func:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | WASM binary | integer[] |
| 403 | Missing `func:write` scope | - |
| 404 | Module or binary not found | - |

