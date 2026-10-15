---
sidebar_position: 14
---

# Sentin8:AI — Platform AI Capability Layer

AI with the same authorization discipline as everything else:
embeddings, chat, completions, and document ingestion behind Shield
scopes and tenant isolation. Per-env configuration, tenant-authored
knowledge bases, and audit on every call.

## Use cases

- **Semantic search** — embed documents per tenant; queries retrieve
  only that env's vectors.
- **Assistants** — chat surfaces in vertical apps (teller support,
  front-desk guest help) call the platform's AI through the BFF with
  user tokens.
- **Document intelligence** — ingestion pipelines chunk, embed, and
  index uploads from Sentin8:Storage.

## API surface

| Endpoint | Method | Gate |
|---|---|---|
| `/v1/health` | GET | none |
| `/v1/embed` | POST | Shield `sentin8:ai:embed` |
| `/v1/chat` | POST | Shield `sentin8:ai:chat` |
| `/v1/documents` | POST/GET | Shield `sentin8:ai:documents:write` |
| `/v1/documents/{id}` | DELETE | Shield `sentin8:ai:documents:write` |

## Deep dive

[AI reference section](/docs/reference/ai/) — harvested from
`Sentin8/sentin8-ai`.