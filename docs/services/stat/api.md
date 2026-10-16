---
title: "Sentin8:Stat - API (OpenAPI)"
sidebar_label: "API (OpenAPI)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-stat/edit/main/docs/openapi.json
---
Sentin8 Sentin8:Stat - analytics/telemetry ingest, read APIs, and embedded pipeline worker.

> Generated from the service’s OpenAPI 3.1 spec (`docs/openapi.json`,
> served live at `GET /openapi.json`) - the source of truth is the
> service’s own `#[utoipa::path]` annotations.

**14 endpoints**.

## stat

### `GET /v1/admin/accounts`

`GET /v1/admin/accounts`

Gate: `sentin8:stat:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of accounts | `Account`[] |
| 403 | Missing stat:admin scope | - |

### `POST /v1/admin/accounts`

`POST /v1/admin/accounts`

Gate: `sentin8:stat:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | yes | The name. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Account created | `Account` |
| 403 | Missing stat:admin scope | - |

### `GET /v1/admin/properties`

`GET /v1/admin/properties`

Gate: `sentin8:stat:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of properties | `Property`[] |
| 403 | Missing stat:admin scope | - |

### `POST /v1/admin/properties`

`POST /v1/admin/properties`

Gate: `sentin8:stat:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `account_id` | string,null | no | account identifier. |
| `name` | string | yes | The name. |
| `slug` | string | yes | The slug. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Property created | `Property` |
| 403 | Missing stat:admin scope | - |

### `GET /v1/admin/properties/{id}`

`GET /v1/admin/properties/{id}`

Gate: `sentin8:stat:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Property | `Property` |
| 403 | Missing stat:admin scope | - |
| 404 | Property not found | - |

### `PUT /v1/admin/properties/{id}`

`PUT /v1/admin/properties/{id}`

Gate: `sentin8:stat:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string,null | no | The name. |
| `status` | string,null | no | The status. |
| `timezone` | string,null | no | The timezone. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Property updated | `Property` |
| 403 | Missing stat:admin scope | - |
| 404 | Property not found | - |

### `DELETE /v1/admin/properties/{id}`

`DELETE /v1/admin/properties/{id}`

Gate: `sentin8:stat:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Property deleted | - |
| 403 | Missing stat:admin scope | - |
| 404 | Property not found | - |

### `GET /v1/admin/properties/{id}/alert-rules`

`GET /v1/admin/properties/{id}/alert-rules`

Gate: `sentin8:stat:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Rules for the property | `AlertRule`[] |
| 403 | Missing stat:admin scope | - |

### `POST /v1/admin/properties/{id}/alert-rules`

`POST /v1/admin/properties/{id}/alert-rules`
Create a per-property custom alert rule (stat README §7). The request
is validated against the known rule types, comparators, and metric
vocabulary (400 on unknown); the property must exist in the target
env (404). The INSERT runs in one explicit transaction with the RLS
context set on the same connection (stat DESIGN §5).

Gate: `sentin8:stat:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `comparator` | string | yes | `gt` \| `gte` \| `lt` \| `lte`. |
| `enabled` | boolean | no | Whether the rule evaluates. |
| `metric_name` | string | yes | Metric vocabulary key (`events.count`, `conversions.count`, `metric:&#123;name&#125;`). |
| `min_sample` | integer | no | Noise floor - the rule never evaluates below it. |
| `name` | string | yes | Display name. |
| `rule_type` | string | yes | `threshold` or `anomaly`. |
| `threshold` | number | yes | Comparison threshold (metric value, or deviation factor for `anomaly` - e.g. `3.0` = current exceeds 3× the baseline). |
| `window_hours` | integer | no | Moving-average lookback in hours (`anomaly` rules). |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Rule created | `AlertRule` |
| 400 | Unknown rule_type, comparator, or metric_name; invalid threshold/window | - |
| 403 | Missing stat:admin scope | - |
| 404 | Property not found in env | - |

### `DELETE /v1/admin/properties/{id}/alert-rules/{rule_id}`

`DELETE /v1/admin/properties/{id}/alert-rules/{rule_id}`

Gate: `sentin8:stat:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `rule_id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Rule deleted | - |
| 403 | Missing stat:admin scope | - |
| 404 | Rule not found | - |

### `POST /v1/admin/properties/{id}/reaggregate`

`POST /v1/admin/properties/{id}/reaggregate`
Delete and rebuild the property's day-granularity `metrics` rollups over
a raw-events window (stat README §7). v1 reaggregates from `stat.events`
ONLY - a window reaching past the property's retention horizon is a 400
(the spilled raw data lives in Storage archives; per stat DESIGN §4.3.6
the archive spill is the source-of-truth boundary and the Storage-archive
replay path is out of scope for this endpoint). The recomputation shares the
background rollup's SQL via
`crate::worker::rollups::reaggregate_property`.

Gate: `sentin8:stat:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `from` | string,null | no | Inclusive window start (RFC 3339). |
| `to` | string,null | no | Inclusive window end (RFC 3339). |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Rollups rebuilt over the window | - |
| 400 | Invalid window, window beyond the retention horizon, or property not in env | - |
| 403 | Missing stat:admin scope | - |
| 404 | Property not found | - |

### `PUT /v1/admin/properties/{id}/retention`

`PUT /v1/admin/properties/{id}/retention`

Gate: `sentin8:stat:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `retention_days` | integer | yes | The retention days. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Retention set | - |
| 403 | Missing stat:admin scope | - |

### `GET /v1/admin/properties/{id}/settings`

`GET /v1/admin/properties/{id}/settings`

Gate: `sentin8:stat:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Property settings | - |
| 403 | Missing stat:admin scope | - |

### `PUT /v1/admin/properties/{id}/settings`

`PUT /v1/admin/properties/{id}/settings`

Gate: `sentin8:stat:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `bot_filter_enabled` | boolean,null | no | The bot filter enabled. |
| `pii_deny_list` | - | no | The pii deny list. |
| `session_timeout_minutes` | integer,null | no | The session timeout minutes. |
| `timezone` | string,null | no | The timezone. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Settings updated | - |
| 403 | Missing stat:admin scope | - |

