---
title: "Sentin8:Secrets - API (OpenAPI)"
sidebar_label: "API (OpenAPI)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-secrets/edit/main/docs/openapi.json
---
Sentin8 Sentin8:Secrets - tenant secret management service.

> Generated from the service’s OpenAPI 3.1 spec (`docs/openapi.json`,
> served live at `GET /openapi.json`) - the source of truth is the
> service’s own `#[utoipa::path]` annotations.

**12 endpoints**.

## secrets

### `GET /v1/health`

`GET /v1/health` - custom payload (shell supplies the standard one too).
Handle health handler.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Service healthy | - |

### `GET /v1/secrets`

`GET /v1/secrets` - list metadata (names, versions, status - NEVER values).
List secrets.

Gate: `sentin8:secrets:secret:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `status` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Secret metadata list | - |
| 403 | Missing secrets scope | - |

### `POST /v1/secrets/maintenance/prune`

`POST /v1/secrets/maintenance/prune` - delete versions older than the
current one past the retention window (default 7d; `SENTIN8_SECRETS_PRUNE_DAYS`).
Idempotent; safe to call from Sentin8:Cron (proxy-back). The reveal-audit
table is NEVER pruned (security-relevant history).
Handle maintenance prune.

Gate: `sentin8:secrets:secret:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Prune summary | - |
| 403 | Missing secrets admin scope | - |

### `POST /v1/secrets/maintenance/re-encrypt`

Handle maintenance re encrypt.

Gate: `sentin8:secrets:secret:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `new_key_version` | integer,null | no | New epoch to stamp on re-encrypted rows (defaults to 1). The new key version. |
| `previous_master_key` | string | yes | The PREVIOUS master key (base64-32) used to open `key_version < current` rows. The previous master key. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Re-encrypt summary | - |
| 400 | Invalid previous key | - |
| 403 | Missing secrets admin scope | - |

### `POST /v1/secrets/resolve`

Resolve secret.

Gate: `sentin8:secrets:secret:read`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `ref` | string | yes | Secret reference URI (`secrets://<name>`; a bare name is accepted). |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Resolved value (audit-logged) | - |
| 400 | Invalid reference | - |
| 403 | Missing secrets scope | - |
| 404 | Secret not found or disabled | - |

### `GET /v1/secrets/{name}`

`GET /v1/secrets/{name}` - metadata for one secret (no value).
Fetch secret.

Gate: `sentin8:secrets:secret:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Secret metadata | - |
| 403 | Missing secrets scope | - |
| 404 | Secret not found | - |

### `PUT /v1/secrets/{name}`

Handle PUT secret.

Gate: `sentin8:secrets:secret:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `description` | string | no | The description. |
| `expires_at` | string,null | no | Optional expiry - a Cron schedule emits `sentin8:secrets:secret:expiring` T-14d before it (secrets README §7). |
| `value` | string | yes | Plaintext secret value (encrypted server-side, never stored as sent). The value. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Secret stored (metadata returned) | - |
| 400 | Invalid name | - |
| 403 | Missing secrets scope | - |

### `DELETE /v1/secrets/{name}`

`DELETE /v1/secrets/{name}` - soft-disable (status → disabled). Hard
delete is not exposed (values are purge-able via version prune only).
Delete secret.

Gate: `sentin8:secrets:secret:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Secret disabled | - |
| 403 | Missing secrets scope | - |
| 404 | Secret not found | - |

### `GET /v1/secrets/{name}/history`

`GET /v1/secrets/{name}/history` - version metadata list (no values).
Handle secret history.

Gate: `sentin8:secrets:secret:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Version metadata list | - |
| 403 | Missing secrets scope | - |
| 404 | Secret not found | - |

### `GET /v1/secrets/{name}/reads`

`GET /v1/secrets/{name}/reads` - reveal audit trail (admin).
Handle secret reads.

Gate: `sentin8:secrets:secret:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Reveal audit rows | - |
| 403 | Missing secrets admin scope | - |
| 404 | Secret not found | - |

### `GET /v1/secrets/{name}/reveal`

`GET /v1/secrets/{name}/reveal` - return the value. Admin scope; every
call writes a `reads` audit row.
Handle reveal secret.

Gate: `sentin8:secrets:secret:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Revealed value (audit-logged) | - |
| 403 | Missing secrets admin scope | - |
| 404 | Secret not found or disabled | - |

### `POST /v1/secrets/{name}/rotate`

`POST /v1/secrets/{name}/rotate` - new version from body value; the old
version is retained until the prune window.
Rotate secret.

Gate: `sentin8:secrets:secret:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `description` | string | no | The description. |
| `expires_at` | string,null | no | Optional expiry - a Cron schedule emits `sentin8:secrets:secret:expiring` T-14d before it (secrets README §7). |
| `value` | string | yes | Plaintext secret value (encrypted server-side, never stored as sent). The value. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Secret rotated (metadata returned) | - |
| 403 | Missing secrets scope | - |
| 404 | Secret not found | - |

