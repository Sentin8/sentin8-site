---
sidebar_position: 4
---

# Sentin8:Acme — Internal Certificate Authority

The platform's internal ACME certificate authority (RFC 8555): it mints
every TLS certificate in the fleet — server leaves for ingress and
services, client leaves for workload identity (`CN=m2m-{workload}`),
the PostgreSQL and Valkey planes' certificates — all anchored by an
**SLH-DSA-SHA2-128s** (hash-based, post-quantum) root CA whose trust is
installed in the OS trust store.

## Use cases

- **Workload identity minting** — every service's m2m client
  certificate (`CN=m2m-{workload}`) that identifies it on every
  service-to-service and database connection.
- **TLS server leaves** — per-service leaf certificates for the proxy's
  SNI routing and in-process TLS termination.
- **PostgreSQL/Valkey certificate identity** — the same CA anchors the
  data planes' TLS-only, client-cert authentication (no passwords
  exist in the cluster).
- **Renewal & expiry hygiene** — enrollment claims and renewal sweeps
  keep fleet certificates fresh; expired workloads re-mint on load.
- **Revocation** — admin revocation disables a workload's identity;
  certificate revocation lists (CRL) close the pre-handshake gap.

## API surface (RFC 8555 ACME)

| Audience | Endpoint | Gate |
|---|---|---|
| public | `GET /acme/directory`, `GET/HEAD /acme/new-nonce` | none |
| public | `POST /acme/new-account` | JWK in body |
| public | `POST /acme/new-order` | domain classification (local/external) |
| public | `GET /acme/authz/{id}`, `POST /acme/challenge/{id}`, finalize + cert fetch | ACME challenge flow |

## Why an internal CA?

Because the platform's trust model is **exclusive post-quantum**: the
public Web PKI does not yet issue ML-DSA-65 leaf certificates
everywhere. Owning the CA lets every connection in the fleet — and the
data planes — run hash-based signatures today, with no classical
fallback anywhere.

## Full documentation

The complete detail lives in this product's sub-pages:

- [Architecture (DDD)](design) — the full document, harvested from the unit's repository at build time.
- [Business rules (BRD)](business) — the full document, harvested from the unit's repository at build time.
- [Security](security) — the full document, harvested from the unit's repository at build time.
- [Overview (repo README)](/docs/reference/acme/) — the maintainer's README in the consolidated reference section.

