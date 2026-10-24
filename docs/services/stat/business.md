---
title: "Sentin8:Stat - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-stat/edit/main/BUSINESS.md
---
# Sentin8:Stat - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Stat **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Stat is the platform's **metrics and analytics service**. It is
the single measurement plane: services, verticals, and apps all emit to
one property/slug vocabulary, so spend, traffic, conversions, and AI
token usage are comparable across the platform. The business value it
delivers:

- **One metrics plane.** Cross-vertical comparison (cost per model,
  traffic per service, conversion funnels) is the point - one
  vocabulary + one query API beats N silos.
- **M2M-only ingest for machine traffic.** Measurement ingestion is
  machine traffic (`sentin8:stat:measure` claimed at DCR); user roles
  never gain ingest - the user/M2M boundary stays clean.
- **PII never enters analytics.** The ingest deny-list strips
  credential-ish keys (email, pan, pin, token…) before persistence and
  flags stripped payloads - metrics are aggregates, not personal data.
- **Cheap fire-and-forget.** Producers never block on analytics; a Stat
  outage costs dashboards, not the business path.
- **One process for ingest + aggregation.** The worker pipeline
  (7-stage transform, rollups, alerts, archive) runs as background
  tasks inside the same service - one identity, one deployment unit.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Ingest | Collect (single/batch ≤ 100 events / 1 MiB), pixel fallback (43-byte GIF), pageview/event/conversion shorthands, metric + batch (strict M2M, ≤ 200 / 4 MiB) |
| Ingest hygiene | Validation, PII deny-list stripping (13 keys, flagged), numeric-only metric filter, per-identity rate limiting (Valkey minute buckets), event-id dedupe |
| Slug resolution | `property_slug` resolved server-side to property id + env (emitters never pool UUIDs; unknown slugs 404 like unknown ids) |
| Property registry | Properties (slug, timezone, retention, bot filter, PII settings, status lifecycle) + accounts; admin CRUD |
| Read API | Canned reports, daily metrics, traffic summaries, sessions, retention, realtime (5-min window), funnels, DSL query over 8 daily tables |
| Embedded worker | Bus SSE consumer (group `stat`) + 30s DB fallback; 7-stage pipeline (clean → attribute → stitch → enrich → aggregate → emit); 60s rollup loop (hour→year); 60s alert evaluator; Valkey pub/sub republisher; hourly archive sweep to Storage |
| Alerts | Curated spike/drop rules (event spike ×3 over volume ≥100; conversion drop ≤0.5) + per-property custom rules (`threshold`, `anomaly`) with admin CRUD |
| Events | Ingest notices, CRUD events, `aggregate:updated` (payload-complete), alert events - via direct produce and the shared inbox/outbox |
| Audit volume metrics | Consumes `sentin8:sys:audit:recorded` and increments per-service audit-volume counters |
| Admin surfaces | RFW admin UI (overview, properties/new, accounts/new, events, metrics, policy) + alert-rule CRUD + reaggregate; Shield policy-admin API |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| TLS traffic metrics | Arrive via the shared Valkey pub/sub channels (Stat republishes) |
| The Bus | Consumed via SSE + ACK (Bus owns delivery) |
| Dashboard rendering | BFF/Dash (they consume the data API + rollup pub/sub) |
| Raw-event retention beyond the window | Storage archives (JSONL spill; rows marked archived, never deleted in DB) |
| OTel export | Deferred to the middleware crate's OTel seam (platform-level answer) |

## 3. Business Capabilities

### 3.1 Ingest

| Capability | Business rule |
|---|---|
| Collect | Optional bearer (Shield evaluated when present) + rate limit; batch ≤ 100 / 1 MiB |
| Pixel | Unauthenticated 1×1 GIF beacon (browsers can't carry tokens); query-string envelope; rate-limited per IP |
| Shorthands | pageview / event / conversion - optional bearer + rate limit |
| Metric / batch | **Strict M2M** (`sentin8:stat:measure`); batch ≤ 200 / 4 MiB |
| Rate limits | Web 1000/min, server 10000/min (per-identity Valkey buckets, TTL 120); 429 with `Retry-After: 60` |
| Dedupe | `ON CONFLICT (id, timestamp) DO NOTHING` - replays idempotent |
| PII strip | 13-key deny-list (email, phone, pan, pin, cvv, ssn, password, token, secret, apikey, api_key, iban, account_number, card_number) stripped before persistence; `props_pii_stripped` flag persisted; raw IPs never persisted |

### 3.2 Aggregation & Worker Pipeline

| Capability | Business rule |
|---|---|
| Pipeline | 7 stages: clean → attribute (fixed 30-min sessions) → stitch → enrich → aggregate → emit; stage-1 rejects events >5 min future / >24 h past |
| Metric semantics | Counter (SUM) when the name ends `.issued/.created/.completed`; else gauge (last-write-wins) - determined once |
| Rollups | 60s loop: hour (last 2d) → day (400d) → week (2y) → month (10y) → year; idempotent upserts; each updated day-bucket emits `sentin8:stat:aggregate:updated` (payload-complete) |
| Realtime | 5-minute ZSET window per property |
| Valkey republish | `stat:metrics:{tls,log}` consumed; `stat:rollups:{minute,hour,day}` republished for Dash/BFF/Captain |
| Archive | Hourly sweep: JSONL PUT to Storage (batches ≤ 1000/property), rows marked `archived=true` - never deleted before archive verification |
| Failure handling | Bus produce is fire-and-forget (DB fallback covers); poison messages nack ×3 then ACK → Bus DLQ owns them (never hot-looped) |

### 3.3 Read & Analysis

| Capability | Business rule |
|---|---|
| Data API | Shield `sentin8:stat:data:read`: reports, metrics, traffic, sessions, retention, realtime, funnels |
| DSL query | Over 8 daily-table allow-list; unsupported operations → `400 QueryRequiresRawScan` (bounded by design) |
| Funnels | First-class funnel records + analysis (signup → install → activation) |
| Reaggregate | Admin-triggered day-metrics rebuild from raw events over a window (default 30d, max 400 buckets; retention-horizon guard 400) |

### 3.4 Alerts

| Capability | Business rule |
|---|---|
| Curated rules | Event spike (×3 over volume ≥100) and conversion drop (≤0.5) - evaluated each 60s pass |
| Custom rules | Per-property `threshold` (value vs comparator) and `anomaly` (moving-average deviation) rules; admin CRUD; create-time metric validation (400 on unknown) + static evaluator allowlist |
| Noise floor | `min_sample` (default 10) - rules below the floor never fire; anomaly rules need a non-empty baseline bucket |
| Dedupe | Payload `dedup_key` per rule per day bucket (`rule:{id}:{day}`); consumer-side dedupe contract |
| Delivery | Alert → Post path (`sentin8:stat:alert:*` on the `stat-pipeline` family) |

## 4. Business Events (Outbound)

| Event | When |
|---|---|
| `sentin8:stat:event:ingested` | Ingest notice (family `stat-events`; also pipeline stage-7 on `stat-pipeline`) |
| `sentin8:stat:property:created/updated/deleted`, `account:created`, `funnel:created`, `alert_rule:created/deleted` | Admin CRUD (family `stat` via the shared inbox/outbox) |
| `sentin8:stat:aggregate:updated` | Per updated day-bucket (payload-complete: property, aggregate, window, bucket, value, dimensions) |
| `sentin8:stat:alert:event_spike` / `conversion_drop` / `rule_triggered` | Alert evaluation (family `stat-pipeline`) |

**Inbound (consumed):** the `stat-events` stream family (embedded
worker, group `stat`), `sentin8:sys:audit:recorded` (audit-volume
metrics, group `stat-audit`), and Valkey `stat:metrics:{tls,log}`.

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **PII never stored** - the 13-key deny-list strips before persistence; non-numeric metrics dropped; raw IPs never persisted.
2. **Dedupe by event id** - replays are idempotent.
3. **Rate limiting per identity bucket** - a compromised client cannot exhaust the ingest plane.
4. **Env from the token, org via lookup** - a body `env_id` mismatch is 403; admin requires explicit `target_env_id` (400 when missing).
5. **Property slugs resolve server-side** - emitters never need UUID pools.
6. **Metric type stability** - counter vs gauge determined once at first upsert.
7. **Poison messages reach the Bus DLQ** - never silently dropped, never hot-looped.
8. **Rollups are idempotent upserts** - the 60s pass can rerun safely.
9. **Alerts carry dedup keys** - consumer-side dedupe is the contract.
10. **Custom rule metrics are allowlisted twice** - create-time validation + static evaluator allowlist; caller input never reaches SQL outside the allowlist.
11. **Custom rules below the noise floor never fire.**
12. **Minute-granularity rollups stay Valkey-only** (DB holds hour→year) - no double-write.
13. **Fire-and-forget ingest** - a Stat outage never blocks business paths; the DB fallback covers missed Bus produces.
14. **No `unsafe` code.**

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Stat |
|---|---|
| Producing service / SDK | Emits metric envelopes (slug-based) fire-and-forget; never blocks on analytics |
| Web app | Pixel beacons + shorthand events (no tokens needed, rate-limited) |
| Business analyst | Queries reports, funnels, retention, traffic, realtime via the data API / Dash |
| Platform operator | Manages properties, accounts, retention, alert rules; triggers reaggregate; watches curated + custom alerts |
| Compliance | Verifies PII stripping, no raw IPs, partitioned + archived raw events |
| Dash / BFF / Captain | Consume `stat:rollups:*` pub/sub and the data API for dashboards |

## 7. KPIs / Success Criteria

- **Coverage**: every platform metric (traffic, spend, conversions, AI tokens, audit volume) lands in one comparable vocabulary.
- **Privacy**: zero PII keys persisted; stripped payloads flagged; no raw IPs.
- **Reliability**: producers never blocked; poison messages DLQ'd; rollup reruns safe; archive never deletes unarchived rows.
- **Freshness**: realtime 5-min windows; rollups refreshed every 60s; aggregate-updated events push (not poll).
- **Alerting quality**: dedup keys + noise floors prevent alert storms; allowlisted metrics prevent injection.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:Bus | Event streaming (ingest → worker; alert/aggregate events out) |
| Valkey | Rate-limit buckets, realtime ZSETs, metrics pub/sub republishing |
| Sentin8:DB (PostgreSQL) | Events (partitioned), properties, sessions, aggregates, rollups, funnels, alert rules (RLS-enforced) |
| Sentin8:Storage | Raw-event archive spill (JSONL) |
| Sentin8:Auth | M2M identities (`sentin8:stat:measure`); bearer verification |
| Shield (Sentin8:Policy) | `data:read` / admin gates (live evaluation) |
| Sentin8:Post | Alert delivery (alert → Post path) |
| Shell (platform) | Outbox relay, middleware, TLS listener, pool cap |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. Any service can emit a metric envelope (single or batch, slug-based) without blocking; unknown slugs 404 cleanly.
2. Pixel beacons work from browsers with no token; all ingest paths are rate-limited with deterministic backoff (`Retry-After`).
3. PII keys never persist; stripped payloads are flagged and filterable.
4. The embedded worker processes events (pipeline → aggregates → rollups) inside one process; missed Bus messages are covered by the DB fallback.
5. Rollups exist hour→year and refresh every 60s; updated day-buckets emit payload-complete `aggregate:updated` events that downstream listeners apply from the payload alone.
6. Realtime counters answer over a 5-minute window.
7. Raw events archive hourly to Storage (JSONL) and are never deleted before verification.
8. Data APIs serve reports, metrics, traffic, sessions, retention, funnels, and DSL queries over the allow-list.
9. Curated spike/drop alerts and per-property custom rules (threshold/anomaly) fire with dedup keys and respect the noise floor; delivery rides the alert → Post path.
10. Admin CRUD (properties, accounts, alert rules, reaggregate) requires explicit `target_env_id` and is audit-journalled.
11. Audit-volume metrics accumulate per service from `sys:audit:recorded` events.

## 10. Open Business Questions

- Per-workload ingest quotas extend the token-bucket key to `(env_id, workload)` with depth surfaced in the admin UI.
- Rule edit/update (PUT) is a future refinement - rules are created, listed, and deleted today (disable via delete + recreate).
- Partition maintenance beyond the seeded today+7 days is an operational concern (no auto-partition loop).
- OpenTelemetry-compatible export defers to the middleware crate's OTel seam.


---

**Architecture & Design:** sentin8:stat and its underlying concepts were designed by [Hamid Jahanzad](https://www.linkedin.com/in/hamidjahanzad/).

