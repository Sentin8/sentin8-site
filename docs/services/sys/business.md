---
title: "Sentin8:Sys - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-sys/edit/main/BUSINESS.md
---
# Sentin8:Sys - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Sys **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Sys is the platform's **control plane**. It owns the tenant
registry (organizations, environments, app instances), service
enablement, memberships and invitations, tenant branding, the
hostname→instance resolver, the platform bootstrap surface, and the
canonical audit trail. The business value it delivers:

- **One tenant registry.** Orgs, envs, and app instances are
  platform-level facts every service needs at request time (tenant
  resolution, branding, feature gating); they live in `sys.*` tables
  owned by exactly one service.
- **Zero compile-time vertical knowledge.** Sys knows nothing about
  bank8, hotel8, or any other vertical - verticals register their admin
  scopes, services, error codes, and listings at runtime
  (`vertical enroll`); sys only persists and serves them.
- **Authorization is data, not code.** Shield policy sets, ReBAC
  relation tuples, and ABAC attributes are sys-owned rows per
  environment; per-service engines load and evaluate them. Sys is the
  durable substrate and the admin surface, not the evaluator.
- **Immediate usability.** An org/env exists the moment its creation
  call returns: the record, the access model, and the creator's
  membership are provisioned together in one request - the owner never
  waits for a background workflow, and a caller never has to retry
  because "the org isn't ready yet".

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Org lifecycle | Create (synchronous: record + full access model in one request), list, get, update, archive, delete - status machine active/suspended/archived |
| Env lifecycle | Create (synchronous, same contract), list, get, update, archive, delete - unique `(org, slug)`, optional auth domain |
| App instances | Hostname→app mapping, OAuth client id, feature flags, scope/service whitelists, auth-mode/group-gate, custom-domain verification |
| App-environment bindings | App↔env bindings with slug uniqueness |
| Service enablement | Per-env service enablement (`GET/PUT /v1/env/{id}/services`) - emits `sentin8:sys:service:updated` so verticals react event-driven |
| Memberships & invitations | List/remove memberships; invitations (create/list/revoke/accept) with one-time tokens, expiry, email-bound acceptance |
| Branding | Org-level base + env-level override; merged view (non-empty wins) |
| Hostname resolver | `GET /v1/resolve/hostname` + auth-domain, scopes, auth-mode endpoints (BFF, Auth, Proxy, TLS all consume these) |
| Bootstrap | `GET /v1/bootstrap` - the dash's first-screen data (orgs the caller can reach, via auth's live group listing) |
| Audit trail | `POST /v1/audit` (M2M ingest, service stamped from the verified client_id) + `GET /v1/audit` (admin query with keyset pagination); canonical rows + local retry journal |
| Shield substrate | `policy_sets`, `policy_relations`, `policy_principal_attrs` per (env, service) - storage + admin surface |
| Vertical registry | `GET /v1/verticals/services`, `GET /v1/scopes/catalog` (open, pre-login) |
| Notifications | Invitation mails via the local `post_outbox` queue (same transaction) + the `sys-post` pusher to Post's send API |
| Events | Durable lifecycle events (outbox → Bus) + best-effort MemBus `domain:changed` for resolver refresh |
| Admin surfaces | RFW admin UI + Shield policy-admin API |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Identity / token issuance | Sentin8:Auth (sys provisions through auth's membership API - never its tables) |
| Roles/groups storage | Auth-owned rows; sys is a writer through the owner's API |
| MemBus transport | Valkey (sys publishes post-commit, best-effort) |
| Vertical domain records | Runtime-registered (`vertical enroll`); sys persists and serves only |
| Long-running business workflows | Sentin8:Flow (step engine, retries, DLQ) - no sys lifecycle rides it |

## 3. Business Capabilities

### 3.1 Tenant Lifecycle (the flagship family)

| Capability | Business rule |
|---|---|
| Org creation | Synchronous: org record + access-model provisioning (roles/nesting/groups/creator membership) through auth's API complete before the response - 200 means the org is fully usable; a provisioning failure rolls the org back (500), so nothing half-created survives |
| Env creation | Same synchronous contract; per-env access model + optional auth domain; the env's platform policy template is seeded before its access model so the very first env-scoped call passes |
| Archive/delete | Archive is reversible-ish state; delete cascades |
| Idempotent provisioning | All provisioning writes are upserts - a caller retrying a failed create converges to the same access model without duplicates |

### 3.2 Memberships & Invitations

| Capability | Business rule |
|---|---|
| Membership listing/removal | Org-scoped; gated by `sys:read`/`sys:memberships:admin` |
| Invitations | Create/list/revoke/accept; one-time token + expiry; status machine pending → accepted/revoked |
| Email-bound acceptance | The token must carry the invited email (proof-of-possession); a mismatch is 403 |
| No fabricated groups | Acceptance assigns `sentin8:org:{org_id}:admins` through auth's API; a missing access model fails 409 - acceptance never invents groups |
| Acceptance atomicity | Status + group assignment + audit + event in ONE transaction |
| Invitation mails | Ride the local `post_outbox` in the same domain transaction; the `sys-post` pusher (10s loop) drains to Post - a Post outage never drops notifications |

### 3.3 Resolver, Branding, Enablement

| Capability | Business rule |
|---|---|
| Hostname resolver | Read-only, `sys:instances:read`-gated - tenant resolution data cannot be mutated through it |
| Branding merge | Env override → org base, non-empty wins; `merged` is read-only |
| Service enablement | Per-env toggles + config; every change emits `sentin8:sys:service:updated` - vertical services react event-driven (env-init pattern), the platform never special-cases them |
| MemBus invalidation | Post-commit `domain:changed` (org/env/app/branding scopes) so proxy/TLS resolvers refresh surgically; a Valkey outage degrades to their 30s safety poll - never fails the mutation |

### 3.4 Audit & Policy

| Capability | Business rule |
|---|---|
| Audit ingest | M2M-only (`audit:write`); `service` stamped from the verified DCR client_id - never caller-supplied; user tokens 403 |
| Canonical + journal | The ingest writes the canonical row AND a local journal row in one transaction - a downstream failure never loses the event |
| Audit query | Admin `audit:read` with `service`/`action`/`env_id` filters + keyset pagination; non-admins are forced to their own env |
| Shield substrate | Policy sets (origin platform/tenant, mode shadow/enforced, version), ReBAC relations, ABAC attributes per env; write-time validation; the admin surface manages them |
| Identity invalidation | `sentin8:sys:identity:updated` / `policy:updated` events (payload-complete) so consumers reload without callbacks |
| Bootstrap policy read | The SECURITY DEFINER `sentin8_boot_policy_load(service)` helper is the sanctioned cold-start read for NOBYPASSRLS engines |

## 4. Business Events (Outbound)

Event family `sys` (outbox-first, same transaction as the change):

| Event | When |
|---|---|
| `sentin8:sys:org:created/updated/archived/deleted` | Org lifecycle |
| `sentin8:sys:env:created/updated/archived/deleted` | Env lifecycle |
| `sentin8:sys:app:created/updated/archived` | App instance lifecycle |
| `sentin8:sys:binding:created/deleted` | Bindings |
| `sentin8:sys:service:updated` | Service enablement (the env-init trigger) |
| `sentin8:sys:membership:removed` | Membership removal |
| `sentin8:sys:invitation:sent/revoked/accepted` | Invitation lifecycle |
| `sentin8:sys:audit:recorded` | From BOTH the ingest API and every internal audit write - Stat's audit-volume aggregate sees the full platform volume |

Event family `policy`: `sentin8:sys:identity:updated`,
`sentin8:sys:policy:updated` (payload-complete envelopes).

Post-commit MemBus: `sentin8:sys:domain:changed` (ephemeral,
best-effort, scope-tagged).

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **Same-transaction context rule** - the RLS context and every statement of a write path share one explicit transaction; statements needing a different env re-set it inline.
2. **Outbox-first emissions** - event rows insert in the SAME transaction as the domain change; a failed emit never blocks the request.
3. **No cross-service DML** - sys holds no grants on `auth.*`; provisioning rides auth's API with the target-env header.
4. **Audit row env = caller env**; ingest stamps `service` from the verified M2M client_id only.
5. **Org/env lifecycle is synchronous** - provisioning completes before the response; a failure rolls the record back. No background steps, no settle windows on the caller's side.
6. **Invitation acceptance is email-bound** and never fabricates groups (missing access model → 409).
8. **Branding merge is layer-priority** (env override → org base, non-empty wins).
9. **Resolver endpoints are read-only** and scoped to `sys:instances:read`.
10. **Org access checks never join auth tables** - platform admins (scope `sys:sys:admin`), delegated tokens with matching env, or auth's live group listing (org-embedded group names).
11. **No migration paths** - schema changes land as fresh CREATE statements (greenfield).
12. **No `unsafe` code**; outbound calls ride DCR cert-bound identities (static tokens are dev-bootstrap only).

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Sys |
|---|---|
| Org owner/admin | Creates orgs and environments (synchronously provisioned with full access models - usable the moment the call returns); manages memberships and invitations |
| Platform operator | Enables services per env; manages app instances, bindings, branding; queries the audit trail; manages Shield policies |
| Invited user | Accepts an email-bound invitation and receives the org-admin role through the real provisioning flow |
| BFF / Proxy / TLS | Consume the resolver endpoints for tenant resolution (read-only, M2M-gated) |
| Vertical service | Reacts to `sentin8:sys:service:updated` events (event-driven env-init) - no compile-time coupling |
| Dash user | Bootstraps the first screen via `GET /v1/bootstrap` (orgs reachable via live groups) |
| Compliance/audit | Reads the canonical audit trail (service-stamped, correlation-indexed) |

## 7. KPIs / Success Criteria

- **Provisioning reliability**: org/env creation completes with its full access model or surfaces loudly - no silent orphans.
- **Tenant correctness**: the resolver always answers correctly (RLS-scoped reads; surgical invalidation + 30s safety polls).
- **Auditability**: every domain change is audited in-transaction; the ingest never trusts caller-supplied service names.
- **Extensibility**: a new vertical registers at runtime - the platform needs zero code changes.
- **Notification durability**: invitation mails survive Post outages (outbox + pusher retries).

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:Auth | Membership provisioning API; live group reads; bearer verification |
| Sentin8:Bus | Lifecycle event publication via the local outbox relay |
| Sentin8:Post | Invitation mails (local `post_outbox` → pusher → send API) |
| Valkey / MemBus | Post-commit domain-changed notifications |
| Shield (Sentin8:Policy) | Engines evaluate sys-owned policy rows; sys is the substrate |
| Sentin8:DB (PostgreSQL) | All `sys.*` tables (RLS FORCE) |
| Shell (platform) | Outbox relay, policy hot-reload, middleware, TLS listener, pool cap |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. An org owner can create an org and environment; the creation is synchronous and complete - record, access model (roles, groups, creator membership), and policy template all exist before the call returns, and any failure rolls back cleanly with a loud error.
2. The moment creation returns, the owner can act on the new org/env (read-your-writes): no background workflow, no "not ready yet" errors.
2. Invitations work end-to-end: create → email → accept (email-bound) → org-admin role assigned via the real provisioning flow; expired/revoked/mismatched invitations reject cleanly.
3. Membership listing/removal works org-scoped with proper gates.
4. Service enablement per env emits `service:updated` - a vertical service reacts and self-initializes without platform code changes.
5. The hostname resolver answers for BFF/Proxy/TLS with correct tenant data; branding merges env-over-org (non-empty wins).
6. The audit ingest accepts M2M events only, stamps `service` from the verified client, and never loses an event (canonical row + journal in one tx); the admin query filters and paginates.
7. Policy sets/relations/attributes are manageable via the admin surface with write-time validation and hot-reload.
8. `GET /v1/bootstrap` returns the caller's reachable orgs computed from live groups.
9. Vertical services and scope catalogs are served from runtime-registered data.
10. Every lifecycle change is event-announced durably (outbox) and resolver-invalidated promptly (MemBus + safety poll).

## 10. Open Business Questions

- The bootstrap surface stays platform-level by design; per-app dashboards are RFW pages served by the owning service.
- `GET /v1/scopes/catalog` stays open as a documented pre-login exception (gating it is the alternative posture if exposure concerns grow).
- `sys.app_environment_bindings` RLS policy is a known gap tracked in the platform backlog (single-role server reads today).


---

**Architecture & Design:** sentin8:sys and its underlying concepts were designed by [Hamid Jahanzad](https://www.linkedin.com/in/hamidjahanzad/).

