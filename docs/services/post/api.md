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

**11 endpoints**.

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

