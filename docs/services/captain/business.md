---
title: "Sentin8:Captain - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-captain/edit/main/BUSINESS.md
---
# Sentin8:Captain - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Captain **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md` (§11 = the multi-host fleet plane).

## 1. Business Purpose

Sentin8:Captain is the platform's **process supervisor and fleet
orchestrator**. One captain runs per machine; it spawns, monitors,
scales, restarts, and drains every Sentin8 service on its host, maintains
the shared fleet registry (what runs where, in which version/build), owns
first-boot bootstrap enrollment, provides load-based scale-out/in plus
machine auto-provisioning, and - on the fleet plane (DESIGN §11) - places
services on OTHER machines (remote spawn) under declarative placement
rules. The business value it delivers:

- **One supervisor per machine, one source of truth per fleet.** The
  Valkey registry (`captain:*` keys) is the authoritative view of what is
  running where; without it, Proxy's SNI routing and the upgrade flow have
  no target list.
- **Rolling upgrades with zero downtime.** `upgrade-instance` starts a new
  instance, waits for its health to turn `Active`, drains the old one
  (gauge-polled, capped), then stops it - the swap happens while traffic
  flows.
- **Scaling needs telemetry, not guesses.** Host samples (procfs or, on
  container fleets, cgroup v2) drive machine provisioning; idle tracking
  drives scale-in; both are bounded by storm guards.
- **The chicken-and-egg of first boot.** A brand-new workload holds no
  certificate and no token; the captain mints its identity at spawn time
  (bootstrap enrollment secret) so acme can issue its first client
  certificate - no matter which machine the workload landed on.
- **Self-healing fleet.** Dead or unresponsive instances are detected,
  killed, and respawned with backoff - with alerts at the restart cap so
  operators always see fleet failures.
- **Placement is declarative, not tribal.** `pin:`, `anti:`, and the
  fleet `singleton` flag in the catalog express where a service may live;
  the fleet enforces them at every spawn site (a violation is a structured
  refusal, never a wrong-machine spawn).

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Process supervision | Spawn (tiered, priority-ordered, health-gated), stop, adopt-orphan reconcile at boot, self-heal with backoff (max 3 restarts → alert) |
| Fleet registry | Valkey-backed registry (`captain:svc:*`): instance records (pid, status, version + build hash, metrics, restarts, api calls), pub/sub change notifications for proxy/TLS resolvers |
| Health monitoring | Per-instance health probes, status machine (Starting → Active → Inactive → Stopping → Stopped / Killed), traffic eligibility = Active + fresh health |
| Rolling upgrades | Zero-downtime swap: reserve port → start new → wait Active → stability window → drain old (gauge-polled) → stop; abort/rollback paths |
| Control surfaces | HTTP API (Shield-gated) + UDS local control channel (`SO_PEERCRED`); SSE streams for upgrade/startup/shutdown progress || Autoscaling | In-machine scale evaluation (inert by pins + storm guard); machine provisioning (OpenTofu) behind leader lock with auto/manual/never profiles; LIFO scale-in that never retires the base |
| **Fleet plane (DESIGN §11)** | **Placement enforcement at every spawn site; remote spawn (`POST /v1/captain/instances`) driven by the autoscaler leader's `captain-remote` M2M workload or the operator's `captain place`; fleet enrollment publication so any machine's acme verifies any machine's first-boot claim; OpenTofu module kit (docker/cloud/hypervisor); graceful-leave deprovision** |
| Autoscaler approvals | Pending-request queue; operators approve/reject scale decisions from the RFW UI |
| Bootstrap enrollment | Sealed enrollment record (AES-256-GCM, 0600, TTL re-stamped) brokered to workloads + acme so first-boot mTLS issuance works |
| Metrics | procfs/cgroup sampling (CPU/RSS/FDs), per-instance traffic counters, host samples (saturation annotation) |
| Fleet readiness | Ungated readiness endpoint (every catalog type has minimum Active instances) |
| Failure visibility | `GET /v1/captain/alerts` - the CURRENT give-up set; `make status` / `captain services` print it as theMANUAL INTERVENTION REQUIRED block after the instance table (services parked at give-up appear in NEITHER view - their registry row is deleted), so a failed service is visible from one command |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Services' runtime behavior | each service (captain supervises processes, not business logic) |
| M2M identities | each child self-registers via DCR (auth) |
| TLS termination | in-process per service (sentin8-tls) |
| App registry / event routing | Sentin8:App / Sentin8:Bus |
| PostgreSQL tables | none owned - the DB is only the Shield policy substrate |
| OS-level watchdogging | the OS supervisor's job (the monitor never kills captain itself) |
| Machine creation modules' internals | OpenTofu + provider credentials (the operator's `sentin8_env_file` is materialized by the module, never stored by captain) |

## 3. Business Capabilities

### 3.1 Supervision & Fleet Registry

| Capability | Business rule |
|---|---|
| Spawn | Tier-sorted startup (captain → acme → auth/proxy → bus → data plane → sys/app → bff/web); each tier health-gates on the previous tier's `Active` (bounded, warn-degrade) |
| Registry | Instance records keyed `{ip}:{port}`: pid, status, version + build hash (`{version}.{build_hash}` - operators verify WHICH binary runs), metrics, restarts |
| Change notifications | `captain:changed` pub/sub consumed by proxy/TLS resolvers - routing updates automatically |
| Orphan adoption | At boot, children running the expected binary are adopted (no duplicate spawns); foreign binaries are SIGTERMed |
| Readiness | Ungated readiness: 200 when every catalog type has ≥ minimum Active instances |
| Machine lock | One captain per machine (TTL lock + PID file, dead-pid steal) |
| Self-protection | The control API never targets the captain's own row (409) - captain restart is `sentin8-cli captain restart` only |

### 3.2 Health & Self-Healing

| Capability | Business rule |
|---|---|
| Health probes | Fresh-state probe clients with retry-once on a stale pooled connection; kill log carries the last probe's error string |
| Status machine | Starting → Active (first healthy probe) → Inactive (drain) → Stopping → Stopped; Killed on dead pid / probe-failure streak (≥3 → SIGKILL) |
| Self-heal | Respawn with backoff (1,2,4,… cap 16s) up to `MAX_RESTARTS=3`; at cap → structured alert + registry row deleted |
| TLS warm-up grace | A LIVE service whose probes fail because its on-demand server cert has not landed yet (TLS refusal / no connect during warm-up) is NOT probe-killed for `SENTIN8_CAPTAIN_CERT_GRACE_S` seconds since start (default 120s; `SENTIN8_CAPTAIN_CERT_GRACE_S=0` disables) - fleet-wide cold starts and upgrades stop mass-killing freshly spawned services behind a saturated cert-mint storm. A non-2xx HTTP answer is never masked - a broken-but-listening service still gets killed like before; failures persisting past the grace window count again |
| Alert-and-recover give-up | A give-up is never a permanent park: one slow respawn attempt per `SENTIN8_CAPTAIN_LAST_RESORT_RESPAWN_S` seconds (default 300s; `0` restores manual-intervention-parked) re-spawns alerted services through the normal start path until one reaches `Active` (which clears the alert). The alert stays raised the whole time - recovery never hides the crash loop |
| Grace | Probes skip instances < 15s old (slow-start grace) |
| Traffic eligibility | Only `Active` + fresh (< 30s) health receives traffic |
| Monitor safety | The monitor never kills captain itself - a busy management window must not orphan the fleet |

### 3.3 Rolling Upgrades (zero-downtime swaps)

| Capability | Business rule |
|---|---|
| Upgrade sequence | Reserve port atomically and HOLD it (TTL 60s) → spawn new → wait Active (≤120s) → 60s stability window → drain old (active-connections gauge, ≤30s cap) → stop → stable-under-load 60s → complete. Parallel upgrades never collide on a port |
| Abort | New instance never Active or unstable → stop + delete THAT service's row (matched on service type + port, never port alone); old instance stays Active; reservation released |
| Rollback | Old instance lost Active during drain → re-mark Active → `rolled_back` |
| Single-flight | Progress published under both the old and the new instance key (10-min TTL); the monitor skips self-heal for EITHER key during the run |
| Progress visibility | SSE streams; phases `starting/spawned/active/stable/draining/complete/aborted/rolled_back` |
| Profile rule | No mixed debug/release fleets - children spawn from captain's own binary prefix; switching profiles requires stop + start |

### 3.4 Scaling & Provisioning

| Capability | Business rule |
|---|---|
| In-machine scaler | Deliberately inert: busy/idle/machine constants pinned to never-scale values; a guard test pins the exact numbers so a silent retune fails the build |
| Retune procedure | Enabling scaling is one reviewed commit: constants + guard test + docs + rebuild/roll (no runtime knob) |
| Storm guard | Max one instance per service type per tick |
| Machine provisioning | Leader lock + cooldown; saturation ≥60s sustained + in-machine scaling exhausted + fleet < max + cooldown elapsed → provision; profiles `auto`, `manual` (queue → approval), `never`; unknown values fail safe |
| LIFO scale-in | Sustained idle (≥600s) + fleet > min → newest machines leave first; the base machine is never deprovisioned |
| Approvals | Pending queue (`captain:provision:pending`, 1h TTL); approve/reject from the RFW UI |
| Remote-spawn-first | Before provisioning a NEW machine, the leader tries placing the busy service on an EXISTING machine (least-loaded, placement-admitting) - a new machine is spun only when no existing machine can host the workload |
| Deployment trimming | `SENTIN8_SERVICES` picks the per-machine service subset - a machine boots exactly the services its placement allows |

### 3.5 The Fleet Plane (DESIGN §11 - multi-host)

| Capability | Business rule |
|---|---|
| Placement | Declarative catalog data: `pin:{ip}` (incl. the operator-resolved `pin:edge` pseudo-IP via `SENTIN8_CAPTAIN_EDGE_IP`), `anti:{service}`, and the fleet `singleton` flag; enforced at boot spawn, `start-services`, scaler scale-up, AND remote spawn - one gate, four call sites; malformed keys fail safe to unconstrained |
| Fleet singletons | `sentin8:acme` (the CA plane must never fork) and `sentin8:proxy` (one :443 ingress) have at most one live instance anywhere in the fleet; a second spawn is refused with `singleton_violation` |
| Remote spawn | `POST /v1/captain/instances` (body = service types only) on a target machine's captain; called by the autoscaler leader with the cert-bound `captain-remote` M2M workload (`sentin8:captain:instances:write`) or the operator's `captain place`; the target's placement gate is the authority (409 with the reason) |
| Hand placement | `sentin8-cli captain place --ip=<machine> <services>` - operators place services explicitly; refusals surface the placement reason |
| Fleet enrollment | Every captain re-publishes its current enrollment record to `captain:enrollment:{ip}` (TTL 120) each tick; acme verifies first-boot claims against the fleet on a local-record miss - a workload on ANY machine mints against the fleet-singleton acme |
| Machine provisioning modules | OpenTofu module kit (`docker` dev backend with macvlan + per-container IPs, AWS `cloud`, Proxmox `hypervisor`; operator-authored for bare-metal); the module owns full bring-up and exposes `new_ip` |
| Operator env contract | `SENTIN8_CAPTAIN_MACHINE_ENV_FILE` content becomes the machine's `/etc/sentin8/sentin8.env` (sensitive; never logged) - DSNs, master keys, domain travel once at provision time |
| Graceful leave | Deprovision calls the target captain's `/v1/captain/shutdown` (best-effort, 10s) BEFORE destroying - services stop, rows delete, the fleet stays consistent; an unreachable machine is destroyed anyway (records age out by TTL) |
| Container telemetry | `SENTIN8_CAPTAIN_TELEMETRY=cgroup` (docker backend) reads the container's OWN cgroup v2 accounting - sibling containers no longer saturate in lockstep |

### 3.6 Bootstrap Enrollment (first-boot identity)

| Capability | Business rule |
|---|---|
| Enrollment secret | 32-byte random secret, AES-256-GCM sealed with the bootstrap master key, file 0600 |
| TTL re-stamp | Re-sealed BEFORE every TTL expiry by the monitor loop; the secret NEVER rotates (rotation would orphan live first-boot claims) |
| Scoping | Can mint only `m2m-*` client certificates - never TLS server leafs; first-boot mints logged at warn |
| Freshness | Acme verifies claims against the CURRENT record (sealed file first; fleet records on the multi-host miss path) - never a spawn-time env copy |
| Cleanup | Cleared on graceful shutdown |
| Env propagation | Children receive a deliberate allowlist - never Acme CA private-key paths |

## 4. Business Events (Outbound)

Captain emits **no Bus domain events**. Its publish surface is the
`captain:changed` pub/sub channel (consumed by proxy/TLS resolvers).
Alerts are structured tracing events: `captain.service.failed`,
`captain.service.bind_failed`, `captain.scale.capacity`,
`captain.provision.dry_run` (and the fleet-plane refusals
`pin_mismatch` / `anti_violation` / `singleton_violation`).

**Inbound (consumed):** `stat:rollups:day` (daily counter reset
subscriber); traffic counters from the shared metrics channel.

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **One captain per machine** - machine lock + PID file; one autoscaler
   leader per fleet (lock TTL 30).
2. **Only `Active` + fresh-health instances serve traffic.**
3. **The supervisor never targets its own row** - captain restart is the
   CLI-only exception.
4. **The monitor never kills captain itself.**
5. **Never-scale thresholds keep the in-machine scaler inert**;
   provisioning is the only real scale lever and is opt-in; retuning is
   one reviewed change.
6. **LIFO scale-in never retires the base instance/machine.**
7. **No mixed debug/release fleets.**
8. **The enrollment secret never rotates mid-fleet** (re-stamp only); the
   fleet key is a read model of the sealed record - the file stays
   authoritative on the machine that owns it; Acme CA private-key paths
   are never propagated.
9. **Children own their process groups** - captain death cannot cascade.
10. **A port belongs to exactly one live instance** (reservation-held
    upgrades; service-type+port matching; BindFailed terminates
    non-retryably).
11. **Consecutive restarts are never erased by a respawn.**
12. **A crash-loop give-up never parks silently forever** - the alert
    stays raised until `Active`, and (unless explicitly disabled) the
    last-resort respawner keeps one slow, paced re-attempt per interval;
    every re-attempt rides the same placement-gated start path as an
    operator action, never a manual process launch.
13. **The TLS warm-up grace never masks a real failure** - a non-2xx
    HTTP answer and any failure persisting past the grace window count
    toward the kill exactly as before; only cert-fetch-warm-up signals
    on a LIVE process are forgiven, and only inside the window.
14. **Placement is enforced at every spawn site** - there is no spawn
    path that bypasses the gate; fleet singletons never fork.
15. **The remote-spawn wire carries service types only** - no binary
    path, port, env, or command crosses the wire.
16. **Machine provisioning is remote-spawn-first** - a new machine is
    provisioned only when no existing placement-admitting machine can
    host the workload.
17. **No `unsafe` code.**

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Captain |
|---|---|
| Platform operator | Boots the fleet, watches the registry, performs rolling upgrades, approves/rejects scale decisions, hand-places services (`captain place`) |
| Dev/test operator | Runs `make fleet-up` for a multi-machine docker-backend dev fleet (macvlan prerequisites per `tofu/README.md`) |
| Vertical service team | Registers its captain catalog entry at runtime (`catalog.json` + `SENTIN8_CAPTAIN_CATALOG_PATHS`) with placement keys where the service demands them |
| First-boot workload | Presents the enrollment claim to acme (any machine's workload); obtains its mTLS client certificate; self-registers via DCR |
| Compliance/audit | Reads structured alerts and kill logs; the enrollment channel's mints are always warn-logged |

## 7. KPIs / Success Criteria

- **Fleet availability**: rolling upgrades complete with zero dropped
  traffic; self-heal keeps instances alive; readiness gates registration.
- **Truthfulness**: the registry always reflects reality (version + build
  hash per instance).
- **Safety**: the scaler stays inert unless deliberately retuned;
  provisioning requires approval by default (`manual`) or an explicit
  operator-chosen backend; the base machine is never deprovisioned;
  placement singletons never fork the CA or the ingress.
- **First-boot reliability**: a brand-new workload always obtains its
  identity (enrollment → cert → DCR) without human intervention - from
  any machine in the fleet.
- **Operability**: every kill is auditable; upgrades are observable and
  reversible; placement refusals carry their reason, never silent; the
  give-up set is one command away (`make status` prints the
  manual-intervention block).

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Valkey | Fleet registry, machine lock, upgrade keys, port reservations, autoscaler leader lock + queues, enrollment publication, pub/sub |
| Sentin8:Auth | Shield-gated control API; the `captain-remote` M2M workload's cert-bound token (remote spawn) |
| Sentin8:Acme | First-boot client-certificate issuance (the enrollment claim's consumer) |
| Sentin8:Stat | Daily rollup counters; traffic counters driving scale decisions |
| Shield (Sentin8:Policy) | `sentin8:captain:admin` + `sentin8:captain:instances:write` evaluation |
| OpenTofu + the module kit | Machine provisioning backends (opt-in, behind the leader lock) |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A fresh machine boots the full fleet in priority tiers; every service
   reaches `Active`; readiness reports 200 only when minimums are met.
2. `make status` shows every instance with its version + build hash - a
   stale binary is visible.
3. `make upgrade-instance` swaps an instance with zero dropped traffic;
   abort and rollback leave the old instance serving.
4. A dead instance self-heals with backoff; at the restart cap the
   operator gets a structured alert; the alert clears when the service
   recovers, and (with the respawner enabled) a crash-looped service
   left behind after a storm self-recovers without an operator having
   to read the alert first.
4b. A fleet-wide cold start or upgrade storm does NOT mass-kill
   freshly spawned services that are merely waiting for their first
   server certificate - the TLS warm-up grace covers them, and real
   unhealthy services (HTTP-layer failures, warm-up persisting past the
   window) are still killed on the normal schedule.
5. A first-boot workload obtains its mTLS client cert via the enrollment
   claim - including a workload on a provisioned machine (fleet
   enrollment) - and completes DCR with no manual steps.
6. The scaler never fires unless deliberately retuned; provisioning
   requires approval by default or an explicitly configured backend; the
   base machine is never retired.
7. Proxy/TLS resolvers update automatically via `captain:changed`.
8. A saturated machine's excess demand lands on the least-loaded,
   placement-admitting EXISTING machine first; only then is a machine
   provisioned; an idle machine leaves gracefully (drain → rows clear →
   destroy) and LIFO never retires the base.
9. A service pinned away from a machine is never spawned there - by boot,
   by operator, or by the autoscaler (placement gate at every site).
10. The control API is Shield-gated; the UDS channel trusts only local
    peer credentials; the captain never kills itself.
11. Children survive a captain crash and are re-adopted at boot.
12. Every fleet event is observable (SSE streams, structured alerts, kill
    logs, placement refusal reasons).

## 10. Open Business Questions

- One captain per machine is the contract; the Valkey registry is the
  consensus point - a second captain per machine is split-brain by
  design.
- The docker-macvlan E2E acceptance  is the remaining
  proof of the provisioning lifecycle end-to-end; prerequisites are
  documented in `tofu/README.md`.
- Edge/DNS framing: the operator's LB fronting the pinned edge
  machine(s) is operator infrastructure (documents the story).
- Predictive scaling is a non-goal: reactive thresholds + never-scale
  pins cover the platform's scale model.

---

**Architecture & Design:** sentin8:captain and its underlying concepts were designed by [Hamid Jahanzad](https://www.linkedin.com/in/hamidjahanzad/).

