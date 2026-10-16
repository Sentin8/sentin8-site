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

**8 endpoints**.

## func

### `GET /v1/modules`

`GET /v1/modules`
List it.

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

`POST /v1/modules` - upload a new WASM module.
Handle upload.

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
| `wasm_hash` | string,null | no | Optional client-provided hash (`sha256:hex…`); verified server-side. The wasm hash. |
| `wasm_language` | string | yes | The wasm language. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Module uploaded | `ModuleRecord` |
| 400 | Invalid binary, hash mismatch, unknown hook, or bad target_env_id | - |
| 403 | Missing func:write scope | - |
| 409 | Module version already exists | - |

### `GET /v1/modules/{id}`

`GET /v1/modules/{id}`
Fetch it.

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

`DELETE /v1/modules/{id}`
Delete it.

Gate: `sentin8:func:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Module deleted | - |
| 403 | Missing func:write scope | - |
| 404 | Module not found or is active | - |

### `POST /v1/modules/{id}/activate`

`POST /v1/modules/{id}/activate`
Handle activate.

Gate: `sentin8:func:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Module activated | - |
| 403 | Missing func:write scope | - |
| 404 | Module not found | - |

### `POST /v1/modules/{id}/execute`

`POST /v1/modules/{id}/execute`
Execute it.

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
| 403 | Missing func:execute scope | - |
| 404 | Module not found | - |
| 500 | Execution failure (fuel/timeout/trap) | - |
| 502 | Proxy-back or Storage failure | - |

### `POST /v1/modules/{id}/validate`

`POST /v1/modules/{id}/validate` - re-validate the stored binary.
Validate it.

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

`GET /v1/modules/{id}/wasm` - download the raw WASM binary from Storage.
Fetch wasm.

Gate: `sentin8:func:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | WASM binary | integer[] |
| 403 | Missing func:write scope | - |
| 404 | Module or binary not found | - |

