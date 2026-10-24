---
title: "Sentin8:Sign - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-sign/edit/main/BUSINESS.md
---
# Sentin8:Sign - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating
> what Sentin8:Sign **does for the business**. For architecture read
> `README.md`; for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Sign is the platform's **electronic signature service**. It
turns "this document must be signed by these people" into a complete,
auditable, legally-presentable ceremony:

- **One ceremony engine for every product.** Banking account
  openings, hospitality contracts, trade confirmations, platform
  agreements - all use the same request → view → sign → evidence flow;
  no vertical builds its own signing.
- **Signer identity is guaranteed by the platform's identity plane.**
  The signer's session and consent are checked by Sentin8:Auth - the
  "who signed" question is answered with the platform's full identity
  assurance (MFA, passkeys, live authorization), not a bespoke
  check.
- **AdES and QES levels.** Advanced signatures work out of the box
  (stub provider exercises the full path); Qualified signatures
  require a configured qualified trust-service provider - one
  environment setting, same ceremony.
- **Evidence that stands up later.** Every ceremony produces a
  durable, tamper-evident record: who signed, when, what they saw,
  how they were authenticated, and the provider's attestation -
  retained per tenant with full audit.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Signature requests | Create, list, get requests with a document set (storage refs), a signer set (user ids + required level), an expiry, and a signature level (AdES/QES) |
| Ceremonies | Per-signer view → approve flow, session-bound approval (no replay), per-signer status, completion when all signers sign, decline by any signer |
| Signature minting | Provider dispatch behind a gateway seam (stub by default; any qualified trust-service provider via environment configuration) |
| Evidence | Completed signature values + provider attestations + ceremony evidence, append-only, per-request evidence fetch |
| Events | `sentin8:sign:request:created/viewed/signed/completed/declined/expired/failed` - payload-complete so consumers never call back |
| Expiry | Stale open requests expire automatically (daily sweep) |
| Admin | RFW admin UI (requests overview, evidence inspection, failed-request replay) + Shield policy administration |
| Audit | Every transition journaled locally + spilled to the platform audit surface |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Signer identity assurance & consent | Sentin8:Auth (sign verifies; never issues) |
| Document storage | Sentin8:Storage (sign holds refs only) |
| Signature notifications to signers | Sentin8:Post (consuming the request events) |
| Authorization decisions | Shield (Sentin8:Policy) |
| Provider credentials custody | Sentin8:Secrets (by reference, resolved at dispatch) |
| Expiry scheduling | Sentin8:Cron (declarative schedule, proxy-back) |

## 3. Business Capabilities

| Capability | Business rule |
|---|---|
| Create request | Caller declares documents (storage refs + names + hashes), signers, level, expiry; the request opens immediately; signer set is fixed after creation |
| View ceremony | Only a listed signer can view; the view is recorded (timestamp + session) and emits an event |
| Approve ceremony | Session-bound: the approving session must be the signer's live session; approval mints the signature through the provider seam |
| Decline ceremony | Any signer can decline; the request closes declined for everyone |
| Completion | The request completes when every signer has signed; the evidence snapshot freezes |
| Failure & replay | Provider failures mark the request failed; an admin can replay (reopen) a failed request |
| Expiry | An open request past its expiry auto-expires; expired requests cannot be signed |
| Level guarantee | QES requests refuse to mint unless the environment has a qualified provider configured - never silently downgrade |
| Tenant isolation | Everything is per-environment; one tenant's requests are invisible to another |
| No document copies | Sign never stores document bytes; evidence references the storage objects |

## 4. Business Events (Outbound)

Event family `sign`; names follow `sentin8:sign:{resource}:{operation}`.

| Event | When |
|---|---|
| `sentin8:sign:request:created` | Request opened |
| `sentin8:sign:request:viewed` | A signer opened the ceremony |
| `sentin8:sign:request:signed` | A signer approved (per-signer) |
| `sentin8:sign:request:completed` | All signers signed - the business fact consumers wait on |
| `sentin8:sign:request:declined` | A signer declined |
| `sentin8:sign:request:expired` | Expiry sweep closed a stale request |
| `sentin8:sign:request:failed` | Provider dispatch failed terminally |

Inbound (consumed): none - sign is a producer; notifications ride the
post service consuming these events.

## 5. Business Rules & Invariants

1. **Session-bound approval** - a signature cannot be minted from a
   replayed or stolen approval token.
2. **Fixed signer set** - after creation, the signer list never
   changes; a wrong list means a new request.
3. **Evidence is append-only** - completed ceremonies are frozen;
   no after-the-fact edits.
4. **Level honesty** - QES never silently degrades to a weaker level.
5. **Expiry is final** - expired requests cannot be signed or
   reopened.
6. **Tenant isolation always** - requests, ceremonies, and evidence
   are env-scoped.
7. **Documents by reference** - the service never holds a second copy
   of the document bytes.
8. **Every transition is an event** - consumers integrate without
   polling and without calling back.

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Sign |
|---|---|
| Business service (banking/hospitality/trading/…) | Creates signature requests from its flows; consumes completion events |
| Signer (customer/employee) | Views documents in the ceremony; approves (signs) or declines in their live session |
| Tenant admin | Oversees requests, inspects evidence, replays failed requests |
| Compliance officer | Reads the evidence + audit journal for legal retention |
| Platform operator | Configures the trust-service provider per environment (via secrets references) |

## 7. KPIs / Success Criteria

- **Reliability**: a Bus outage never loses a signature event; a
  provider outage never corrupts a ceremony (commit-or-rollback).
- **Trust**: zero replayed approvals; zero cross-tenant leaks; every
  completed signature carries provider attestation.
- **Speed**: request creation and evidence fetch are single-query.
- **Compliance**: evidence retention is append-only and
  audit-journaled; QES requests only complete via a qualified provider.
- **Integration**: a consuming service never calls back for state -
  events are payload-complete.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:Auth | Signer identity assurance + session-bound approval consent |
| Sentin8:Storage | Document bytes (by reference) |
| Sentin8:Secrets | Provider credentials (by reference, resolved at dispatch) |
| Sentin8:Bus | Event delivery (durable, outbox-backed) |
| Sentin8:Cron | Expiry sweep |
| Sentin8:DB | Persistence (schema `sign`) |
| Shield (Sentin8:Policy) | Authorization decisions on every surface |
| QTSP (external, per-env) | Qualified signature minting |

## 9. Acceptance Criteria

1. A service creates a request with 2 signers; both sign in their
   sessions; the request completes; the completion event carries the
   evidence references; a consumer acts on the event alone.
2. A replayed approval token is rejected.
3. A signer declining closes the request declined for all.
4. An expired request cannot be signed; the expiry sweep event fires.
5. QES with no qualified provider configured fails closed (no silent
   downgrade).
6. A provider outage marks the request failed; admin replay reopens
   it; the retry curve runs 1s→5s→30s→2m→10m before terminal.
7. No document bytes ever appear in the sign schema.
8. All admin surfaces (requests, evidence, replay) render via the
   RFW admin UI.
9. Build clean, zero warnings; all tests green.

## 10. Open Business Questions

- Multi-document packages (one signature over N documents) -
  semantics deferred.
- Push callbacks to requester apps on completion (today: events only).
- Evidence export formats for external legal workflows (PDF/A
  evidence bundles).

---

**Architecture & Design:** Sentin8:Sign and its underlying concepts were
designed by [Hamid Jahanzad](https://www.linkedin.com/in/hamidjahanzad/).
