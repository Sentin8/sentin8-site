---
sidebar_position: 11
---

# Sentin8:Sign - Electronic Signature Ceremonies

The platform's signature ceremony engine: a signature request (documents
+ signers + level) opens, each signer is driven through a session-bound
ceremony, the signature is minted through a provider gateway seam, and
the evidence is durably retained per tenant. One ceremony engine for
every product - AdES on the stub dispatch, QES through a qualified
trust-service provider per environment.

## Use cases

- **Contract ceremonies** - a consumer service opens a signature
  request over its documents (storage refs + hashes), lists the
  signers, and consumes the `sentin8:sign:request:completed` event -
  no polling, no call-backs.
- **Session-bound signer approval** - the approving token's replay
  identifier is recorded; a replayed or cross-session approval is
  rejected (the CIBA-shaped anti-replay rule).
- **Level honesty** - QES requests refuse to mint without a qualified
  provider configured for the environment; never a silent downgrade.
- **Append-only evidence** - signed ceremonies freeze; the evidence
  bundle (who signed, when, what they saw, provider attestation) is
  fetch-ready for legal retention.
- **Administrator replay** - a provider outage marks the request
  failed; an admin reopens it; the retry curve runs before terminal.

## API surface

| Endpoint | Method | Gate |
|---|---|---|
| `/v1/requests` | POST | Shield `request:write` - create (opens immediately) |
| `/v1/requests` · `/v1/requests/{id}` | GET | Shield `request:read` - list + detail |
| `/v1/requests/{id}/view` | POST | Shield `signer:read` - listed signer opens the ceremony |
| `/v1/requests/{id}/approve` | POST | Shield `signer:write` - session-bound sign/decline |
| `/v1/requests/{id}/evidence` | GET | Shield `request:read` - append-only evidence bundle |

## Full documentation

The complete detail lives in this product's sub-pages:

- [Architecture (DDD)](design) - the full document, harvested from the unit's repository at build time.
- [Business rules (BRD)](business) - the full document, harvested from the unit's repository at build time.
- [Security](security) - the full document, harvested from the unit's repository at build time.