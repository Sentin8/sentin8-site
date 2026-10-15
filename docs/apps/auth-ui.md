---
sidebar_position: 2
---

# Sentin8:Auth-UI — The Identity App

The user-facing identity surface: sign-in, sign-up, consent,
wallet binding, branding-aware flows. One Flutter app serves every
vertical's login experience — the hostname resolves the instance,
the runtime context resolves the branding, and the auth domain is
derived from the platform's uniform hierarchy.

## Use cases

- **Unified login across verticals** — the same app signs in a bank
  customer, a hotel staff member, and an exchange trader; branding
  switches per org/env.
- **OAuth consent screens** — third-party client authorization (DCR'd
  clients, FDX recipients) renders here with the exact scopes
  requested.
- **Device flows** — `POST /oauth/device` + verify flows for
  input-constrained clients.
- **Wallet binding** — SD-JWT credential issuance and presentation.

## Deep dive

[Auth-UI reference section](/docs/reference/auth-ui/) — harvested from
`Sentin8/sentin8-auth-ui`.