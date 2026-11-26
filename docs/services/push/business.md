---
title: "Sentin8:Push - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-push/edit/main/BUSINESS.md
---
# Sentin8:Push - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Push **does for the business**. For architecture read `README.md`; for
> wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Push exists so that any Sentin8 service can reach a user on their device
through a path the operator controls, without that service holding a device
registry, a provider credential, or any knowledge of which platform the user is
on.

The commercial drivers:

- **Regulatory reachability.** Several regulated activities require that a
  customer be *notified* of an event (a delegated access request, a payment
  authorization, a security change) on a channel the customer actually sees.
  In-app messages alone do not satisfy that: the user must be reachable while the
  app is closed.
- **Sovereignty of the default path.** Sending notification metadata to a
  third-party push service is unacceptable in some jurisdictions. The primary
  delivery path is therefore the platform's own event stream, which keeps the
  common case entirely inside the operator's fleet. A provider is needed only
  where the device platform makes it unavoidable.
- **Credential custody.** Where a provider is used, its credential is a security
  asset. It lives in Sentin8:Secrets, is resolved per delivery, and never appears
  in an application table or a log.
- **One notification pipeline.** Producers already emit through Sentin8:Post. Push
  plugs in as a channel adapter, so a service that emits a notification gains
  device reachability without new integration work.

## 2. Business Scope (What the Service Provides)

| Capability | Business outcome | Consumer |
|---|---|---|
| Device registration | A signed-in user's app registers its device once; the registration survives restarts and expires predictably | Mobile clients |
| Live delivery | A connected client receives the notification immediately over the platform's own stream, with no third-party dependency | Mobile clients |
| Background delivery | A client the platform cannot reach live receives the notification through the device's provider, which is what makes iOS background delivery possible | Mobile clients |
| Backlog replay | A notification that could not be delivered is retained and replayed when the device returns, so nothing is lost while a client is offline | Mobile clients |
| Cross-device fan-out | A user with several registered devices is served on each one | Sentin8:Post |
| Guaranteed attempt | Every offline delivery is recorded and retried on a bounded curve until it succeeds, is permanently rejected, or reaches the dead-letter queue | Operators |
| Tenant isolation | One tenant's devices and deliveries are invisible to another, enforced independently of application logic | All tenants |
| Provider optionality | A tenant can operate entirely without a third-party provider, on the live stream plus backlog replay | Regulated tenants |
| Delivery visibility | An administrator can inspect recent deliveries and their outcomes for their own environment | Tenant administrators |
| Device revocation | A user revokes a device registration, and delivery to it stops | Mobile clients, administrators |

### What the service does NOT own

| Concern | Owner |
|---|---|
| Message authoring, templates, delivery preferences, the in-app channel | Sentin8:Post |
| Identity, authentication and tokens | Sentin8:Auth |
| Provider credentials at rest | Sentin8:Secrets |
| Provider account provisioning and key rotation | The operator |
| Whether a tenant may use a third-party provider | Sentin8:Sys policy |
| Deciding that a notification should be sent | The producing service, via Post |

## 3. Business Capabilities

### 3.1 Device registration

| Rule | Statement |
|---|---|
| One registration per device per user | A repeat registration replaces the previous one; a device cannot be claimed by a second user |
| Predictable expiry | A registration expires after the configured lifetime (default 90 days), refreshed on each registration |
| Provider is optional | A device that only ever uses the live stream registers no provider and no token reference |
| Credential by reference | The registration stores a reference into Sentin8:Secrets, never the provider token |

### 3.2 Delivery

| Rule | Statement |
|---|---|
| Live first | If the user has a connected client, the notification is delivered there and no provider is contacted |
| Provider second | If not connected and the device registered a usable provider credential, the provider carries it |
| Backlog last | If neither applies, the notification is retained and replayed when the device next connects |
| No loss | A notification accepted for delivery is either delivered, retried, or visible in the dead-letter queue - never silently dropped |
| Single owner per attempt | Each retained delivery names the path that owns it, so the live replay and the provider retry can never double-send |

### 3.3 Reliability

| Rule | Statement |
|---|---|
| Bounded retry | Retries follow 1s, 5s, 30s, 2min, 10min, repeating the final step, sharing Sentin8:Post's curve |
| Dead-letter queue | When the retry budget is exhausted the delivery is parked in the dead-letter queue, visible to an operator |
| Idempotent on replay | A repeated delivery request from Post for the same notification and device is a no-op, not a second notification |
| Permanent rejection is terminal | A provider reporting that a token is no longer registered marks the delivery failed and removes the device, so it stops being a target |

### 3.4 Isolation and custody

| Rule | Statement |
|---|---|
| Tenant isolation | Devices and deliveries are scoped to the environment and enforced by row-level security, not only by application logic |
| No plaintext credential | No provider token and no provider credential exists in any application table |
| No cross-tenant broadcast | A live delivery can never reach a user in another environment |

## 4. Business Events (Outbound)

The service currently emits **no domain events**. Its business record is the
`push.deliveries` table: every retained delivery, its status, its attempt count,
and the transport that carried it. Administrators read this through
`GET /v1/admin/deliveries`.

Inbound triggers: `POST /v1/deliver` from Sentin8:Post's push channel adapter.
That edge is the service's whole external trigger surface.

## 5. Business Rules & Invariants

1. A device registration is owned by exactly one user in one environment.
2. A provider token reference is either absent or a reference - never a token.
3. A delivery record survives the device registration it referred to.
4. Every record belongs to exactly one environment, enforced by the database.
5. At most one delivery exists per notification per device.
6. A live delivery can never cross an environment boundary.
7. A retained delivery always names the path responsible for it.
8. A notification accepted for delivery is never silently discarded.

## 6. Target-User Roles & Use Cases

| Persona | What they do with the service |
|---|---|
| **End user (customer)** | Receives notifications while the app is open, backgrounded, or closed; tapping one opens the relevant screen; revokes a lost device |
| **Producing service** | Notifies a user through Sentin8:Post without knowing anything about devices or providers |
| **Platform operator** | Keeps the fleet running; a provider outage becomes queued work with a visible backlog and dead-letter queue rather than a stuck request; rotates provider credentials without redeploying |
| **Compliance officer** | Demonstrates that a notification was sent: every retained delivery records its outcome and the transport that carried it, independent of the device registration |
| **Tenant administrator** | Inspects delivery outcomes for their own environment and sees failures that need attention |

## 7. KPIs / Success Criteria

- A notification emitted by any producing service reaches a connected device
  immediately, with no third-party involvement.
- A user with two registered devices is served on both.
- An offline device receives its notifications when it reconnects, with no
  operator action.
- An iOS device receives notifications while the app is suspended.
- A provider outage produces queued deliveries that drain without operator
  intervention once the provider recovers, landing in the dead-letter queue only
  when the retry budget is genuinely exhausted.
- No provider credential and no provider token exists in any application table.
- One tenant's devices are never visible from another tenant's context.
- Delivery latency to a connected client stays inside the fleet's request budget,
  because the live path performs no provider call.

## 8. Dependencies & Reliance on Other Services

| Service | What Push relies on | If it is unavailable |
|---|---|---|
| Sentin8:Auth | Token and workload-certificate verification | Requests are rejected; no unauthenticated delivery is possible |
| Sentin8:Secrets | Provider credential resolution | Provider sends stay queued and retry; the live path is unaffected |
| Sentin8:Post | The `push` channel adapter calling `/v1/deliver` | No new notifications; retained deliveries still replay |
| Sentin8:TLS | Tenant context headers and transport security | Requests cannot be trusted or served |
| Sentin8:Bus | Configured endpoint for platform events | No business impact today: the service emits no domain events |

## 9. Acceptance Criteria

1. A device registers, and a subsequent notification for that user reaches it live
   while the stream is open.
2. With the stream closed and a provider credential registered, the notification
   is sent through the provider and the delivery row records `sent` with the
   provider's message id.
3. With the stream closed and no provider credential, the notification is retained
   and delivered when the stream reopens.
4. A repeated `/v1/deliver` for the same notification and device creates no second
   notification.
5. A provider reporting an unregistered token marks the delivery failed and
   removes the device, after which it stops being a delivery target.
6. A delivery whose retry budget is exhausted appears in the dead-letter queue.
7. A user revoking a device removes it from the delivery target set.
8. A device in one environment is never a delivery target for another
   environment's notification.
9. No provider token appears in any table, log line, or API response.
10. An expired registration is skipped as a target rather than delivered to.

## 10. Open Business Questions

- **Retention policy for expired registrations.** Expired devices are skipped but
  not deleted. A retention window is needed before a long-lived tenant
  accumulates dormant rows.
- **Per-tenant provider mandate.** Whether an environment may forbid a third-party
  provider is a Sentin8:Sys policy decision, not a gap in this service.
- **Multi-replica live delivery latency.** A live delivery is process-local, so a
  client on another replica waits for the retry curve instead. This is a latency
  question only; correctness is unaffected.

