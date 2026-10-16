---
title: "Sentin8:Dash - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-dash/edit/main/BUSINESS.md
---
# BUSINESS.md: Sentin8 Dash - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what the
> Sentin8 operator console **does for the business**. For architecture read
> `dash/README.md`; for wire-level detail read `dash/DESIGN.md`.

## 1. Business Purpose

- Give organizations a single, secure control room to run their entire
  platform presence: create and govern organizations and environments, decide
  which services are available in each environment, and manage tenant
  branding - all without engineering involvement.
- Eliminate the per-service admin-app cost: every platform and vertical
  service publishes its admin screens as data and dash renders them, so new
  services appear in the console automatically at registration time.
- Enforce the platform's security posture end-to-end: the browser never holds
  tokens, all actions flow through the BFF with tenant binding, and every
  mutation is CSRF-protected and audited by the owning service.
- Make multi-organization, multi-environment operations ergonomic with a
  consistent shell, live updates, and clear access-denied states.

## 2. Business Scope (What the Service Provides)

| Capability | Description |
|---|---|
| Identity-based sign-in/out | Operator sign-in with delegated OAuth flows; sessions live in the BFF cookie, never in the client. |
| First-run onboarding | Zero-membership users are guided straight to organization creation. |
| Organization management | Create orgs (slug + auto-derived domain with availability check), rename, set custom domains, delete (danger zone). |
| Environment management | Create environments per org (click-to-edit subdomain), list, enable/disable services, delete. |
| Service discovery | Dynamic, runtime-registered service catalog per env/org - the console updates without releases. |
| Remote admin applications | Every service's admin pages (tables, forms, dashboards, native widgets) rendered generically from RFW definitions. |
| App store administration | Browse/create/publish/uninstall app listings and app instances (server-rendered RFW pages today; rich native pages exist unwired). |
| Branding management | Org-level and env-level logo/colors/fonts/theme mode with a merged preview. |
| Membership visibility | View organization members with user enrichment (invite action pending). |
| Audit visibility | Environment audit timeline drawn from the platform audit record. |
| Platform health visibility | Readiness across platform services (native page currently unwired). |
| Live operations feed | Real-time updates for org/env changes and operational metrics via WebSocket. |
| Guest browsing entry | A guest entry point into the organization picker surface. |

### What the service does NOT own (business boundary)

| Concern | Owner |
|---|---|
| Sign-in credential handling, OAuth, session tokens | Sentin8:BFF + Sentin8:Auth |
| Organizations, environments, memberships, service toggles | Sentin8:Sys |
| Authorization decisions (what data/actions a user may touch) | Owning service + Shield policy + RLS |
| Admin backend endpoints and admin page definitions | Each owning service |
| App store records, listings, installs | Sentin8:App |
| Static hosting of the console bundle | Sentin8:Web (+ Sentin8:Captain registry) |
| Metrics storage | Sentin8:Stat |
| Audit event storage | Sentin8:Sys |

## 3. Business Capabilities

| Area | Capability | Business rule |
|---|---|---|
| Onboarding | Guided first-run | A user with no organizations is routed directly to org creation; one org goes straight in; several get a picker. |
| Orgs | Identity via domain | Every organization gets an auto-derived domain from its display name (slug), editable before creation with live availability feedback. |
| Orgs | Namespace ownership | Organizations may claim a custom domain; a default domain can be restored at any time. |
| Orgs | Destructive control | Deleting an organization requires explicit confirmation and ends the session's membership context. |
| Environments | Scoped segregation | Environments are the unit of isolation; each gets its own subdomain derived from the org's domain. |
| Environments | Service enablement | Operators choose which registered services exist in an environment; changes reflect instantly in navigation. |
| Admin surfaces | Zero-code admin | Admin screen content, forms, and data come from the owning service at runtime - the console cannot and does not hardcode service logic. |
| Admin surfaces | Deterministic navigation | Service pages appear as tabs and tree entries exactly as registered; deep links to any service page work. |
| Branding | Layered identity | Environment branding overrides organization branding; merged previews show the final result before commit. |
| Governance | Transparency | Audit entries expose who did what and when within an environment. |
| Security UX | Least-session | Session data is opaque to the client; scope changes are picked up by an explicit refresh after lifecycle events. |
| Access UX | Informed denial | When a user lacks membership/permission, the console shows the reason with the correct recovery path rather than a generic error. |

## 4. Business Events (Outbound)

The console emits no domain events - it is a consumer and actuator.

**Inbound (consumed, live):**

| Event (observed client-side) | Business reaction |
|---|---|
| `sentin8:sys.org.created` / `sentin8:sys.org.updated` | Organization list refreshes live while open. |
| `sentin8:sys.env.created` / `sentin8:sys.env.updated` | Environment list refreshes live while open. |
| `sentin8:stat.traffic.snapshot` | Operational traffic metrics view (currently in an unwired component). |

## 5. Business Rules & Invariants

1. Every backend interaction of the console goes through the BFF proxy - the
   console never addresses services directly, never touches databases, and
   never holds OAuth tokens.
2. Exactly one tenant target applies per request: an environment target when
   one is set, otherwise an organization target - never both.
3. Service availability and admin screens come only from runtime
   registration; installing a new service makes it (and its admin pages)
   appear with zero console releases.
4. An environment's service set is shown from the authoritative registry, not
   local configuration.
5. Deletion of orgs/environments is always explicit and confirmed.
6. Denied access is always explained (not a member / environment missing /
   feature disabled), and the console always offers a constructive next step
   (retry, back to organizations, sign in).
7. Client-side gating is a convenience: the platform's authorization layer
   remains the sole enforcement authority for every action.

## 6. Target-User Roles & Use Cases

| Persona | Use case |
|---|---|
| Platform operator | Runs the system org/ops environment: monitors registry, services, branding, audit across the platform and verticals. |
| Organization owner | Creates the org, shapes its domain, and governs environments. |
| Tenant administrator | Enables services per environment, tunes branding, reviews membership and audit. |
| Service/vertical operator | Uses each service's RFW admin screens (users, tables, streams, jobs, workflows, gateways…) from one console. |
| App developer | Publishes app listings, installs app instances into an environment, and launches managed apps. |
| Vendor/aggregator role | Connects via data-consent journeys initiated from client apps (handled by the auth surfaces, administered here). |

## 7. KPIs / Success Criteria

| Area | Measure |
|---|---|
| Coverage | 100% of registered services' admin pages reachable from the console without client changes. |
| Onboarding speed | From sign-up to first working organization + environment in minutes, with live navigation updates. |
| Admin throughput | Common administrative actions (create/rename/enable/disable/brand) complete through forms without engineering intervention. |
| Security | No token material in the browser; every mutation carries CSRF and an explicit tenant target; all actions auditable. |
| Resilience | Console recovers automatically from propagation windows and TLS warm-up races via bounded retries; denials are explained, never silent. |
| Operability | Live org/env changes appear without manual refresh while screens are open. |

## 8. Dependencies & Reliance on Other Services

| Rely on | For |
|---|---|
| Sentin8:BFF | Session endpoints, proxying, tenant binding, transparent token refresh, CSRF scheme. |
| Sentin8:Sys | Organizations, environments, memberships, service enablement, vertical registry, branding records, audit, readiness. |
| Sentin8:Auth | Identity backend of the delegated flows; admin user lookup fallback. |
| Sentin8:App | App store listings, instances, setup/installation. |
| Sentin8:Web | Hosting the bundle per instance hostname. |
| Sentin8:Captain | The registry entry mapping the dash host slug to its build directory. |
| Every service (RFW) | Admin page definitions and admin data endpoints. |
| Sentin8:Stat | Traffic metrics data. |

## 9. Acceptance Criteria

1. A new user can register through the delegated flow, create an organization
   with a validated unique slug/domain, and land in it with correct scoping -
   no manual URL handling.
2. An owner can create environments, enable services, and immediately see and
   use those services' admin pages.
3. A new service can ship admin UI that appears in the console with no dash
   release or code change.
4. Administrators can rebrand orgs and environments and preview the merged
   result before saving.
5. Every admin mutation performed from the console is CSRF-protected,
   tenant-scoped, and visible in that environment's audit.
6. Users attempting to reach resources they lack membership for receive a
   precise explanation with a recovery path.
7. Signing out ends the session server-side (BFF) and the console returns to
   its sign-in screen.
8. Screens are operable via keyboard and assistive technology, and e2e
   automation can drive all core journeys through the real UI.

## 10. Open Business Questions

- Is native app-store administration (listings/instances) required as client
  screens, or is the server-rendered RFW experience the product standard?
- Which real-time operational metrics should ship in the console first (the
  traffic view exists as an unwired component), and on which channel?
- Is an invitation/membership invitation journey required at launch (the UI
  affordance is a stub today)?
- Should organizations be explorable without a session (guest entry) for
  storefront-style discovery, or does that break the access model?
- Does the admin experience need multi-tab workflows (row-level detail panes)
  beyond the current tab bar and page navigation?
- What is the product stance on in-console user-profile management (currently
  a stub menu entry)?

---

**Design attribution:** sentin8:dash and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

