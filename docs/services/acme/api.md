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

**2 endpoints**.

## acme

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

