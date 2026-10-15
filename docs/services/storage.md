---
sidebar_position: 7
---

# Sentin8:Storage — Object Storage Service

Tenant-scoped object storage: buckets, versioned objects, presigned
upload/download tokens, server-side copy/move, dedup-on-write. Every
object path is env-scoped and Shield-gated — a read of another
tenant's prefix is a 403, never an empty list.

## Use cases

- **Documents & statements** — ledger statement PDFs, compliance
  filings, generated reports land in Storage (the platform's
  generated-document sink).
- **WASM module hosting** — Sentin8:Func stores tenant-authored
  modules via `put_if_absent` (content-addressed dedup).
- **Media & branding assets** — logos, themes, attachments.
- **Presigned handoff** — browser-direct upload/download for large
  payloads without proxying bytes through the app.

## API surface

| Endpoint | Method | Gate | Notes |
|---|---|---|---|
| `/v1/storage/objects/{*path}` | PUT/HEAD/GET/DELETE | `env:write`/`env:read`/`env:admin` | dedup via `X-If-Absent` |
| `/v1/storage/objects/{*path}` | POST | dispatch | sign-read/sign-upload/copy/move |
| `/v1/storage/objects` | GET | `env:read` | `?prefix=` listing; 403 propagates |
| `/v1/storage/signed/{token}` | GET/PUT | HMAC token (no bearer) | method-scoped, expiring |

## Deep dive

[Storage reference section](/docs/reference/storage/) — harvested from
`Sentin8/sentin8-storage`.