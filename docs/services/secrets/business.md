---
title: "Sentin8:Secrets — Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-secrets/edit/main/BUSINESS.md
---
# Sentin8:Secrets — Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Secrets **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Secrets is the platform's **secret-reference store and
resolver**. It is the single place credential material lives —
everything else in the platform stores only a reference
(`backend://path`). The business value it delivers:

- **Secret references only.** Application tables store
  `backend://path` references, never credential material — a database
  dump or backup must never contain a usable provider key, PAN, PIN, or
  OAuth client secret.
- **Two access paths, both audited.** Machines resolve values
  programmatically (with a workload-scoped token); humans reveal for
  inspection — every reveal writes a `reads` audit row. An unaudited
  reveal is the classic secret-store failure.
- **Zeroize-on-drop plaintext.** Plaintext values live only inside
  request/response handling; metadata projections never serialize
  values; logs and error messages never carry them.
- **Key rotation without downtime.** Value ciphers carry a key version;
  re-encrypt rewraps rows lazily while old-version rows stay readable;
  version rotation retains the previous value through the prune window
  so consumers mid-upgrade keep resolving.
- **Compliance-grade visibility.** The reveal audit trail is
  append-only and never pruned — who, what, when, operator-attributable.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Secret storage | Named secrets (`stripe/api_key` style) envelope-encrypted at rest (AES-256-GCM, `v2:` prefix, fresh nonce per seal) with key-version epochs |
| CRUD | Create/upsert, list/get (metadata only), soft-disable (delete), name validation (charset, length, no traversal) |
| Rotation | `rotate` bumps the version and retains the previous one until the prune window; the active pointer flips atomically |
| Machine resolve | `POST /v1/secrets/resolve` (M2M, `secret:read`) — accepts `secrets://`, `sentin8-secrets://`, or bare name; value returned once, never logged |
| Human reveal | Admin `reveal` (`secret:admin`) — audited; surfaced in the admin UI history |
| Reveal audit | Append-only, never-pruned `reads` table — reader subject, service, type (user/m2m) |
| Version history | Append-only `versions` table per secret |
| Expiry | `expires_at` with an expiring-soon event window (T-14d) and the daily expiry scan |
| Maintenance | Prune (Cron-driven, daily at boot-registered 05:30) + re-encrypt (manual post-key-rotation step) |
| Events | Metadata-only lifecycle events (values never) via the local outbox |
| Admin surfaces | RFW admin UI (secret history + reveal audit trail pages) + Shield policy-admin API |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Secrets' lifecycle decisions | Callers (they rotate and disable) |
| Provider connectivity | The consuming service (Secrets only stores/resolves) |
| Key rotation scheduling | Manual ops step (re-encrypt is not scheduled) |
| Env-variable-only secrets | Rejected by design (unversioned, unrotatable, unaudited, invisible) |
| External Vault-style systems | Rejected by design (an extra failure domain and identity plane) |

## 3. Business Capabilities

### 3.1 Storage & Rotation

| Capability | Business rule |
|---|---|
| Upsert | Idempotent create/update (version++, history row appended); plaintext accepted once and encrypted immediately |
| Names | Fail-closed validation: non-empty, ≤256 chars, `[a-zA-Z0-9/_-]`, no empty segments (traversal refused) |
| Rotation | Version++ with retained previous value until the prune window — consumers mid-upgrade keep resolving |
| Soft-disable | DELETE disables; resolve/reveal refuse as 404 — disabled state cannot be distinguished from absence (no existence oracle) |
| Expiry | `expires_at` + daily expiry scan + T-14d expiring-soon event |
| Key epochs | `key_version` per cipher; re-encrypt rewraps lazily (per-row continue-on-failure, resumable) — rotation never bricks readers |

### 3.2 Reveal (the security-critical family)

| Capability | Business rule |
|---|---|
| M2M resolve | Shield `secret:read`; envelope opened, value wrapped in `SecretValue` (zeroize-on-drop), returned once |
| Human reveal | Shield `secret:admin`; audited, visible in the admin history page |
| Audit-before-response | The audit INSERT runs inside the same transaction as the value SELECT; audit failure → 500 — the value is never returned unaudited |
| Audit trail | Append-only, never pruned; reader subject, service, type; LIMIT 100 listing per secret |
| Metadata safety | `SecretRow::metadata()` serializes id/name/description/version/key_version/status/creator/env/timestamps — `value_cipher` never leaves the resolve path |

### 3.3 Maintenance

| Capability | Business rule |
|---|---|
| Prune | Daily `secrets-version-prune` schedule (registered at boot, 05:30) drives the Cron proxy-back; removes versions older than the window within the caller env only; ≤0 window disables |
| Re-encrypt | Manual post-key-rotation step; rewraps rows to the current key version; failures continue per-row (idempotent, resumable) |
| Expiry scan | Daily Cron proxy-back (`schedule_type: expiry-scan`) |

## 4. Business Events (Outbound)

Event family `secrets`; metadata-only payloads — values never.

| Event | When |
|---|---|
| `sentin8:secrets:secret:created` | Create (payload: secret_id, name, version) |
| `sentin8:secrets:secret:updated/rotated` | Update/rotate (payload includes previous_version) |
| `sentin8:secrets:secret:disabled` | Soft-disable |
| Expiring-soon event | T-14d before `expires_at` (expiry scan) |

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **Plaintext only in request scope** — decrypted values live in `SecretValue` (zeroize-on-drop); the master key is `Zeroizing` and never prints.
2. **Metadata is value-free by construction** — a future field addition cannot leak ciphertext because the value never enters the projection.
3. **Every reveal is audited** (m2m / user / admin) into the append-only, never-pruned `reads` table.
4. **Envelope discipline** — `v2:` prefix, fresh 12-byte nonce per seal, AES-256-GCM; ciphertext is non-deterministic.
5. **Names fail closed** — traversal and malformed names rejected.
6. **Disabled refusal = 404** — callers cannot distinguish disabled from absent.
7. **Rotation via versioning, not overwrite** — history is append-only; hard delete is not exposed.
8. **Master key fail-closed** — absent/invalid key panics in production; dev mode is an explicit, loudly-warned escape hatch (ephemeral key, values unreadable after restart).
9. **Tenant context from claims only** — never URL path segments; cross-env requires admin roles validated at the authorization layer.
10. **RLS context set on the same connection, same transaction** as every secret read/write.
11. **No `unsafe` code**; crypto is the shared envelope crate.

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Secrets |
|---|---|
| Consuming service (ai, post, bank8-fdx…) | Stores provider credentials by reference; resolves them at call time with a workload-scoped token |
| Platform operator | Creates/rotates/disables secrets via the admin UI; reviews the reveal audit trail; runs re-encrypt after key rotation |
| Compliance/audit | Verifies zero plaintext at rest, zero unaudited reveals, and the never-pruned audit history |
| Key administrator | Rotates the master key and runs the re-encrypt sweep (resumable, per-row failure isolation) |

## 7. KPIs / Success Criteria

- **Confidentiality**: zero plaintext secrets in any database dump, backup, log, or metadata surface.
- **Auditability**: 100% of reveals attributed (who/what/when); audit-before-response enforced.
- **Rotation safety**: key rotation never bricks readers (lazy re-encrypt); version rotation never strands mid-upgrade consumers (prune window).
- **Fail-closed posture**: missing master key refuses boot; traversal refused; disabled indistinguishable from absent.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:DB (PostgreSQL) | Secrets/versions/reads/outbox tables (RLS-enforced) |
| Sentin8:Auth | Bearer verification; workload-scoped M2M tokens; Shield scope-mirror |
| Shield (Sentin8:Policy) | `secret:read`/`write`/`admin` gates (live evaluation) |
| Sentin8:Cron | Daily version-prune + expiry-scan schedules (proxy-back) |
| Sentin8:Bus | Metadata-only lifecycle events via the local outbox relay |
| sentin8-crypto (crate) | The AES-256-GCM envelope format |
| Shell (platform) | Outbox relay, middleware, TLS listener, pool cap |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A service can store a provider credential by name and resolve it at call time — the plaintext exists only within the request.
2. Every application table in the platform holds only `backend://path` references — no credential material outside Secrets.
3. Every resolve and reveal lands in the never-pruned audit trail with reader attribution; an audit failure blocks the response.
4. Rotation retains the previous version through the prune window; consumers mid-upgrade never fail.
5. Disabled secrets resolve as 404 — no existence oracle.
6. Key rotation + re-encrypt rewrap rows without downtime; failures are per-row isolated and resumable.
7. The daily prune and expiry scans run via Cron proxy-back.
8. Metadata surfaces (lists, admin pages, events) never contain values.
9. The master key fails closed at boot in production.
10. Admin history pages show version history and the reveal audit trail.

## 10. Open Business Questions

- Hardware-backed key storage as another `KeyProvider` impl behind the existing master-key seam.
- Per-scope secret ACLs keep scope-gating as the contract (`sentin8:secrets:{scope}:read` per scope).
- Secret sharing (split-knowledge / Shamir) is a non-goal — operational ceremony without a consumer.


---

**Design attribution:** sentin8:secrets and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

