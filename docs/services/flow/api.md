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

**28 endpoints** across 5 groups.

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

Gate: `sentin8:flow:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `page` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | RFW page definition (rendered by Sentin8:Dash) | - |
| 403 | Caller lacks a flow read/admin scope | - |
| 404 | Unknown page | - |

### `GET /v1/admin/{resource}`

`GET /v1/admin/&#123;resource&#125;` - returns a JSON array of admin data rows. Fetch admin data.

Gate: `sentin8:flow:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `resource` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The resource's rows for the RFW table | - |
| 403 | Caller lacks a flow read/admin scope | - |
| 404 | Unknown resource | - |


## flow

### `POST /v1/handlers/register`

`POST /v1/handlers/register` - register a domain's step handler profile. Register handler.

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
| 403 | Missing `flow:write` scope | - |

### `GET /v1/workflows`

`GET /v1/workflows` List workflows.

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
| 403 | Missing `flow:read` scope | - |

### `POST /v1/workflows`

`POST /v1/workflows` - create + start workflow. Create workflow.

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
| 403 | Missing `flow:write` scope | - |

### `GET /v1/workflows/{id}`

`GET /v1/workflows/&#123;id&#125;` Fetch workflow.

Gate: `sentin8:flow:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Workflow | `WorkflowRecord` |
| 403 | Missing `flow:read` scope | - |
| 404 | Workflow not found | - |

### `POST /v1/workflows/{id}/cancel`

`POST /v1/workflows/&#123;id&#125;/cancel` Cancel workflow.

Gate: `sentin8:flow:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Workflow cancelled | `WorkflowRecord` |
| 403 | Missing `flow:write` scope | - |
| 404 | Workflow not found | - |

### `POST /v1/workflows/{id}/repair`

`POST /v1/workflows/&#123;id&#125;/repair` - rewind to a step and reprocess. Repair workflow.

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
| 403 | Missing `flow:write` scope | - |
| 404 | Workflow not found | - |

### `POST /v1/workflows/{id}/resume`

`POST /v1/workflows/&#123;id&#125;/resume` - resume from waiting state (manual decision, async HTTP, schedule). Resume workflow.

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
| 403 | Missing `flow:write` scope | - |
| 404 | Workflow not found | - |

### `POST /v1/workflows/{id}/retry`

`POST /v1/workflows/&#123;id&#125;/retry` - retry a failed workflow from the failed step. Retry workflow.

Gate: `sentin8:flow:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Workflow retried | `WorkflowRecord` |
| 403 | Missing `flow:write` scope | - |
| 404 | Workflow not found | - |


## meta

### `GET /v1/health`

Handle health.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Liveness (version, build, active connections) | - |


## internal

### `POST /v1/internal/callbacks/async`

`POST /v1/internal/callbacks/async` - external callback to resume a waiting workflow. Handle internal async callback.

Gate: `sentin8:flow:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `error` | string,null | no | The error. |
| `output` | - | no | The output. |
| `status` | string | yes | The status. |
| `workflow_id` | string | yes | workflow identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Workflow resumed (waiting step advanced with the callback status/output) | - |
| 401 | Caller authentication failed (cert identity or bearer) | - |
| 404 | Unknown workflow | - |
| 409 | Workflow is not in a waiting state | - |

### `POST /v1/internal/schedules/run`

`POST /v1/internal/schedules/run` - Cron calls this to resume due scheduled workflows. Handle internal schedule run.

Gate: `sentin8:flow:write`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Due scheduled workflows resumed (count returned) | - |
| 401 | Caller authentication failed (cert identity or bearer) | - |

