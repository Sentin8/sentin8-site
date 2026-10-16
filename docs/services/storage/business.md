---
title: "Sentin8:Storage - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-storage/edit/main/BUSINESS.md
---
# Sentin8:Storage - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Storage **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Storage is the platform's **object-storage service** - the one
place every file and blob lives. AI chunk text, trace archives, app
uploads, media, and vertical blobs all share one storage plane with
tenant-isolated semantics. The business value it delivers:

- **One object plane.** No vertical owns an S3 account or a filesystem;
  one plane means one credential owner, one audit surface, and one
  tenant-isolation model.
- **All access requires a token.** Every read/write requires an
  Auth-issued token; signed URLs are the time-boxed escape hatch for
  untrusted clients (browser uploads/downloads) - auditable and
  tamper-proof.
- **Path traversal is a security invariant.** Keys must stay inside
  their bucket root - traversal attempts are rejected BEFORE any IO,
  not sanitized after.
- **Idempotent, content-addressed friendly.** Content-addressed
  verticals short-circuit duplicate uploads (`If-None-Match` /
  `X-If-Absent`) and probe with HEAD - the dedup fast path is a
  first-class API.
- **Pluggable backend.** The local FS backend ships today; S3-style
  object stores are an adapter away without any caller change.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Object CRUD | PUT (with idempotency hints), GET, HEAD (existence + size, no payload), DELETE, list by prefix, copy/move |
| Dedup fast path | `X-If-Absent` / `If-None-Match: *` → `X-Storage-Deduped: true`; optional `X-Content-Sha256` verification on dedup hits |
| Signed URLs | HMAC-SHA256 token-embedded authorization, method-scoped (GET/PUT), TTL 3600s - browser-direct uploads/downloads without credentials |
| Public reads | Image-only extension allowlist (svg/png/jpg/jpeg/gif/webp/ico) for platform + per-env paths, `Cache-Control` cached |
| Tenant isolation | Keys `org/{org_id}/env/{env_id}/{path}` - env from the verified token, org resolved server-side (never in URLs) |
| Path safety | Component-level traversal rejection pre-IO + canonicalize-deepest-existing + containment - symlink escapes rejected |
| Admin surfaces | RFW bucket admin (create/delete/upload/download/link objects) with cross-env authority checks; Shield policy-admin API |
| Events | Object lifecycle events (`created`/`deleted`/`moved`) via the local outbox with the caller's publisher identity |
| Adapter abstraction | `StorageAdapter` trait - LocalFsAdapter today, pluggable backends (native HEAD/range) tomorrow |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Object semantics | Callers decide what a key means (services store references/keys in their own schemas) |
| Object metadata tables | None - the service holds no domain tables; buckets are `.keep` marker objects |
| Tenant identity | Sentin8:Auth (env from the verified token; org resolved from `sys.environments`) |
| Object versioning | Non-goal - copy-then-delete + audit journal cover the requirement |
| Multipart uploads | Ride the presigned-PUT pattern (N part-PUTs + a commit endpoint) |

## 3. Business Capabilities

### 3.1 Object API

| Capability | Business rule |
|---|---|
| Put / get / head / delete | Shield-gated (`env:write` / `env:read` / `env:admin`); HEAD answers existence + size without shipping bytes |
| List | `?prefix=` filtering; a 403 propagates (never masked as an empty list) |
| Copy / move | Admin scope; move is copy-then-delete (no partial state); both emit `object:moved` |
| Dedup | Opt-in: a dedup hit returns 200 + `X-Storage-Deduped: true` without re-writing bytes; with `X-Content-Sha256` present the hash is verified (407 on mismatch) |
| Signed-URL flows | Sign-read / sign-upload via POST dispatch; the signed route itself needs no bearer |

### 3.2 Signed URLs (browser-direct transfers)

| Capability | Business rule |
|---|---|
| Issuance | Write-scoped caller requests a signed URL for one key + method (GET/PUT), TTL 3600s |
| Verification | HMAC + expiry + method checked BEFORE any IO; expired/tampered → 403; malformed → 400; wrong method → 405 |
| Scope | Single-key, single-operation capability - no broad token exposure to browsers |
| No events | Signed serving/upload flows emit no lifecycle events (the sign-issuing mutation does) |

### 3.3 Public Reads

| Capability | Business rule |
|---|---|
| Allowlist | Image extensions only - arbitrary object leakage through the public route is impossible |
| Platform variant | Pinned to the system org/env (branding/logos) |
| Per-env variant | Org resolved from the `env_id` path segment |
| Caching | `Cache-Control: public, max-age=3600` |

### 3.4 Administration

| Capability | Business rule |
|---|---|
| Bucket admin | RFW pages: create/delete buckets (`.keep` markers, name-sanitized), upload/download/link objects |
| Cross-env authority | Requires platform/org/env-admin scopes |
| Policy admin | Shared Shield surface (policy sets, relations, attributes) |

## 4. Business Events (Outbound)

Event family `storage`; publisher identity = the caller's JWT.

| Event | When |
|---|---|
| `sentin8:storage:object:created` | PUT (payload: key, content_type, size) |
| `sentin8:storage:object:deleted` | DELETE (payload: key) |
| `sentin8:storage:object:moved` | Copy or move (payload: from_key, to_key) |

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **Key containment validated pre-IO** - traversal and symlink escapes are rejected before any filesystem IO.
2. **Fail-closed tenant resolution** - unknown env → 404 (never a system-org fallback); pool/context errors → 500; context and lookup share one transaction on one connection.
3. **Signed URLs are token-embedded, HMAC-tamper-proof, method-scoped, expiry-checked** before IO; unsigned legacy tokens rejected.
4. **Dedup semantics are opt-in** and never verify bytes unless the caller supplies `X-Content-Sha256`.
5. **Public reads are image-only** - arbitrary object leakage through the public route is impossible.
6. **`org_id` never appears in URL paths** - resolved server-side from `env_id`.
7. **Move is copy-then-delete** - no partial state on failure.
8. **Shield (step 5) is the only access gate** on tenant routes; signed and public routes are bearer-free by contract.
9. **Production fails fast without a signing key** (`SENTIN8_STORAGE_SIGNING_KEY` required at boot in production; the ephemeral fallback deliberately invalidates URLs on restart).
10. **No `unsafe` code**; the FS adapter is the only IO surface.

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Storage |
|---|---|
| Platform service | Stores/retrieves blobs (AI chunks, trace archives, module binaries, app media) via the shared SDK; stores only keys in its own schema |
| Browser user | Uploads/downloads large files directly via signed URLs (no bytes proxied through the BFF, no credentials exposed) |
| Public visitor | Reads branding images via the public read surface |
| Platform operator | Manages buckets and objects via the RFW admin; monitors lifecycle events |
| Compliance | Verifies traversal rejection, fail-closed tenant resolution, and event-attributed mutations |

## 7. KPIs / Success Criteria

- **Isolation**: zero cross-tenant object access (token env + server-side org resolution + containment).
- **Safety**: zero traversal escapes (pre-IO rejection); zero arbitrary public reads (image allowlist).
- **Convenience**: browser-direct transfers work without credential exposure; dedup avoids wasted IO/egress.
- **Reliability**: copy/move never leaves partial state; relay failures retry (rows unrelayed, never lost).

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:Auth | Bearer verification (JWKS); M2M workload identities |
| Shield (Sentin8:Policy) | `env:read`/`write`/`admin` scope-mirror gates |
| Sentin8:Sys | `sys.environments` lookups (org resolution, context-first) |
| Sentin8:Bus | Lifecycle event publication via the local outbox relay |
| Local filesystem / adapter backend | Physical object storage (`{state_dir}/storage`) |
| Shell (platform) | Outbox relay, middleware, TLS listener, pool cap |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A service can put/get/head/delete/list objects through one API, storing only keys in its own schema.
2. A browser can upload or download a specific object via a signed URL that expires within the hour - no platform credentials in the client.
3. Traversal attempts (`..`, absolute paths, URL-encoded traversal, symlink escapes) are rejected before any IO.
4. Dedup works: identical content-addressed uploads short-circuit; `X-Content-Sha256` verifies hits.
5. Public reads serve branding images (image allowlist, cache headers) for the platform and per-env.
6. Cross-tenant access is impossible - `org_id` never in URLs, unknown envs 404 fail-closed.
7. Copy/move complete atomically (copy-then-delete) and emit lifecycle events with caller attribution.
8. Bucket admin works end-to-end via the RFW UI with proper cross-env authority checks.
9. Production boots only with a real signing key.
10. Object lifecycle events reach the Bus durably (outbox relay with retries).

## 10. Open Business Questions

- The S3-compatible backend adapter is deliberate future work behind the adapter trait (the seam exists; only LocalFs ships).
- Per-bucket quota enforcement tracks bytes-per-namespace in metadata (the dedup path already scans sizes).
- Multipart uploads ride the presigned-PUT pattern (N part-PUTs + a commit endpoint).
- Object versioning stays a non-goal - the copy-then-delete contract plus the audit journal cover the requirement.


---

**Design attribution:** sentin8:storage and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

