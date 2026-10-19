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

**35 endpoints** across 3 groups.

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

### `GET /v1/admin/secrets`

GET alias for `/v1/admin/secrets` - the POST-only literal on the same path shadows the `/v1/admin/&#123;resource&#125;` catch-all for GET requests (axum returns 405 instead of falling through), so the data read must be registered explicitly, mirroring the db service pattern.

Gate: `sentin8:secrets:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The secrets rows for the RFW table (no plaintext) | - |
| 403 | Caller lacks a secrets read/admin scope | - |

### `POST /v1/admin/secrets`

Handle admin put secret.

Gate: `sentin8:secrets:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `description` | string,null | no | The description. |
| `expires_at` | string,null | no | Optional expiry - emits ``sentin8:secrets:secret:expiring`` T-14d before it via the cron schedule (secrets README §7). |
| `name` | string | yes | The name. |
| `value` | string | yes | The value. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Secret stored encrypted (RFW redirect to the list) | - |
| 403 | Caller lacks a secrets admin scope | - |

### `POST /v1/admin/secrets/rotate`

`POST /v1/admin/secrets/rotate` - rotate from the admin form. The previous version is retained until the prune window. Handle admin rotate secret.

Gate: `sentin8:secrets:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | yes | The name. |
| `value` | string | yes | The value. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | New version stored (the previous retained until the prune window) | - |
| 404 | Unknown secret name | - |

### `POST /v1/admin/secrets/{name}/disable`

Handle admin disable secret.

Gate: `sentin8:secrets:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Secret soft-disabled (RFW redirect) | - |
| 404 | Unknown secret name | - |

### `POST /v1/admin/secrets/{name}/reveal`

`POST /v1/admin/secrets/&#123;name&#125;/reveal` - explicit reveal action. Every call writes a `reads` audit row; the value is returned once and never cached by the UI. Handle admin reveal secret.

Gate: `sentin8:secrets:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | One-time reveal (audited, never cached by the UI) | - |
| 404 | Unknown secret name | - |

### `GET /v1/admin/ui/{page}`

Fetch admin ui.

Gate: `sentin8:secrets:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `page` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | RFW page definition (rendered by Sentin8:Dash) | - |
| 403 | Caller lacks a secrets read/admin scope | - |
| 404 | Unknown page | - |

### `GET /v1/admin/{resource}`

`GET /v1/admin/&#123;resource&#125;` - returns a JSON array of admin data rows.

Gate: `sentin8:secrets:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `resource` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The resource's rows for the RFW table | - |
| 403 | Caller lacks a secrets read/admin scope | - |
| 404 | Unknown resource | - |


## secrets

### `GET /v1/health`

`GET /v1/health` - custom payload (shell supplies the standard one too). Handle health handler.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Service healthy | - |

### `POST /v1/internal/schedules/run`

`POST /v1/internal/schedules/run` - Sentin8:Cron proxy-back target. Maintenance sweeps that must not depend on a user request: (a) `expiry-scan` - emits ``sentin8:secrets:secret:expiring`` for every secret whose `expires_at` lands within the next 14 days (secrets README §7), (b) `version-prune` - drops prunable non-current versions using the service's own prune window (SECRETS-2, secrets DESIGN §10: the schedule is declared at boot next to `expiry-scan`). Authenticated by the cron ticker's M2M token (verified like any other principal under Shield).

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Maintenance run completed | - |

### `GET /v1/secrets`

`GET /v1/secrets` - list metadata (names, versions, status - NEVER values). List secrets.

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

`POST /v1/secrets/maintenance/prune` - delete versions older than the current one past the retention window (default 7d; `SENTIN8_SECRETS_PRUNE_DAYS`). Idempotent; safe to call from Sentin8:Cron (proxy-back). The reveal-audit table is NEVER pruned (security-relevant history). Handle maintenance prune.

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

`GET /v1/secrets/&#123;name&#125;` - metadata for one secret (no value). Fetch secret.

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
| `expires_at` | string,null | no | Optional expiry - a Cron schedule emits ``sentin8:secrets:secret:expiring`` T-14d before it (secrets README §7). |
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

`DELETE /v1/secrets/&#123;name&#125;` - soft-disable (status → disabled). Hard delete is not exposed (values are purge-able via version prune only). Delete secret.

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

`GET /v1/secrets/&#123;name&#125;/history` - version metadata list (no values). Handle secret history.

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

`GET /v1/secrets/&#123;name&#125;/reads` - reveal audit trail (admin). Handle secret reads.

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

`GET /v1/secrets/&#123;name&#125;/reveal` - return the value. Admin scope; every call writes a `reads` audit row. Handle reveal secret.

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

`POST /v1/secrets/&#123;name&#125;/rotate` - new version from body value; the old version is retained until the prune window. Rotate secret.

Gate: `sentin8:secrets:secret:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `description` | string | no | The description. |
| `expires_at` | string,null | no | Optional expiry - a Cron schedule emits ``sentin8:secrets:secret:expiring`` T-14d before it (secrets README §7). |
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

