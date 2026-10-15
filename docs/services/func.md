---
sidebar_position: 11
---

# Sentin8:Func — Standalone WASM Execution Service

Tenant-authored serverless functions: sandboxed WebAssembly modules,
executed behind the platform's authorization pipeline, idempotent per
key, proxy-calling back to the owning service only for domain data
the event payload cannot carry.

## Use cases

- **Compliance hooks** — a bank runs a tenant-authored fraud-scoring
  function on every `ledger:posting:committed` event (the canonical
  trigger example).
- **Tenant custom logic** — property-specific pricing rules, message
  transforms, webhook munging — authored in any WASM-targeting
  language, zero platform redeploys.
- **Declarative triggers** — `vertical-registry.json` `event_triggers`
  bind `event_type → module/hook`; enrollment provisions them
  fleet-wide.

## API surface

| Endpoint | Method | Gate |
|---|---|---|
| `/v1/modules` | POST/GET | Shield `func:write` / verify — upload (Storage `put_if_absent`) / list |
| `/v1/modules/{id}` | GET | verify only — metadata |
| `/v1/modules/{id}/wasm` | GET | Shield `func:write` — raw binary |
| `/v1/modules/{id}` | DELETE (+`/delete` alias) | Shield `func:write` — draft/deprecated only |
| `/v1/modules/{id}/execute` | POST | cert-bound workload (Flow, triggers) or bearer |

## Deep dive

[Func reference section](/docs/reference/func/) — harvested from
`Sentin8/sentin8-func`.