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

**172 endpoints** across 13 groups.

## oauth

### `GET /.well-known/jwks.json`

OIDC JSON Web Key Set - the verification keys for every ID/access token this issuer mints (fetched by every service + third-party IdP).

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The active signing keys (JWK Set RFC 7517) | `JwksResponse` |

### `GET /.well-known/openid-configuration`

Handle discovery.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OIDC discovery document (issuer-resolved) | `DiscoveryDocument` |

### `POST /device/verify`

`POST /device/verify` - the signed-in user submits the user_code to approve a device sign-in (RFC 8628 ).

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `user_code` | string | yes | The device user_code being approved. The approving user identity comes from the session (SEC-) - never the body. The user code. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Device sign-in approved (polling grant armed for this user) | - |
| 400 | Unknown user_code | - |
| 401 | No session - approval requires an authenticated user | - |
| 410 | user_code expired | - |

### `POST /mtls/oauth/revoke`

`POST /mtls/oauth/revoke` - the standard revocation handler behind a client-certificate-presence guard.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `token` | query | yes | string |
| `client_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Revoked (RFC 7009) | - |
| 401 | invalid_client - no verified client certificate | - |

### `POST /mtls/oauth/token`

`POST /mtls/oauth/token` - the standard token handler behind a client-certificate-presence guard. Delegates to `oauth::token` so behavior is identical to `POST /oauth/token` apart from the guard.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `grant_type` | query | yes | string |
| `scope` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Token issued (identical contract to /oauth/token) | `TokenResponse` |
| 401 | invalid_client - no client certificate presented / thumbprint not registered | - |

### `GET /oauth/authorize`

The authorize endpoint validates the request and redirects to the Auth hosted UI (`/sign-in`) with the OAuth params preserved. After the user authenticates, the UI calls back to issue an auth code. For non-interactive flows (already has a session), it issues the code directly. Authorize it.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `response_type` | path | yes | string,null |
| `client_id` | path | yes | string |
| `redirect_uri` | path | yes | string,null |
| `scope` | path | yes | string |
| `state` | path | yes | string |
| `code_challenge` | path | yes | string,null |
| `code_challenge_method` | path | yes | string,null |
| `request_uri` | path | yes | string,null |
| `screen_hint` | path | yes | string,null |
| `nonce` | path | yes | string,null |
| `response_mode` | path | yes | string,null |
| `request` | path | yes | string,null |
| `resource` | path | yes | string,null |
| `authorization_details` | path | yes | - |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 302 | Redirect to the hosted sign-in UI (params preserved) or straight back to the client with the code when a session exists | - |
| 400 | Invalid authorization request (unknown client, bad redirect_uri/response_type) | - |

### `POST /oauth/authorize/continue`

Authorize continue.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `authorization_details` | - | no | RFC 9396 authorization_details - validated against the client's registered types; stored in the code record and echoed into the ID token. The authorization details. |
| `client_id` | string | yes | client identifier. |
| `code_challenge` | string,null | no | The code challenge. |
| `nonce` | string,null | no | OIDC nonce - bound into the ID token (SEC-). The nonce. |
| `redirect_uri` | string | yes | The redirect URI. |
| `resource` | string,null | no | RFC 8707 resource indicator (SEC-). The resource. |
| `response_mode` | string,null | no | OAuth response mode - `jwt` triggers a JARM response (SEC-). The response mode. |
| `scope` | string | yes | The scope. |
| `selected_account_ids` | string[] | no | Account IDs the customer selected to share during the FDX consent screen (FDX UX Guidelines "Select Accounts"). Forwarded as a comma-separated query param on the redirect_uri so the FDX callback can persist them as consent resources. The selected account ids. |
| `session_token` | string | yes | The session token. |
| `state` | string | yes | The state. |
| `user_id` | string | yes | user identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 302 | Redirect to the client's redirect_uri with the issued code (or an error response per response_mode) | - |
| 400 | Invalid request (unknown client/session, bad redirect_uri or scope) | - |
| 401 | Session invalid or expired | - |

### `POST /oauth/backchannel-logout`

Handler - `POST /oauth/backchannel-logout` / `POST /v1/backchannel-logout/trigger`. Handle trigger backchannel logout.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `client_id` | string,null | no | Optional - restrict to a single client_id (e.g. for RP-initiated logout). client identifier. |
| `session_id` | string | yes | session identifier. |
| `user_id` | string | yes | user identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OIDC Back-Channel Logout token minted and delivered | `BackchannelLogoutResponse` |
| 403 | Admin guard - internal trigger | - |

### `POST /oauth/device`

`POST /oauth/device` - request a device code.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `client_id` | query | yes | string |
| `scope` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Device code + user_code + verification_uri (RFC 8628 §3.2) | `DeviceAuthResponse` |
| 400 | Unknown client | - |
| 401 | Client authentication failed | - |

### `POST /oauth/grants`

`POST /oauth/grants` - create/record a grant (admin/client API).

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `authorization_details` | - | no | The authorization details. |
| `client_id` | string | yes | client identifier. |
| `env_id` | string | yes | The tenant the grant lives in - REQUIRED (SEC-: no silent fallback to the caller's env). env identifier. |
| `scope` | string | yes | The scope. |
| `user_id` | string | yes | user identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Grant recorded | `GrantResponse` |
| 403 | Caller lacks the required admin/client scope | - |

### `GET /oauth/grants/{id}`

`GET /oauth/grants/&#123;id&#125;` - query a grant's status/actions.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The grant | `GrantResponse` |
| 401 | Unauthenticated | - |
| 404 | Unknown grant | - |

### `DELETE /oauth/grants/{id}`

`DELETE /oauth/grants/&#123;id&#125;` - revoke the grant and cascade-revoke the dependent tokens. Tokens carry `grant_id`; the token-endpoint verify path treats a revoked grant as a hard 401 (checked via the Valkey ``auth:grant:revoked`:&#123;grant_id&#125;` key - same read path as the jti denylist, so no DB hit on the hot path).

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Grant revoked (dependent tokens cascade-revoked) | - |
| 403 | Caller is not the grant's user or an env admin | - |
| 404 | Unknown grant | - |

### `PATCH /oauth/grants/{id}`

`PATCH /oauth/grants/&#123;id&#125;` - upgrade/downgrade the granted scope. The new scope must be a subset-or-superset of the current one; the caller must be the grant's user or an env admin. Handle patch grant.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `authorization_details` | - | no | The authorization details. |
| `scope` | string | yes | The scope. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Scope updated | `GrantResponse` |
| 400 | Invalid scope transition | - |
| 403 | Caller is not the grant's user or an env admin | - |
| 404 | Unknown grant | - |

### `POST /oauth/introspect`

Introspect it.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `token` | query | yes | string |
| `client_id` | query | yes | string |
| `client_secret` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | RFC 7662 introspection response (active + claims when active) | `IntrospectionResponse` |
| 401 | Caller authentication failed (RFC 7662 requires client auth) | - |

### `GET /oauth/logout`

Handle logout.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `post_logout_redirect_uri` | path | yes | string,null |
| `id_token_hint` | path | yes | string,null |
| `client_id` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 302 | Redirect to the registered post_logout_redirect_uri (or the local sign-in page when unregistered) | - |

### `POST /oauth/par`

Handle pushed authorization request.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `response_type` | query | yes | string |
| `client_id` | query | yes | string |
| `redirect_uri` | query | yes | string |
| `scope` | query | yes | string |
| `state` | query | yes | string |
| `code_challenge` | query | yes | string |
| `code_challenge_method` | query | yes | string |
| `nonce` | query | yes | string |
| `resource` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Request URI issued (RFC 9126) | `ParResponse` |
| 400 | Unsupported response_type or invalid client | - |
| 401 | Client authentication failed | - |

### `POST /oauth/register`

Register it.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `application_type` | string,null | no | The application type. |
| `client_name` | string,null | no | The client name. |
| `client_uri` | string,null | no | The client URI. |
| `consent_required` | boolean | no | When false, this first-party client skips the consent screen. The consent required. |
| `contacts` | string[] | no | The contacts. |
| `grant_types` | string[] | no | The grant types. |
| `jwks` | - | no | The JWKS. |
| `jwks_uri` | string,null | no | The JWKS URI. |
| `logo_uri` | string,null | no | The logo URI. |
| `policy_uri` | string,null | no | The policy URI. |
| `redirect_uris` | string[] | no | The redirect uris. |
| `response_types` | string[] | no | The response types. |
| `scope` | string,null | no | The scope. |
| `sector_identifier_uri` | string,null | no | The sector identifier URI. |
| `self_signed_tls_client_auth_thumbprint` | string,null | no | SHA-256 thumbprint for `self_signed_tls_client_auth` method. The self signed tls client auth thumbprint. |
| `software_id` | string,null | no | software identifier. |
| `software_statement` | string,null | no | The software statement. |
| `subject_type` | string,null | no | The subject type. |
| `tls_client_auth_subject_dn` | string,null | no | Subject DN for `tls_client_auth` method (RFC 8705 ). The tls client auth subject DN. |
| `token_endpoint_auth_method` | string,null | no | The token endpoint auth method. |
| `tos_uri` | string,null | no | The tos URI. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | Client registered (registration_access_token returned) | `RegisterResponse` |
| 400 | invalid_client_metadata / invalid_redirect_uri (RFC 7591 §3.3) | - |

### `GET /oauth/register/{client_id}`

Fetch client.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `client_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Client configuration (RFC 7592 §2.2) | `RegisterResponse` |
| 401 | Missing/invalid registration access token | - |
| 404 | Unknown client | - |

### `PUT /oauth/register/{client_id}`

Update client.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `client_name` | string,null | no | The client name. |
| `client_uri` | string,null | no | The client URI. |
| `consent_required` | boolean,null | no | The consent required. |
| `contacts` | array,null | no | The contacts. |
| `grant_types` | array,null | no | The grant types. |
| `jwks` | - | no | The JWKS. |
| `jwks_uri` | string,null | no | The JWKS URI. |
| `logo_uri` | string,null | no | The logo URI. |
| `policy_uri` | string,null | no | The policy URI. |
| `redirect_uris` | array,null | no | The redirect uris. |
| `response_types` | array,null | no | The response types. |
| `scope` | string,null | no | The scope. |
| `sector_identifier_uri` | string,null | no | The sector identifier URI. |
| `software_id` | string,null | no | software identifier. |
| `software_statement` | string,null | no | The software statement. |
| `token_endpoint_auth_method` | string,null | no | The token endpoint auth method. |
| `tos_uri` | string,null | no | The tos URI. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `client_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Client configuration updated | `RegisterResponse` |
| 401 | Missing/invalid registration access token | - |
| 404 | Unknown client | - |

### `DELETE /oauth/register/{client_id}`

Delete client.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `client_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Client deleted | - |
| 401 | Missing/invalid registration access token | - |
| 404 | Unknown client | - |

### `POST /oauth/revoke`

`POST /oauth/revoke` - RFC 7009 token revocation.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `token` | query | yes | string |
| `client_id` | query | yes | string |
| `client_secret` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Revoked (RFC 7009: 200 even for unknown tokens) | - |
| 401 | Client authentication failed | - |

### `POST /oauth/token`

Handle token.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `grant_type` | query | yes | string |
| `code` | query | yes | string |
| `redirect_uri` | query | yes | string |
| `client_id` | query | yes | string |
| `client_secret` | query | yes | string |
| `code_verifier` | query | yes | string |
| `refresh_token` | query | yes | string |
| `scope` | query | yes | string |
| `auth_req_id` | query | yes | string |
| `device_code` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Token response (access_token, token_type, expires_in, refresh_token?, id_token?) | `TokenResponse` |
| 400 | invalid_request / invalid_grant / unsupported_grant_type (RFC 6749 §5.2 error JSON) | - |
| 401 | invalid_client (Basic auth rejected) | - |

### `GET /oauth/userinfo`

Handle userinfo.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | OIDC Standard Claims for the bearer subject | - |
| 401 | Missing/invalid/expired bearer token | - |

### `GET /v1/security-profile`

`GET /v1/security-profile` - return the effective security profile for the resolved tenant (platform/org/env).

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `scope` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The effective security profile | `SecurityProfileResponse` |

### `PUT /v1/security-profile`

`PUT /v1/security-profile` - update (or insert) the security profile for the given scope + tenant.

Gate: `sentin8:sys:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `env_id` | string,null | no | env identifier. |
| `max_token_lifetime` | integer,null | no | Maximum token lifetime. |
| `org_id` | string,null | no | org identifier. |
| `profile` | string,null | no | The profile. |
| `refresh_rotation` | boolean,null | no | The refresh rotation. |
| `require_dpop` | boolean,null | no | The require DPoP. |
| `require_http_signatures` | boolean,null | no | RFC 9421 HTTP request signatures (FAPI 2.0 MS). The require http signatures. |
| `require_iss` | boolean,null | no | The require iss. |
| `require_jarm` | boolean,null | no | The require JARM. |
| `require_jwt_introspection` | boolean,null | no | RFC 9701 signed introspection responses. The require JWT introspection. |
| `require_mtls` | boolean,null | no | The require mtls. |
| `require_par` | boolean,null | no | The require par. |
| `scope` | string | yes | The scope. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Profile stored (admin-guarded; platform operators manage any scope row, org/env rows are RBAC-checked) | `SecurityProfileResponse` |
| 400 | Unknown profile name | - |
| 403 | Caller lacks the write-mode admin scope | - |


## delegation

### `POST /delegate/access-token`

`POST /delegate/access-token` - issue a cert-bound delegated token.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `act_email` | string,null | no | The staff user's email (for the `act` claim). The act email. |
| `act_sub` | string | yes | The staff user's Auth user ID (the `act.sub`). The act sub. |
| `audience` | string | yes | Target audience (RFC 8707 resource indicator, e.g. `https://ledger.sentin8.local`). The audience. |
| `env_id` | string,null | no | Target env_id for the delegated token. env identifier. |
| `scope` | string | yes | Requested scopes (space-separated, will be downscoped). The scope. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Delegated token issued (act claim carried, downscoped) | `DelegateAccessTokenResponse` |
| 400 | Malformed request | - |
| 401 | Caller not authorized to delegate (BFF cert + scope, or M2M bearer with `sentin8:delegate:read`) | - |


## ciba

### `POST /oauth/bc-authorize`

`POST /oauth/bc-authorize` - issue a CIBA auth_req_id.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `act_email` | string,null | no | - staff member's email (for audit alongside `act_sub`). The act email. |
| `act_sub` | string,null | no | (Option A): the initiating staff member's Auth user ID. Sent by the platform BFF (Delegation Gateway) from its authenticated staff session - NOT by the staff app's request body. Embedded in the CIBA token's `act` claim (RFC 8693 ) so every customer-data access is attributable to a human. The act sub. |
| `binding_message` | string,null | no | Binding message - displayed to the user on the decoupled device. The binding message. |
| `client_assertion` | string,null | no | SEC- - private_key_jwt client assertion (RFC 7523). The client assertion. |
| `client_id` | string | yes | client identifier. |
| `client_notification_token` | string,null | no | Ping callback URL (required when request_mode=ping). The client notification token. |
| `client_secret` | string,null | no | SEC- - client authentication (client_secret_post). Public clients omit it. The client secret. |
| `delivery` | string,null | no |  Delivery mode: `decoupled_device` (default) or `assisted_link`.  `assisted_link` requests a front-channel verification URL  (`verification_uri_complete`) that the staff forwards to the customer. Assisted Login.  The delivery. |
| `id_token_hint` | string,null | no | The id token hint. |
| `login_hint` | string,null | no | User identifier - one of: login_hint, login_hint_token, id_token_hint, sub. The login hint. |
| `login_hint_token` | string,null | no | The login hint token. |
| `request_mode` | string,null | no | Notification mode: `ping` or `poll` (default). The request mode. |
| `requested_expiry` | integer,null | no | Expiry in seconds (requested by client; AS may override). The requested expiry. |
| `scope` | string,null | no | The scope. |
| `sub` | string,null | no | The sub. |
| `user_code` | string,null | no | The user code. |
| `verification_uri_base` | string,null | no | Base URL for the verification link (env-scoped Auth URL). BFF passes this so the `verification_uri` in the Post message points to the customer's own Auth (e.g. `https://auth.prod.ibank.local`), not the platform Auth (`state.config.issuer`). The verification URI base. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Auth request issued (CIBA backchannel) | `CibaResponse` |
| 400 | Unknown client or invalid delivery mode | - |
| 401 | Client authentication failed | - |

### `POST /v1/ciba/approve`

`POST /v1/ciba/approve` - user approves or denies from their device.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `approved` | boolean | yes | The approved. |
| `auth_req_id` | string | yes | auth req identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Approval recorded (the approving user is the SESSION's user) | - |
| 400 | Unknown auth_req_id | - |
| 401 | No session - approval requires an authenticated user | - |

### `GET /v1/ciba/assisted/{auth_req_id}`

`GET /ciba/assisted/&#123;auth_req_id&#125;` - Assisted Login page metadata.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `auth_req_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Assisted sign-in page details (binding_message, short_code, client, scopes) | - |
| 404 | Unknown or expired auth_req_id | - |

### `POST /v1/ciba/assisted/{auth_req_id}/complete`

`POST /v1/ciba/assisted/complete` - bind customer session to CIBA request.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `auth_req_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | CIBA request bound to the signed-in customer (single-use) | - |
| 401 | No customer session | - |
| 404 | Unknown auth_req_id | - |
| 409 | Already completed (status returned, no re-bind) | - |


## wallet

### `POST /oauth/credentials`

Handle credential offer.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `claims` | string[] | no | Claims to make selectively disclosable. The claims. |
| `cnf_jwk` | - | yes | The wallet's public JWK (proof-of-possession binding, `cnf.jwk`). The cnf jwk. |
| `type_` | string | yes | The credential type (e.g. 'VerifiedPersonCredential'). The type. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Credential offer created for the signed-in user | - |
| 400 | Unknown credential type | - |
| 401 | Session required | - |

### `POST /oauth/credentials/issue`

Handle credential issue.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `cnf_jwk` | - | yes | The wallet's key JWK - must match the offer's `cnf_jwk`. The cnf jwk. |
| `credential_id` | string | yes | credential identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Credential issued (with Status List 2021 enrollment) | - |
| 401 | Session required | - |
| 404 | Unknown offer | - |

### `POST /oauth/credentials/revoke/{id}`

`POST /oauth/credentials/revoke/&#123;id&#125;` - revoke (admin). Handle credential revoke.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Credential revoked in its status list | - |
| 403 | Admin scope required | - |
| 404 | Unknown status list | - |

### `GET /oauth/credentials/status/{id}`

`GET /oauth/credentials/status/&#123;id&#125;` - Status List 2021 endpoint: the compressed bitstring for this issuer's credentials (index = the credential's issuance ordinal, per-credential status lists). Handle credential status.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Status List 2021 compressed bitstring | - |
| 404 | Unknown status list | - |

### `POST /oauth/vp/response`

`POST /oauth/vp/response` - the wallet's `direct_post` callback. Handle vp response.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `nonce` | string | yes | The nonce from the authorization request. The nonce. |
| `presentation_submission` | - | no | The presentation submission. |
| `vp_token` | string | yes | The vp token. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Presentation accepted (single-use pending request resolved) | - |
| 400 | Unknown or expired presentation request | - |
| 401 | Presentation verification failed | - |

### `GET /v1/auth/wallet/metadata`

`GET /v1/auth/wallet/metadata` - public wallet metadata (formats, trusted issuers, the required presentation definition, the response endpoint). Handle wallet metadata.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Wallet connection metadata (formats, trusted issuers, presentation definition, response endpoint) | - |


## scim

### `POST /scim/v2/Bulk`

`POST /scim/v2/Bulk` - batch users provisioning (AUTH-5). Thin wrapper: each operation dispatches through the SAME per-user SQL paths the individual endpoints run (create/replace/delete; patch maps to replace) - no second write path, no partial-batch semantics beyond `failOnErrors`. Authenticated once for the whole batch.

Gate: `sentin8:auth:scim`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `Operations` | `ScimBulkOperation`[] | yes | The batch operations (SCIM wire name `Operations`). |
| `failOnErrors` | integer,null | no | Max failures before the batch stops (RFC 7644 §3.7). 0 = unlimited. |
| `schemas` | array,null | no | SCIM schema URIs (caller-supplied, informational). |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Per-operation results | `ScimBulkResponse` |
| 401 | Caller authentication failed | - |

### `GET /scim/v2/Groups`

`GET /scim/v2/Groups` - list groups (read-only, env-scoped).

Gate: `sentin8:auth:scim`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `filter` | path | yes | string,null |
| `start_index` | path | yes | integer,null |
| `count` | path | yes | integer,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | SCIM ListResponse of group mirrors (read-only directory sync) | - |
| 401 | Caller authentication failed | - |

### `GET /scim/v2/ResourceTypes`

`GET /scim/v2/ResourceTypes` - supported resource types.

Gate: `sentin8:auth:scim`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | SCIM resource types (Users, Groups) | - |

### `GET /scim/v2/ServiceProviderConfig`

`GET /scim/v2/ServiceProviderConfig` - capabilities metadata.

Gate: `sentin8:auth:scim`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | SCIM service-provider capabilities | - |

### `GET /scim/v2/Users`

`GET /scim/v2/Users` - list/search users.

Gate: `sentin8:auth:scim`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `filter` | path | yes | string,null |
| `start_index` | path | yes | integer,null |
| `count` | path | yes | integer,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | SCIM ListResponse (filter supported: userName eq, emails.value co, name.familyName sw) | `ScimListResponse` |
| 400 | Unsupported filter | - |
| 401 | Caller authentication failed (M2M or bearer) | - |

### `POST /scim/v2/Users`

`POST /scim/v2/Users` - create a user.

Gate: `sentin8:auth:scim`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `active` | boolean,null | no | The active. |
| `emails` | `ScimEmail`[] | no | The emails. |
| `externalId` | string,null | no | external identifier. |
| `name` | null \\| `ScimCreateName` | no |  |
| `phoneNumbers` | `ScimPhone`[] | no | The phone numbers. |
| `user_name` | string,null | no | The user name. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | User created | `ScimUser` |
| 401 | Caller authentication failed | - |
| 409 | User already exists | - |

### `GET /scim/v2/Users/{id}`

`GET /scim/v2/Users/&#123;id&#125;` - get a user.

Gate: `sentin8:auth:scim`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The SCIM user | `ScimUser` |
| 401 | Caller authentication failed | - |
| 404 | No such user | - |

### `PUT /scim/v2/Users/{id}`

`PUT /scim/v2/Users/&#123;id&#125;` - replace a user.

Gate: `sentin8:auth:scim`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `active` | boolean,null | no | The active. |
| `emails` | `ScimEmail`[] | no | The emails. |
| `externalId` | string,null | no | external identifier. |
| `name` | null \\| `ScimCreateName` | no |  |
| `phoneNumbers` | `ScimPhone`[] | no | The phone numbers. |
| `user_name` | string,null | no | The user name. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | User replaced | `ScimUser` |
| 401 | Caller authentication failed | - |
| 404 | No such user | - |

### `DELETE /scim/v2/Users/{id}`

`DELETE /scim/v2/Users/&#123;id&#125;` - deactivate a user.

Gate: `sentin8:auth:scim`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | User deactivated | - |
| 401 | Caller authentication failed | - |
| 404 | No such user | - |

### `PATCH /scim/v2/Users/{id}`

`PATCH /scim/v2/Users/&#123;id&#125;` - partial update.

Gate: `sentin8:auth:scim`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `operations` | `ScimPatchOp`[] | no | The operations. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | User patched | `ScimUser` |
| 400 | Unsupported patch op | - |
| 401 | Caller authentication failed | - |
| 404 | No such user | - |


## auth

### `POST /v1/actor-tokens/revoke`

`POST /v1/actor-tokens/revoke` - revoke an actor token by token_id (jti). `POST /v1/actor-tokens/revoke` - revoke an actor token by token_id. Revoke actor token.

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

`GET /v1/admin/actor-events` - query the actor event audit log. `GET /v1/admin/actor-events` - query the actor event audit log. List actor events.

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

`GET /v1/admin/actor-tokens` - list recent actor token issuances (audit). `GET /v1/admin/actor-tokens` - list recent actor token issuances. List actor tokens.

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
| 403 | actor lacks `auth:actor:issue` scope | - |
| 404 | target user not found | - |

### `GET /v1/admin/api-keys`

`GET /v1/admin/api-keys` - list API keys (paginated). List API keys.

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
| 403 | Missing `auth:admin` scope | - |

### `POST /v1/admin/api-keys`

`POST /v1/admin/api-keys` - create an API key. Create API key.

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
| 403 | Missing `auth:admin` scope | - |

### `POST /v1/admin/api-keys/{id}/revoke`

`POST /v1/admin/api-keys/&#123;id&#125;/revoke` - revoke an API key. Revoke API key.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | API key not found | - |

### `GET /v1/admin/audit`

`GET /v1/admin/audit` - list audit events (paginated). List audit events.

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
| 403 | Missing `auth:admin` scope | - |

### `GET /v1/admin/enterprise-connections`

`GET /v1/admin/enterprise-connections` - list enterprise connections. List connections.

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

`POST /v1/admin/enterprise-connections` - create an enterprise connection. Create connection.

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

`GET /v1/admin/enterprise-connections/&#123;id&#125;` - get an enterprise connection. Fetch connection.

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

`PUT /v1/admin/enterprise-connections/&#123;id&#125;` - update an enterprise connection. Update connection.

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

`DELETE /v1/admin/enterprise-connections/&#123;id&#125;` - delete an enterprise connection. Delete connection.

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

### `POST /v1/admin/enterprise-connections/{id}/delete`

`POST /v1/admin/enterprise-connections/&#123;id&#125;/delete` - RFW alias of `DELETE /v1/admin/enterprise-connections/&#123;id&#125;`.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Connection deleted (same contract as DELETE /v1/admin/enterprise-connections/&#123;id&#125;) | - |
| 403 | Caller lacks the admin write scope | - |
| 404 | Unknown connection | - |

### `GET /v1/admin/groups`

`GET /v1/admin/groups` - list groups (paginated). List groups.

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
| 403 | Missing `auth:admin` scope | - |

### `POST /v1/admin/groups`

`POST /v1/admin/groups` - create a new group. Create group.

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
| 403 | Missing `auth:admin` scope | - |
| 409 | group name already exists | - |

### `GET /v1/admin/groups/{group_id}/members`

`GET /v1/admin/groups/&#123;group_id&#125;/members` - list group members. List group members.

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
| 403 | Missing `auth:admin` scope | - |

### `POST /v1/admin/groups/{group_id}/members`

`POST /v1/admin/groups/&#123;group_id&#125;/members` - add a member to a group. Handle add group member.

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
| 403 | Missing `auth:admin` scope | - |

### `DELETE /v1/admin/groups/{group_id}/members/{user_id}`

`DELETE /v1/admin/groups/&#123;group_id&#125;/members/&#123;user_id&#125;` - remove a member from a group. Remove group member.

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
| 403 | Missing `auth:admin` scope | - |

### `GET /v1/admin/groups/{group_id}/roles`

`GET /v1/admin/groups/&#123;group_id&#125;/roles` - list roles assigned to a group. List group roles.

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
| 403 | Missing `auth:admin` scope | - |

### `POST /v1/admin/groups/{group_id}/roles`

`POST /v1/admin/groups/&#123;group_id&#125;/roles` - assign a role to a group. Handle add group role.

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
| 403 | Missing `auth:admin` scope | - |

### `DELETE /v1/admin/groups/{group_id}/roles/{role_id}`

`DELETE /v1/admin/groups/&#123;group_id&#125;/roles/&#123;role_id&#125;` - remove a role from a group. Remove group role.

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
| 403 | Missing `auth:admin` scope | - |

### `GET /v1/admin/groups/{id}`

`GET /v1/admin/groups/&#123;id&#125;` - the group's members (the same `list_group_members` handler is bound at both this path and `/v1/admin/groups/&#123;group_id&#125;/members`; one spec entry documents the contract, a second entry records this duplicate binding so the drift guard passes and both forms are visible on the site page).

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The group's members (identical handler to GET /v1/admin/groups/&#123;group_id&#125;/members) | - |
| 403 | Caller lacks the admin read scope | - |
| 404 | Unknown group | - |

### `PUT /v1/admin/groups/{id}`

`PUT /v1/admin/groups/&#123;id&#125;` - update a group. Update group.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | group not found | - |

### `DELETE /v1/admin/groups/{id}`

`DELETE /v1/admin/groups/&#123;id&#125;` - delete a group. Delete group.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | group not found | - |

### `POST /v1/admin/groups/{id}/delete`

`POST /v1/admin/groups/&#123;id&#125;/delete` - RFW alias of `DELETE /v1/admin/groups/&#123;id&#125;`.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Group deleted (same contract as DELETE /v1/admin/groups/&#123;id&#125;) | - |
| 403 | Caller lacks the admin write scope | - |
| 404 | Unknown group | - |

### `POST /v1/admin/groups/{id}/update`

`POST /v1/admin/groups/&#123;id&#125;/update` - RFW alias of `PUT /v1/admin/groups/&#123;id&#125;` (raw JSON body passthrough).

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
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Group updated (same contract as PUT /v1/admin/groups/&#123;id&#125;) | `GroupResponse` |
| 403 | Caller lacks the admin write scope | - |
| 404 | Unknown group | - |

### `GET /v1/admin/invitations`

`GET /v1/admin/invitations` - list invitations (proxy → sys). List invitations.

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
| 403 | Missing `auth:admin` scope | - |

### `POST /v1/admin/invitations`

`POST /v1/admin/invitations` - create an invitation (proxy → sys). Create invitation.

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
| 403 | Missing `auth:admin` scope | - |

### `POST /v1/admin/invitations/{id}/revoke`

`POST /v1/admin/invitations/&#123;id&#125;/revoke` - revoke an invitation (proxy → sys). Revoke invitation.

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
| 403 | Missing `auth:admin` scope | - |

### `GET /v1/admin/memberships`

`GET /v1/admin/memberships` - list memberships. List memberships.

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
| 403 | Missing `auth:admin` scope | - |

### `POST /v1/admin/memberships`

`POST /v1/admin/memberships` - create a membership. Create membership.

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
| 403 | Missing `auth:admin` scope | - |

### `DELETE /v1/admin/memberships/{id}`

`DELETE /v1/admin/memberships/&#123;id&#125;` - delete a membership. Delete membership.

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
| 403 | Missing `auth:admin` scope | - |

### `GET /v1/admin/oauth-clients`

`GET /v1/admin/oauth-clients` - list OAuth clients (paginated). List OAuth clients.

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
| 403 | Missing `auth:admin` scope | - |

### `POST /v1/admin/oauth-clients`

`POST /v1/admin/oauth-clients` - create an OAuth client. Create OAuth client.

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
| 403 | Missing `auth:admin` scope | - |
| 409 | client_id already exists | - |

### `GET /v1/admin/oauth-clients/{id}`

`GET /v1/admin/oauth-clients/&#123;id&#125;` - get an OAuth client by ID. Fetch OAuth client.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | OAuth client not found | - |

### `PUT /v1/admin/oauth-clients/{id}`

`PUT /v1/admin/oauth-clients/&#123;id&#125;` - update an OAuth client. Update OAuth client.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | OAuth client not found | - |

### `DELETE /v1/admin/oauth-clients/{id}`

`DELETE /v1/admin/oauth-clients/&#123;id&#125;` - delete an OAuth client. Delete OAuth client.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | OAuth client not found | - |

### `POST /v1/admin/oauth-clients/{id}/delete`

`POST /v1/admin/oauth-clients/&#123;id&#125;/delete` - RFW alias of `DELETE /v1/admin/oauth-clients/&#123;id&#125;`.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Client deleted (same contract as DELETE /v1/admin/oauth-clients/&#123;id&#125;) | - |
| 403 | Caller lacks the admin write scope | - |
| 404 | Unknown client | - |

### `GET /v1/admin/oauth-clients/{id}/federated-credentials`

`GET /v1/admin/oauth-clients/&#123;id&#125;/federated-credentials` - list federated credentials for an OAuth client. List federated credentials.

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
| 403 | Missing `auth:admin` scope | - |

### `POST /v1/admin/oauth-clients/{id}/federated-credentials`

`POST /v1/admin/oauth-clients/&#123;id&#125;/federated-credentials` - create a federated credential. Create federated credential.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | OAuth client not found | - |
| 409 | federated credential already exists | - |

### `DELETE /v1/admin/oauth-clients/{id}/federated-credentials/{cred_id}`

`DELETE /v1/admin/oauth-clients/&#123;id&#125;/federated-credentials/&#123;cred_id&#125;` - delete a federated credential. Delete federated credential.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | federated credential not found | - |

### `GET /v1/admin/oauth-clients/{id}/roles`

`GET /v1/admin/oauth-clients/&#123;id&#125;/roles` - list roles assigned to an OAuth client. List client roles.

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
| 403 | Missing `auth:admin` scope | - |

### `POST /v1/admin/oauth-clients/{id}/roles`

`POST /v1/admin/oauth-clients/&#123;id&#125;/roles` - assign a role to an OAuth client. Handle add client role.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | OAuth client not found | - |

### `DELETE /v1/admin/oauth-clients/{id}/roles/{role_id}`

`DELETE /v1/admin/oauth-clients/&#123;id&#125;/roles/&#123;role_id&#125;` - remove a role from an OAuth client. Remove client role.

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
| 403 | Missing `auth:admin` scope | - |

### `POST /v1/admin/provision/group`

Handle provision group.

Gate: `sentin8:auth:admin:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `env_id` | string | yes | env identifier. |
| `name` | string | yes | The name. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Group upserted (id returned) | - |
| 403 | Missing provisioning scope | - |

### `POST /v1/admin/provision/group_member`

Handle provision group member.

Gate: `sentin8:auth:admin:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `env_id` | string | yes | env identifier. |
| `group_name` | string | yes | The group name. |
| `user_id` | string | yes | user identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Membership ensured (count returned) | - |
| 403 | Missing provisioning scope | - |

### `POST /v1/admin/provision/group_role`

Handle provision group role.

Gate: `sentin8:auth:admin:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `env_id` | string | yes | env identifier. |
| `group_name` | string | yes | The group name. |
| `role_name` | string | yes | The role name. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Assignment ensured | - |
| 403 | Missing provisioning scope | - |

### `POST /v1/admin/provision/role`

Handle provision role.

Gate: `sentin8:auth:admin:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `env_id` | string | yes | env identifier. |
| `name` | string | yes | The name. |
| `permissions` | string[] | no | The permissions. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Role upserted (id returned) | - |
| 403 | Missing provisioning scope | - |

### `POST /v1/admin/provision/role_nesting`

Handle provision role nesting.

Gate: `sentin8:auth:admin:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `child_name` | string | yes | The child name. |
| `env_id` | string | yes | env identifier. |
| `parent_name` | string | yes | The parent name. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Nesting ensured | - |
| 403 | Missing provisioning scope | - |

### `POST /v1/admin/provision/user_role`

Handle provision user role.

Gate: `sentin8:auth:admin:write`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `env_id` | string | yes | env identifier. |
| `role_name` | string | yes | The role name. |
| `user_id` | string | yes | user identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Assignment ensured | - |
| 403 | Missing provisioning scope | - |

### `GET /v1/admin/roles`

`GET /v1/admin/roles` - list roles (paginated). List roles.

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
| 403 | Missing `auth:admin` scope | - |

### `POST /v1/admin/roles`

`POST /v1/admin/roles` - create a new role. Create role.

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
| 403 | Missing `auth:admin` scope | - |
| 409 | role name already exists | - |

### `GET /v1/admin/roles/{id}`

`GET /v1/admin/roles/&#123;id&#125;` - list role members. List role members.

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
| 403 | Missing `auth:admin` scope | - |

### `PUT /v1/admin/roles/{id}`

`PUT /v1/admin/roles/&#123;id&#125;` - update a role. Update role.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | role not found | - |

### `DELETE /v1/admin/roles/{id}`

`DELETE /v1/admin/roles/&#123;id&#125;` - delete a role. Delete role.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | role not found | - |

### `POST /v1/admin/roles/{id}/delete`

`POST /v1/admin/roles/&#123;id&#125;/delete` - RFW alias of `DELETE /v1/admin/roles/&#123;id&#125;`.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Role deleted (same contract as DELETE /v1/admin/roles/&#123;id&#125;) | - |
| 403 | Caller lacks the admin write scope | - |
| 404 | Unknown role | - |

### `POST /v1/admin/roles/{id}/update`

`POST /v1/admin/roles/&#123;id&#125;/update` - RFW alias of `PUT /v1/admin/roles/&#123;id&#125;` (form body passthrough).

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
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Role updated (same contract as PUT /v1/admin/roles/&#123;id&#125;) | `RoleResponse` |
| 403 | Caller lacks the admin write scope | - |
| 404 | Unknown role | - |

### `POST /v1/admin/roles/{role_id}/members`

`POST /v1/admin/roles/&#123;role_id&#125;/members` - add a member to a role. Handle add role member.

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
| 403 | Missing `auth:admin` scope | - |

### `DELETE /v1/admin/roles/{role_id}/members/{user_id}`

`DELETE /v1/admin/roles/&#123;role_id&#125;/members/&#123;user_id&#125;` - remove a member from a role. Remove role member.

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
| 403 | Missing `auth:admin` scope | - |

### `GET /v1/admin/security`

`GET /v1/admin/security` - read the current high-level selection (prefill for the security page + CLI verify).

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The env's security selection | `SecuritySelectionResponse` |
| 403 | Caller lacks the auth admin scope | - |

### `POST /v1/admin/security`

`POST /v1/admin/security` - the high-level submit. Selecting a new profile / extensions / overlay **resets the detail flags** to the profile's defaults (adjusted for the chosen extensions/overlay), then upserts the env row. The overlay row is written alongside.

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `extensions` | string[] | no | Enabled protocol extensions ( extensions) - additive. The extensions. |
| `overlay` | string,null | no | Regulatory overlay ( overlays) - none \| obie \| cdr \| brazil. The overlay. |
| `profile` | string | yes | The profile. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Selection stored (detail flags reset to the profile defaults) | `SecuritySelectionResponse` |
| 400 | Unknown profile or extension | - |
| 403 | Caller lacks the auth admin scope | - |

### `POST /v1/admin/security/detail`

`POST /v1/admin/security/detail` - the detail-page submit: write the individual `require_*` flags onto the env row **without** touching the high-level selection. Only the provided fields change (partial update).

Gate: `sentin8:auth:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `max_token_lifetime` | integer,null | no | Maximum token lifetime. |
| `refresh_rotation` | boolean,null | no | The refresh rotation. |
| `require_dpop` | boolean,null | no | The require DPoP. |
| `require_http_signatures` | boolean,null | no | The require http signatures. |
| `require_iss` | boolean,null | no | The require iss. |
| `require_jarm` | boolean,null | no | The require JARM. |
| `require_jwt_introspection` | boolean,null | no | The require JWT introspection. |
| `require_mtls` | boolean,null | no | The require mtls. |
| `require_par` | boolean,null | no | The require par. |

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `target_env_id` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Detail flags stored (partial update) | `SecuritySelectionResponse` |
| 403 | Caller lacks the auth admin scope | - |

### `GET /v1/admin/sessions`

`GET /v1/admin/sessions` - list sessions (paginated). List sessions.

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
| 403 | Missing `auth:admin` scope | - |

### `DELETE /v1/admin/sessions/{id}`

`DELETE /v1/admin/sessions/&#123;id&#125;` - terminate a session. Terminate session.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | session not found | - |

### `POST /v1/admin/sessions/{id}/revoke`

`POST /v1/admin/sessions/&#123;id&#125;/revoke` - RFW alias of `DELETE /v1/admin/sessions/&#123;id&#125;`.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Session revoked (same contract as DELETE /v1/admin/sessions/&#123;id&#125;) | - |
| 403 | Caller lacks the admin write scope | - |
| 404 | Unknown session | - |

### `GET /v1/admin/users`

`GET /v1/admin/users` - list users (paginated). List users.

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
| 403 | Missing `auth:admin` scope | - |

### `POST /v1/admin/users`

`POST /v1/admin/users` - create a new user. Create user.

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
| 403 | Missing `auth:admin` scope | - |
| 409 | email already exists | - |

### `GET /v1/admin/users/{id}`

`GET /v1/admin/users/&#123;id&#125;` - get a user by ID. Fetch user.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | user not found | - |

### `PUT /v1/admin/users/{id}`

`PUT /v1/admin/users/&#123;id&#125;` - update a user. Update user.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | user not found | - |

### `DELETE /v1/admin/users/{id}`

`DELETE /v1/admin/users/&#123;id&#125;` - delete a user. Delete user.

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
| 403 | Missing `auth:admin` scope | - |
| 404 | user not found | - |

### `POST /v1/admin/users/{id}/delete`

`POST /v1/admin/users/&#123;id&#125;/delete` - RFW alias of `DELETE /v1/admin/users/&#123;id&#125;`.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | User deleted (same contract as DELETE /v1/admin/users/&#123;id&#125;) | - |
| 403 | Caller lacks the admin write scope | - |
| 404 | Unknown user | - |

### `GET /v1/admin/users/{id}/groups`

`GET /v1/admin/users/&#123;id&#125;/groups` - list group names for a user. List user groups.

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
| 403 | Missing `auth:admin` scope | - |

### `GET /v1/admin/users/{id}/roles`

`GET /v1/admin/users/&#123;id&#125;/roles` - list resolved role names for a user. List user roles.

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
| 403 | Missing `auth:admin` scope | - |

### `GET /v1/admin/webhooks/attempts/{outbox_id}`

`GET /v1/admin/webhooks/attempts/&#123;outbox_id&#125;` - list delivery attempts for an outbox entry. List attempts.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `outbox_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Delivery attempts | `AttemptResponse`[] |

### `POST /v1/admin/webhooks/attempts/{outbox_id}/replay`

`POST /v1/admin/webhooks/attempts/&#123;outbox_id&#125;/replay` - reset a failed webhook delivery to pending (mirrors post's `replay_dlq`, auth DESIGN §10). Admin-gated; the relay picks the row up on its next tick. Replay a failed webhook delivery.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `outbox_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 204 | Delivery reset to pending | - |
| 404 | Outbox entry not found in this env | - |

### `GET /v1/admin/webhooks/endpoints`

`GET /v1/admin/webhooks/endpoints` - list webhook endpoints. List endpoints.

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

`POST /v1/admin/webhooks/endpoints` - create a webhook endpoint. Create endpoint.

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

`GET /v1/admin/webhooks/endpoints/&#123;id&#125;` - get a webhook endpoint. Fetch endpoint.

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

`DELETE /v1/admin/webhooks/endpoints/&#123;id&#125;` - delete a webhook endpoint. Delete endpoint.

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

`GET /v1/admin/webhooks/outbox` - list recent outbox entries. List outbox.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `env_id` | query | no | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Outbox entries | `OutboxEntryResponse`[] |

### `GET /v1/auth/consent/accounts`

`GET /v1/auth/consent/accounts` - fetch the authenticated customer's accounts from consent data providers registered via `sentin8-cli vertical enroll`.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `session_token` | path | yes | string |
| `user_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The consent flow's customer accounts (per scope selection) | - |
| 401 | Session invalid or expired | - |

### `POST /v1/auth/consent/approve`

Handle proxy consent approve.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `client_id` | string,null | no | client identifier. |
| `consent_flow` | string,null | no | The consent flow. |
| `redirect_uri` | string,null | no | The redirect URI. |
| `scopes` | string,null | no | The scopes. |
| `selected_account_ids` | array,null | no | The selected account ids. |
| `session_token` | string,null | no | SEC- - the session authorizing this approval. The session token. |
| `state` | string,null | no | The state. |
| `user_id` | string,null | no | user identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Approval recorded by the owning vertical service | - |
| 401 | Session validation failed | - |
| 404 | No consent flow registered for the requested scopes | - |

### `POST /v1/auth/consent/deny`

Handle proxy consent deny.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `consent_flow` | string,null | no | The consent flow. |
| `redirect_uri` | string,null | no | The redirect URI. |
| `scopes` | string,null | no | The scopes. |
| `session_token` | string,null | no | SEC- - the session authorizing this denial. The session token. |
| `state` | string,null | no | The state. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Denial recorded by the owning vertical service | - |
| 401 | Session validation failed | - |
| 404 | No consent flow registered for the requested scopes | - |

### `GET /v1/auth/consent/ui`

`GET /v1/auth/consent/ui` - proxy to the vertical service's consent UI endpoint.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `consent_flow` | path | yes | string,null |
| `scopes` | path | yes | string,null |
| `client_id` | path | yes | string,null |
| `client_name` | path | yes | string,null |
| `redirect_uri` | path | yes | string,null |
| `state` | path | yes | string,null |
| `user_id` | path | yes | string,null |
| `session_token` | path | yes | string,null |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The vertical's consent RFW page descriptor | - |
| 401 | Session validation failed | - |
| 404 | No consent flow registered for the requested scopes | - |

### `GET /v1/branding`

Handle branding. Merged org→env branding for the hosted Auth UI (env overrides org per-field).

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The merged branding payload for the resolved tenant | - |
| 401 | No valid tenant context could be resolved from the request | - |

### `POST /v1/email/verify`

`POST /v1/email/verify` - request an email verification token.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | yes | Email to verify. The user must already exist. The email. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Always `status: sent` (enumeration-safe) | `EmailVerifyResponse` |
| 429 | Rate limit exceeded | - |

### `POST /v1/email/verify/confirm`

`POST /v1/email/verify/confirm` - confirm email verification with a token. Handle email verify confirm.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `token` | string | yes | The token. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Email verified | `EmailVerifyConfirmResponse` |
| 400 | Token required, invalid, or expired | - |

### `POST /v1/internal/keys/rotate`

`POST /v1/internal/keys/rotate` - Sentin8:Cron proxy-back target for automated JWKS rotation (AUTH-1, auth DESIGN §10). Generates and persists a new signing key; the JWKS reader keeps every key published, so tokens signed by the previous key stay verifiable for overlap.

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Signing key rotated | - |

### `POST /v1/password/reset`

`POST /v1/password/reset` - request a password reset token.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | yes | The email. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Always `status: sent` (enumeration-safe); short_code present in dev mode | `PasswordResetResponse` |
| 429 | Rate limit exceeded | - |

### `POST /v1/password/reset/confirm`

`POST /v1/password/reset/confirm` - set a new password with a reset token. Handle password reset confirm.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `new_password` | string | yes | The new password. |
| `token` | string | yes | The token. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Password updated | `PasswordResetConfirmResponse` |
| 400 | Invalid or expired token | - |

### `GET /v1/session`

Fetch session.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The caller's session | `SessionInfo` |
| 401 | No session or the session expired | - |

### `POST /v1/sign-in`

Sign in.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | yes | The email. |
| `password` | string | yes | The password. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Session established (also set as the `__session` HttpOnly cookie) | `SignInResponse` |
| 400 | Email and password are required | - |
| 401 | Unknown email or wrong password | - |
| 429 | Sign-in rate limit (bot protection) exceeded | - |

### `POST /v1/sign-out`

Sign out.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Session revoked | - |
| 403 | Missing X-Sentin8-CSRF header for a cookie-authenticated call | - |

### `POST /v1/sign-up`

Sign up.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `email` | string | yes | The email. |
| `first_name` | string,null | no | The first name. |
| `last_name` | string,null | no | The last name. |
| `password` | string | yes | The password. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | User created and signed in (session cookie set) | `SignInResponse` |
| 400 | Invalid email or password | - |
| 409 | Email already registered for this environment | - |


## policy

### `GET /v1/admin/attributes`

`GET /v1/admin/attributes` - the env's principal attributes.

Gate: `sentin8:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Principal attributes of this service | -[] |
| 403 | Caller lacks the admin scope | - |

### `PUT /v1/admin/attributes`

`PUT /v1/admin/attributes` - store a principal attribute.

Gate: `sentin8:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `attr_key` | string | yes |  |
| `attr_value` | - | yes |  |
| `subject_id` | string | yes |  |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Attribute stored | - |
| 400 | Invalid attribute definition | - |
| 403 | Caller lacks the admin scope | - |

### `DELETE /v1/admin/attributes`

`DELETE /v1/admin/attributes` - delete an attribute by id (query param).

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

`GET /v1/admin/policy-sets` - the env's policy sets.

Gate: `sentin8:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Policy sets of this service | -[] |
| 403 | Caller lacks the admin scope | - |

### `POST /v1/admin/policy-sets/disable`

`POST /v1/admin/policy-sets/disable` - disable the named sets (RFW row action).

Gate: `sentin8:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `enabled` | boolean,null | no |  |
| `policy_set_name` | string | yes |  |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Sets disabled | - |
| 403 | Caller lacks the admin scope | - |

### `POST /v1/admin/policy-sets/enforce`

`POST /v1/admin/policy-sets/enforce` - switch the named sets to enforce mode (RFW row action).

Gate: `sentin8:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `enabled` | boolean,null | no |  |
| `policy_set_name` | string | yes |  |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Sets switched to enforce mode | - |
| 403 | Caller lacks the admin scope | - |

### `POST /v1/admin/policy-sets/shadow`

`POST /v1/admin/policy-sets/shadow` - switch the named sets to shadow mode (RFW row action).

Gate: `sentin8:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `enabled` | boolean,null | no |  |
| `policy_set_name` | string | yes |  |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Sets switched to shadow mode | - |
| 403 | Caller lacks the admin scope | - |

### `GET /v1/admin/policy-sets/{name}`

`GET /v1/admin/policy-sets/&#123;name&#125;` - one policy set.

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

`PUT /v1/admin/policy-sets/&#123;name&#125;` - store a policy set.

Gate: `sentin8:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `description` | string | no |  |
| `enabled` | boolean,null | no |  |
| `mode` | string,null | no |  |
| `policies` | string | yes |  |
| `schema` | string,null | no |  |

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

`DELETE /v1/admin/policy-sets/&#123;name&#125;` - delete a policy set.

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

`POST /v1/admin/policy-sets/&#123;name&#125;/test` - dry-run evaluate against the set.

Gate: `sentin8:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `action` | string,null | no |  |
| `policies` | string | yes |  |
| `roles` | string[] | no | Sample live-role names for role-based candidate rules. |
| `schema` | string,null | no |  |
| `scopes` | string[] | no |  |
| `subject_id` | string | yes |  |
| `token_tp` | string | no |  |

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

`GET /v1/admin/relations` - the env's ReBAC relations.

Gate: `sentin8:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | ReBAC relations of this service | -[] |
| 403 | Caller lacks the admin scope | - |

### `PUT /v1/admin/relations`

`PUT /v1/admin/relations` - store a relation tuple.

Gate: `sentin8:admin`

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `object_id` | string | yes |  |
| `object_type` | string | yes |  |
| `relation` | string | yes |  |
| `subject_id` | string | yes |  |
| `subject_type` | string | yes |  |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Relation stored | - |
| 400 | Invalid relation definition | - |
| 403 | Caller lacks the admin scope | - |

### `DELETE /v1/admin/relations`

`DELETE /v1/admin/relations` - delete a relation by id (query param).

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

`GET /v1/admin/relations/check` - dry-run relation check.

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

### `GET /v1/admin/ui/{page}`

Fetch admin ui.

Gate: `sentin8:auth:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `page` | path | yes | string |
| `target_env_id` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | RFW page definition (rendered by Sentin8:Dash) | - |
| 403 | Caller lacks the admin scope | - |
| 404 | Unknown page | - |


## meta

### `GET /v1/health`

Handle health. Liveness (captain monitor payload: status, service, version, build).

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The service is live | - |


## app-passwords

### `GET /v1/me/app-passwords`

`GET /v1/me/app-passwords` - list the user's app passwords (no hashes, no secrets). List app passwords.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The caller's app passwords (no hashes, no secrets) | - |
| 401 | Not the caller's own identity | - |

### `POST /v1/me/app-passwords`

Create app password.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `allowed_scopes` | string[] | no | Space-separated scope whitelist (e.g. "`email8:mail:read` `email8:mail:write` `email8:submission:send`"). The allowed scopes. |
| `label` | string | yes | The label. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Created - the raw secret is returned ONCE | - |
| 401 | Not the caller's own identity (self-service only) | - |

### `DELETE /v1/me/app-passwords/{id}`

`DELETE /v1/me/app-passwords/&#123;id&#125;` - revoke one app password. Revoke app password.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Revoked | - |
| 401 | Not the caller's own identity | - |


## mfa

### `POST /v1/mfa/disable`

`POST /v1/mfa/disable` - disable an MFA factor (password re-confirmation). Handle disable.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `factor_id` | string | yes | factor identifier. |
| `password` | string | yes | Password re-confirmation to prevent accidental/abusive disable. The password. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Factor disabled | - |
| 400 | Missing factor id or password | - |
| 401 | Not authenticated | - |
| 403 | Password re-confirmation failed or CSRF check failed | - |

### `POST /v1/mfa/enroll`

`POST /v1/mfa/enroll` - start TOTP enrollment.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string,null | no | Friendly name for the factor (e.g. "Authy"). The name. |
| `user_id` | string,null | no | Bearer access token or session cookie identifies the user. We also accept `user_id` for admin-initiated enrollment (admin scope). user identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Enrollment started: the otpauth:// URL + base32 secret for the QR code | `EnrollResponse` |
| 401 | Not authenticated (bearer or session) | - |
| 403 | Admin-initiated enrollment requires the admin scope | - |

### `POST /v1/mfa/verify`

`POST /v1/mfa/verify` - verify a TOTP code.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `code` | string | yes | 6-digit TOTP code. The code. |
| `factor_id` | string,null | no | Factor ID being verified. Required for enrollment verification. factor identifier. |
| `pending_token_id` | string,null | no | For sign-in MFA verification: the pending session token id returned by `POST /v1/sign-in` when MFA is required. pending token identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Code verified: factor activated or pending sign-in session activated | `VerifyResponse` |
| 400 | Code must be 6 digits / missing factor or pending token | - |
| 401 | Invalid code or expired pending session | - |
| 429 | Verify rate limit exceeded | - |


## passkey

### `POST /v1/passkey/enroll/begin`

`POST /v1/passkey/enroll/begin` - start passkey enrollment.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `authenticator_attachment` | string,null | no | Authenticator attachment preference: "platform" \| "cross-platform". The authenticator attachment. |
| `user_id` | string,null | no | user identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | WebAuthn creation options for the enrollment ceremony | `EnrollBeginResponse` |
| 401 | Not authenticated (bearer or session) | - |

### `POST /v1/passkey/enroll/finish`

`POST /v1/passkey/enroll/finish` - validate attestation, store public key.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `attestation_object` | string | yes | Base64url-encoded attestation object (CBOR-encoded). The attestation object. |
| `challenge_id` | string | yes | challenge identifier. |
| `client_data_json` | string | yes | Base64url-encoded client data JSON. The client data JSON. |
| `credential_id` | string | yes | Base64url-encoded credential id. credential identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Passkey stored and factor activated | `EnrollFinishResponse` |
| 400 | Invalid attestation or client data | - |
| 404 | Challenge not found | - |
| 409 | Challenge already consumed | - |
| 410 | Challenge expired | - |

### `POST /v1/passkey/verify/begin`

`POST /v1/passkey/verify/begin` - start passkey sign-in.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `pending_token_id` | string | yes | Pending session token id returned by `POST /v1/sign-in` when MFA is required. pending token identifier. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | WebAuthn assertion options for the sign-in ceremony | `VerifyBeginResponse` |
| 404 | Pending session not found or no active passkey factor | - |

### `POST /v1/passkey/verify/finish`

`POST /v1/passkey/verify/finish` - validate assertion, activate session.

**Request body** (`application/json`):

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `authenticator_data` | string | yes | Base64url-encoded authenticator data. The authenticator data. |
| `challenge_id` | string | yes | challenge identifier. |
| `client_data_json` | string | yes | Base64url-encoded client data JSON. The client data JSON. |
| `credential_id` | string | yes | credential identifier. |
| `signature` | string | yes | Base64url-encoded signature (DER-encoded ECDSA signature). The signature. |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Assertion verified: the pending sign-in session is activated | `VerifyFinishResponse` |
| 400 | Invalid assertion or client data | - |
| 401 | Signature verification failed | - |
| 404 | Challenge not found | - |
| 409 | Challenge already consumed | - |
| 410 | Challenge expired | - |


## sso

### `POST /v1/saml/acs/{connection_id}`

`POST /v1/saml/acs/&#123;connection_id&#125;` - SAML Assertion Consumer Service.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `SAMLResponse` | query | yes | string |
| `RelayState` | query | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 302 | Redirect into the app with the issued platform session | - |
| 400 | Malformed/invalid SAML response | - |
| 404 | Unknown or non-SAML connection | - |

### `GET /v1/saml/metadata/{connection_id}`

`GET /v1/saml/metadata/&#123;connection_id&#125;` - return the SP metadata XML.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `connection_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | SP metadata XML (entity id + ACS URL) | - |
| 404 | Unknown or non-SAML connection | - |

### `GET /v1/sso/{connection_id}/authorize`

`GET /v1/sso/&#123;connection_id&#125;/authorize` - start the SSO flow.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `connection_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 302 | Redirect to the IdP (OIDC authorize URL with PKCE, or the SAML SSO URL) | - |
| 400 | Connection not in active state | - |
| 404 | Unknown connection id | - |
| 501 | SAML connection without a usable SSO URL in metadata | - |

### `GET /v1/sso/{connection_id}/callback`

`GET /v1/sso/&#123;connection_id&#125;/callback` - OIDC code exchange callback.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `connection_id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 302 | Redirect into the app with the issued platform session (code exchanged, user upserted) | - |
| 400 | State mismatch or connection inactive | - |
| 502 | IdP returned an error or token exchange failed | - |

