---
sidebar_position: 1
---

# Samples

First calls against a running Sentin8 deployment — through the BFF
proxy (the only client path), from cURL, Rust, and Dart.

## 1. Sign in and list your orgs

```bash
# The BFF establishes the session; the cookie jar is the client's
# only credential store.
curl -c jar.txt \
  https://bff.ops.sys.example.com/v1/sign-in \
  -H 'content-type: application/json' \
  -d '{"email": "you@example.com", "password": "…"}'

curl -b jar.txt \
  https://bff.ops.sys.example.com/proxy/sys/v1/o
```

## 2. Create an environment

```bash
curl -b jar.txt \
  https://bff.ops.sys.example.com/proxy/sys/v1/e \
  -H 'content-type: application/json' \
  -d '{"org_id": "<org>", "name": "Production", "slug": "prod"}'
```

A 200 means fully provisioned: the access model exists, the policy
template is seeded, and your next request already carries membership.

## 3. Post a ledger transfer (bank8)

```bash
curl -b jar.txt \
  https://bff.ops.sys.example.com/proxy/ledger/v1/postings \
  -H 'content-type: application/json' \
  -d '{
    "batch_id": "b-2026-001",
    "idempotency_key": "b-2026-001",
    "instructions": [{
      "type": "transfer",
      "from_account_id": "<acct-a>",
      "to_account_id": "<acct-b>",
      "amount": "10.00",
      "denomination": "USD",
      "value_date": "2026-10-15"
    }]
  }'
```

Money is a string on the wire (`rust_decimal` end-to-end); retries
with the same `idempotency_key` are safe by construction.

## 4. From Rust (service consumer)

```rust
use sentin8::m2m;                    // workload identity
use sentin8::tls;                    // PQ-TLS transport

let transport = sentin8::middleware::build_mtls_client(
    workload, ca, cert, key,
)?;
let resp = transport
    .get(format!("{base}/v1/accounts/{id}/balances"))
    .send()
    .await?;
```

A workload's only identity is its certificate — there is no token to
configure, no secret to leak.

## 5. From Dart (app consumer)

```dart
final ctx = await fetchRuntimeContext();          // fail-closed
final bff = Bff8ApiClient(origin: ctx.origin);
final result = await bff.post('ledger', '/v1/postings', body: payload);
```

The BFF holds the tokens; the app holds a cookie.

## What every request inherits

Whichever language you call from, the platform guarantees:

1. **PQ-TLS** — X25519MLKEM768 + ML-DSA-65, no classical fallback.
2. **Verified identity** — issuer, signature, expiry, audience, type.
3. **Live authorization** — Shield decides against roles resolved now,
   not embedded in tokens.
4. **Tenant isolation** — FORCE RLS + explicit `WHERE env_id` on the
   same connection.
5. **Audit** — the action is journaled before it returns.