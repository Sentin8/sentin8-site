---
title: "Sentin8:Post - API (OpenAPI)"
sidebar_label: "API (OpenAPI)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-post/edit/main/docs/openapi.json
---
Sentin8 Sentin8:Post - multi-channel message delivery service.

> Generated from the service’s OpenAPI 3.1 spec (`docs/openapi.json`,
> served live at `GET /openapi.json`) - the source of truth is the
> service’s own `#[utoipa::path]` annotations.

**37 endpoints** across 4 groups.

## policy

### `GET /v1/admin/attributes`

List attributes.

Gate: `sentin8:post:policy:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `subject_id` | path | yes | string,null |
| `target_env_id` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OK | -[] |
| 403 | Caller lacks the policy scope | - |

### `PUT /v1/admin/attributes`

`PUT /v1/admin/attributes` - upsert one principal attribute. Values must be JSON scalars or arrays of scalars (Shield restricted expressions cannot represent nested objects - 422 otherwise). Handle PUT attribute.

Gate: `sentin8:post:policy:read`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `attr_key` | string | yes | The attr key. |
| `attr_value` | - | yes | The attr value. |
| `subject_id` | string | yes | subject identifier. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OK | - |
| 403 | Caller lacks the policy scope | - |

### `DELETE /v1/admin/attributes`

Delete attribute.

Gate: `sentin8:post:policy:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `subject_id` | path | yes | string |
| `attr_key` | path | yes | string |
| `target_env_id` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Done | - |
| 403 | Caller lacks the policy scope | - |

### `POST /v1/admin/attributes/{id}/delete`

`POST /v1/admin/attributes/&#123;id&#125;/delete` - row-action alias. `id` is ``subject_id:attr_key`` as emitted by the RFW list; splitn(2) keeps any colons inside the attribute key. Handle admin delete attribute path.

Gate: `sentin8:post:policy:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Done | - |
| 403 | Caller lacks the policy scope | - |

### `GET /v1/admin/policy-decisions`

`GET /v1/admin/policy-decisions` - deny / would-deny feed for the UI . Reads the shared audit trail rows the runtime writes (`event->>'action' IN ('policy.deny','policy.would_deny')`). List policy decisions.

Gate: `sentin8:post:policy:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Recent decision log (policy.deny / would_deny rows) | -[] |
| 403 | Caller lacks the policy scope | - |

### `GET /v1/admin/policy-sets`

`GET /v1/admin/policy-sets` - list this service's policy sets. List policy sets.

Gate: `sentin8:post:policy:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OK | -[] |
| 403 | Caller lacks the policy scope | - |

### `POST /v1/admin/policy-sets`

Create policy set.

Gate: `sentin8:post:policy:read`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `description` | string | no | The description. |
| `mode` | string,null | no | The mode. |
| `policies` | string | yes | The policies. |
| `policy_set_name` | string | yes | The policy set name. |
| `schema` | string,null | no | The schema. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OK | - |
| 403 | Caller lacks the policy scope | - |

### `POST /v1/admin/policy-sets/disable`

`POST /v1/admin/policy-sets/disable` - disable a set (no-match → deny for its actions; use `shadow` for pure observation-off). Handle admin disable policy set.

Gate: `sentin8:post:policy:read`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `enabled` | boolean,null | no | The enabled. |
| `policy_set_name` | string | yes | The policy set name. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Done | - |
| 403 | Caller lacks the policy scope | - |

### `POST /v1/admin/policy-sets/enforce`

`POST /v1/admin/policy-sets/enforce` - promote a set to enforced. Handle admin enforce policy set.

Gate: `sentin8:post:policy:read`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `enabled` | boolean,null | no | The enabled. |
| `policy_set_name` | string | yes | The policy set name. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Done | - |
| 403 | Caller lacks the policy scope | - |

### `POST /v1/admin/policy-sets/shadow`

`POST /v1/admin/policy-sets/shadow` - demote a set to shadow (rollback). Handle admin shadow policy set.

Gate: `sentin8:post:policy:read`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `enabled` | boolean,null | no | The enabled. |
| `policy_set_name` | string | yes | The policy set name. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Done | - |
| 403 | Caller lacks the policy scope | - |

### `GET /v1/admin/policy-sets/{name}`

`GET /v1/admin/policy-sets/&#123;name&#125;` - fetch one set. Fetch policy set.

Gate: `sentin8:post:policy:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OK | - |
| 403 | Caller lacks the policy scope | - |

### `PUT /v1/admin/policy-sets/{name}`

`PUT /v1/admin/policy-sets/&#123;name&#125;` - create/update with write-time validation. Platform rows are returned read-only (400); tenant rows (or new rows) are validated then stored, starting in `shadow`. Handle PUT policy set.

Gate: `sentin8:post:policy:read`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `description` | string | no | The description. |
| `enabled` | boolean,null | no | The enabled. |
| `mode` | string,null | no | The mode. |
| `policies` | string | yes | The policies. |
| `schema` | string,null | no | The schema. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OK | - |
| 403 | Caller lacks the policy scope | - |

### `DELETE /v1/admin/policy-sets/{name}`

`DELETE /v1/admin/policy-sets/&#123;name&#125;` - tenant sets only. Delete policy set.

Gate: `sentin8:post:policy:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Done | - |
| 403 | Caller lacks the policy scope | - |

### `POST /v1/admin/policy-sets/{name}/save`

`POST /v1/admin/policy-sets/&#123;name&#125;/save` - PUT alias for the RFW renderer. Handle save policy set.

Gate: `sentin8:post:policy:read`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `description` | string | no | The description. |
| `enabled` | boolean,null | no | The enabled. |
| `mode` | string,null | no | The mode. |
| `policies` | string | yes | The policies. |
| `schema` | string,null | no | The schema. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OK | - |
| 403 | Caller lacks the policy scope | - |

### `POST /v1/admin/policy-sets/{name}/test`

`POST /v1/admin/policy-sets/&#123;name&#125;/test` - dry-run candidate policy text against a sample context; returns decision + trace WITHOUT storing. Handle test policy set.

Gate: `sentin8:post:policy:read`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | string,null | no | Action to evaluate, defaults to the service's read scope. The action. |
| `policies` | string | yes | Candidate Shield policy text (not yet saved). The policies. |
| `schema` | string,null | no | The schema. |
| `scopes` | string[] | no | The scopes. |
| `subject_id` | string | yes | Sample caller context to evaluate against. subject identifier. |
| `token_tp` | string | no | The token tp. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OK | - |
| 403 | Caller lacks the policy scope | - |

### `POST /v1/admin/policy-sets/{name}/{action}`

`POST /v1/admin/policy-sets/&#123;name&#125;/&#123;action&#125;` - path-param row-action dispatcher (enforce \| shadow \| disable \| delete). One route shape serves all four actions (axum's matchit router cannot register `&#123;name&#125;/delete` next to `&#123;name&#125;/&#123;action&#125;` without a conflict). Handle admin path action policy set.

Gate: `sentin8:post:policy:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |
| `action` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OK | - |
| 403 | Caller lacks the policy scope | - |

### `GET /v1/admin/relations`

`GET /v1/admin/relations` - list this service's relation tuples. List relations.

Gate: `sentin8:post:policy:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OK | -[] |
| 403 | Caller lacks the policy scope | - |

### `PUT /v1/admin/relations`

`PUT /v1/admin/relations` - upsert one relation tuple. Tenant tuples carry `origin='tenant'`; the UNIQUE key dedupes re-writes. Handle PUT relation.

Gate: `sentin8:post:policy:read`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `object_id` | string | yes | object identifier. |
| `object_type` | string | yes | The object type. |
| `relation` | string | yes | The relation. |
| `subject_id` | string | yes | subject identifier. |
| `subject_type` | string | yes | The subject type. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OK | - |
| 403 | Caller lacks the policy scope | - |

### `DELETE /v1/admin/relations`

`DELETE /v1/admin/relations` - remove one relation tuple (tenant or platform: env admins govern their env's graph; platform tuples are re-seeded by enroll on the next `vertical init`). Delete relation.

Gate: `sentin8:post:policy:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `subject_type` | path | yes | string |
| `subject_id` | path | yes | string |
| `relation` | path | yes | string |
| `object_type` | path | yes | string |
| `object_id` | path | yes | string |
| `target_env_id` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Done | - |
| 403 | Caller lacks the policy scope | - |

### `GET /v1/admin/relations/check`

Check relation.

Gate: `sentin8:post:policy:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `subject_type` | path | yes | string |
| `subject_id` | path | yes | string |
| `relation` | path | yes | string |
| `object_type` | path | yes | string |
| `object_id` | path | yes | string |
| `target_env_id` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OK | - |
| 403 | Caller lacks the policy scope | - |

### `POST /v1/admin/relations/{id}/delete`

`POST /v1/admin/relations/&#123;id&#125;/delete` - row-action alias. `id` is the colon-joined tuple the RFW list emits (``subject_type:subject_id:relation:object_type:object_id``); parsed back-first (the last three segments are relation/object_type/object_id, the first is subject_type, the middle rest is subject_id - tolerant of colons inside subject ids). Handle admin delete relation path.

Gate: `sentin8:post:policy:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Done | - |
| 403 | Caller lacks the policy scope | - |


## admin-ui

### `GET /v1/admin/ui/{page}`

Fetch admin ui.

Gate: `sentin8:post:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `page` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | RFW page definition (rendered by Sentin8:Dash) | - |
| 403 | Caller lacks a post read/admin scope | - |
| 404 | Unknown page | - |

### `GET /v1/admin/{resource}`

`GET /v1/admin/&#123;resource&#125;` - returns a JSON array of admin data rows. Fetch admin data.

Gate: `sentin8:post:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `resource` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The resource's rows for the RFW table | - |
| 403 | Caller lacks a post read/admin scope | - |
| 404 | Unknown resource | - |


## post

### `GET /v1/dlq`

`GET /v1/dlq` - list dead-lettered deliveries. `GET /v1/dlq` - list dead-letter queue entries. List dlq.

Gate: `sentin8:post:read`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | DLQ entries | - |
| 403 | Missing `post:read` scope | - |

### `POST /v1/dlq/{id}/replay`

`POST /v1/dlq/&#123;id&#125;/replay` - replay a dead-lettered delivery. `POST /v1/dlq/&#123;id&#125;/replay` - replay a DLQ entry. Handle replay dlq.

Gate: `sentin8:post:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | DLQ entry replayed | - |
| 403 | Missing `post:write` scope | - |
| 404 | DLQ entry not found | - |

### `GET /v1/gateways`

`GET /v1/gateways` - list gateway configs. List gateways.

Gate: `sentin8:post:read`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of gateways | - |
| 403 | Missing `post:read` scope | - |

### `POST /v1/gateways`

`POST /v1/gateways` - create a gateway config. `POST /v1/gateways` - create a gateway config. Create gateway.

Gate: `sentin8:post:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `channel` | string | yes | The channel. |
| `config` | - | yes | The config. |
| `is_enabled` | boolean | yes | Whether enabled. |
| `provider` | string | yes | The provider. |
| `scope` | string | yes | The scope. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Gateway created | - |
| 403 | Missing `post:write` scope | - |

### `POST /v1/gateways/test`

`POST /v1/gateways/test` - send a test message through a gateway. `POST /v1/gateways/test` - test a gateway config. Handle test gateway.

Gate: `sentin8:post:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `channel` | string | yes | The channel. |
| `config` | - | yes | The config. |
| `is_enabled` | boolean | yes | Whether enabled. |
| `provider` | string | yes | The provider. |
| `scope` | string | yes | The scope. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Gateway test result | - |
| 403 | Missing `post:write` scope | - |

### `DELETE /v1/gateways/{id}`

`DELETE /v1/gateways/&#123;id&#125;` - delete a gateway config. `DELETE /v1/gateways/&#123;id&#125;` - delete a gateway config. Delete gateway.

Gate: `sentin8:post:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Gateway deleted | - |
| 403 | Missing `post:write` scope | - |
| 404 | Gateway not found | - |

### `POST /v1/gateways/{id}/delete`

`POST /v1/gateways/&#123;id&#125;/delete` - RFW alias of `DELETE /v1/gateways/&#123;id&#125;`.

Gate: `sentin8:post:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Gateway deleted (same contract as DELETE /v1/gateways/&#123;id&#125;) | - |
| 403 | Missing `post:write` scope (platform-tier deletes require `sys:admin`) | - |
| 404 | Unknown gateway | - |

### `GET /v1/messages`

List messages.

Gate: `sentin8:post:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `message_type` | query | no | string |
| `status` | query | no | string |
| `limit` | query | no | integer |
| `mine` | query | no | boolean |
| `unread` | query | no | boolean |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | List of messages | `MessageSummary`[] |
| 403 | Missing `post:read` scope | - |

### `GET /v1/messages/{id}`

`GET /v1/messages/&#123;id&#125;` - message detail with all delivery attempts. Fetch message.

Gate: `sentin8:post:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Message detail | - |
| 403 | Missing `post:read` scope | - |
| 404 | Message not found | - |

### `GET /v1/messages/{id}/content`

`GET /v1/messages/&#123;id&#125;/content` - message content (subject + body only). `GET /v1/messages/&#123;id&#125;/content` - raw message content. Fetch message content.

Gate: `sentin8:post:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Message content | - |
| 403 | Missing `post:read` scope | - |
| 404 | Message not found | - |

### `POST /v1/messages/{id}/read`

`POST /v1/messages/&#123;id&#125;/read` - mark a message as read.

Gate: `sentin8:post:read`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Message marked as read | - |
| 403 | Missing `post:read` scope | - |
| 404 | Message not found | - |

### `POST /v1/messages/{id}/replay`

`POST /v1/messages/&#123;id&#125;/replay` - RFW alias of `POST /v1/dlq/&#123;id&#125;/replay`.

Gate: `sentin8:post:write`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Message replayed (same contract as POST /v1/dlq/&#123;id&#125;/replay) | - |
| 403 | Missing `post:write` scope | - |
| 404 | Unknown DLQ entry | - |

### `POST /v1/send`

`GET /v1/messages` - list messages in the caller's org/env. Send message.

Gate: `sentin8:post:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `body` | string | yes | The body. |
| `body_format` | string,null | no | The body format. |
| `category` | string,null | no | The category. |
| `message_type` | string | yes | The message type. |
| `metadata` | - | no | The metadata. |
| `priority` | string,null | no | The priority. |
| `recipient_email` | string,null | no | The recipient email. |
| `recipient_user_id` | string,null | no | recipient user identifier. |
| `subject` | string | yes | The subject. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | Message queued | `SendMessageResponse` |
| 403 | Missing `post:write` scope | - |


## meta

### `GET /v1/health`

Handle health.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Liveness (version, build, active connections) | - |

