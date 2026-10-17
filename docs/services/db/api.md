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

**12 endpoints**.

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

