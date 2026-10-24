---
title: "sentin8 Flutter SDK - Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-flutter/edit/main/BUSINESS.md
---
# sentin8-flutter - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what
> sentin8-flutter **does for the business**. For the overview read
> `README.md`; for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

sentin8-flutter is the platform's **app experience kit**: the single
package every product app (platform and vertical) builds on, carrying
the design system, the app shell, and the only approved path to backend
data. The business value it delivers:

- **One brand, everywhere.** The design system (4px grid, glass panels,
  Royal Gold accent, Inter, WCAG AA) is implemented once and inherited
  by every app - the product looks like one product.
- **Tenant identity on screen.** Branding loads from the platform's
  branding tables at runtime (org base → env override) - tenants see
  THEIR brand, not ours.
- **Security without app-side secrets.** All backend traffic rides the
  BFF (tokens held server-side) - apps never handle provider tokens and
  never grow a rogue HTTP client.
- **Cheaper apps.** An app repo is mostly journeys and screens; the
  plumbing is shared, reviewed, and tested once.

## 2. Business Scope (What the Service Provides)

| Area | Capabilities |
|---|---|
| Design system | Theme implementation: grid/panels/accent/typography; accessibility floor (WCAG AA) |
| Tenant branding | Runtime brand loading (`sentin8_sys_branding`: org base → env override, non-empty wins) |
| App shell | Boot sequence, navigation frame, session bootstrap |
| Backend access | `Bff8ApiClient` - the single sanctioned backend path (`/proxy/{service}/…`) |
| Shared widgets | Common components (Material Icons by code point) |
| Platform parity | Conditional imports: native features compile only into native builds |

### What the package does NOT own (business boundary)

| Out of scope | Owner |
|---|---|
| App journeys/screens | each app repo (dash, auth-ui, vertical apps) |
| Session issuing/validation | Sentin8:Auth (the package holds a session, never issues one) |
| Token safeguarding | Sentin8:BFF (server-side token guardian) |
| Business APIs | the owning services (behind the BFF) |

## 3. Business Capabilities

| Capability | Business rule |
|---|---|
| One shared implementation | Infra exists once; apps import - no copied theme/bootstrap/client between apps |
| Branded experiences | Tenant brand overrides apply at load with org→env precedence; a tenant's product IS their brand |
| Server-held tokens | The client carries a session only; OAuth material never touches app storage |
| Single transport | Every backend request flows through `Bff8ApiClient` - auditability and policy apply uniformly |
| Accessibility floor | WCAG AA is the minimum shipped state, not an aspiration |

## 4. Business Events (Outbound)

None. The package raises no domain events; its "events" are the API
calls its apps make through the BFF (audited there).

## 5. Business Rules & Invariants

1. **Apps never call backend services directly** - the BFF path is
   exclusive; a direct HTTP import is a defect.
2. **Tokens never rest in app storage** - the BFF holds them.
3. **The design system is non-negotiable** - brand consistency is a
   product invariant.
4. **One package, many apps** - a second copy of any infra widget is a
   defect.
5. **Web/native boundary is compile-enforced** - conditional imports,
   not discipline.

## 6. Target-User Roles & Use Cases

| Persona | What they do with sentin8-flutter |
|---|---|
| App developers | Import theme/shell/client; build screens and journeys |
| Product designers | Evolve the design system in ONE place; every app improves |
| Tenants | Receive their branded product experience automatically |
| Security reviewers | Verify a single transport path and no token persistence |

## 7. KPIs / Success Criteria

- **Reuse**: zero copied infra across app repos (reviewed invariant).
- **Brand compliance**: every app renders the design system; tenant
  overrides visible end-to-end.
- **Security posture**: no token in app storage; single-path traffic in
  audits.
- **Accessibility**: WCAG AA pass rate across shared components.

## 8. Dependencies & Reliance on Other Services

| The business relies on… | For |
|---|---|
| Sentin8:BFF | The server-held-token session gateway (`/proxy/...`) |
| `sentin8_sys_branding` (Sentin8:Sys) | Tenant brand overrides |
| Flutter toolchain | Web + native build targets |

## 9. Acceptance Criteria

1. Every platform + vertical app depends on this package (no copies).
2. Tenant branding overrides render in shipped apps (org base, env
   override).
3. Traffic audits show only BFF-originated calls from apps.
4. Web builds compile from the same source as native (conditional
   imports honored).
5. Shared components pass the WCAG AA floor.

## 10. Open Business Questions

- Vertical-specific extension points (e.g. domain theming beyond color)
  wait for the first vertical app that needs more than branding.

---

**Architecture & Design:** sentin8:flutter and its underlying concepts were designed by [Hamid Jahanzad](https://www.linkedin.com/in/hamidjahanzad/).

