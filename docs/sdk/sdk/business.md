---
title: "sentin8 Rust SDK - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-sdk/edit/main/BUSINESS.md
---
# sentin8-sdk - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> the sentin8-sdk **does for the business**. For architecture read
> `README.md`; for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

- Every service ships with one proven, centrally maintained library set -
  security, boot, policy, and messaging patterns are implemented once and
  inherited everywhere.
- Teams build a service independently with one dependency pin - no
  platform checkout, no coordination, no version drift across the fleet.
- Security posture (post-quantum TLS, cert-bound machine identity, live
  role resolution, row-level tenant isolation) is uniform by construction.
- Platform observability (policy decisions, service metrics) works
  without any service writing integration code - it is inherited from the
  shared shell and policy engine.

## 2. Business Scope (What the SDK Provides)

| Capability | Business rule |
|---|---|
| Shared boot sequence (shell) | Every service starts with the same 10-step hardened boot - TLS, identity, policy, outbox relay, audit push - no per-service deviation possible. |
| Policy engine (Shield) | Authorization decisions (RBAC + ABAC + ReBAC) with roles resolved LIVE - role changes take effect on the next request, never wait for token expiry. |
| Machine identity (m2m) | Cert-bound service-to-service tokens - a stolen token without the private key is useless. |
| Database access (pg_pool) | Every PostgreSQL connection rides certificate identity - the workload's Acme-issued client pair authenticates the connection; no database password exists anywhere in the platform, and a misconfigured password-bearing DSN is rejected at startup (group DESIGN.md §3.2). |
| Message bus clients (bus plane) | Durable domain events (outbox → Bus) and ephemeral telemetry (MemBus Pub/Sub) with tenant isolation built in. |
| Declarative registration | A service self-describes its admin scopes, policies, event triggers, and recurring schedules - enrollment provisions everything; the platform never hardcodes a vertical's details. |
| Telemetry emission | Policy decisions and service metrics publish fire-and-forget; a monitoring outage degrades to logs and never blocks a business request. |
| Config derivation | Every URL/domain derives from one setting at runtime - no hardcoding, no per-environment code changes. |

### What the SDK does NOT own (business boundary)

| Concern | Owner |
|---|---|
| Service SDK crates (flow/cron/storage/… clients + contracts) | Each owning service repo (`sdk/` mini-facade) |
| Firing scheduled work | Sentin8:Cron |
| Telemetry ingestion, rollups, dashboards | Sentin8:Stat (+ consumers reading rollups) |
| Service binaries, registration data, business logic | Each service repo |
| Vertical facades | Retired - contracts live in owner service repos |

## 3. Business Capabilities

| Area | Capability | Business rule |
|---|---|---|
| Onboarding | Add a service by cloning one repo and pinning the SDK tag | The build fetches everything else; no platform checkout, no live DB (offline caches committed). |
| Authorization | Decisions centralized in Shield | Handlers declare actions; grants are data; auditors read one policy surface. |
| Observability | Decision/metric telemetry automatic | Zero integration code; loss on outage is acceptable by contract (non-important updates). |
| Scheduling | Recurring work declared, not coded | `schedules` in the service's registration; enroll provisions; Cron fires; no boot-time cross-service calls. |
| Change management | One version ring for the shared plane | SDK changes ship as tags; consumers bump pins at their own pace. |
| Cost | Compile scope honest | A repo compiles the shared plane + only the service SDKs it pins. |
| Data-plane security | Database connections are certificate-authenticated | A leaked DSN string grants nothing without the workload's private key; revocation is the identity map (`pgm` rows) + cert expiry - no password rotation program exists because no passwords exist. |

## 4. Business Events (Outbound)

| Event | When |
|---|---|
| MemBus frame `stat:telemetry` (policy decisions, service metrics) | Every policy decision; every shared metric emission |
| MemBus frames for rollup publication (existing `stat:metrics:*`) | TLS/traffic counters, error metrics (unchanged) |

Inbound: none (library plane).

## 5. Business Rules & Invariants

1. The shared plane never depends on a service - the fleet's dependency
   pyramid points one way.
2. Telemetry is fire-and-forget: a telemetry outage never fails a business
   request.
3. Role changes take effect on the next request (live resolution).
4. Tenant isolation is a property of the message key, never of the
   payload - frames cannot leak across environments.
5. The facade exposes the shared plane only; service clients import from
   owner repos.
6. No legacy naming survives: one import shape, one facade, vendor names
   only in the lockfile.

## 6. Target-User Roles & Use Cases

| Persona | Use case |
|---|---|
| Service developer | Build one repo with one pin; inherit boot/security/telemetry. |
| Platform architect | Change the shared plane once, tag, and let consumers adopt. |
| Security auditor | One policy engine, one identity pattern, uniform audit journaling. |
| Operator | Fleet boots health-gated with no cross-service boot-time registration races. |

## 7. KPIs / Success Criteria

- SDK builds clean, zero warnings.
- No service repo compiles service SDK crates it does not pin.
- Zero `{leaf}-policy` DCR workloads across the fleet (per-process M2M
  registrations eliminated).
- Telemetry publish adds µs-class cost; zero added business-request
  failures on Valkey outage.

## 8. Dependencies & Reliance on Other Services

- The SDK plane relies on **Valkey** for MemBus (telemetry class) -
  degradation is log-only.
- It relies on **Sentin8:Auth** at runtime (JWKS via auth-client) -
  existing posture unchanged.
- Consumer repos rely on the SDK tag plus any per-service sdk tags they
  pin.

## 9. Acceptance Criteria

1. Workspace = 24 crates; no `sdk-crates/` members remain.
2. Facade compiles without service modules or legacy client types.
3. `--print-registration --section=schedules` round-trips `ScheduleDecl`.
4. Fleet boot smoke: no cron self-registration logs; schedules present
   after enroll.
5. All consumer repos build against the new pin with import-first-segment
   changes only.

## 10. Open Business Questions

- Whether per-service sdk tags need a bump-bot for consumer adoption
  visibility - deferred to aggregation CI.

---

**Design attribution:** sentin8 and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

