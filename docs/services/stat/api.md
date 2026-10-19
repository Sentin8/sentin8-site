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

**51 endpoints** across 6 groups.

## stat

### `GET /v1/admin/accounts`

`GET /v1/admin/accounts`

Gate: `sentin8:stat:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of accounts | `Account`[] |
| 403 | Missing `stat:admin` scope | - |

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
| 403 | Missing `stat:admin` scope | - |

### `GET /v1/admin/properties`

`GET /v1/admin/properties`

Gate: `sentin8:stat:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of properties | `Property`[] |
| 403 | Missing `stat:admin` scope | - |

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
| 403 | Missing `stat:admin` scope | - |

### `GET /v1/admin/properties/{id}`

`GET /v1/admin/properties/&#123;id&#125;`

Gate: `sentin8:stat:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Property | `Property` |
| 403 | Missing `stat:admin` scope | - |
| 404 | Property not found | - |

### `PUT /v1/admin/properties/{id}`

`PUT /v1/admin/properties/&#123;id&#125;`

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
| 403 | Missing `stat:admin` scope | - |
| 404 | Property not found | - |

### `DELETE /v1/admin/properties/{id}`

`DELETE /v1/admin/properties/&#123;id&#125;`

Gate: `sentin8:stat:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Property deleted | - |
| 403 | Missing `stat:admin` scope | - |
| 404 | Property not found | - |

### `GET /v1/admin/properties/{id}/alert-rules`

`GET /v1/admin/properties/&#123;id&#125;/alert-rules`

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
| 403 | Missing `stat:admin` scope | - |

### `POST /v1/admin/properties/{id}/alert-rules`

`POST /v1/admin/properties/&#123;id&#125;/alert-rules` Create a per-property custom alert rule (stat README §7). The request is validated against the known rule types, comparators, and metric vocabulary (400 on unknown); the property must exist in the target env (404). The INSERT runs in one explicit transaction with the RLS context set on the same connection (stat DESIGN §5).

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
| 403 | Missing `stat:admin` scope | - |
| 404 | Property not found in env | - |

### `DELETE /v1/admin/properties/{id}/alert-rules/{rule_id}`

`DELETE /v1/admin/properties/&#123;id&#125;/alert-rules/&#123;rule_id&#125;`

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
| 403 | Missing `stat:admin` scope | - |
| 404 | Rule not found | - |

### `POST /v1/admin/properties/{id}/delete`

`POST /v1/admin/properties/&#123;id&#125;/delete` - RFW alias of `DELETE /v1/admin/properties/&#123;id&#125;`.

Gate: `sentin8:stat:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Property deleted (same contract as DELETE /v1/admin/properties/&#123;id&#125;) | - |
| 403 | Missing `stat:admin` scope | - |
| 404 | Unknown property | - |

### `POST /v1/admin/properties/{id}/reaggregate`

`POST /v1/admin/properties/&#123;id&#125;/reaggregate` Delete and rebuild the property's day-granularity `metrics` rollups over a raw-events window (stat README §7). v1 reaggregates from `stat.events` ONLY - a window reaching past the property's retention horizon is a 400 (the spilled raw data lives in Storage archives; per stat DESIGN §4.3.6 the archive spill is the source-of-truth boundary and the Storage-archive replay path is out of scope for this endpoint). The recomputation shares the background rollup's SQL via `crate::worker::rollups::reaggregate_property`.

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
| 403 | Missing `stat:admin` scope | - |
| 404 | Property not found | - |

### `PUT /v1/admin/properties/{id}/retention`

`PUT /v1/admin/properties/&#123;id&#125;/retention`

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
| 403 | Missing `stat:admin` scope | - |

### `GET /v1/admin/properties/{id}/settings`

`GET /v1/admin/properties/&#123;id&#125;/settings`

Gate: `sentin8:stat:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Property settings | - |
| 403 | Missing `stat:admin` scope | - |

### `PUT /v1/admin/properties/{id}/settings`

`PUT /v1/admin/properties/&#123;id&#125;/settings`

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
| 403 | Missing `stat:admin` scope | - |


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

Gate: `sentin8:stat:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `page` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | RFW page definition (rendered by Sentin8:Dash) | - |
| 403 | Caller lacks a stat read/admin scope | - |
| 404 | Unknown page | - |

### `GET /v1/admin/{resource}`

`GET /v1/admin/&#123;resource&#125;` - returns a JSON array of admin data rows. Fetch admin data.

Gate: `sentin8:stat:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `resource` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The resource's rows for the RFW table | - |
| 403 | Caller lacks a stat read/admin scope | - |
| 404 | Unknown resource | - |


## data

### `POST /v1/data/funnels`

`POST /v1/data/funnels` - define a funnel. Create funnel.

Gate: `sentin8:stat:data:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | yes | The name. |
| `property_id` | string | yes | property identifier. |
| `steps` | - | yes | The steps. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Funnel created | `Funnel` |
| 403 | Missing `stat:data:write` scope | - |

### `GET /v1/data/funnels/{id}`

`GET /v1/data/funnels/&#123;id&#125;` - funnel report. Fetch funnel.

Gate: `sentin8:stat:data:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Funnel steps + drop-off | - |
| 403 | Missing `stat:data:read` scope | - |
| 404 | Unknown funnel | - |

### `GET /v1/data/metrics`

`GET /v1/data/metrics` - server-telemetry time-series from `sentin8_stat_aggregate_metrics_daily`. Handle metrics.

Gate: `sentin8:stat:data:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `property_id` | path | yes | string,null |
| `from` | path | yes | string,null |
| `to` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Aggregated metrics | -[] |
| 403 | Missing `stat:data:read` scope | - |

### `POST /v1/data/query`

`POST /v1/data/query` - arbitrary aggregate query (JSON DSL, aggregates only). Handle query.

Gate: `sentin8:stat:data:read`

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Query result rows | - |
| 400 | Invalid query | - |
| 403 | Missing `stat:data:read` scope | - |

### `GET /v1/data/realtime`

`GET /v1/data/realtime` - real-time active users (last 5 min, in-memory).

Gate: `sentin8:stat:data:read`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Realtime counters (active sessions, recent events) | - |
| 403 | Missing `stat:data:read` scope | - |

### `GET /v1/data/reports`

`GET /v1/data/reports` - list available report templates. List reports.

Gate: `sentin8:stat:data:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `property_id` | path | yes | string,null |
| `from` | path | yes | string,null |
| `to` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Saved reports for this property | -[] |
| 403 | Missing `stat:data:read` scope | - |

### `GET /v1/data/reports/{report_id}`

`GET /v1/data/reports/&#123;report_id&#125;` - run a pre-canned report. Run report.

Gate: `sentin8:stat:data:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `report_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The report's result rows | - |
| 403 | Missing `stat:data:read` scope | - |
| 404 | Unknown report | - |

### `GET /v1/data/retention`

`GET /v1/data/retention` - cohort retention (reads sessions aggregate). Handle retention.

Gate: `sentin8:stat:data:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `property_id` | path | yes | string,null |
| `from` | path | yes | string,null |
| `to` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Retention cohorts | - |
| 403 | Missing `stat:data:read` scope | - |

### `GET /v1/data/sessions`

`GET /v1/data/sessions` - session breakdown. Handle sessions.

Gate: `sentin8:stat:data:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `property_id` | path | yes | string,null |
| `from` | path | yes | string,null |
| `to` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Session rows | -[] |
| 403 | Missing `stat:data:read` scope | - |

### `GET /v1/data/traffic`

`GET /v1/data/traffic` - TLS inter-service traffic matrix.

Gate: `sentin8:stat:data:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `property_id` | path | yes | string,null |
| `from` | path | yes | string,null |
| `to` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Traffic summaries | -[] |
| 403 | Missing `stat:data:read` scope | - |


## meta

### `GET /v1/health`

Handle health.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Liveness (version, build, active connections) | - |

### `GET /v1/readiness`

Handle readiness.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Readiness (PG reachable + writer workers) | - |
| 503 | Not ready | - |


## ingest

### `POST /v1/m/batch`

`POST /v1/m/batch` - server-side batch (M2M required, higher limits). Handle batch.

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Per-item results (offline replay) | - |
| 403 | Property unknown | - |

### `GET /v1/m/collect`

Handle pixel.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `pt` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | 1x1 transparent GIF (beacon) | - |

### `POST /v1/m/collect`

`POST /v1/m/collect` - batch ingest (max 100 events / 1 MiB). Handle collect.

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Accepted | - |
| 403 | Property unknown / origin mismatch | - |

### `POST /v1/m/conversion`

`POST /v1/m/conversion` Handle conversion.

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Stored | - |
| 403 | Property unknown | - |

### `POST /v1/m/event`

`POST /v1/m/event` Handle event.

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Stored | - |
| 403 | Property unknown | - |

### `POST /v1/m/metric`

`POST /v1/m/metric` - server-only telemetry (requires ``sentin8:stat:measure``). Handle metric.

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Stored | - |
| 403 | Property unknown | - |

### `POST /v1/m/pageview`

`POST /v1/m/pageview` Handle pageview.

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Stored | - |
| 403 | Property unknown | - |

