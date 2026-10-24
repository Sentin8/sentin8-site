---
title: "sentin8 Flutter SDK - Architecture (DDD)"
sidebar_label: "Architecture (DDD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-flutter/edit/main/DESIGN.md
---
# sentin8-flutter - Detailed Design Document

> Wire-level construction of the platform Flutter package. Overview in
> `README.md`; business framing in `BUSINESS.md`.

## 1. Scope & Context

`sentin8_flutter` is the ONE shared Flutter package for the whole tree
(platform + vertical apps): the design system, the shell/bootstrap
layer, and the ONLY sanctioned backend path (`Bff8ApiClient`). Apps
import modules; they never copy-paste infra and never call backend
services directly.

```mermaid
graph TD
    subgraph PKG["sentin8_flutter (this package)"]
        THEME["theme - 4px grid · glass · Royal Gold #D4AF37<br/>Inter · WCAG AA"]
        SHELL["shell - boot · nav · tenant branding load"]
        BFFC["Bff8ApiClient - token-holding BFF client<br/>/proxy/{service}/…"]
        WIDGETS["shared widgets"]
        GUARD["conditional imports - native-only guarded"]
    end
    APP["any app repo<br/>(dash, auth-ui, vertical apps)"] --> PKG
    BFFC -->|"HTTPS"| BFF["Sentin8:BFF"]
    BFF --> SVC["backend services"]
    BRANDING["sentin8_sys_branding<br/>(org base → env override)"] --> THEME
```

## 2. Module Map

| Module | Role |
|---|---|
| `theme/` | The design system implementation: grid, panels, accent, typography, accessibility floor. Tenant branding (`sentin8_sys_branding`) overrides at load: org base → env override, non-empty wins. |
| `shell/` | Boot sequence, navigation shell, session bootstrap - apps start from here. |
| `bff/` | `Bff8ApiClient`: the token-holding client; all traffic → `Bff8ApiClient → Sentin8:BFF /proxy/{service}/…`. The standalone direct-HTTP SDK pattern is deprecated. |
| `widgets/` | Shared components; Material Icons by code point (hex strings), not names. |
| conditional imports | `*.web.dart` / `*.io.dart` pairs - native-only features (e.g. platform channels) never compile into the web build and vice versa. |

## 3. Backend Traffic Contract

```mermaid
sequenceDiagram
    participant A as App widget
    participant C as Bff8ApiClient
    participant B as Sentin8:BFF
    participant S as Service

    A->>C: call("/sys/orgs", …)
    C->>B: POST /proxy/sys/orgs (session cookie/token held here)
    B->>B: token guardian (server-side tokens)
    B->>S: /v1/… (M2M/delegated)
    S-->>B: response
    B-->>C: response
    C-->>A: decoded model
```

Tokens never reach the client storage layer: the BFF holds OAuth
material server-side; the package's client carries only the session.

## 4. Invariants

1. **One package** - no app re-implements theme/boot/BFF-client.
2. **No direct backend calls from apps** - every request exits through
   `Bff8ApiClient`; a direct-HTTP import is a defect.
3. **Design system by construction** - off-grid/off-palette styling
   fails review, not just taste.
4. **Web builds stay web-safe** - native-only code hides behind
   conditional imports.
5. **Icons are code points** - Material Icons hex strings, never
   font-name lookups.

## 5. Testing Strategy

- Widget tests per shared component (golden-safe where layout-critical).
- BFF-client tests: request shaping, error mapping - against a mocked
  BFF, never a live fleet.
- App repos own their journey tests; the package owns only its units.
  Web builds exercise the web halves of every conditional import.

## 6. Open Questions

- Icon font subsetting strategy for packaged web builds.
- Deeplink/universal-link conventions for vertical apps landing in the
  shell.

---

**Architecture & Design:** sentin8:flutter and its underlying concepts were designed by [Hamid Jahanzad](https://www.linkedin.com/in/hamidjahanzad/).

