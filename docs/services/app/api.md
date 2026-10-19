---
title: "Sentin8:App - API (OpenAPI)"
sidebar_label: "API (OpenAPI)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-app/edit/main/docs/openapi.json
---
Sentin8 Sentin8:App - third-party app store, instance management.

> Generated from the service’s OpenAPI 3.1 spec (`docs/openapi.json`,
> served live at `GET /openapi.json`) - the source of truth is the
> service’s own `#[utoipa::path]` annotations.

**36 endpoints** across 4 groups.

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


## app

### `POST /v1/admin/instances/uninstall`

`POST /v1/admin/instances/uninstall` - uninstall an app instance. Body: `&#123; "instance_id": "uuid" &#125;`. Deletes the instance if it belongs to the caller's org/env (RLS-enforced).

Gate: `sentin8:app:admin`

**Request body** (`application/json`):


**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Instance uninstalled (RLS-own check enforced) | - |
| 403 | Caller lacks an app admin scope | - |
| 404 | Unknown instance | - |

### `GET /v1/app/admin/instances/{id}`

`GET /v1/app/admin/instances/&#123;id&#125;` - instance admin detail.

Gate: `sentin8:app:instances:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Instance detail | - |
| 403 | Missing `app:instances:admin` scope | - |
| 404 | Instance not found | - |

### `PUT /v1/app/admin/instances/{id}/domain`

`PUT /v1/app/admin/instances/&#123;id&#125;/domain` - update custom domain (with DNS TXT validation).

Gate: `sentin8:app:instances:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cname_target` | string,null | no | APP-5 (CNAME challenge): the resolved target of `&#123;token&#125;.verify.&#123;domain&#125;` as retrieved by the caller's DNS lookup. Pass together with `cname_token`; wins over `txt_record` when both are present. |
| `cname_token` | string,null | no | APP-5: the challenge token previously generated for this domain (`sentin8-verify-<32-hex>`). |
| `custom_domain` | string | yes | The custom domain to bind (verified via DNS TXT or CNAME). |
| `txt_record` | string,null | no | The DNS TXT record value retrieved by App from the customer's DNS. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Domain updated | - |
| 400 | Invalid custom_domain | - |
| 403 | Missing `app:instances:admin` scope | - |
| 404 | Instance not found | - |

### `PUT /v1/app/admin/instances/{id}/env-vars`

`PUT /v1/app/admin/instances/&#123;id&#125;/env-vars` - update env var secret references.

Gate: `sentin8:app:instances:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `env_vars_ref` | string | yes | Secret reference path (e.g. `sentin8-secrets://app/&#123;id&#125;/env`). |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Env vars reference updated | - |
| 403 | Missing `app:instances:admin` scope | - |
| 404 | Instance not found | - |

### `GET /v1/app/admin/instances/{id}/env-vars/resolve`

`GET /v1/app/admin/instances/&#123;id&#125;/env-vars/resolve` - resolve the instance's stored env-vars secret reference through the shared `sentin8-secrets` resolver chain ( story 34.2.5). Returns the resolved value once; never logged. Requires the `instances:admin` scope.

Gate: `sentin8:app:instances:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Resolved env vars value | - |
| 403 | Missing `app:instances:admin` scope | - |
| 404 | Instance not found or reference unset/unresolvable | - |

### `PUT /v1/app/admin/instances/{id}/feature-flags`

`PUT /v1/app/admin/instances/&#123;id&#125;/feature-flags` - update feature flags.

Gate: `sentin8:app:instances:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `feature_flags` | - | yes | The full feature-flag map (replaces the stored value). |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Feature flags updated | - |
| 403 | Missing `app:instances:admin` scope | - |
| 404 | Instance not found | - |

### `GET /v1/app/admin/instances/{id}/oauth-client`

`GET /v1/app/admin/instances/&#123;id&#125;/oauth-client` - get OAuth client (DCR summary).

Gate: `sentin8:app:instances:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OAuth client summary | - |
| 403 | Missing `app:instances:admin` scope | - |
| 404 | Instance not found | - |

### `PUT /v1/app/admin/instances/{id}/status`

`PUT /v1/app/admin/instances/&#123;id&#125;/status` - update instance status.

Gate: `sentin8:app:instances:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `status` | string | yes | New status (`active`/`maintenance`/`offline`). |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Status updated | - |
| 400 | Invalid status | - |
| 403 | Missing `app:instances:admin` scope | - |
| 404 | Instance not found | - |

### `GET /v1/app/instances/customer-mode`

`GET /v1/app/instances/customer-mode?env_id=…` - enumerate the customer-mode (`allow_signup`) instances installed in an env (auth DESIGN invariant 12: the owner-API replacement for auth's retired direct read of `sys.app_instances`).

Gate: `sentin8:app:instances:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Customer-mode instances in the env | - |
| 400 | Missing env_id | - |
| 403 | Missing `app:instances:read` scope or non-M2M token | - |

### `GET /v1/app/runtime/context`

Stories , , -34 - `GET /v1/app/runtime/context`.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Runtime context for the TLS-identified app (instance metadata, org name, merged branding) | - |
| 401 | No X-Sentin8-App-Id header / unknown instance | - |

### `POST /v1/app/setup`

`POST /v1/app/setup` - create an app instance (atomic).

Gate: `sentin8:app:instances:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `allow_signup` | boolean | no | When true, public sign-up is visible. When false, only SSO is available. Defaults to true. |
| `auth_url` | string,null | no | Auth URL selected from the org's env Auth servers dropdown. Stored as `auth_domain` on the app instance (hostname only, scheme stripped). Used for OIDC sign-in. |
| `channel` | string,null | no | Release channel to install from (APP-4). Defaults to `stable`; resolves the newest published version for the listing's slug on this channel. |
| `custom_domain` | string,null | no | Custom domain to bind (verified via DNS TXT). |
| `instance_description` | string,null | no | Instance description. |
| `instance_name` | string,null | no | Instance display name. |
| `listing_id` | string | yes | The listing being installed. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Instance created (RFW redirect) | - |
| 403 | Missing `app:instances:write` scope | - |

### `GET /v1/app/setup/{id}/status`

`GET /v1/app/setup/&#123;instanceId&#125;/status` - provisioning status.

Gate: `sentin8:app:instances:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `instanceId` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Provisioning status | `SetupResponse` |
| 403 | Missing `app:instances:read` scope | - |
| 404 | Instance not found | - |

### `GET /v1/app/store/listings`

List published store listings visible to the caller (RLS-scoped). `?category=` filters to listings carrying that category (APP-3).

Gate: `sentin8:app:store:read`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of published listings | `StoreListingResponse`[] |
| 403 | Missing `app:store:read` scope | - |

### `POST /v1/app/store/listings`

`POST /v1/app/store/listings` - create a store listing.

Gate: `sentin8:app:store:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `app_name` | string | yes | App display name. |
| `app_slug` | string | yes | URL-safe app slug. |
| `backend_url` | string,null | no | Backend URL metadata from the app developer. |
| `categories` | array,null | no | Category slugs (APP-3): replaces this listing's category rows. |
| `channel` | string,null | no | Release channel (APP-4): `stable\|beta\|dev`. Optional, default `stable`. |
| `default_signup_role` | string,null | no | Role name auto-assigned to a new env-realm user at sign-up. Must match one of the names in `roles`. Optional. |
| `description` | string,null | no | Human description. |
| `media` | - | no | Media entries (APP-3): typed by-reference descriptors - `&#123;role, resolution, storage_key&#125;`; bytes live in Sentin8:Storage. |
| `oauth_defaults` | - | no | OAuth defaults advertised at install. |
| `roles` | `ListingRole`[] | no | App-declared security roles. Provisioned in `sentin8_auth_roles` on install. Optional at create-time; can be added later via update. |
| `supports_dcr` | boolean,null | no | Whether the app supports OAuth DCR. |
| `version` | string,null | no | Release version of this listing row (APP-4). Optional, default `0.0.0`. |
| `visibility` | string,null | no | Visibility: "public" (default), "env", or "usr" (Epic 15.5). |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Listing created | `StoreListingResponse` |
| 400 | Invalid visibility or roles | - |
| 403 | Missing `app:store:admin` scope | - |

### `GET /v1/app/store/listings/{id}`

`GET /v1/app/store/listings/&#123;id&#125;` - listing detail.

Gate: `sentin8:app:store:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Listing detail | `StoreListingResponse` |
| 403 | Missing `app:store:read` scope | - |
| 404 | Listing not found | - |

### `PUT /v1/app/store/listings/{id}`

`PUT /v1/app/store/listings/&#123;id&#125;` - update a listing (catalog admin).

Gate: `sentin8:app:store:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `app_name` | string,null | no | New app name, when changing it. |
| `app_slug` | string,null | no | New slug, when changing it. |
| `backend_url` | string,null | no | New backend URL, when changing it. |
| `categories` | array,null | no | Category slugs (APP-3): replaces this listing's category rows when supplied (pass `[]` to clear). |
| `default_signup_role` | string,null | no | Role name auto-assigned to a new env-realm user at sign-up. Pass `null` to clear, or omit to keep the current value. |
| `description` | string,null | no | New description, when changing it. |
| `media` | - | no | Media entries (APP-3): replaces the current media JSONB when supplied. |
| `oauth_defaults` | - | no | New OAuth defaults, when changing them. |
| `roles` | array,null | no | App-declared security roles. Replaces the current list when supplied. Provisioned in `sentin8_auth_roles` on subsequent installs. Pass `[]` to clear. |
| `status` | string,null | no | New lifecycle status, when transitioning it. |
| `supports_dcr` | boolean,null | no | New DCR support flag, when changing it. |
| `visibility` | string,null | no | Visibility: "env", "usr", or "public". If omitted, keeps current value. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Listing updated | `StoreListingResponse` |
| 400 | Invalid status, visibility, or roles | - |
| 403 | Missing `app:store:admin` scope | - |
| 404 | Listing not found | - |

### `DELETE /v1/app/store/listings/{id}`

Story - `DELETE /v1/app/store/listings/&#123;id&#125;` - archive a listing (soft delete). Sets `status = 'archived'` so the listing is hidden from the public store but retained for audit. `DELETE /v1/app/store/listings/&#123;id&#125;` - archive a listing (soft delete).

Gate: `sentin8:app:store:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Listing archived | - |
| 403 | Missing `app:store:admin` scope | - |
| 404 | Listing not found | - |

### `POST /v1/internal/steps/execute`

`POST /v1/internal/steps/execute` - App step handler called by Flow (proxy-back).

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `config` | - | no | The step configuration (free-form JSON). |
| `input` | - | no | The workflow input / step input payload. |
| `step_kind` | string | yes | The step kind (one of the `STEP_*` constants). |
| `step_name` | string | yes | The step name being executed. |
| `workflow_id` | string | yes | The workflow ID the step belongs to. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Step executed | `StepExecuteResponse` |
| 400 | Invalid step | - |


## admin-ui

### `GET /v1/admin/ui/{page}`

`GET /v1/admin/ui/&#123;page&#125;` - RFW page definition for the requested page.

Gate: `sentin8:app:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `page` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | RFW page definition (rendered by Sentin8:Dash) | - |
| 403 | Caller lacks an app read/admin scope | - |
| 404 | Unknown page | - |

### `GET /v1/admin/{resource}`

`GET /v1/admin/&#123;resource&#125;` - returns a JSON array of admin data rows.

Gate: `sentin8:app:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `resource` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The resource's rows for the RFW table | - |
| 403 | Caller lacks an app read/admin scope | - |
| 404 | Unknown resource | - |


## meta

### `GET /v1/health`

`GET /v1/health` - liveness probe.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Liveness (version, build, active connections) | - |

