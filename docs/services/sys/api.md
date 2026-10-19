---
title: "Sentin8:Sys - API (OpenAPI)"
sidebar_label: "API (OpenAPI)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-sys/edit/main/docs/openapi.json
---
Sentin8 Sentin8:Sys - control plane, org/env lifecycle, saga orchestration.

> Generated from the service’s OpenAPI 3.1 spec (`docs/openapi.json`,
> served live at `GET /openapi.json`) - the source of truth is the
> service’s own `#[utoipa::path]` annotations.

**61 endpoints** across 2 groups.

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


## sys

### `GET /v1/app-instance/auth-mode`

`GET /v1/app-instance/auth-mode` - returns the app instance's auth_domain and allow_signup. Fetch instance auth mode.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `hostname` | query | no | string |
| `app_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Auth mode | - |
| 400 | hostname or app_id query param is required | - |

### `GET /v1/app-instance/scopes`

`GET /v1/app-instance/scopes` - resolve an app instance's OAuth scopes. Fetch instance scopes.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `hostname` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Instance scopes | - |
| 400 | hostname query param is required | - |

### `GET /v1/audit`

`GET /v1/audit` - query orchestration audit events. List audit.

Gate: `sentin8:sys:audit:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `limit` | query | no | integer |
| `offset` | query | no | integer |
| `action` | query | no | string |
| `service` | query | no | string |
| `org_id` | query | no | string |
| `env_id` | query | no | string |
| `after_ts` | query | no | string |
| `after_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Audit events | `AuditEventResponse`[] |
| 403 | Missing `sys:audit:read` scope | - |

### `POST /v1/audit`

`POST /v1/audit` - canonical audit ingest (M2M, ``sentin8:sys:audit:write``).

Gate: `sentin8:sys:audit:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `events` | `AuditIngestItem`[] | yes | The events. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Batch accepted | `AuditIngestResponse` |
| 401 | Missing/invalid token | - |
| 403 | Missing `sys:audit:write` scope | - |

### `GET /v1/bootstrap`

`GET /v1/bootstrap` - user orgs and default org. Handle bootstrap.

Gate: `sentin8:sys:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Bootstrap data | `BootstrapResponse` |
| 403 | Forbidden | - |

### `GET /v1/e`

`GET /v1/e` - list environments. List envs.

Gate: `sentin8:sys:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `org_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of environments | `EnvResponse`[] |

### `POST /v1/e`

`POST /v1/e` - create environment. Create env.

Gate: `sentin8:sys:env:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `display_name` | string | yes | The display name. |
| `org_id` | string | yes | org identifier. |
| `slug` | string | yes | The slug. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Environment created | `EnvResponse` |
| 403 | Missing `sys:env:admin` scope | - |
| 409 | Env slug already exists | - |

### `GET /v1/env/{env_id}`

`GET /v1/env/&#123;env_id&#125;` - environment detail. Fetch env.

Gate: `sentin8:sys:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Environment | `EnvResponse` |
| 403 | Forbidden | - |
| 404 | Not found | - |

### `PUT /v1/env/{env_id}`

`PUT /v1/env/&#123;env_id&#125;` - update environment. Update env.

Gate: `sentin8:sys:env:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `auth_domain` | string,null | no | The auth domain. |
| `display_name` | string,null | no | The display name. |
| `status` | string,null | no | The status. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Environment updated | `EnvResponse` |
| 403 | Missing `sys:env:admin` scope | - |
| 404 | Not found | - |

### `DELETE /v1/env/{env_id}`

`DELETE /v1/env/&#123;env_id&#125;` - cascade-delete environment. Delete env.

Gate: `sentin8:sys:env:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Environment deleted | - |
| 403 | Missing `sys:env:admin` scope | - |
| 404 | Not found | - |

### `GET /v1/env/{env_id}/app-custom-domain`

`GET /v1/env/&#123;env_id&#125;/app-custom-domain` - returns the custom domain for the app instance. Fetch app custom domain.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Custom domain | - |
| 404 | Environment not found | - |

### `GET /v1/env/{env_id}/applications`

`GET /v1/env/&#123;env_id&#125;/applications` - list applications. List applications.

Gate: `sentin8:sys:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of applications | `ApplicationResponse`[] |
| 403 | Forbidden | - |

### `POST /v1/env/{env_id}/applications`

`POST /v1/env/&#123;env_id&#125;/applications` - create application. Create application.

Gate: `sentin8:sys:app:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `app_type` | string | no | The app type. |
| `name` | string | yes | The name. |
| `slug` | string | yes | The slug. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Application created | `ApplicationResponse` |
| 403 | Missing `sys:app:admin` scope | - |
| 409 | Application slug already exists | - |

### `GET /v1/env/{env_id}/applications/{app_id}`

`GET /v1/env/&#123;env_id&#125;/applications/&#123;app_id&#125;` - application detail. Fetch application.

Gate: `sentin8:sys:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |
| `app_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Application | `ApplicationResponse` |
| 403 | Forbidden | - |
| 404 | Not found | - |

### `PUT /v1/env/{env_id}/applications/{app_id}`

`PUT /v1/env/&#123;env_id&#125;/applications/&#123;app_id&#125;` - update application. Update application.

Gate: `sentin8:sys:app:admin`

**Request body** (`application/json`):


**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |
| `app_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Application updated | `ApplicationResponse` |
| 403 | Missing `sys:app:admin` scope | - |
| 404 | Not found | - |

### `POST /v1/env/{env_id}/applications/{app_id}`

`POST /v1/env/&#123;env_id&#125;/applications/&#123;app_id&#125;/archive` - archive application. Archive application.

Gate: `sentin8:sys:app:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |
| `app_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Application archived | - |
| 403 | Missing `sys:app:admin` scope | - |
| 404 | Not found | - |

### `POST /v1/env/{env_id}/archive`

`POST /v1/env/&#123;env_id&#125;/archive` - archive environment. Archive env.

Gate: `sentin8:sys:env:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Environment archived | - |
| 403 | Missing `sys:env:admin` scope | - |
| 404 | Not found | - |

### `GET /v1/env/{env_id}/auth-domain`

`GET /v1/env/&#123;env_id&#125;/auth-domain` - returns the env's full auth_domain URL. Fetch env auth domain.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Auth domain | - |
| 404 | Environment not found | - |

### `GET /v1/env/{env_id}/bindings`

`GET /v1/env/&#123;env_id&#125;/bindings` - list bindings. List bindings.

Gate: `sentin8:sys:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of bindings | `BindingResponse`[] |
| 403 | Forbidden | - |

### `POST /v1/env/{env_id}/bindings`

`POST /v1/env/&#123;env_id&#125;/bindings` - create app-environment binding. Create binding.

Gate: `sentin8:sys:app:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `app_type` | string | no | The app type. |
| `application_id` | string | yes | application identifier. |
| `name` | string | yes | The name. |
| `slug` | string | yes | The slug. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Binding created | `BindingResponse` |
| 403 | Missing `sys:app:admin` scope | - |
| 409 | Binding slug already exists | - |

### `DELETE /v1/env/{env_id}/bindings/{binding_id}`

`DELETE /v1/env/&#123;env_id&#125;/bindings/&#123;binding_id&#125;` - remove binding. Delete binding.

Gate: `sentin8:sys:app:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |
| `binding_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Binding deleted | - |
| 403 | Missing `sys:app:admin` scope | - |
| 404 | Not found | - |

### `GET /v1/env/{env_id}/branding`

`GET /v1/env/&#123;env_id&#125;/branding` - get env-level branding. Fetch env branding.

Gate: `sentin8:sys:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Env branding | `BrandingResponse` |
| 403 | Forbidden | - |

### `PUT /v1/env/{env_id}/branding`

`PUT /v1/env/&#123;env_id&#125;/branding` - set env-level branding. Handle set env branding.

Gate: `sentin8:sys:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `accent_color` | string,null | no | The accent color. |
| `custom_css` | string,null | no | The custom css. |
| `font_family` | string,null | no | The font family. |
| `logo_icon_url` | string,null | no | The logo icon URL. |
| `logo_url` | string,null | no | The logo URL. |
| `primary_color` | string,null | no | The primary color. |
| `sign_in_text` | string,null | no | The sign in text. |
| `theme_mode` | string,null | no | The theme mode. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Env branding updated | `BrandingResponse` |
| 403 | Forbidden | - |

### `GET /v1/env/{env_id}/branding/merged`

`GET /v1/env/&#123;env_id&#125;/branding/merged` - merged org+env branding. Fetch merged branding.

Gate: `sentin8:sys:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Merged branding | `BrandingResponse` |
| 403 | Forbidden | - |

### `GET /v1/env/{env_id}/services`

`GET /v1/env/&#123;env_id&#125;/services` - list service states. List services.

Gate: `sentin8:sys:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Service states | `ServiceResponse`[] |
| 403 | Forbidden | - |

### `PUT /v1/env/{env_id}/services`

`PUT /v1/env/&#123;env_id&#125;/services` - enable/disable service. Handle set service.

Gate: `sentin8:sys:services:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `config` | - | no | The config. |
| `enabled` | boolean | yes | The enabled. |
| `service` | string | yes | The service. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Service state updated | `ServiceResponse` |
| 403 | Missing `sys:services:admin` scope | - |

### `GET /v1/health`

`GET /v1/health` - liveness probe. Handle health.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Service is healthy | - |

### `POST /v1/invitations/{id}/revoke`

`POST /v1/invitations/&#123;id&#125;/revoke` - revoke an invitation (: lifecycle owner surface; auth's admin UI proxies here). Revoke invitation.

Gate: `sentin8:sys:memberships:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Invitation revoked | - |
| 403 | Missing `sys:memberships:admin` scope | - |
| 404 | Invitation not found | - |

### `GET /v1/o`

`GET /v1/o` - list organizations. List orgs.

Gate: `sentin8:sys:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `limit` | query | no | integer |
| `offset` | query | no | integer |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of organizations | `OrgResponse`[] |

### `POST /v1/o`

`POST /v1/o` - create organization. Create org.

Gate: `sentin8:sys:org:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `custom_domain` | string,null | no | Optional domain for the org (e.g. "ibank.local"). If not provided, defaults to &#123;slug&#125;.o.&#123;sentin8_domain&#125;. Serialized as `custom_domain` for API compatibility with the frontend. The domain. |
| `display_name` | string | yes | The display name. |
| `slug` | string | yes | The slug. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Organization created | `OrgResponse` |
| 403 | Missing `sys:org:admin` scope | - |
| 409 | Org slug already exists | - |

### `GET /v1/org/{id}`

`GET /v1/org/&#123;id&#125;` - organization detail. Fetch org.

Gate: `sentin8:sys:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Organization | `OrgResponse` |
| 403 | Forbidden | - |
| 404 | Not found | - |

### `PUT /v1/org/{id}`

`PUT /v1/org/&#123;id&#125;` - update organization. Update org.

Gate: `sentin8:sys:org:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `custom_domain` | string,null | no | Optional domain update - triggers domain chaining via TLS. `None` or empty = no change; `Some(val)` = update. Serialized as `custom_domain` for API compatibility with the frontend. The domain. |
| `display_name` | string,null | no | The display name. |
| `status` | string,null | no | The status. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Organization updated | `OrgResponse` |
| 403 | Missing `sys:org:admin` scope | - |
| 404 | Not found | - |

### `DELETE /v1/org/{id}`

`DELETE /v1/org/&#123;id&#125;` - cascade-delete org and all related records. Delete org.

Gate: `sentin8:sys:org:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Organization deleted | - |
| 403 | Missing `sys:org:admin` scope | - |
| 404 | Not found | - |

### `POST /v1/org/{id}/archive`

`POST /v1/org/&#123;id&#125;/archive` - archive organization. Archive org.

Gate: `sentin8:sys:org:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Organization archived | - |
| 403 | Missing `sys:org:admin` scope | - |
| 404 | Not found | - |

### `GET /v1/org/{org_id}/branding`

`GET /v1/org/&#123;org_id&#125;/branding` - get org-level branding. Fetch org branding.

Gate: `sentin8:sys:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `org_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Org branding | `BrandingResponse` |
| 403 | Forbidden | - |

### `PUT /v1/org/{org_id}/branding`

`PUT /v1/org/&#123;org_id&#125;/branding` - set org-level branding. Handle set org branding.

Gate: `sentin8:sys:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `accent_color` | string,null | no | The accent color. |
| `custom_css` | string,null | no | The custom css. |
| `font_family` | string,null | no | The font family. |
| `logo_icon_url` | string,null | no | The logo icon URL. |
| `logo_url` | string,null | no | The logo URL. |
| `primary_color` | string,null | no | The primary color. |
| `sign_in_text` | string,null | no | The sign in text. |
| `theme_mode` | string,null | no | The theme mode. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `org_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Org branding updated | `BrandingResponse` |
| 403 | Forbidden | - |

### `GET /v1/org/{org_id}/invitations`

`GET /v1/org/&#123;org_id&#125;/invitations` - list invitations (: the lifecycle owner's read surface; auth's admin UI proxies here). List invitations.

Gate: `sentin8:sys:memberships:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `org_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of invitations | `InvitationResponse`[] |
| 403 | Missing `sys:memberships:admin` scope | - |

### `POST /v1/org/{org_id}/invitations`

`POST /v1/org/&#123;org_id&#125;/invitations` - send invitation. Send invitation.

Gate: `sentin8:sys:memberships:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | yes | The email. |
| `role` | string | no | The role. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `org_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Invitation sent | `InvitationResponse` |
| 403 | Missing `sys:memberships:admin` scope | - |

### `POST /v1/org/{org_id}/invitations/{invitation_id}/accept`

`POST /v1/org/&#123;org_id&#125;/invitations/&#123;invitation_id&#125;/accept` - accept invitation. Handle accept invitation.

Gate: `sentin8:sys:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `org_id` | path | yes | string |
| `invitation_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Invitation accepted | - |
| 404 | Invitation not found | - |
| 409 | Invitation is not pending | - |
| 410 | Invitation expired | - |

### `GET /v1/org/{org_id}/memberships`

`GET /v1/org/&#123;org_id&#125;/memberships` - list members. List memberships.

Gate: `sentin8:sys:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `org_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of memberships | `MembershipResponse`[] |
| 403 | Forbidden | - |

### `DELETE /v1/org/{org_id}/memberships`

`DELETE /v1/org/&#123;org_id&#125;/memberships` - remove member. Remove membership.

Gate: `sentin8:sys:memberships:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `org_id` | path | yes | string |
| `user_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Membership removed | - |
| 400 | user_id query param required | - |
| 403 | Missing `sys:memberships:admin` scope | - |

### `GET /v1/readiness`

`GET /v1/readiness` - readiness probe. Handle readiness.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Service is ready | - |
| 503 | Database unavailable | - |

### `GET /v1/resolve/hostname`

`GET /v1/resolve/hostname` - : the single cache-miss path for every service's embedded sentin8-tls DomainResolver. Returns the hostname → (service, org_id, env_id, app_id) mapping so no service needs SELECT grants on sys's domain tables. M2M ``sentin8:sys:instances:read``, Shield-gated, audited. Resolve hostname.

Gate: `sentin8:sys:instances:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `hostname` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Hostname mapping (service, org_id, env_id, app_id) | - |
| 400 | hostname query param is required | - |
| 404 | Hostname not resolvable | - |

### `GET /v1/scopes/catalog`

`GET /v1/scopes/catalog` - returns the platform's well-known OAuth scope catalog as a flat list. Used by Dash's `ScopeSelector` widget to populate its autocomplete suggestions without duplicating the list on the client side.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Scope catalog | - |

### `GET /v1/tenants/{env_id}`

`GET /v1/tenants/&#123;env_id&#125;` - VDC-4 tenant-snapshot API (design/sentin8-vertical-data-plane-contract.md §VDC.5).

Gate: `sentin8:sys:tenants:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Tenant snapshot + the caller's own service enablement | - |
| 401 | Missing/invalid token | - |
| 403 | Missing `tenants:read` scope or non-M2M token | - |
| 404 | Env unknown or the caller's service is not enabled there (scoped discovery) | - |

### `GET /v1/verticals/services`

`GET /v1/verticals/services?orgId=&#123;uuid&#125;&envId=&#123;uuid&#125;` - discover registered vertical services and their admin_ui entries, filtered by feature enablement for the given org/env.

Gate: `sentin8:sys:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `org_id` | query | no | string |
| `env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Vertical services | `VerticalServiceResponse`[] |
| 403 | Forbidden | - |

