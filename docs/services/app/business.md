---
title: "Sentin8:App — Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-app/edit/main/BUSINESS.md
---
# Sentin8:App — Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:App **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:App is the platform's **app store and app-instance lifecycle
service**. It is where third-party apps become first-class platform
tenants: developers publish listings, organizations install them, and the
install provisions the entire platform resource stack behind one request.
The business value it delivers:

- **Apps are tenants too.** Third-party apps need provisioning surfaces
  (roles, groups, memberships, OAuth clients) without ever touching other
  services' tables — the app store is the composition point where an
  install becomes a full stack of platform resources.
- **Backend URL is metadata, not configuration.** The platform never
  hardcodes app-slug→backend mappings; the developer's `backend_url` is
  stored on the listing and consumed by others — the BFF hostname pattern
  (`bff.{app_domain}`) is derived, never hardcoded.
- **Visibility is a product decision.** Listings are `usr`, `env`, or
  `public` scoped; the store API filters by the caller's perspective and
  RLS enforces the same tiers on the tables.
- **App lifecycles need workflow machinery.** Onboarding (KYC check,
  approval review, document upload) is a multi-step compensable process —
  a natural Flow workflow with proxy-back steps.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Store catalog | Listing CRUD with visibility tiers (`usr`/`env`/`public`), status lifecycle (draft → published → disabled/archived), per-channel release trains (`stable`/`beta`/`dev`) with advisory versioning, media (typed by-reference entries, bytes in Storage), categories, declared roles + scope sets, default signup role |
| Install (setup) | `POST /v1/app/setup` provisions: the instance record, Auth roles/groups/user_role bindings, an OAuth client (DCR), a domain binding (derived default or DNS-verified custom), a Stat property, and the embeddable Web SDK snippet |
| Runtime context | Public, header-based bootstrap endpoint the installed app's SPA calls to learn its instance context (auth domain, BFF domain, feature flags, OAuth client id, signup flag, branding) |
| Instance admin | Domain binding (TXT/CNAME verification), env vars (secret references, resolve-once), feature flags, status management (provisioning/active/maintenance/offline), OAuth client query |
| Uninstall | Org+env scoped uninstall emitting `sentin8:app:instance:uninstalled` |
| Onboarding workflows | Flow step-handler profile (domain `app`): KYCCheckStep, ApprovalReviewStep (ManualDecision pause), DocumentUploadStep |
| Usage metrics | SSE Bus consumer for `sentin8:stat:aggregate:updated` events → applies them as listing usage metrics; daily telemetry counters (`instances.count`, `listings.count`, `installs.daily`) via Cron + Stat |
| Admin surfaces | RFW admin UI pages for instances, domains, feature flags, status |
| Events | Domain events via the local outbox (same transaction as the write) |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Identity/roles/groups | Sentin8:Auth (App calls Auth's provisioning verbs — never its tables) |
| OAuth client registry | Sentin8:Auth (DCR registration; `oauth_client_id` stored on the instance) |
| Hostname→instance resolution | Sentin8:Sys resolver + Sentin8:TLS (they read `sys.app_instances`) |
| Branding truth | `sys.branding` (App serves a merged read: org base → env override) |
| Analytics properties | Sentin8:Stat (App creates properties via Stat's API) |
| Workflow execution | Sentin8:Flow |
| Env-var secrets | Sentin8:Secrets (App stores references only) |

## 3. Business Capabilities

### 3.1 Store Catalog

| Capability | Business rule |
|---|---|
| Create/update listing | Visibility tier (`usr`/`env`/`public`) set at creation; status lifecycle draft → published → disabled/archived; archive is soft (never hard-delete) |
| Visibility enforcement | RLS-enforced, not handler-filtered — a `usr`/`env` listing is invisible (404) outside its tier; env-admin override is explicit |
| Visibility immutability | `visibility` is immutable after publish — 400 on change (an audience can't be silently widened) |
| Role declarations | The developer declares the roles (and scope sets) the app needs; `default_signup_role` must be one of the declared roles; the includes-graph is cycle-checked before save |
| Release trains | A listing row is a `(app_slug, channel)` release (`stable` default); install resolves the newest published version on the requested channel; manifests may pin `version`/`channel` |
| Media | Typed by-reference entries (`{role, resolution, storage_key}`); bytes live in Storage — no blobs in tables |
| Categories | `listing_categories` join table; `GET /v1/app/store/listings?category=` filters |
| Backend URL | Developer metadata stored on the listing; the platform never hardcodes app→backend mappings |

### 3.2 Install (Setup)

| Capability | Business rule |
|---|---|
| Install | `POST /v1/app/setup` with listing id + instance naming; `target_env_id` REQUIRED, RBAC-validated in the target env (403 without membership) |
| OAuth defaults | When the listing declares `oauth_defaults.redirect_uris`, the derived callback (`https://bff.{hostname}/auth/callback`) MUST match exactly — mismatch fails the install (400), never an off-list callback |
| DCR | Each instance gets its own OAuth client (public PKCE, auth_code+refresh) — revocation and branding are per-tenant; DCR failure = warn + continue (BFF fallback client) |
| Auth provisioning | Roles (with their scope sets), group + binding, default signup role wiring — via Auth's provisioning API (idempotent verbs) |
| Domains | Default `{app_slug}.{env_slug}.{org_domain}` derived; custom domains verified via DNS TXT or CNAME challenge (CNAME wins when both present) |
| Instance state | `provisioning → active`; admin moves it to `maintenance`/`offline`; offline → provisioning is the reinstall path |
| Uninstall | Org+env scoped DELETE emitting `sentin8:app:instance:uninstalled` |
| Group gate | `group_gate='strict'` fixed at install (fail-closed app-group gate) |

### 3.3 Runtime & Admin

| Capability | Business rule |
|---|---|
| Runtime context | Public header-based endpoint (TLS-injected `X-Sentin8-App-Id`/Hostname/Env-Id); returns `{auth_domain, bff_domain, feature_flags, oauth_client_id, allow_signup, branding}` — metadata only, no tokens |
| Env vars | Stored by secret reference; the resolve endpoint returns the value ONCE, never logs it |
| Feature flags | Per-instance flag management |
| Status admin | provisioning/active/maintenance/offline transitions via admin PUT |
| OAuth client query | `GET …/oauth-client` for the instance's client record |
| Admin UI (RFW) | Instance, domain, flags, status pages — gated by any of `store:read/store:admin/sys:admin/org:admin/env:admin` |

### 3.4 Metrics & Telemetry

| Capability | Business rule |
|---|---|
| Usage metrics | SSE consumer on `stat-pipeline` family applies `sentin8:stat:aggregate:updated` events as listing usage metrics (Stat ingest, property = the listing's) with ACK + 2s reconnect backoff |
| Daily telemetry | `instances.count`, `listings.count`, `installs.daily` counters (dimension: env) — scheduled, idempotent, fire-and-forget; DCR-registered M2M (scope `sentin8:stat:measure`) |

## 4. Business Events (Outbound)

Event family `app`; names follow `sentin8:app:{resource}:{operation}`.
Listing events are in-transaction (commit-atomic); instance events are
best-effort post-tx.

| Event | When |
|---|---|
| `sentin8:app:listing:created/updated/archived` | Store catalog lifecycle |
| `sentin8:app:instance:created` | Install completed (status active) |
| `sentin8:app:instance:uninstalled` | Uninstall |
| `sentin8:app:instance:domain:updated` | Domain binding change |
| `sentin8:app:instance:envvars:updated/resolved` | Env-var changes/resolutions |
| `sentin8:app:instance:featureflags:updated` | Feature-flag changes |
| `sentin8:app:instance:status:updated` | Status transitions |

**Inbound (consumed):** `sentin8:stat:aggregate:updated` (stat-pipeline
family, SSE) → listing usage metrics; Flow step-execution proxy-backs
(`POST /v1/internal/steps/execute`).

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **Tokens never reach the client** — runtime context returns metadata only; OAuth flows ride the BFF.
2. **Visibility tiers enforced by RLS**, not handler filters — out-of-tier listings are 404s, not filtered rows.
3. **`visibility` immutable after publish** — an audience can't be silently widened.
4. **Role graph integrity** — `default_signup_role` must be declared; the includes-graph is cycle-checked before save.
5. **Env vars are references** — resolved values returned once, never logged, never stored plaintext.
6. **`target_env_id` required + RBAC-in-target check** on admin/setup surfaces — no cross-env writes without membership.
7. **Install hostnames derived deterministically** — default `{app_slug}.{env_slug}.{org_domain}`; BFF always `bff.{hostname}`; custom domains verified (TXT/CNAME) before activation.
8. **`group_gate='strict'` fixed at install** — the fail-closed app-group gate; platform surfaces use `self_service` explicitly.
9. **DCR secrets returned once** and stored on the instance record; listing rows never carry client secrets.
10. **Events via the local outbox** — same transaction as the domain write; tx rollback vanishes the event (no orphans).
11. **`sys.app_instances` is Sys-owned DDL with App as the declared DML owner** — the only sanctioned cross-schema write grant (instance provisioning is App's domain by design).
12. **No `unsafe` blocks in the service.**

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:App |
|---|---|
| App developer | Publishes listings (visibility, roles, OAuth defaults, media, channels); maintains releases per channel |
| Org operator | Installs listings into environments (full platform resource stack); manages instances (domains, env vars, flags, status); uninstalls |
| End user / app visitor | Loads an installed app's SPA which bootstraps via the runtime context endpoint; signs up when `allow_signup` |
| Platform / store admin | Manages the catalog via the admin API; reviews listings (status field reserved for a future review workflow) |
| Compliance/audit | Reads audit journal entries and lifecycle events |
| Business owner | Sees listing usage metrics (via Stat aggregates) and daily install telemetry |

## 7. KPIs / Success Criteria

- **Time-to-first-value**: an install provisions roles, OAuth client, domain, Stat property, and SDK snippet in one request — an installed app is immediately operable.
- **Isolation**: visibility tiers hold under RLS; no cross-tenant listing visibility; no cross-env writes without membership.
- **Safety**: tokens never reach the client; env-var values resolve once and are never logged.
- **Operability**: instance lifecycle (provisioning → active → maintenance/offline → reinstall) fully admin-managed; uninstall is scoped and event-announced.
- **Insight**: usage metrics per listing via Stat aggregates; daily install counters.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:Auth | DCR client registration; provisioning verbs (role/group/membership); bearer verification |
| Sentin8:Sys | `sys.app_instances` (App is the DML owner by declared grant); branding reads |
| Sentin8:Flow | Onboarding step execution (KYC/approval/document steps proxy-back to App) |
| Sentin8:Stat | Usage metrics ingest; daily telemetry; listing aggregates |
| Sentin8:Bus | Event outbox relay; SSE stat-pipeline consumption |
| Sentin8:Secrets | Env-var secret reference resolution |
| Sentin8:Storage | Listing media bytes (by-reference storage keys) |
| Sentin8:Cron | Daily telemetry schedule (self-registered) |
| Shield (Sentin8:Policy) | Authorization decisions on admin/store paths |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A developer can publish a listing with visibility, declared roles + scopes, OAuth defaults, media, and channel — and it appears in the store catalog for the right audience.
2. An operator can install the listing into an environment and receive a fully provisioned stack: instance record, roles/groups, OAuth client, derived domain, Stat property, and SDK snippet.
3. The installed app's SPA bootstraps via the public runtime context endpoint and learns everything it needs (auth domain, BFF domain, flags, client id, branding) without ever receiving a token.
4. Visibility tiers hold — out-of-tier listings are invisible; an audience change after publish is rejected.
5. Custom domains verify via TXT or CNAME before activation.
6. Env vars resolve once, are never logged, and never store plaintext.
7. Instance status is admin-manageable; uninstall is org+env scoped and event-announced.
8. Listing usage metrics flow from Stat aggregates into per-listing dashboards; daily telemetry counters exist.
9. Onboarding workflows (KYC, approval, document upload) run as Flow workflows with proxy-back steps and a manual-decision pause for approval.
10. All listing mutations are audit-journalled (same transaction) and event-announced (commit-atomic).

## 10. Open Business Questions

- Listing review/approval keeps the status field; a review workflow is justified when multiple operators need approval gates.
- Usage-based billing stays out of scope — metering rides Stat (usage metrics per listing).
- KYC/document Flow step wiring (capture = Storage upload, verification = Flow workflow) is the delegation contract; only the target wiring changes.


---

**Design attribution:** sentin8:app and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

