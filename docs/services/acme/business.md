---
title: "Sentin8:Acme - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-acme/edit/main/BUSINESS.md
---
# Sentin8:Acme - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> Sentin8:Acme **does for the business**. For architecture read `README.md`;
> for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

Sentin8:Acme is the platform's **internal certificate authority**. It is the
single source of every TLS certificate the platform trusts - no other
service or external provider is needed to secure platform traffic. The
business value it delivers:

- **Post-quantum TLS needs its own authority.** The platform's TLS stack
  (X25519MLKEM768 / ML-DSA-65) is exclusive - certificates must come from a
  platform-controlled CA, not a public CA whose ecosystem lags the
  cipher-suite requirements.
- **Internal hostnames cannot be publicly signed.** `{service}.{env}.
  {org}.{tld}` domains, `.local` names, private IPs, and operator-declared dev
  domains are unsignable by
  public CAs - the platform needs an authority that trusts them everywhere
  automatically (OS trust store + NSS for Chromium).
- **Certificate-bound M2M identity.** M2M tokens are certificate-bound by
  default; every workload needs a client certificate at first boot -
  including the first-boot chicken-and-egg case where the workload holds
  neither a certificate nor a token.
- **One issuer for everything.** Server leafs (HTTPS), client leafs (mTLS
  identity), and the trust anchor all come from one service, one CA, one
  admin surface.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Certificate authority | Two-tier CA hierarchy (Root 10-year, Intermediate 5-year); leaf certificates (90-day default) |
| TLS server certificates | ACME (RFC 8555) issuance for every platform domain - local domains (localhost, `.local`, private IPs, operator-declared `SENTIN8_ACME_LOCAL_DOMAINS` suffixes) signed directly; external domains relayed to an upstream public ACME provider (rejected outright when no upstream is configured) |
| mTLS client certificates | `POST /v1/client-cert` - RFC 8705 client certificates for M2M workloads (CN `m2m-{service_name}`, ClientAuth EKU) |
| Trust anchor distribution | Root CA download endpoints; automatic install into OS + Chromium/NSS trust stores |
| Certificate revocation | Admin revocation (metadata + event announcement) |
| Protocol surface | Full RFC 8555 flow: directory, nonces, accounts, orders, authorizations, HTTP-01 challenges, finalize, cert download, revoke |
| Admin surfaces | RFW admin UI (overview, certificates list, settings); Shield policy-admin API and Policy Studio aliases |
| Mint protection | Admission control on every mint endpoint: a bounded shared mint queue answers `503 Service Busy + Retry-After` when the CA signing path is saturated - overload is loud and self-draining, never a silent caller timeout (the failure that cascade-killed fresh services via captain's probe watchdog) |
| Events | CA lifecycle events to Sentin8:Bus (observability/audit) |

### What the service does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| Tenant identity / bearer verification | Sentin8:Auth (acme verifies, never issues identity) |
| DCR thumbprint binding | Sentin8:Auth (workloads register cert thumbprints there directly) |
| Enrollment-secret brokering | Sentin8:Captain (brokers the sealed enrollment record to both workload and acme at spawn) |
| CRL/OCSP distribution | not implemented (revocation visibility rides the event path; the Root CA lives in every fleet node's OS trust store) |
| Database domain persistence | none - durable DOMAIN state is filesystem-only (CA keys, accounts, orders, certificates); the only table is the service's own `acme.outbox` (event durability) |

## 3. Business Capabilities

### 3.1 TLS Server Certificates (ACME protocol)

| Capability | Business rule |
|---|---|
| ACME accounts | RFC 8555 account creation with JWK; account key thumbprint binding (RFC 7638 §6.2 verification) |
| New orders | Single-identifier orders; local vs external domain classification - mixed orders rejected |
| Local domains | Signed directly by the Intermediate CA with HTTP-01 challenge short-circuited (the challenge target is the platform's own network) |
| External domains | Proxied to the upstream public ACME provider when proxy mode is enabled |
| Challenges | HTTP-01 only (DNS-01 declared for upstream mode); local short-circuit avoids pointless self-fetch |
| Finalize + download | Combined PEM (leaf + chain + key) for local issuance; cert-only for upstream (key never leaves the requester) |
| Revocation | `POST /acme/revoke-cert` (event-announced); admin revoke path marks metadata + emits event |
| Trust anchors | `GET /v1/ca/root.crt`, `GET /v1/ca/intermediate.crt` public downloads |
| CA hierarchy validity | Root 3650d, Intermediate 1825d, leaf 90d (defaults, configurable) |

### 3.2 mTLS Client Certificates (M2M identity bootstrap)

| Capability | Business rule |
|---|---|
| Client-cert mints | `POST /v1/client-cert` with `service_name` + validity days (default 365, clamped 1-3650); CN `m2m-{service_name}`, EKU ClientAuth |
| Admission channel 1 - bootstrap enrollment | Workload presents the `X-Sentin8-Bootstrap-Enrollment` secret captain brokered at spawn; verified locally against the CURRENT sealed record read fresh from disk; scoped to client certs only |
| Admission channel 2 - self-issuance | Caller's bearer `sub` must equal `service_name` (a workload re-issuing its own identity) |
| Admission channel 3 - operator/enroll | Bearer carries `sentin8:acme:clientcert:issue` (provisions any declared workload's initial certificate) |
| Key handling | Combined PEM (leaf+chain+key) returned exactly ONCE - the private key is never persisted server-side |
| Metadata record | Certificate + metadata (domain, kind, expiry, revoked) recorded for admin listing/revocation |

### 3.3 Administration & Observability

| Capability | Business rule |
|---|---|
| Admin UI (RFW) | Overview, certificates (newest 500 entries), settings pages |
| Policy admin | Shared Shield policy-admin API + Policy Studio aliases (policy sets, relations, attributes) |
| Certificate revocation | Admin revoke marks metadata + announces `sentin8:acme:certificate:revoked` |
| Events | account:created, order:created, order:finalized, clientcert:issued, certificate:revoked - observability/audit signal only (no registered consumers) |
| Traffic metrics | Counter flush every 10s to Valkey (`stat:metrics` channel) |
| Mint overload behavior | Mint endpoints (`new-order`, `finalize`, `client-cert`) share ONE bounded queue: within budget every mint runs; at the cap the acme answers `503 Service Busy` + `Retry-After: 30` (one client retry window) and warn-logs the depth - health, CA downloads, and cert downloads are NEVER shed (the recovery path itself), so a saturated storm drains instead of cascade-killing the fleet |

## 4. Business Events (Outbound)

Event family `acme`; names follow `sentin8:acme:{resource}:{operation}`.
Events are advisory/observability - no registered consumers; emission
failure is warn-and-drop (at-least-once is not required).

| Event | When |
|---|---|
| `sentin8:acme:account:created` | ACME account creation |
| `sentin8:acme:order:created` | New certificate order |
| `sentin8:acme:order:finalized` | Order finalized (cert issued) |
| `sentin8:acme:clientcert:issued` | mTLS client certificate minted |
| `sentin8:acme:certificate:revoked` | Certificate revoked |

## 5. Business Rules & Invariants (the "always true" guarantees)

1. **CA private keys never leave the data dir** - only public certs are served; the data dir is never propagated to other services.
2. **Client-cert private keys are never persisted server-side** - the combined PEM is returned exactly once.
3. **The enrollment channel mints client certs only** - never TLS server leafs; the CN prefix is the scope boundary.
4. **The enrollment claim is verified against the CURRENT captain record** read fresh from disk per request - never a spawn-time env copy.
5. **Fail-closed CA resolution** - no unauthenticated minting; no `danger_accept_invalid_certs` anywhere; callers trust only the platform Root CA.
6. Keys on disk are 0600; the trust-store install is best-effort and never gates startup.
7. The Intermediate CA is always served from the stored PEM bytes (Root-signed) - never a reconstruction.
8. ACME nonces are single-use, in-memory, time-stamped (RFC 8555 §6.5 replay protection).
9. Order authorization is single-identifier; finalize extracts all DNS identifiers into the SAN list.
10. A lost CA dir regenerates - previously issued leafs then fail validation until re-issued (fail-closed).
11. Acme's database identity is its own declared service role - it never borrows another service's role or a shared dev role; a missing or mismatched credential aborts boot (fail fast) rather than degrading the certificate plane silently.
12. **Mint overload is refused UP FRONT, deterministically, and audibly** - 503 + `Retry-After` at the queue cap, never an accepted-but-stalled mint; refusals are always warn-logged.

## 6. Target-User Roles & Use Cases

| Persona | What they do with Sentin8:Acme |
|---|---|
| Platform operator | Views/revokes certificates via the RFW admin UI; manages settings; manages Shield policies |
| Platform service (workload) | Obtains its mTLS client cert at first boot (enrollment/self-issuance); renews its identity |
| Service TLS library (on-demand SNI) | Fetches server certificates over the ACME flow when an unknown SNI arrives |
| Upstream ACME clients | Order external domains via the proxy path |
| Compliance/audit | Consumes acme lifecycle events for the certificate inventory |

## 7. KPIs / Success Criteria

- **Security**: zero CA key exposure; zero unauthenticated certificate mints; all enrollment mints logged at warn (audit visibility).
- **Availability**: bootstrap chain-of-trust holds - acme self-issues its own hostname's certificate so the platform never deadlocks on first boot; a fleet-wide cold start does NOT cascade-kill freshly spawned services (the mint shed + backoff keeps the cert plane responsive so TLS fetches succeed on retry).
- **Coverage**: every internal hostname is signable (no public-CA dependency); every fleet node trusts the Root (OS + NSS install).
- **Operability**: certificate inventory visible in admin UI; revocation announced via events.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:Captain | Brokering the sealed bootstrap-enrollment record to workload + acme at spawn |
| Sentin8:Auth | Bearer verification (JWKS) for self-issuance and operator channels |
| Sentin8:Bus | Event publishing (local outbox → produce API) |
| Sentin8:Tls (library) | In-process PQ-TLS termination; on-demand SNI resolver as the primary certificate consumer |
| sentin8-m2m (crate) | The workload-side DCR + client-cert mint integration |
| PostgreSQL (shared db) | Own service-role login + acme's own outbox table only (`acme.outbox`); the role is provisioned by the platform bootstrap so a database reset cannot strand it |
| Valkey | Traffic metrics channel |

## 9. Acceptance Criteria (what "done" looks like for the business)

1. A first-boot workload with neither cert nor token can obtain its mTLS client certificate via the enrollment channel and immediately complete DCR + token minting.
2. Every `{service}.{env}.{org}.{tld}` domain resolves to a valid platform-issued TLS certificate - no external CA required.
3. The platform Root CA is installed in the OS and Chromium/NSS trust stores on every fleet node (browsers show the platform's own green padlock).
4. A workload can re-issue its own client cert (self-issuance) and an operator can provision any declared workload's cert (issue scope).
5. Client-cert private keys are returned exactly once and never persisted server-side.
6. Admin can list certificates (bounded inventory), revoke any certificate by id, and manage settings via the RFW admin UI.
7. External domains are orderable via the upstream public ACME proxy.
8. All ACME protocol endpoints work per RFC 8555 (directory, nonces, accounts, orders, authz, challenges, finalize, download, revoke).
9. Lifecycle events are published for account/order/cert changes.
10. A deleted CA dir regenerates fail-closed - stale leafs stop validating until re-issued.
11. A fleet-wide cold-start cert storm does not starve or kill the platform: mint overload answers a clear `503 + Retry-After` (never a silent timeout), the shed self-drains, and every refusal is visible in the logs.

## 10. Open Business Questions

- CRL/OCSP distribution beyond the event path (private CA whose Root already lives in every fleet node's trust store).
- Automated leaf renewal rides the Cron-delegation pattern (recurring renewal schedule per certificate - the daily renewal sweep is registered at boot).
- Upstream (public ACME) challenge relay is scoped to `dns-01` only; the HTTP-challenge relay is a declared non-goal.


---

**Design attribution:** sentin8:acme and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

