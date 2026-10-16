---
title: "Sentin8:Flow - API (OpenAPI)"
sidebar_label: "API (OpenAPI)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-flow/edit/main/docs/openapi.json
---
Sentin8 Sentin8:Flow - standalone workflow execution engine.

> Generated from the service’s OpenAPI 3.1 spec (`docs/openapi.json`,
> served live at `GET /openapi.json`) - the source of truth is the
> service’s own `#[utoipa::path]` annotations.

**8 endpoints**.

## flow

### `POST /v1/handlers/register`

`POST /v1/handlers/register` - register a domain's step handler profile.
Register handler.

Gate: `sentin8:flow:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `auth_token` | string | yes | The auth token. |
| `base_url` | string | yes | The base URL. |
| `domain` | string | yes | The domain. |
| `internal_path` | string | yes | The internal path. |
| `step_kinds` | string[] | yes | The step kinds. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Handler registered | - |
| 403 | Missing flow:write scope | - |

### `GET /v1/workflows`

`GET /v1/workflows`
List workflows.

Gate: `sentin8:flow:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `domain` | query | no | string |
| `state` | query | no | string |
| `correlation_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of workflows | `WorkflowRecord`[] |
| 403 | Missing flow:read scope | - |

### `POST /v1/workflows`

`POST /v1/workflows` - create + start workflow.
Create workflow.

Gate: `sentin8:flow:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `callback_config` | `CallbackConfig` | yes | The callback config. |
| `auth_token` | string | no | The auth token. |
| `base_url` | string | no | The base URL. |
| `host_functions` | object | no | The host functions. |
| `internal_path` | string | no | The internal path. |
| `correlation_id` | string,null | no | correlation identifier. |
| `domain` | string | yes | The domain. |
| `input` | - | no | The input. |
| `logic` | `LogicVersion` | yes | The logic. |
| `correlation_id_func` | string,null | no | The correlation id func. |
| `expected_parameters` | array,null | no | The expected parameters. |
| `logic_id` | string | yes | logic identifier. |
| `steps` | `StepDef`[] | yes | The steps. |
| `version` | integer | yes | The version. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Workflow created | `WorkflowRecord` |
| 403 | Missing flow:write scope | - |

### `GET /v1/workflows/{id}`

`GET /v1/workflows/{id}`
Fetch workflow.

Gate: `sentin8:flow:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Workflow | `WorkflowRecord` |
| 403 | Missing flow:read scope | - |
| 404 | Workflow not found | - |

### `POST /v1/workflows/{id}/cancel`

`POST /v1/workflows/{id}/cancel`
Cancel workflow.

Gate: `sentin8:flow:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Workflow cancelled | `WorkflowRecord` |
| 403 | Missing flow:write scope | - |
| 404 | Workflow not found | - |

### `POST /v1/workflows/{id}/repair`

`POST /v1/workflows/{id}/repair` - rewind to a step and reprocess.
Repair workflow.

Gate: `sentin8:flow:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `input` | - | no | Optional updated input. The input. |
| `rewind_to` | integer | yes | Index to rewind to (0 = restart from beginning). The rewind to. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Workflow repaired | `WorkflowRecord` |
| 403 | Missing flow:write scope | - |
| 404 | Workflow not found | - |

### `POST /v1/workflows/{id}/resume`

`POST /v1/workflows/{id}/resume` - resume from waiting state (manual decision, async HTTP, schedule).
Resume workflow.

Gate: `sentin8:flow:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `decision` | - | no | Decision/output for the resumed step. The decision. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Workflow resumed | `WorkflowRecord` |
| 403 | Missing flow:write scope | - |
| 404 | Workflow not found | - |

### `POST /v1/workflows/{id}/retry`

`POST /v1/workflows/{id}/retry` - retry a failed workflow from the failed step.
Retry workflow.

Gate: `sentin8:flow:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Workflow retried | `WorkflowRecord` |
| 403 | Missing flow:write scope | - |
| 404 | Workflow not found | - |

