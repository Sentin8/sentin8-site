---
sidebar_position: 9
---

# Sentin8:Secrets — Secret Reference Store & Resolver

The platform's zero-plaintext-secrets discipline, enforced: provider
tokens, OAuth client secrets, webhook signing keys, and private keys
are stored **by reference only**. Application tables carry pointers;
the values live here, versioned, rotatable, auditable.

## Use cases

- **Credential indirection** — a bank connection profile stores
  `secrets://provider-token/{id}`, never the token; the owner service
  resolves at call time behind its workload identity.
- **Rotation without migrations** — `POST /rotate` bumps the version
  and history; consumers pick the new value on next resolve. No
  database migration ever rewrites secrets.
- **Expiry hygiene** — scheduled sweeps flag expiring secrets before
  they strand integrations.
- **Soft-disable** — a compromised secret is disabled and resolves
  404-equivalent instantly, without deleting history.

## API surface

| Endpoint | Method | Gate |
|---|---|---|
| `/v1/secrets/{name}` | PUT | Shield `secret:write` — create/upsert (version++) |
| `/v1/secrets` · `/v1/secrets/{name}` · `/history` | GET | Shield `secret:read` — metadata only |
| `/v1/secrets/{name}/rotate` | POST | Shield `secret:write` |
| `/v1/secrets/{name}` | DELETE | Shield `secret:admin` — soft-disable |

## Full documentation

The complete detail lives in this product's sub-pages:

- [Architecture (DDD)](design) — the full document, harvested from the unit's repository at build time.
- [Business rules (BRD)](business) — the full document, harvested from the unit's repository at build time.
- [Security](security) — the full document, harvested from the unit's repository at build time.
- [Overview (repo README)](/docs/reference/secrets/) — the maintainer's README in the consolidated reference section.

