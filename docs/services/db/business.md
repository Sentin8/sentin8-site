---
title: "Sentin8:DB - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-db/edit/main/BUSINESS.md
---
# Sentin8:DB - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:DB **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:DB is the platform's **structured-persistence service** for dynamic,
tenant-isolated data. Verticals and apps that need ad-hoc structured
storage - without designing their own physical schema - create logical
tables through it, and every table ships with the platform's full
tenant-isolation guarantees by construction. The business value it
delivers:

- **Data storage without a schema engineer.** A caller defines a logical
  table (name + typed columns) and immediately gets a full CRUD data API
  with JSON documents plus typed columns, soft deletes, and optimistic
  concurrency.
- **Tenant isolation by construction.** Every dynamic table is created
  per environment with `ENABLE + FORCE` row-level security and exactly
  four env-scoped policies - a table cannot be created unsafe, and a
  posture surface detects drift if anyone tries.
- **One persistence plane.** Direct PostgreSQL access from domain services
  is prohibited; Sentin8:DB centralizes connectivity, credentials, and
  the tenant-context discipline (the single most important invariant in
  the platform's data layer).
- **No BYPASSRLS anywhere.** The service role is NOBYPASSRLS; explicit
  `WHERE env_id` clauses are defense-in-depth on top of RLS.
- **Full DDL accountability.** Every create/alter/archive/drop/restore is
  audit-trailed with actor and detail, and lifecycle events flow through
  the durable outbox.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Table lifecycle | Create, list, get, alter (add columns), archive, drop (pending_delete → physical DROP), restore - logical↔physical registry with lifecycle statuses |
| Dynamic tenant tables | Per-env physical tables (`sentin8_db_{env8}_{logical}`) with system columns (id, env_id, data JSONB, timestamps, `resource_version`, `deleted_at`) + user-typed columns; mandatory RLS |
| Data API | Query (scalar filters, declared-column sorts, limit ≤ 1000, keyset pagination), insert, update, delete (soft-delete only), optimistic concurrency via `resource_version` |
| Posture surface | RLS drift detection per table (not enabled, not forced, missing policies) |
| DDL audit trail | Append-only `ddl_audit` - one row per DDL operation with actor + detail |
| Admin surfaces | RFW admin UI (overview, tables/new form, posture, audit, settings) + Shield policy-admin API |
| Events | Outbox-first lifecycle events (`sentin8:db:table:*`) - same transaction as the DDL |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Business schema design | Callers define their own tables/rows (DB provides the machinery) |
| Free-form SQL execution | **Prohibited by design** - there is no arbitrary SQL endpoint; the surface is tables + data CRUD + posture |
| Identity | Sentin8:Auth (bearer verification via the shared SDK) |
| Shield policy storage | Sentin8:Sys (`policy_sets` substrate; DB runs an engine on it) |
| Database/table creation for the platform | `sentin8-cli db bootstrap` / `vertical init` (services start on existing schemas) |

## 3. Business Capabilities

### 3.1 Table Lifecycle (DDL)

| Capability | Business rule |
|---|---|
| Create | Logical name + column definitions; identifiers sanitized; the physical table is created with RLS FORCE + 4 env policies - an unsafe table cannot exist |
| Registry | `table_registry` maps logical ↔ physical names per env; uniqueness enforced (409 on collision) |
| Alter | Adds columns only |
| Archive / restore | Archived tables can be restored to active |
| Drop | Two-phase: `pending_delete` → physical `DROP TABLE … CASCADE`; a failed drop rolls the registry status back in-transaction |
| Reuse | Prior `dropped` rows for a logical name are purged on re-creation |
| DDL atomicity | DDL + registry row + audit row + outbox event commit atomically; event-emit failure aborts the change |

### 3.2 Data API (CRUD)

| Capability | Business rule |
|---|---|
| Query | Scalar filters on declared columns, declared-column sorts, `limit` default 100 / max 1000; keyset pagination (`pagination.after` UUID cursor takes precedence over offset, order pinned to `(sort, id)`, `next_cursor` returned) |
| Insert / update | Typed columns win over the JSONB `data` document in responses |
| Delete | Soft-delete only (`deleted_at` set); queries exclude deleted rows; physical removal only via the drop flow |
| Optimistic concurrency | Optional `resource_version` predicate on update/delete; automatic increment on mutation |
| Reserved columns | System columns (`id, env_id, data, created_at, updated_at, resource_version, deleted_at, usr_id, visibility`) are never writable or filterable through the API |
| Injection safety | Only sanitized identifiers interpolate; values are always bound parameters |
| Cross-env safety | `target_env_id` explicit (400 when missing); cross-env targeting requires platform admin or RBAC membership; foreign-env ids 404 (never 403 - no existence leak) |

### 3.3 Posture & Audit

| Capability | Business rule |
|---|---|
| Posture checks | Per-table RLS drift flags: `rls_not_enabled`, `rls_not_forced`, `missing_policies` (< 4) |
| DDL audit | Append-only trail with actor, scope, and detail per operation |
| Deny auditing | Shield denials land in the audit journal (fire-and-forget, context set first) |

## 4. Business Events (Outbound)

Event family `db`; outbox-first (same transaction as the DDL - commit-atomic).

| Event | When |
|---|---|
| `sentin8:db:table:created` | Table created (payload: id, table_name) |
| `sentin8:db:table:altered` | Columns added (payload: id, columns_added) |
| `sentin8:db:table:archived` | Table archived |
| `sentin8:db:table:dropped` | Physical drop completed |

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **RLS context is set inside the same explicit transaction as the statement** - a bare-pool statement filters to 0 rows (fail-closed, test-pinned).
2. **Every dynamic tenant table ships `ENABLE + FORCE RLS` + exactly 4 env policies** - posture endpoints detect drift.
3. **Explicit `WHERE env_id = $N` on every query in addition to RLS.**
4. **Soft-delete only** for data; physical removal only via the drop flow.
5. **Reserved columns are never writable/filterable**; identifiers sanitized before interpolation; filter values scalar-only.
6. **Optimistic concurrency** via `resource_version` (optional predicate, auto-increment).
7. **Registry + audit + event commit atomically with the DDL** - event-emit failure aborts the domain change.
8. **`env_id` on the wire is never trusted for identity filters** - the RLS context and token env are authoritative.
9. **The service role carries NO BYPASSRLS.**
10. **No free-form SQL** - the prohibition is the security posture, documented as such.
11. **No `unsafe` code**; all dynamic SQL interpolation is limited to sanitized identifiers.

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:DB |
|---|---|
| Vertical developer | Creates logical tables for dynamic/domain data; uses the CRUD data API instead of designing physical schemas |
| App developer | Stores per-env app data with tenant isolation guaranteed by construction |
| Platform operator | Monitors posture (RLS drift), reviews the DDL audit trail, manages tables via the RFW admin UI |
| Compliance/audit | Reads the append-only DDL audit and lifecycle events |

## 7. KPIs / Success Criteria

- **Isolation**: cross-tenant reads are impossible (RLS + explicit clauses + fail-closed context); tested end-to-end in both directions.
- **Safety-by-construction**: no table can be created without RLS; drift is detected and visible.
- **Data integrity**: soft deletes preserve history; optimistic concurrency prevents lost updates.
- **Accountability**: every DDL is audit-trailed and event-announced atomically.
- **Operability**: posture and audit surfaces replace psql archaeology during incidents.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:DB (PostgreSQL) | Physical persistence (dynamic tables, registry, audit, outbox) |
| Sentin8:Auth | Bearer verification (JWKS); M2M identities for callers |
| Shield (Sentin8:Policy) | `data:read`/`data:write`/`table:admin`/`posture:read` gates (live roles) |
| Sentin8:Bus | Lifecycle event publication via the local outbox relay |
| Shell (platform) | Outbox relay, middleware, TLS listener, pool cap (≤ 3), PG18 enforcement |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A caller can create a logical table with typed columns and immediately query/insert/update/soft-delete rows through the data API.
2. Every created table carries RLS FORCE + 4 policies; the posture surface reports zero drift on healthy tables and flags any drift precisely.
3. Cross-tenant access is denied end-to-end: env B sees 0 rows from env A; a context-less transaction sees 0 rows; foreign-env table ids 404.
4. DDL operations (create/alter/archive/drop/restore) are audit-trailed with actor + detail and emit commit-atomic lifecycle events.
5. Queries support filters, sorts, bounded limits, and keyset pagination with `next_cursor`.
6. Soft-deleted rows disappear from queries but remain physically present until a drop.
7. Optimistic concurrency rejects stale updates via `resource_version`.
8. Reserved/system columns cannot be written or filtered through the API; identifiers are sanitized.
9. All admin surfaces (tables, posture, audit, settings) work via the RFW admin UI with proper gates.

## 10. Open Business Questions

- Read-replica routing is deferred until multi-node deployment (a pool-level routing option, not a per-statement contract).
- Statement timeouts are set per acquired connection from the request class (interactive 5s, batch 60s) - one `SET LOCAL` in the tenant transaction.
- Row-level audit includes affected row ids in the existing audit envelope's `resource`/`resource_id` fields - no new audit surface.


---

**Architecture & Design:** sentin8:db and its underlying concepts were designed by [Hamid Jahanzad](https://www.linkedin.com/in/hamidjahanzad/).

