---
title: "Sentin8:Acme - API (OpenAPI)"
sidebar_label: "API (OpenAPI)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-acme/edit/main/docs/openapi.json
---
Sentin8 Sentin8:Acme - internal ACME certificate authority server.

> Generated from the service’s OpenAPI 3.1 spec (`docs/openapi.json`,
> served live at `GET /openapi.json`) - the source of truth is the
> service’s own `#[utoipa::path]` annotations.

**39 endpoints** across 4 groups.

## acme

### `GET /.well-known/acme-challenge/{token}`

Serve an http-01 key authorization for the upstream CA's validator (DESIGN §4.3): `GET /.well-known/acme-challenge/&#123;token&#125;`. The proxy's :80 listener forwards here; the bounded map holds only tokens captured for in-flight external orders. Unauthenticated by design (RFC 8555 §8.1) - the token itself is the capability.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `token` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The key authorization (application/jose+json, upstream orders) | - |
| 404 | Unknown token / local order | - |

### `GET /acme/authz/{id}`

`GET /acme/authz/&#123;id&#125;` - fetch an authorization (RFC 8555 §7.1.4).

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Authorization challenges (RFC 8555 §7.1.4) | - |
| 404 | Unknown authorization | - |

### `GET /acme/cert/{id}`

`GET /acme/cert/&#123;id&#125;` - download the certificate as a combined PEM (chain, plus the private key for locally-issued certs so TLS can build its `ServerConfig` from one artifact).

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Certificate (chain; + private key for locally-issued certs) | - |
| 404 | Unknown certificate | - |

### `POST /acme/challenge/{id}`

`POST /acme/challenge/&#123;id&#125;` - signal the challenge is ready for validation (RFC 8555 §8.3). Local orders short-circuit to `valid` (the challenge target is the platform's own host network); external orders notify the upstream CA that its http-01 challenge is ready - the upstream then fetches the key authorization from the proxy's :80 listener → acme's well-known route (DESIGN §4.2/§4.3).

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Challenge marked ready (proxy mode: notifies the upstream) | - |
| 404 | Unknown challenge | - |
| 409 | Challenge not pending | - |

### `GET /acme/directory`

`GET /acme/directory` - ACME directory object (RFC 8555 §7.1.1).

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | RFC 8555 directory (resource URLs resolved from the request Host) | - |

### `POST /acme/new-account`

`POST /acme/new-account` - register a new ACME account (RFC 8555 §7.1.2), persisted to the accounts directory and announced as ``sentin8:acme:account:created``.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | Account created/updated (JWS-verified) | - |
| 400 | Malformed JWS | - |
| 403 | Rejected identifier policy | - |

### `POST /acme/new-order`

`POST /acme/new-order` - create an order (RFC 8555 §7.1.3).

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 201 | Order created (authorizations + finalize URLs; locally-signed or relayed upstream) | - |
| 400 | Unsupported/forbidden identifier | - |
| 403 | Local-domain without proxy mode, or relay proxy off | - |

### `GET /acme/order/{id}`

`GET /acme/order/&#123;id&#125;` - fetch the order status.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Order status (pending → ready → valid) | - |
| 404 | Unknown order | - |

### `POST /acme/order/{id}/finalize`

`POST /acme/order/&#123;id&#125;/finalize` - submit the CSR and issue the certificate (RFC 8555 §7.4). Local orders require a VALID authorization (defense in depth - the challenge short-circuit set it; an order that never proved control is never signed) and are signed by the Intermediate CA; external orders are finalized upstream through the relay and the certificate cached (DESIGN §4.2).

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Order finalized (CSR processed; platform-CA or upstream-signed chain) | - |
| 400 | Invalid CSR | - |
| 404 | Unknown order | - |
| 409 | Order not in ready state | - |

### `POST /acme/revoke-cert`

`POST /acme/revoke-cert` - revoke a certificate (RFC 8555 §7.6), marking its metadata and announcing ``sentin8:acme:certificate:revoked``.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Certificate revoked (metadata flag / upstream relay) | - |
| 400 | Malformed revocation request | - |

### `GET /v1/ca/intermediate.crt`

`GET /v1/ca/intermediate.crt` - download the Intermediate CA certificate.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Intermediate CA PEM | string |

### `GET /v1/ca/root.crt`

`GET /v1/ca/root.crt` - download the Root CA certificate.

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Root CA PEM | string |

### `POST /v1/client-cert`

`POST /v1/client-cert` - mint an mTLS client certificate.

Gate: `sentin8:acme:clientcert:issue`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Combined PEM (leaf chain + key) | string |
| 400 | invalid service_name | - |
| 401 | missing/invalid bearer token | - |
| 403 | sub does not match the requested service_name | - |

### `POST /v1/internal/schedules/run`

`POST /v1/internal/schedules/run` - Sentin8:Cron proxy-back target for the daily leaf-cert renewal sweep. Scans the certificates directory for locally-issued (`source = "local"`) certs whose `expires_at` lands within the next 14 days and re-issues each one (new key + full chain via the same `sign_leaf` path as order finalize); the previous cert stays on disk until its natural expiry (overlap). Authenticated by the cron ticker's M2M token.

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Renewal sweep completed | - |


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

### `POST /v1/admin/attributes/{id}/delete`

Gate: `sentin8:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Attribute deleted | - |
| 403 | Caller lacks the admin scope | - |

### `GET /v1/admin/policy-decisions`

Gate: `sentin8:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Recent decision log | -[] |
| 403 | Caller lacks the admin scope | - |

### `GET /v1/admin/policy-sets`

Gate: `sentin8:admin`

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Policy sets of this service | -[] |
| 403 | Caller lacks the admin scope | - |

### `POST /v1/admin/policy-sets`

Gate: `sentin8:admin`

**Request body** (`application/json`):


**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Policy set created | - |
| 400 | Invalid policy set definition | - |
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

### `POST /v1/admin/policy-sets/{name}/save`

Gate: `sentin8:admin`

**Request body** (`application/json`):


**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Policy set saved | - |
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

### `POST /v1/admin/policy-sets/{name}/{action}`

Gate: `sentin8:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `name` | path | yes | string |
| `action` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Action applied | - |
| 400 | Unknown row action | - |
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

### `POST /v1/admin/relations/{id}/delete`

Gate: `sentin8:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Relation deleted | - |
| 403 | Caller lacks the admin scope | - |


## admin-ui

### `POST /v1/admin/certificates/{id}/revoke`

`POST /v1/admin/certificates/&#123;id&#125;/revoke` - revoke an issued certificate.

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `id` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | Certificate revoked (RFW redirect to the certificates page) | - |
| 403 | Shield deny | - |
| 404 | Unknown certificate | - |

### `GET /v1/admin/ui/{page}`

`GET /v1/admin/ui/&#123;*page&#125;` - returns the RFW page definition as JSON.

Gate: `sentin8:acme:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `page` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | RFW page definition (rendered by Sentin8:Dash) | - |
| 403 | Caller lacks an acme read/admin scope | - |
| 404 | Unknown page | - |

### `GET /v1/admin/{resource}`

`GET /v1/admin/&#123;resource&#125;` - returns a JSON array of admin data rows.

Gate: `sentin8:acme:admin`

**Parameters**:

| Name | In | Required | Type |
| --- | --- | --- | --- |
| `resource` | path | yes | string |

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The resource's rows for the RFW table | - |
| 403 | Caller lacks an acme read/admin scope | - |
| 404 | Unknown resource | - |


## meta

### `GET /v1/health`

Liveness (captain monitor payload).

**Responses**:

| Status | Description | Body |
| --- | --- | --- |
| 200 | The service is live | - |

