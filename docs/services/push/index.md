---
sidebar_position: 8.5
---

# Sentin8:Push - Push Delivery Adapter

Push delivery for every Sentin8 client: a device registry, live delivery
over the platform's own stream, and provider delivery (APNs / FCM) for a
client the platform cannot reach live. A notification that cannot be
delivered is retained and replayed - never silently dropped.

## Use cases

- **Live in-app notification** - a connected client receives the
  notification over the platform's own SSE stream: no third party, no
  provider credential, no external metadata.
- **Background delivery** - an iOS or Android device with a registered
  provider token receives the notification while the app is suspended,
  which is the case the live stream structurally cannot cover.
- **Offline replay** - a device with no stream open and no provider token
  has its notification retained and replayed the moment it reconnects.
- **Cross-device fan-out** - a user with several registered devices is
  served on each of them.
- **Credential custody** - a provider credential is a reference into
  Sentin8:Secrets, resolved per delivery, never stored in a table.

## How it sits in the platform

Sentin8:Post fans a notification out across channels and names a gateway
adapter behind each one. For the `push` channel that adapter is
Sentin8:Push, reached over a single M2M `POST /v1/deliver` call. Neither
service reads the other's tables, and neither is on the other's
per-request path.

Push chooses the transport per device, in this order:

1. **Live stream** - the user has a connected client, so the delivery is
   one in-memory broadcast.
2. **Provider** - the device registered a provider and a credential
   reference, so APNs or FCM carries it.
3. **Backlog** - neither applies, so the delivery is retained and
   replayed on reconnect.

## API surface

| Endpoint | Method | Gate |
|---|---|---|
| `/v1/health` | GET | none |
| `/v1/devices` | POST | bearer token - identity from the session |
| `/v1/devices/{id}` | DELETE | bearer token - owner match |
| `/subscribe` | GET (SSE) | bearer token - live stream plus backlog replay |
| `/v1/deliver` | POST | M2M `sentin8:push:deliver:write` |
| `/v1/admin/deliveries` | GET | Shield admin scope |

## Guarantees

- A notification accepted for delivery is delivered, retried on a bounded
  curve, or parked in the dead-letter queue - never silently discarded.
- A repeated delivery request for the same notification and device is a
  no-op, so Post's at-least-once relay cannot double-send.
- No provider token or provider credential exists in any application table.
- One tenant's devices and deliveries are never visible from another's
  context, enforced by database row-level security.

## Full documentation

The complete detail lives in this product's sub-pages:

- [Architecture (DDD)](design) - wire-level detail, tables, and every diagram.
- [Business rules (BRD)](business) - capabilities, rules, acceptance criteria.
- [Security](security) - the platform security model.
- [Overview (repo README)](/docs/reference/push/) - the maintainer's README in the consolidated reference section.
