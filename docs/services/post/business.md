---
title: "Sentin8:Post - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-post/edit/main/BUSINESS.md
---
# Sentin8:Post - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Post **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Post is the platform's **multi-channel message-delivery
service**. It is how the platform reaches users: in-app notifications
always land, and external channels (email, push, SMS) compose on top of
one durable message record. The business value it delivers:

- **Messages must not vanish.** A domain event that triggers a
  notification must not lose it if the consumer is down; the
  inbox-first pattern makes the notification as durable as the domain
  fact itself (a Post outage never loses a message).
- **One delivery surface, many channels.** In-app, push, email, and SMS
  compose over one message record - the sender declares the message;
  channel resolution is Post's job.
- **Real-time plus reliability.** Users expect millisecond in-app
  notifications; the hybrid relay (LISTEN/NOTIFY wake + 5s safety poll)
  gives latency without depending on notifications for correctness.
- **Gateway credentials by reference.** External channel credentials
  (SMTP keys, device tokens) resolve through the shared Secrets chain
  at delivery time - never stored in rows, so a DB dump never contains
  provider keys and rotation needs no restart.
- **Template-branded messaging.** Messages render from per-env
  templates with branding overrides (org base → env override,
  non-empty wins), falling back to producer literals.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Message intake | `POST /v1/send` (M2M, Shield-gated) and the producer-side `post_outbox` + pusher DBX path - the inbox row commits with the producer's domain change |
| Durable inbox | `post.inbox` (RLS env-scoped) with category (`transaction|security|marketing|system`), priority (`low|normal|high`), body format (text/html/markdown), recipient fields, metadata |
| View channel | In-app delivery that ALWAYS delivers (the record of truth) - before any external gateway attempt |
| External gateways | Email (SMTP HTTP relay when `gateway_url` is declared), push/sms/web_push/mail (stub dispatch behind the same seam); scope-tiered gateway config (`sys`/`org`/`env`) |
| Delivery records | Per-channel `post.deliveries` with retry state - backoff curve 1s → 5s → 30s → 2m → 10m, max 3 retries |
| Dead-letter queue | Failed external deliveries land in `post.dlq`; replay resets the inbox row and re-pends the delivery |
| Events | `notification.received` on View delivery (direct Bus produce); read receipts via the local outbox in the same transaction as the read |
| Templates | `post.templates` (`(env, key, locale)` → subject/body) with `{{var}}` substitution; branding resolves into render vars |
| Preferences | Per-user `notification_preferences` - muted categories, quiet-hours windows; consulted before external channels attempt (the View channel always delivers) |
| Message management | List/get/content/read (idempotent, COALESCE), unread counts |
| Admin surfaces | RFW admin UI (messages, gateways, DLQ, relations, attributes) + a LOCAL Shield policy-admin surface |
| Gateway test | `POST /v1/gateways/test` - dispatch smoke through the adapter seam |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Producers' domain changes | The producing service (it writes its own outbox in its own transaction; Post never writes producer tables) |
| Gateway provider credentials | Sentin8:Secrets (referenced via `secret_ref`, resolved at delivery time) |
| Shield substrate | `sys.policy_sets` (Post stores tenant sets there through its admin surface and reads for evaluation) |
| Real push/SMS provider adapters | Stub dispatch today (FCM/APNs land behind the same `gateway_dispatch` seam) |

## 3. Business Capabilities

### 3.1 Message Intake & Delivery

| Capability | Business rule |
|---|---|
| Send | Inbox-first insert; producer identity from the verified token (`stream_family = sub`), never caller input |
| Relay | Hybrid LISTEN/NOTIFY (millisecond wake) + 5s safety poll; batch ≤ 50 undelivered in created_at order; startup drains pre-existing undelivered rows |
| View channel | Always delivered first - the record of truth; a FCM/SMTP outage never loses the message |
| External channels | Additive: dispatch through the gateway adapter seam; email rides the SMTP HTTP relay when configured; stubs otherwise |
| Terminal delivery | Delivered rows are terminal - no double delivery; replayed relay passes skip delivered rows |
| Read receipts | `notification:read` emitted via the local outbox in the SAME transaction as the read - badge counters update on every device within one hop |
| Unread counts | Computed per recipient; degrades to 0 on error (understates, never fails the read) |

### 3.2 Channels & Gateways

| Capability | Business rule |
|---|---|
| Channel matrix | view · email · sms · push · web_push · mail |
| Gateway config | Scope-tiered (`sys`/`org`/`env`); credentials as `{"secret_ref": "backend://…"}` ONLY; sys/org creation requires platform admin |
| Credential resolution | At delivery time via the shared Secrets chain; zeroize-on-drop; never logged; resolution failure proceeds without credentials rather than failing the notification |
| Retry curve | 1s → 5s → 30s → 2m → 10m, max 3 retries → DLQ; `simulate_failure` config exercises the machinery without a provider |
| DLQ replay | Resets the inbox row to undelivered and re-pends the delivery (404 on missing ids) |
| Templates | Rendered at delivery time with `{{var}}` substitution; branding (primary_color, logo_url) from `sys.branding`; unresolvable templates fall back to producer literals |
| Preferences | Muted categories + quiet hours (UTC hours) filter external channels; the View channel always delivers |

### 3.3 Administration

| Capability | Business rule |
|---|---|
| Admin UI (RFW) | Messages, gateways/new, DLQ, relations, attributes pages; `target_env_id` required |
| Local policy admin | Full Shield surface (policy sets, relations, attributes, decisions) - write-time validation (422), 64 KiB caps (413), platform-origin rows enroll-managed (409 on overwrite), tenant sets start in `shadow`, version bumps on upsert |
| Gateway test | Dispatch smoke through the adapter seam |

## 4. Business Events (Outbound)

| Event | When |
|---|---|
| `sentin8:notification:received` | View-channel delivery (direct Bus produce, fire-and-forget); payload-complete: user, title, body, category, resource refs, unread_count |
| `sentin8:post:notification:read` | Mark-read (local outbox, same transaction as the read); payload-complete: user, notification id, read_at, unread_count |
| Policy events | Policy-admin mutations (family `policy`) |

**Inbound (consumed):** policy hot-reload SSE (Shield engine refresh).

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **Inbox-first** - the producer's domain change and the inbox row commit atomically; producer identity rides the verified token, never caller input.
2. **The View channel always delivers** before any external gateway attempt; delivered rows are terminal.
3. **Gateway credentials are secret references only** - plaintext provider tokens never touch the database; resolution failures proceed rather than fail the notification.
4. **RLS context on the same connection as every query**; event names colon-only; envelopes payload-complete (test-pinned).
5. **`target_env_id` required** on policy admin + admin data (400 when missing).
6. **Idempotent mark-read** (COALESCE) + idempotency keys on events → effectively-once badge counting.
7. **Sys/org gateway scope changes require platform admin** before any tenant mapping happens.
8. **Read receipts commit with the read** (outbox-first - exactly once with the domain change).
9. **Credential material is zeroize-on-drop** via the shared secrets crate; never in responses or logs.
10. **No `unsafe` code.**

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Post |
|---|---|
| Producing service | Declares messages (category, priority, recipient, template key or literals) via `POST /v1/send` or its local `post_outbox` + pusher |
| End user | Receives in-app notifications in real time (BFF SSE/WS push); reads them; badge counts update across devices; preferences (mutes, quiet hours) respected on external channels |
| Platform operator | Configures gateways per scope; tests dispatch; inspects the DLQ and replays failed deliveries; manages policy sets via the local admin surface |
| Compliance/audit | Verifies credentials are references-only; reads notification events and read receipts |

## 7. KPIs / Success Criteria

- **Reliability**: zero lost notifications (inbox-first; View always delivers); crash recovery drains pre-existing rows at startup.
- **Latency**: millisecond in-app delivery (NOTIFY wake), bounded catch-up (5s poll).
- **Channel health**: external failures retry on a bounded curve and land in the DLQ (never silently dropped); replay restores delivery.
- **Security**: credentials references-only; zeroize-on-drop; no plaintext in dumps or logs.
- **UX quality**: templates + branding render consistently; preferences respected; badge counters effectively-once.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:Bus | `notification.received` / `notification:read` events (the BFF's consumer pushes to apps) |
| Sentin8:Secrets | Gateway credential resolution at delivery time |
| Sentin8:DB (PostgreSQL) | Inbox, deliveries, gateways, DLQ, templates, preferences, outbox (RLS-enforced) |
| Sentin8:Auth | Bearer verification; M2M identities (`<service>-post` pushers) |
| Shield (Sentin8:Policy) | `post:write`/`post:read`/policy-admin gates (live evaluation) |
| Sentin8:Sys | Branding resolution for templates; the Shield substrate (`sys.policy_sets`) |
| BFF (consumer) | Pushing received notifications to connected apps |
| Shell (platform) | Outbox relay, middleware, TLS listener, pool cap |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A producer can send a message in the same transaction as its domain change; a Post outage never loses it.
2. Every message lands in the View channel first; in-app notifications arrive in real time with unread counts.
3. Read receipts update every device's badge via events (effectively-once).
4. External channels dispatch through the configured gateway; email rides the SMTP relay when configured; failures retry on the 1s→5s→30s→2m→10m curve and land in the DLQ.
5. DLQ replay resets and re-delivers; missing replays 404.
6. Gateway credentials resolve from secret references at delivery time - never stored, never logged.
7. Templates render with `{{var}}` substitution and branding overrides; fallbacks work.
8. User preferences (muted categories, quiet hours) gate external channels; the View channel always delivers.
9. Gateway config changes (including sys/org scope) are platform-admin-gated; dispatch is testable via the gateway test endpoint.
10. Policy-admin writes validate at write time, cap sizes, and manage platform-origin rows correctly.

## 10. Open Business Questions

- FCM/APNs push adapters land behind the same `gateway_dispatch` seam as the SMTP relay (the seam is the contract; retry/DLQ machinery is adapter-agnostic).
- The audit-journal → Sys push loop rides the shared shell task.
- Per-hook traffic splitting and richer provider receipts arrive with the real adapters.


---

**Design attribution:** sentin8:post and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

