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

**7 endpoints**.

## storage

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

