---
title: "Sentin8:Cron - API (OpenAPI)"
sidebar_label: "API (OpenAPI)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-cron/edit/main/docs/openapi.json
---
Sentin8 Sentin8:Cron - standalone distributed scheduler.

> Generated from the service’s OpenAPI 3.1 spec (`docs/openapi.json`,
> served live at `GET /openapi.json`) - the source of truth is the
> service’s own `#[utoipa::path]` annotations.

**12 endpoints**.

## cron

### `GET /v1/dlq`

`GET /v1/dlq` List dlq.

Gate: `sentin8:cron:read`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of DLQ items | `DlqResponse`[] |
| 403 | Missing `cron:read` scope | - |

### `GET /v1/dlq/{id}`

`GET /v1/dlq/&#123;id&#125;` - DLQ item detail. Fetch dlq.

Gate: `sentin8:cron:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | DLQ item detail | `DlqResponse` |
| 404 | DLQ item not found | - |

### `POST /v1/dlq/{id}/republish`

`POST /v1/dlq/&#123;id&#125;/republish` - republish a DLQ item as a new pending job and delete the DLQ row. Handle republish dlq.

Gate: `sentin8:cron:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | DLQ item republished | - |
| 404 | DLQ item not found | - |

### `GET /v1/jobs`

`GET /v1/jobs` List jobs.

Gate: `sentin8:cron:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `schedule_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of jobs | `JobResponse`[] |
| 403 | Missing `cron:read` scope | - |

### `GET /v1/jobs/{id}`

`GET /v1/jobs/&#123;id&#125;` - job detail. Fetch job.

Gate: `sentin8:cron:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Job detail | `JobResponse` |
| 403 | Missing `cron:read` scope | - |
| 404 | Job not found | - |

### `POST /v1/jobs/{id}/retry`

`POST /v1/jobs/&#123;id&#125;/retry` - reset a failed job to `pending` with `next_attempt_at = now`; the ticker drains it on the next tick . Retry job.

Gate: `sentin8:cron:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Job queued for retry | - |
| 404 | Failed job not found | - |

### `GET /v1/schedules`

`GET /v1/schedules` List schedules.

Gate: `sentin8:cron:read`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of schedules | `ScheduleResponse`[] |
| 403 | Missing `cron:read` scope | - |

### `POST /v1/schedules`

`POST /v1/schedules` Create schedule.

Gate: `sentin8:cron:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cron_expression` | string | yes | The cron expression. |
| `domain` | string | yes | The domain. |
| `fire_at` | string,null | no | Single fire time for `kind: "once"` schedules (RFC 3339). |
| `kind` | string,null | no | `once` = single fire at `fire_at` (then `completed`); default recurring = the cron expression drives every fire. |
| `max_retries` | integer | no | Maximum retries. |
| `schedule_type` | string | yes | The schedule type. |
| `target_config` | - | no | The target config. |
| `timezone` | string,null | no | IANA zone the cron_expression's wall-clock fields match against (CRON-6, cron README §7). Default 'UTC'. Rejected at create time when unparseable. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Schedule created | `ScheduleResponse` |
| 403 | Missing `cron:write` scope | - |

### `GET /v1/schedules/{id}`

`GET /v1/schedules/&#123;id&#125;` - schedule detail. Fetch schedule.

Gate: `sentin8:cron:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Schedule detail | `ScheduleResponse` |
| 403 | Missing `cron:read` scope | - |
| 404 | Schedule not found | - |

### `DELETE /v1/schedules/{id}`

`DELETE /v1/schedules/&#123;id&#125;` Delete schedule.

Gate: `sentin8:cron:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Schedule deleted | - |
| 403 | Missing `cron:write` scope | - |
| 404 | Schedule not found | - |

### `POST /v1/schedules/{id}/pause`

`POST /v1/schedules/&#123;id&#125;/pause` Pause schedule.

Gate: `sentin8:cron:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Schedule paused | - |
| 404 | Schedule not found | - |

### `POST /v1/schedules/{id}/resume`

`POST /v1/schedules/&#123;id&#125;/resume` Resume schedule.

Gate: `sentin8:cron:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Schedule resumed | - |
| 404 | Schedule not found | - |

