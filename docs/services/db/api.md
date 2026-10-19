---
title: "Sentin8:DB - API (OpenAPI)"
sidebar_label: "API (OpenAPI)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-db/edit/main/docs/openapi.json
---
Sentin8 Sentin8:DB - structured persistence over PostgreSQL with RLS.

> Generated from the service’s OpenAPI 3.1 spec (`docs/openapi.json`,
> served live at `GET /openapi.json`) - the source of truth is the
> service’s own `#[utoipa::path]` annotations.

**40 endpoints** across 4 groups.

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

### `POST /v1/admin/attributes/{id}/delete`

Gate: `sentin8:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Attribute deleted | - |
| 403 | Caller lacks the admin scope | - |

### `GET /v1/admin/policy-decisions`

Gate: `sentin8:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Recent decision log | -[] |
| 403 | Caller lacks the admin scope | - |

### `GET /v1/admin/policy-sets`

Gate: `sentin8:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Policy sets of this service | -[] |
| 403 | Caller lacks the admin scope | - |

### `POST /v1/admin/policy-sets`

Gate: `sentin8:admin`

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Policy set created | - |
| 400 | Invalid policy set definition | - |
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

### `POST /v1/admin/policy-sets/{name}/save`

Gate: `sentin8:admin`

**Request body** (`application/json`):


**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Policy set saved | - |
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

### `POST /v1/admin/policy-sets/{name}/{action}`

Gate: `sentin8:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |
| `action` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Action applied | - |
| 400 | Unknown row action | - |
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

### `POST /v1/admin/relations/{id}/delete`

Gate: `sentin8:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Relation deleted | - |
| 403 | Caller lacks the admin scope | - |


## admin-ui

### `GET /v1/admin/tables`

GET handler for the literal `/v1/admin/tables` route (the POST alias shares the path; without an explicit GET registration axum answers 405). Fetch admin data for tables.

Gate: `sentin8:db:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The tables rows for the RFW table | - |
| 403 | Caller lacks a db read/admin scope | - |

### `POST /v1/admin/tables`

`POST /v1/admin/tables` - create-table form submission (RFW renderer only supports POST). Delegates to the main create handler. Handle admin create table.

Gate: `sentin8:db:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `columns` | `ColumnDef`[] | no | The columns. |
| `display_name` | string | yes | The display name. |
| `table_name` | string | yes | The table name. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Table created | - |
| 400 | Invalid create-table form | - |
| 403 | Caller lacks a db admin scope | - |

### `POST /v1/admin/tables/{id}/archive`

`POST /v1/admin/tables/&#123;id&#125;/archive` - archive row action. Handle admin archive table.

Gate: `sentin8:db:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Table archived | - |
| 403 | Caller lacks a db admin scope | - |
| 404 | Unknown table | - |

### `POST /v1/admin/tables/{id}/drop`

`POST /v1/admin/tables/&#123;id&#125;/drop` - drop row action. Handle admin drop table.

Gate: `sentin8:db:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Table dropped | - |
| 403 | Caller lacks a db admin scope | - |
| 404 | Unknown table | - |

### `GET /v1/admin/ui/{page}`

Fetch admin ui.

Gate: `sentin8:db:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `page` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | RFW page definition (rendered by Sentin8:Dash) | - |
| 403 | Caller lacks a db read/admin scope | - |
| 404 | Unknown page | - |

### `GET /v1/admin/{resource}`

`GET /v1/admin/&#123;resource&#125;` - returns a JSON array of admin data rows. Registry-backed for `tables`, live posture findings for `posture`, recent DDL audit entries for `audit`. Cross-env via `target_env_id` requires ``sentin8:sys:admin`` (handlers::TargetEnvQuery validation applies). Fetch admin data.

Gate: `sentin8:db:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `resource` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The resource's rows for the RFW table | - |
| 403 | Caller lacks a db read/admin scope | - |
| 404 | Unknown resource | - |


## db

### `GET /v1/audit`

`GET /v1/audit` - DDL audit log (Stories). Handle audit log.

Gate: `sentin8:db:audit:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | DDL audit log | - |
| 403 | Missing `db:audit:read` scope | - |

### `POST /v1/data/delete`

Delete it.

Gate: `sentin8:db:data:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | - | no | The filter. |
| `table` | string | yes | The table. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Rows deleted | - |
| 403 | Missing `db:data:write` scope | - |

### `POST /v1/data/insert`

`POST /v1/data/insert` - insert rows with mandatory system columns.

Gate: `sentin8:db:data:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `rows` | -[] | yes | The rows. |
| `table` | string | yes | The table. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Rows inserted | - |
| 403 | Missing `db:data:write` scope | - |

### `POST /v1/data/query`

`POST /v1/data/query` - query rows with filters, sorts, pagination. Soft-deleted rows (`deleted_at IS NOT NULL`) are excluded. Handle query.

Gate: `sentin8:db:data:read`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `filters` | - | no | Opaque filter expression (the server interprets per table). |
| `pagination` | `Pagination` | no | Limit/offset window. |
| `after` | string,null | no | Keyset cursor (DB-3, db README §7): return rows strictly after this `id`. Takes precedence over `offset` when set - stable under inserts between pages, unlike the offset window. Paired with `sort` on `id` enforced server-side when the cursor is used. |
| `limit` | integer,null | no | Maximum rows to return. |
| `offset` | integer,null | no | Rows to skip (offset mode). |
| `sort` | `SortClause`[] | no | Sort clauses in priority order. |
| `table` | string | yes | The table to query. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Query results | `QueryResponse` |
| 403 | Missing `db:data:read` scope | - |

### `POST /v1/data/update`

Update it.

Gate: `sentin8:db:data:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `filter` | - | no | The filter. |
| `resource_version` | integer,null | no | The resource version. |
| `set` | - | yes | The set. |
| `table` | string | yes | The table. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Rows updated | - |
| 403 | Missing `db:data:write` scope | - |

### `GET /v1/posture`

`GET /v1/posture` - RLS drift detection (Stories). Handle posture.

Gate: `sentin8:db:posture:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | RLS posture report | - |
| 403 | Missing `db:table:admin` or `db:posture:read` scope | - |

### `GET /v1/tables`

`GET /v1/tables` - list active tables for the resolved env. List tables.

Gate: `sentin8:db:data:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of tables | `TableResponse`[] |

### `POST /v1/tables`

`POST /v1/tables` - create a table with mandatory system columns + RLS.

Gate: `sentin8:db:table:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `columns` | `ColumnDef`[] | no | The columns. |
| `display_name` | string | yes | The display name. |
| `table_name` | string | yes | The table name. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Table created | `TableResponse` |
| 403 | Missing `db:table:admin` scope | - |

### `GET /v1/tables/{id}`

`GET /v1/tables/&#123;id&#125;` - get table metadata. Env-scoped + authenticated ; a foreign-env id 404s. Fetch table.

Gate: `sentin8:db:data:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Table metadata | `TableResponse` |
| 403 | Missing `db:data:read` scope | - |
| 404 | Table not found | - |

### `POST /v1/tables/{id}/alter`

Handle alter table.

Gate: `sentin8:db:table:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `add_columns` | `ColumnDef`[] | yes | The add columns. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Table altered | - |
| 403 | Missing `db:table:admin` scope | - |
| 404 | Table not found | - |

### `POST /v1/tables/{id}/archive`

`POST /v1/tables/&#123;id&#125;/archive` - mark a table as archived (Stories). Env-scoped; registry update, audit row, and event commit together. Archive table.

Gate: `sentin8:db:table:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Table archived | - |
| 403 | Missing `db:table:admin` scope | - |
| 404 | Table not found or not active | - |

### `POST /v1/tables/{id}/drop`

`POST /v1/tables/&#123;id&#125;/drop` - pending-delete then drop (Stories). Env-scoped; registry status, physical DROP, audit row, and event commit together - a failed DROP rolls the registry status back. Handle drop table.

Gate: `sentin8:db:table:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Table dropped | - |
| 403 | Missing `db:table:admin` scope | - |
| 404 | Table not found or already dropped | - |


## meta

### `GET /v1/health`

Handle health.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Liveness (version, build, active connections) | - |

