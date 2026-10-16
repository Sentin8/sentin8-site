---
title: "Sentin8:Func — Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-func/edit/main/BUSINESS.md
---
# Sentin8:Func — Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Func **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Func is the platform's **serverless WASM execution service**. It
executes user-authored and service-authored modules (compiled to
WebAssembly) with hard resource bounds — the one class of logic no
platform service owns. The business value it delivers:

- **User-defined logic without deployment.** Custom hooks, compliance
  rules, and tenant-authored functions need a host that runs them with
  hard resource bounds — no interpreter escape, no arbitrary syscalls.
  Tenants extend platform behavior without code deployments.
- **Event-triggered execution.** "Event first, API second": when a
  service needs a reaction no service owns, a trigger invokes a module
  — the hook receives a self-contained envelope (payload-completeness).
- **Determinism + safety.** The same module + input produces the same
  result (idempotency keys dedupe replays), and a malicious or buggy
  module cannot escape (linear memory only, fuel-based gas, no WASI
  filesystem/network).
- **Lifecycle discipline.** Modules move draft → active → deprecated; a
  broken binary can never receive traffic without passing validation
  and an explicit activation.
- **Per-environment control.** The WASM engine is feature-gated per env
  (platform default open, explicitly closable) — tenants decide
  whether untrusted code runs in their environment at all.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Module lifecycle | Upload (content-addressed, idempotent), list, get, delete (draft/deprecated only), validate (compile dry-run), activate (explicit promotion, supersedes) |
| Module identity | Content-addressed versions (`wasm_hash` verified server-side); identical re-uploads re-register the existing version; exactly one active version per (domain, product, env) |
| Execution | Per-hook execution under sandbox caps: fuel (100M instructions default), memory limiter (16 MiB), epoch + wall-clock timeout (5s default), 1 MiB response caps |
| Host functions | Built-ins (`log`, `util_now`, `util_date_add`, `util_round`) + dynamic imports proxy-backed to the owning service's internal API (2s timeout, 1 MiB cap) |
| Hook protocol | Versioned request/response contract (`HookRequest`, `HookResponse` with accept/reject + reject_reason + directives) |
| Execution idempotency | Optional `idempotency_key` with a `(module_id, hook, key)` dedupe table (TTL window) returning the cached response on replay |
| Feature gate | Per-env `sys.services` row; missing row = open (platform default); explicit disabled row closes the engine (409 on mutating endpoints) |
| Events | Lifecycle events (created/deleted/activated) through the local outbox |
| Observability | Fuel used + duration per execution; `func.execute` Stat metric (fire-and-forget) |
| Admin surfaces | RFW admin UI (overview, versions pages) + Shield policy-admin API |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| WASM source/toolchain | Uploads are compiled binaries (Rust/TS compile to WASM) |
| The hooks' business semantics | The owning service (proxy-back carries the domain logic) |
| Module blob storage | Sentin8:Storage (`func/{domain}/{id}.wasm`, content-addressed) |
| Trigger registration | Verticals declare `event_triggers` (Func's registration declares none — execution is API-triggered today) |
| Domain data access | Never direct — host functions are the only bridge (proxy-back to the owner) |

## 3. Business Capabilities

### 3.1 Module Lifecycle

| Capability | Business rule |
|---|---|
| Upload | Binary + language + hooks + parameters; Storage object written BEFORE the metadata row (best-effort rollback on failure — a row can never point at a missing object) |
| Content addressing | sha256 `wasm_hash` verified server-side; identical content re-registers the existing version (no duplicate storage) |
| Validation | Compile + import/hook checks without status change — a dry-run gate |
| Activation | Explicit draft → active; supersedes the previous active version (unique partial index enforces exactly one active per product) |
| Deletion | Draft/deprecated only; active modules must be deprecated first (no traffic teardown while serving); delete cleans row + cache + object |
| Hook vocabulary | Closed set (`pre_posting`, `post_posting`, `scheduled_event`, `activation`, `deactivation`); undeclared hook executions rejected |

### 3.2 Execution

| Capability | Business rule |
|---|---|
| Execute | `POST /v1/modules/{id}/execute` (or product's active version) with hook + args + optional callback config; fresh Store per invocation |
| Sandbox caps | Fuel, memory limiter, epoch + wall-clock timeout, 1 MiB response ceilings — a module cannot loop forever, exhaust memory, or return unbounded data |
| No WASI | Filesystem/network imports rejected at validate — no host escape |
| Import coverage | Non-builtin `env` imports must be declared in the callback's host-function map (validate-time or execute-time error) |
| Proxy-back | Host functions call the owning service's internal API; non-2xx results fail the execution (the error propagates) |
| Idempotency | Optional `idempotency_key` replays the recorded response within the dedupe window |
| Determinism | Same module + input → same result; timeouts abort deterministically (no partial commits) |

## 4. Business Events (Outbound)

Event family `func`; lifecycle events are best-effort post-commit (the
domain tx commits first).

| Event | When |
|---|---|
| `sentin8:func:module:created` | Upload (payload: module_id, language, hash) |
| `sentin8:func:module:activated` | Activation / supersedes |
| `sentin8:func:module:deleted` | Deletion |

**Inbound (consumed):** policy hot-reload SSE (Shield engine refresh);
execution is API-triggered today (e.g. Flow's `BasicStep` hooks, posting
hooks from verticals).

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **Sandbox hard caps**: fuel, memory limiter, epoch + wall timeout, 1 MiB response caps — a module cannot DoS the platform.
2. **No WASI** — no filesystem/network escape; imports are restricted to builtins or declared host functions.
3. **Hook vocabulary is closed** — uploads reject unknown hooks; execution requires the exact export signature.
4. **Object-before-row** — Storage put is idempotent and precedes the metadata row; orphaned objects (not rows) are the only possible inconsistency.
5. **One active version per (domain, product, env)** — enforced by partial unique index; active modules are undeletable.
6. **Two-phase promotion** — validate (dry-run) then activate; traffic never routes to unverified binaries.
7. **RLS discipline** — context set on the same transaction; the feature-gate query is schema-qualified (the role's search_path is `func, public`).
8. **Feature gate defaults OPEN** — a fresh env is not broken by a missing gate row; an explicit disabled row closes the engine.
9. **Bounded responses** — module JSON and proxy-back bodies are brace-scanned with a 1 MiB ceiling before parse.
10. **Only the module owner (or admin) may upload/activate/delete** — Shield decides (no handler scope checks).
11. **No `unsafe` code** — sandboxing is Wasmtime's; host functions are the only bridge to platform data.

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Func |
|---|---|
| Tenant developer | Authors compliance rules / custom hooks in Rust or TS; compiles to WASM; uploads, validates, activates |
| Vertical service | Registers posting hooks / custom reactions; supplies the proxy-back host-function map for domain data |
| Sentin8:Flow | Invokes modules as workflow steps (BasicStep hooks) |
| Platform operator | Manages module versions via the RFW admin UI; closes the WASM engine per env via the feature gate |
| Compliance/audit | Reads module lifecycle events and execution metrics (fuel/duration) |

## 7. KPIs / Success Criteria

- **Safety**: zero sandbox escapes (enforced by construction: fuel + memory + epochs + no WASI); bounded responses.
- **Determinism**: identical inputs produce identical results; replays dedupe within the window.
- **Lifecycle discipline**: no unverified binary ever serves; exactly one active version per product; active modules never torn down mid-traffic.
- **Cost visibility**: fuel + duration per execution as metrics; per-tenant gas pricing derives from them.
- **Control**: the engine is feature-gated per env; defaults open, explicitly closable.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:Storage | Module blob storage (content-addressed objects; M2M DCR client) |
| Sentin8:DB (PostgreSQL) | `func.modules` metadata, outbox, audit journal (RLS-enforced) |
| Sentin8:Auth | Bearer verification; M2M identity for Storage + proxy-back |
| Sentin8:Bus | Lifecycle event publication via the local outbox relay |
| Owning services | Host-function proxy-backs (the only domain-data bridge) |
| Sentin8:Sys | Feature gate (`sys.services` per-env enabled row) |
| Shield (Sentin8:Policy) | `func:write` / `func:execute` / admin gates |
| Wasmtime (embedded) | The sandbox runtime (fuel, limiter, epochs) |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A tenant can upload a compiled module; identical content re-registers the same version; validation catches malformed binaries before any traffic.
2. Activation is explicit and supersedes; exactly one active version serves per product.
3. Execution runs under fuel/memory/timeout caps; a non-terminating module dies deterministically with a structured error.
4. A module can access domain data ONLY via declared host functions that proxy-back to the owning service — and never the filesystem or network.
5. Idempotent executions replay the recorded response within the dedupe window.
6. The feature gate closes the engine per env (409 on mutating endpoints); a fresh env defaults open.
7. Active modules cannot be deleted; deletion cleans the metadata row, cache, and Storage object.
8. Lifecycle changes emit events; executions emit fuel/duration metrics.
9. All admin surfaces work via the RFW UI with proper gates; `target_env_id` is always explicit.

## 10. Open Business Questions

- Per-hook traffic splitting between module versions (beyond the active-version pointer).
- WASI preview 2 adoption when the proxy-back host interface needs it.
- Module signing signs module blobs at upload (publisher key stored as a secrets reference).
- The directive contract is a versioned union (`kind` + payload) documented in the README.


---

**Design attribution:** sentin8:func and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

