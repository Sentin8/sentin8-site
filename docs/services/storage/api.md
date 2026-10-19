---
title: "Sentin8:Storage - API (OpenAPI)"
sidebar_label: "API (OpenAPI)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-storage/edit/main/docs/openapi.json
---
Sentin8 Sentin8:Storage - object/file storage with pluggable adapters.

> Generated from the service’s OpenAPI 3.1 spec (`docs/openapi.json`,
> served live at `GET /openapi.json`) - the source of truth is the
> service’s own `#[utoipa::path]` annotations.

**35 endpoints** across 4 groups.

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

### `GET /v1/admin/buckets`

`GET /v1/admin/buckets` - list buckets (top-level prefixes). This is a dedicated handler because the route `/v1/admin/buckets` also has a POST handler, so the catch-all `/v1/admin/&#123;resource&#125;` route is shadowed for GET requests. List buckets.

Gate: `sentin8:storage:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Bucket names + object counts | - |

### `POST /v1/admin/buckets`

`POST /v1/admin/buckets` - create a bucket by placing a `.keep` marker object at the bucket path. Returns an RFW redirect to the buckets list. Create bucket.

Gate: `sentin8:storage:write`

**Request body** (`application/json`):


**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Bucket created (.keep marker written) | - |

### `GET /v1/admin/buckets/objects`

`GET /v1/admin/buckets/objects?bucket=name` - list objects in a bucket. List bucket objects.

Gate: `sentin8:storage:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `bucket` | query | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Objects in the bucket | - |
| 404 | Unknown bucket | - |

### `POST /v1/admin/buckets/upload`

`POST /v1/admin/buckets/upload` - upload a file to a bucket. Handle upload file.

Gate: `sentin8:storage:write`

**Request body** (`application/json`):


**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | File stored (multipart or JSON body per the RFW form) | - |

### `POST /v1/admin/buckets/{id}/delete`

`POST /v1/admin/buckets/&#123;id&#125;/delete` - delete a bucket and all its objects. Delete bucket.

Gate: `sentin8:storage:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Bucket deleted with all objects | - |
| 404 | Unknown bucket | - |

### `GET /v1/admin/buckets/{id}/download`

`GET /v1/admin/buckets/&#123;id&#125;/download?object=&#123;name&#125;` - download an object. Returns the raw bytes as a binary stream. Handle download object.

Gate: `sentin8:storage:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `object` | query | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The raw object bytes | - |
| 404 | Unknown bucket or object | - |

### `POST /v1/admin/buckets/{id}/link`

`POST /v1/admin/buckets/&#123;id&#125;/link` - generate a signed read URL for an object. Generate link.

Gate: `sentin8:storage:write`

**Request body** (`application/json`):


**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Signed read URL for the object | - |
| 404 | Unknown bucket or object | - |

### `POST /v1/admin/buckets/{id}/objects/{object}/delete`

`POST /v1/admin/buckets/&#123;id&#125;/objects/&#123;object&#125;/delete` - delete a single object. Delete object.

Gate: `sentin8:storage:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `object` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Object deleted | - |
| 404 | Unknown bucket or object | - |

### `GET /v1/admin/ui/{page}`

Fetch admin ui.

Gate: `sentin8:storage:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `page` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | RFW page definition (rendered by Sentin8:Dash) | - |
| 403 | Caller lacks a storage read/admin scope | - |
| 404 | Unknown page | - |

### `GET /v1/admin/{resource}`

`GET /v1/admin/&#123;resource&#125;` - returns a JSON array of admin data rows.

Gate: `sentin8:storage:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `resource` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The resource's rows for the RFW table | - |
| 403 | Caller lacks a storage read/admin scope | - |
| 404 | Unknown resource | - |


## meta

### `GET /v1/health`

Handle health.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Liveness (version, build, disk usage) | - |


## storage

### `GET /v1/public/env/{env_id}/objects/{object_path}`

`GET /v1/public/env/&#123;env_id&#125;/objects/&#123;*path&#125;` - env-scoped public read. No auth required. Only serves image extensions. Handle public read env.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |
| `object_path` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The raw image bytes (Content-Type by extension) | - |
| 403 | Non-image extension | - |
| 404 | No such object | - |

### `GET /v1/public/objects/{object_path}`

`GET /v1/public/objects/&#123;*path&#125;` - platform-scoped public read for image assets. No auth required. Only serves image extensions. Uses system env storage prefix. Handle public read.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `object_path` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The raw image bytes (Content-Type by extension) | - |
| 403 | Non-image extension | - |
| 404 | No such object | - |

### `GET /v1/storage/objects`

`GET /v1/storage/objects` - list objects with optional prefix. List objects.

Gate: `sentin8:storage:env:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `prefix` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of objects | - |

### `GET /v1/storage/objects/{object_path}`

`GET /v1/storage/objects/&#123;path&#125;` - download an object. Fetch object.

Gate: `sentin8:storage:env:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `object_path` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Object content | integer[] |
| 403 | Missing storage scope | - |
| 404 | Object not found | - |

### `PUT /v1/storage/objects/{object_path}`

`PUT /v1/storage/objects/&#123;path&#125;` - upload an object. Handle PUT object.

Gate: `sentin8:storage:env:write`

**Request body** (`application/octet-stream`):


**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `object_path` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Object uploaded | - |
| 403 | Missing storage scope | - |

### `POST /v1/storage/objects/{object_path}`

`POST /v1/storage/objects/&#123;*path&#125;` - dispatch sign-read, sign-upload, copy, move. Handle object action.

Gate: `sentin8:storage:env:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `object_path` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Action completed | - |
| 403 | Missing storage scope | - |
| 405 | POST not supported on this path | - |

### `DELETE /v1/storage/objects/{object_path}`

`DELETE /v1/storage/objects/&#123;path&#125;` - delete an object. Delete object.

Gate: `sentin8:storage:env:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `object_path` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Object deleted | - |
| 403 | Missing storage scope | - |
| 404 | Object not found | - |

### `GET /v1/storage/signed/{token}`

`GET /v1/storage/signed/&#123;token&#125;` - serve object via signed URL. Serve signed.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `token` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Object content | integer[] |
| 400 | Invalid token | - |
| 403 | Signed URL expired or forged | - |

### `PUT /v1/storage/signed/{token}`

`PUT /v1/storage/signed/&#123;token&#125;` - store object via signed upload URL. Handle upload signed.

**Request body** (`application/octet-stream`):


**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `token` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Object stored | integer[] |
| 400 | Invalid token | - |
| 403 | Signed URL expired or forged | - |

