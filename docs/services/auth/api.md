---
title: "Sentin8:Auth - API (OpenAPI)"
sidebar_label: "API (OpenAPI)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-auth/edit/main/docs/openapi.json
---
Sentin8 Sentin8:Auth - identity, OAuth/OIDC/FAPI, sessions, JWKS authority.

> Generated from the service’s OpenAPI 3.1 spec (`docs/openapi.json`,
> served live at `GET /openapi.json`) - the source of truth is the
> service’s own `#[utoipa::path]` annotations.

**62 endpoints**.

## auth

### `POST /v1/actor-tokens/revoke`

`POST /v1/actor-tokens/revoke` - revoke an actor token by token_id (jti).
`POST /v1/actor-tokens/revoke` - revoke an actor token by token_id.
Revoke actor token.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `token_id` | string | yes | token identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Actor token revoked | - |
| 404 | actor token not found | - |

### `GET /v1/admin/actor-events`

`GET /v1/admin/actor-events` - query the actor event audit log.
`GET /v1/admin/actor-events` - query the actor event audit log.
List actor events.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_user_id` | query | no | string |
| `actor_user_id` | query | no | string |
| `page` | query | no | integer |
| `page_size` | query | no | integer |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Actor events | `ActorEventResponse`[] |

### `GET /v1/admin/actor-tokens`

`GET /v1/admin/actor-tokens` - list recent actor token issuances (audit).
`GET /v1/admin/actor-tokens` - list recent actor token issuances.
List actor tokens.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_user_id` | query | no | string |
| `actor_user_id` | query | no | string |
| `page` | query | no | integer |
| `page_size` | query | no | integer |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Actor token events | `ActorEventResponse`[] |

### `POST /v1/admin/actor-tokens`

`POST /v1/admin/actor-tokens` - issue an actor token.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `reason` | string | yes | Free-text reason for the impersonation (required, audited). The reason. |
| `scope` | string,null | no | Requested scope (must be a subset of the impersonated user's scopes). The scope. |
| `target_user_id` | string | yes | The user to impersonate. target user identifier. |
| `ttl_secs` | integer,null | no | Token lifetime in seconds (bounded to MAX_ACTOR_TOKEN_TTL_SECS). The ttl secs. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Actor token issued | `ActorTokenResponse` |
| 400 | reason is required | - |
| 401 | actor must be authenticated | - |
| 403 | actor lacks auth:actor:issue scope | - |
| 404 | target user not found | - |

### `GET /v1/admin/api-keys`

`GET /v1/admin/api-keys` - list API keys (paginated).
List API keys.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |
| `page` | query | no | integer |
| `page_size` | query | no | integer |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Paginated API key list | `ApiKeyListResponse` |
| 403 | Missing auth:admin scope | - |

### `POST /v1/admin/api-keys`

`POST /v1/admin/api-keys` - create an API key.
Create API key.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `env_id` | string,null | no | Optional - the RFW form does not send it (env is resolved from the token's tenant context); the auth-context env is used when absent. env identifier. |
| `expires_at` | string,null | no | expires time. |
| `name` | string | yes | The name. |
| `scopes` | string[] | no | Accepts either a JSON array or a single comma-separated string - the RFW form sends text fields as strings (the field label is "Scopes (comma-separated)"). Same contract as role permissions. The scopes. |
| `user_id` | string,null | no | user identifier. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | API key created (includes plaintext key) | - |
| 400 | name is required | - |
| 403 | Missing auth:admin scope | - |

### `POST /v1/admin/api-keys/{id}/revoke`

`POST /v1/admin/api-keys/{id}/revoke` - revoke an API key.
Revoke API key.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | API key revoked | - |
| 403 | Missing auth:admin scope | - |
| 404 | API key not found | - |

### `GET /v1/admin/audit`

`GET /v1/admin/audit` - list audit events (paginated).
List audit events.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |
| `action` | query | no | string |
| `page` | query | no | integer |
| `page_size` | query | no | integer |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Paginated audit events | `AuditListResponse` |
| 403 | Missing auth:admin scope | - |

### `GET /v1/admin/enterprise-connections`

`GET /v1/admin/enterprise-connections` - list enterprise connections.
List connections.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Enterprise connections | `ConnectionResponse`[] |

### `POST /v1/admin/enterprise-connections`

`POST /v1/admin/enterprise-connections` - create an enterprise connection.
Create connection.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `acs_url` | string,null | no | The acs URL. |
| `client_id` | string,null | no | client identifier. |
| `client_secret` | string,null | no | The client secret. |
| `discovery_url` | string,null | no | The discovery URL. |
| `domain_hint` | string,null | no | The domain hint. |
| `email_attribute` | string,null | no | The email attribute. |
| `entity_id` | string,null | no | entity identifier. |
| `env_id` | string,null | no | env identifier. |
| `issuer_url` | string,null | no | The issuer URL. |
| `metadata_url` | string,null | no | The metadata URL. |
| `metadata_xml` | string,null | no | The metadata xml. |
| `name` | string | yes | The name. |
| `name_attribute` | string,null | no | The name attribute. |
| `scopes` | array,null | no | The scopes. |
| `strategy` | string | yes | Federation protocol: `oidc` or `saml`. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Connection created | `ConnectionResponse` |
| 400 | strategy must be 'oidc' or 'saml' | - |
| 409 | connection name already exists | - |

### `GET /v1/admin/enterprise-connections/{id}`

`GET /v1/admin/enterprise-connections/{id}` - get an enterprise connection.
Fetch connection.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Connection | `ConnectionResponse` |
| 404 | connection not found | - |

### `PUT /v1/admin/enterprise-connections/{id}`

`PUT /v1/admin/enterprise-connections/{id}` - update an enterprise connection.
Update connection.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `acs_url` | string,null | no | The acs URL. |
| `client_id` | string,null | no | client identifier. |
| `client_secret` | string,null | no | The client secret. |
| `discovery_url` | string,null | no | The discovery URL. |
| `domain_hint` | string,null | no | The domain hint. |
| `email_attribute` | string,null | no | The email attribute. |
| `entity_id` | string,null | no | entity identifier. |
| `env_id` | string,null | no | env identifier. |
| `issuer_url` | string,null | no | The issuer URL. |
| `metadata_url` | string,null | no | The metadata URL. |
| `metadata_xml` | string,null | no | The metadata xml. |
| `name` | string | yes | The name. |
| `name_attribute` | string,null | no | The name attribute. |
| `scopes` | array,null | no | The scopes. |
| `strategy` | string | yes | Federation protocol: `oidc` or `saml`. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Connection updated | - |
| 404 | connection not found | - |

### `DELETE /v1/admin/enterprise-connections/{id}`

`DELETE /v1/admin/enterprise-connections/{id}` - delete an enterprise connection.
Delete connection.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Connection deleted | - |
| 404 | connection not found | - |

### `GET /v1/admin/groups`

`GET /v1/admin/groups` - list groups (paginated).
List groups.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |
| `page` | query | no | integer |
| `page_size` | query | no | integer |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Paginated group list | `GroupListResponse` |
| 403 | Missing auth:admin scope | - |

### `POST /v1/admin/groups`

`POST /v1/admin/groups` - create a new group.
Create group.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | yes | The name. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | Group created | `GroupResponse` |
| 400 | Invalid group name | - |
| 403 | Missing auth:admin scope | - |
| 409 | group name already exists | - |

### `GET /v1/admin/groups/{group_id}/members`

`GET /v1/admin/groups/{group_id}/members` - list group members.
List group members.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `group_id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Group members | - |
| 403 | Missing auth:admin scope | - |

### `POST /v1/admin/groups/{group_id}/members`

`POST /v1/admin/groups/{group_id}/members` - add a member to a group.
Handle add group member.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | string | yes | user identifier. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `group_id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | Member added | - |
| 403 | Missing auth:admin scope | - |

### `DELETE /v1/admin/groups/{group_id}/members/{user_id}`

`DELETE /v1/admin/groups/{group_id}/members/{user_id}` - remove a member from
a group.
Remove group member.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `group_id` | path | yes | string |
| `user_id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Member removed | - |
| 403 | Missing auth:admin scope | - |

### `GET /v1/admin/groups/{group_id}/roles`

`GET /v1/admin/groups/{group_id}/roles` - list roles assigned to a group.
List group roles.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `group_id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Group roles | - |
| 403 | Missing auth:admin scope | - |

### `POST /v1/admin/groups/{group_id}/roles`

`POST /v1/admin/groups/{group_id}/roles` - assign a role to a group.
Handle add group role.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `role_id` | string | yes | role identifier. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `group_id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | Role assigned | - |
| 403 | Missing auth:admin scope | - |

### `DELETE /v1/admin/groups/{group_id}/roles/{role_id}`

`DELETE /v1/admin/groups/{group_id}/roles/{role_id}` - remove a role from a group.
Remove group role.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `group_id` | path | yes | string |
| `role_id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Role removed | - |
| 403 | Missing auth:admin scope | - |

### `PUT /v1/admin/groups/{id}`

`PUT /v1/admin/groups/{id}` - update a group.
Update group.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string,null | no | The name. |
| `role_ids` | array,null | no | Optional list of role IDs - replaces the full set of roles. The role ids. |
| `user_ids` | array,null | no | Optional list of user IDs - replaces the full set of members. The user ids. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Group updated | `GroupResponse` |
| 403 | Missing auth:admin scope | - |
| 404 | group not found | - |

### `DELETE /v1/admin/groups/{id}`

`DELETE /v1/admin/groups/{id}` - delete a group.
Delete group.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Group deleted | - |
| 403 | Missing auth:admin scope | - |
| 404 | group not found | - |

### `GET /v1/admin/invitations`

`GET /v1/admin/invitations` - list invitations (proxy → sys).
List invitations.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |
| `page` | query | no | integer |
| `page_size` | query | no | integer |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Invitations | `InvitationResponse`[] |
| 403 | Missing auth:admin scope | - |

### `POST /v1/admin/invitations`

`POST /v1/admin/invitations` - create an invitation (proxy → sys).
Create invitation.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | yes | The email. |
| `org_id` | string,null | no | org identifier. |
| `role` | string | no | The role. |
| `ttl_days` | integer | no | TTL in days. RFW forms submit number fields as strings ("7") - accept both JSON numbers and numeric strings. The ttl days. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | Invitation created | `InvitationResponse` |
| 403 | Missing auth:admin scope | - |

### `POST /v1/admin/invitations/{id}/revoke`

`POST /v1/admin/invitations/{id}/revoke` - revoke an invitation
(proxy → sys).
Revoke invitation.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Invitation revoked | - |
| 403 | Missing auth:admin scope | - |

### `GET /v1/admin/memberships`

`GET /v1/admin/memberships` - list memberships.
List memberships.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |
| `page` | query | no | integer |
| `page_size` | query | no | integer |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Memberships | `MembershipResponse`[] |
| 403 | Missing auth:admin scope | - |

### `POST /v1/admin/memberships`

`POST /v1/admin/memberships` - create a membership.
Create membership.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `org_id` | string | yes | org identifier. |
| `role` | string | no | The role. |
| `user_id` | string | yes | user identifier. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | Membership created | `MembershipResponse` |
| 403 | Missing auth:admin scope | - |

### `DELETE /v1/admin/memberships/{id}`

`DELETE /v1/admin/memberships/{id}` - delete a membership.
Delete membership.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Membership deleted | - |
| 403 | Missing auth:admin scope | - |

### `GET /v1/admin/oauth-clients`

`GET /v1/admin/oauth-clients` - list OAuth clients (paginated).
List OAuth clients.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |
| `page` | query | no | integer |
| `page_size` | query | no | integer |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Paginated OAuth client list | `OAuthClientListResponse` |
| 403 | Missing auth:admin scope | - |

### `POST /v1/admin/oauth-clients`

`POST /v1/admin/oauth-clients` - create an OAuth client.
Create OAuth client.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `client_id` | string | yes | client identifier. |
| `client_name` | string | yes | The client name. |
| `client_secret` | string,null | no | The client secret. |
| `consent_required` | boolean | no | First-party consent bypass . When false, the authorize endpoint issues the code directly without consent. Default true (safe). The consent required. |
| `env_id` | string,null | no | env identifier. |
| `grant_types` | string[] | no | The grant types. |
| `redirect_uris` | string[] | no | The redirect uris. |
| `response_types` | string[] | no | The response types. |
| `scopes` | string[] | no | The scopes. |
| `token_endpoint_auth_method` | string | no | The token endpoint auth method. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | OAuth client created | `OAuthClientResponse` |
| 400 | client_id and client_name are required | - |
| 403 | Missing auth:admin scope | - |
| 409 | client_id already exists | - |

### `GET /v1/admin/oauth-clients/{id}`

`GET /v1/admin/oauth-clients/{id}` - get an OAuth client by ID.
Fetch OAuth client.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OAuth client | `OAuthClientResponse` |
| 403 | Missing auth:admin scope | - |
| 404 | OAuth client not found | - |

### `PUT /v1/admin/oauth-clients/{id}`

`PUT /v1/admin/oauth-clients/{id}` - update an OAuth client.
Update OAuth client.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `client_name` | string,null | no | The client name. |
| `consent_required` | boolean,null | no | The consent required. |
| `grant_types` | array,null | no | The grant types. |
| `redirect_uris` | array,null | no | The redirect uris. |
| `response_types` | array,null | no | The response types. |
| `scopes` | array,null | no | The scopes. |
| `status` | string,null | no | The status. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OAuth client updated | `OAuthClientResponse` |
| 403 | Missing auth:admin scope | - |
| 404 | OAuth client not found | - |

### `DELETE /v1/admin/oauth-clients/{id}`

`DELETE /v1/admin/oauth-clients/{id}` - delete an OAuth client.
Delete OAuth client.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | OAuth client deleted | - |
| 403 | Missing auth:admin scope | - |
| 404 | OAuth client not found | - |

### `GET /v1/admin/oauth-clients/{id}/federated-credentials`

`GET /v1/admin/oauth-clients/{id}/federated-credentials` - list federated credentials for an OAuth client.
List federated credentials.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Federated credentials | `FederatedCredentialResponse`[] |
| 403 | Missing auth:admin scope | - |

### `POST /v1/admin/oauth-clients/{id}/federated-credentials`

`POST /v1/admin/oauth-clients/{id}/federated-credentials` - create a federated credential.
Create federated credential.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `audience` | string | no | The audience. |
| `description` | string | no | The description. |
| `issuer` | string | yes | The issuer. |
| `subject` | string | yes | The subject. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | Federated credential created | `FederatedCredentialResponse` |
| 400 | issuer and subject are required | - |
| 403 | Missing auth:admin scope | - |
| 404 | OAuth client not found | - |
| 409 | federated credential already exists | - |

### `DELETE /v1/admin/oauth-clients/{id}/federated-credentials/{cred_id}`

`DELETE /v1/admin/oauth-clients/{id}/federated-credentials/{cred_id}` - delete a federated credential.
Delete federated credential.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `cred_id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Federated credential deleted | - |
| 403 | Missing auth:admin scope | - |
| 404 | federated credential not found | - |

### `GET /v1/admin/oauth-clients/{id}/roles`

`GET /v1/admin/oauth-clients/{id}/roles` - list roles assigned to an OAuth client.
List client roles.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Client roles | `ClientRoleResponse`[] |
| 403 | Missing auth:admin scope | - |

### `POST /v1/admin/oauth-clients/{id}/roles`

`POST /v1/admin/oauth-clients/{id}/roles` - assign a role to an OAuth client.
Handle add client role.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `role_id` | string | yes | role identifier. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | Role assigned | - |
| 403 | Missing auth:admin scope | - |
| 404 | OAuth client not found | - |

### `DELETE /v1/admin/oauth-clients/{id}/roles/{role_id}`

`DELETE /v1/admin/oauth-clients/{id}/roles/{role_id}` - remove a role from an OAuth client.
Remove client role.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `role_id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Role removed | - |
| 403 | Missing auth:admin scope | - |

### `GET /v1/admin/roles`

`GET /v1/admin/roles` - list roles (paginated).
List roles.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |
| `page` | query | no | integer |
| `page_size` | query | no | integer |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Paginated role list | `RoleListResponse` |
| 403 | Missing auth:admin scope | - |

### `POST /v1/admin/roles`

`POST /v1/admin/roles` - create a new role.
Create role.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | yes | The name. |
| `permissions` | string[] | no | The permissions. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | Role created | `RoleResponse` |
| 400 | Invalid role name | - |
| 403 | Missing auth:admin scope | - |
| 409 | role name already exists | - |

### `GET /v1/admin/roles/{id}`

`GET /v1/admin/roles/{id}` - list role members.
List role members.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Role members | `RoleMemberResponse`[] |
| 403 | Missing auth:admin scope | - |

### `PUT /v1/admin/roles/{id}`

`PUT /v1/admin/roles/{id}` - update a role.
Update role.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string,null | no | The name. |
| `permissions` | array,null | no | The permissions. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Role updated | `RoleResponse` |
| 403 | Missing auth:admin scope | - |
| 404 | role not found | - |

### `DELETE /v1/admin/roles/{id}`

`DELETE /v1/admin/roles/{id}` - delete a role.
Delete role.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Role deleted | - |
| 403 | Missing auth:admin scope | - |
| 404 | role not found | - |

### `POST /v1/admin/roles/{role_id}/members`

`POST /v1/admin/roles/{role_id}/members` - add a member to a role.
Handle add role member.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `user_id` | string | yes | user identifier. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `role_id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | Member added | - |
| 403 | Missing auth:admin scope | - |

### `DELETE /v1/admin/roles/{role_id}/members/{user_id}`

`DELETE /v1/admin/roles/{role_id}/members/{user_id}` - remove a member from a role.
Remove role member.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `role_id` | path | yes | string |
| `user_id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Member removed | - |
| 403 | Missing auth:admin scope | - |

### `GET /v1/admin/sessions`

`GET /v1/admin/sessions` - list sessions (paginated).
List sessions.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |
| `user_id` | query | no | string |
| `page` | query | no | integer |
| `page_size` | query | no | integer |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Paginated session list | `SessionListResponse` |
| 403 | Missing auth:admin scope | - |

### `DELETE /v1/admin/sessions/{id}`

`DELETE /v1/admin/sessions/{id}` - terminate a session.
Terminate session.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Session terminated | - |
| 403 | Missing auth:admin scope | - |
| 404 | session not found | - |

### `GET /v1/admin/users`

`GET /v1/admin/users` - list users (paginated).
List users.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |
| `page` | query | no | integer |
| `page_size` | query | no | integer |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Paginated user list | `UserListResponse` |
| 403 | Missing auth:admin scope | - |

### `POST /v1/admin/users`

`POST /v1/admin/users` - create a new user.
Create user.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | yes | The email. |
| `env_id` | string,null | no | env identifier. |
| `first_name` | string,null | no | The first name. |
| `group_ids` | string[] | no | The group ids. |
| `last_name` | string,null | no | The last name. |
| `password` | string,null | no | The password. |
| `status` | string,null | no | The status. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | User created | `UserResponse` |
| 400 | email is required | - |
| 403 | Missing auth:admin scope | - |
| 409 | email already exists | - |

### `GET /v1/admin/users/{id}`

`GET /v1/admin/users/{id}` - get a user by ID.
Fetch user.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | User | `UserResponse` |
| 403 | Missing auth:admin scope | - |
| 404 | user not found | - |

### `PUT /v1/admin/users/{id}`

`PUT /v1/admin/users/{id}` - update a user.
Update user.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email_verified` | boolean,null | no | The email verified. |
| `first_name` | string,null | no | The first name. |
| `last_name` | string,null | no | The last name. |
| `mfa_enabled` | boolean,null | no | The MFA enabled. |
| `status` | string,null | no | The status. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | User updated | `UserResponse` |
| 403 | Missing auth:admin scope | - |
| 404 | user not found | - |

### `DELETE /v1/admin/users/{id}`

`DELETE /v1/admin/users/{id}` - delete a user.
Delete user.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | User deleted | - |
| 403 | Missing auth:admin scope | - |
| 404 | user not found | - |

### `GET /v1/admin/users/{id}/groups`

`GET /v1/admin/users/{id}/groups` - list group names for a user.
List user groups.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Group names | string[] |
| 403 | Missing auth:admin scope | - |

### `GET /v1/admin/users/{id}/roles`

`GET /v1/admin/users/{id}/roles` - list resolved role names for a user.
List user roles.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Resolved role names | string[] |
| 403 | Missing auth:admin scope | - |

### `GET /v1/admin/webhooks/attempts/{outbox_id}`

`GET /v1/admin/webhooks/attempts/{outbox_id}` - list delivery attempts for an outbox entry.
List attempts.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `outbox_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Delivery attempts | `AttemptResponse`[] |

### `GET /v1/admin/webhooks/endpoints`

`GET /v1/admin/webhooks/endpoints` - list webhook endpoints.
List endpoints.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Webhook endpoints | `EndpointResponse`[] |

### `POST /v1/admin/webhooks/endpoints`

`POST /v1/admin/webhooks/endpoints` - create a webhook endpoint.
Create endpoint.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `env_id` | string,null | no | env identifier. |
| `event_types` | array,null | no | Event types to subscribe to ('*' = all). The event types. |
| `name` | string,null | no | The name. |
| `url` | string | yes | The URL. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Webhook endpoint created (includes signing secret) | - |
| 400 | url must be an http(s) URL | - |

### `GET /v1/admin/webhooks/endpoints/{id}`

`GET /v1/admin/webhooks/endpoints/{id}` - get a webhook endpoint.
Fetch endpoint.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Webhook endpoint | `EndpointResponse` |
| 404 | endpoint not found | - |

### `DELETE /v1/admin/webhooks/endpoints/{id}`

`DELETE /v1/admin/webhooks/endpoints/{id}` - delete a webhook endpoint.
Delete endpoint.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Endpoint deleted | - |
| 404 | endpoint not found | - |

### `GET /v1/admin/webhooks/outbox`

`GET /v1/admin/webhooks/outbox` - list recent outbox entries.
List outbox.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Outbox entries | `OutboxEntryResponse`[] |

