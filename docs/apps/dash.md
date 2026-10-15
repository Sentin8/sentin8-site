---
sidebar_position: 1
---

# Sentin8:Dash — Admin Rendering Host

The pure rendering host for every service's admin UI: Dash holds zero
compile-time knowledge of vertical pages. Every service publishes its
admin surface as **Remote UI (RFW) definitions** at
`GET /v1/admin/ui/{page}` — Dash fetches and renders them, and the
data mutations go through the same service's
`POST/PUT/DELETE /v1/admin/{resource}` routes.

## Use cases

- **Platform administration** — orgs, environments, services,
  branding, audit — every platform service's admin pages render in one
  place.
- **Vertical admin surfaces** — each vertical's services publish their
  own RFW pages (ledger products, FDX providers, PMS configuration);
  enrolling a vertical adds its admin UIs with zero Dash changes.
- **Tenant branding** — the rendered chrome inherits org/env
  branding from the platform's chain.

## Why RFW?

Because the alternative — a fat admin app that knows every page of
every vertical — breaks the zero compile-time coupling rule
(`architecture-principles.md` §4.14): every new vertical would require
a Dash release. With RFW, a service's admin UI ships **with the
service**.

Read the [Remote UI pattern](/docs/developers/remote-ui) for the
contract (POST alias routes, Material Icons code points).

## Deep dive

[Dash reference section](/docs/reference/dash/) — harvested from
`Sentin8/sentin8-dash`.