---
title: "Sentin8:Dash - Architecture (DDD)"
sidebar_label: "Architecture (DDD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-dash/edit/main/DESIGN.md
---
# DESIGN.md: Sentin8 Dash - Detailed Design Document

> Audience: maintainers, reviewers, and architects modifying the operator
> console. For the overview read `dash/README.md`; for the business view read
> `dash/BUSINESS.md`. Everything below describes the app as implemented; the
> platform-side services (BFF, Sys, Web, Auth) are referenced only by
> contract.

## 1. Scope & Context

**Owns (client responsibilities):**

- The console shell: dynamic navigation, breadcrumbs, scope tabs, user menu,
  rail collapse persistence.
- Session UX: bootstrap, login/sign-up redirects to the BFF, sign-out,
  post-lifecycle scope refresh.
- Organization and environment lifecycle screens: creation (slug derivation,
  availability checks, domain editing), settings, member viewing, branding
  management (org + env + merged preview), audit viewing.
- **Generic Remote UI (RFW) hosting**: definition loading, rendering, data
  actions, navigation, and native-widget hosting for every registered
  service's admin pages.
- Client-side gating UX (`RlsGuard`), live updates over WebSocket, client
  observability, and the e2e automation bridge.

**Does NOT own (delegated):**

- Authentication, OAuth/PKCE, token issuance and transparent refresh -
  Sentin8:BFF + Sentin8:Auth.
- Organization/env domain data, memberships, service toggles, vertical
  registry, audit store - Sentin8:Sys.
- Enforcement of authorization (RLS + Shield policy) - every backend service.
- Admin UI definitions and admin data endpoints - each service exposes its
  own `/v1/admin/*`.
- Static hosting and multi-instance routing - Sentin8:Web + Sentin8:Captain
  registry.
- Notification delivery, stat aggregation, logging storage - their owning
  services.

```mermaid
graph TD
    subgraph DashApp["apps/dash"]
        SHELL["DashShell + RlsGuard"]
        PAGES["Native pages: bootstrap · org/env · settings · branding · audit"]
        RFW["RfwPage + RfwRenderer"]
        APIC["ApiClient / Sentin8Services"]
        WS["BffWebSocket"]
        AUTHP["AuthProvider"]
    end
    subgraph PlatformBackends
        BFF["Sentin8:BFF"]
        SYS["Sentin8:Sys"]
        AUTH["Sentin8:Auth"]
        APP["Sentin8:App"]
        STAT["Sentin8:Stat"]
        VERTS["Vertical services (runtime-registered)"]
        WEB["Sentin8:Web"]
    end
    WEB -->|"serve bundle + runtime context"| DashApp
    AUTHP -->|"GET /auth/session · POST /auth/refresh"| BFF
    PAGES -->|"GET/POST /v1/o, /v1/e, /v1/org/*, /v1/env/*, /v1/branding*, /v1/audit"| BFF
    SHELL -->|"GET /v1/verticals/services"| BFF
    RFW -->|"GET /v1/admin/ui/{page} · admin data/actions"| BFF
    WS -->|"WS /ws"| BFF
    BFF -->|"token exchange + Bearer attach"| SYS
    BFF --> VERTS
    BFF --> AUTH
    BFF --> APP
    BFF --> STAT
```

### 1.1 System Context

```mermaid
graph TD
    OP["Operator / tenant user"] -->|"browser"| DASH["Sentin8 Dash (this app)"]
    PROXY["Sentin8:Proxy / TLS"] -->|"route dash.* host"| WEB["Sentin8:Web"]
    ENVV["Org/env instance host (dash.<env>.<org>...)"] --> WEB
    DASH -->|"all API traffic"| BFF["Sentin8:BFF (bff.<host>)"]
    BFF -->|"delegated tokens + tenant binding"| SVC["Platform + vertical services"]
    SVC -->|"runtime registry + admin-UI definitions"| BFF
    CAP["Sentin8:Captain registry (Valkey)"] -->|"captain:app_dir:dash"| WEB
```

## 2. Runtime Architecture

### 2.1 Component View

```mermaid
graph TD
    subgraph Entry["main.dart"]
        APPWIDGET["DashApp: MaterialApp.onGenerateRoute (hash routes)"]
        TABLE["_generateRoute route table + RFW catch-all"]
        BRIDGE["test_bridge: window.sentin8Test*"]
    end
    subgraph Core
        AUTHP["AuthProvider (singleton)"]
        SVC["Sentin8Services: 11 named ApiClients"]
        GUARD["RlsGuard"]
        SHELL["DashShell (nav_shell)"]
        OBS["DashLogger / DashMetrics / DashAlerts"]
    end
    subgraph RFWHost["rfw/"]
        RFWPAGE["RfwPage"]
        RENDERER["SDK RfwRenderer + RfwActions"]
        CACHE["RfwCache"]
        NATIVE["Native widget registry: policy_simulator (+ placeholders)"]
    end
    subgraph Pages
        BOOT["BootstrapPage"]
        ORGS["OrganizationPicker · OrganizationHome · CreateOrg · OrgSettings · Sentin8ors"]
        ENVS["CreateEnvironment · EnvironmentHome · EnvironmentSettings"]
        MISC["Branding(Org/Env) · Audit · SignIn/SignOut · AuthCallback"]
    end
    subgraph Widgets
        SCOPE["ScopeSelector"]
        ROLE["RoleSelector"]
        SUBDOM["ClickableSubdomainField"]
        DS["theme.dart + glass panels + StatusBadge"]
    end
    APPWIDGET --> TABLE
    TABLE --> BOOT --> ORGS --> ENVS --> MISC
    TABLE -->|"#/{service}/{page}"| RFWPAGE
    GUARD -->|"wraps scoped pages"| TABLE
    BOOT --> SHELL
    RFWPAGE --> RENDERER --> NATIVE
    RFWPAGE --> CACHE
    Pages --> SVC
    RFWPAGE --> SVC
    SHELL --> SVC
    AUTHP --> SVC
    SVC -->|"fetch + headers + correlation + metrics"| OBS
    Widgets -.-> Pages
    BRIDGE -.-> Pages
```

### 2.2 Request Lifecycle - Session bootstrap and first-run routing

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant App as DashApp
    participant P as AuthProvider
    participant BFF as Sentin8:BFF
    participant SYS as Sentin8:Sys (via /proxy)
    B->>App: load build/web (hash #/ or deep link)
    App->>P: init()
    P->>BFF: GET /auth/session (credentials include)
    alt authenticated
        BFF-->>P: {user, scopes, org_id, env_id, csrf_token}
        App->>SYS: GET /v1/bootstrap
        alt memberships 0
            App->>B: route #/org/create
        else 1 membership
            App->>B: route #/home?org=...
        else several
            App->>B: route #/org
        end
    else not authenticated
        P->>B: route #/sign-in
    end
    note over P,BFF: 401-family during bootstrap → sign-out + #/sign-in · 403/404 → retry up to 5 attempts (identity settle window)
```

### 2.3 Request Lifecycle - Login via BFF redirect

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant S as SignInPage
    participant P as AuthProvider
    participant BFF as Sentin8:BFF
    participant AUTH as Sentin8:Auth
    B->>S: #/sign-in
    S->>P: signInWithAuth()
    P->>B: location.href = bff.<host>/auth/login
    BFF->>AUTH: 302 /oauth/authorize (PKCE, state = app URL)
    AUTH-->>B: hosted sign-in (auth-ui) → callback
    AUTH->>BFF: code at /auth/callback (back-channel exchange)
    BFF-->>B: set __Host-bff-session cookie, return to app URL
    B->>App: reload → BootstrapPage (see §2.2)
```

### 2.4 Request Lifecycle - RFW admin page render + action

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant R as RfwPage
    participant BFF as Sentin8:BFF
    participant SVC as Owning service
    B->>R: #/{service}/{page}?env=...
    R->>R: resolve DynamicServiceInfo (GET /v1/verticals/services) - page tabs
    loop retries: 6 × 750ms on 403 (policy identity invalidation) / 502·503·504 (fresh-env TLS)
        R->>BFF: GET /proxy/{svc}/v1/admin/ui/{page} (+target headers)
    end
    BFF-->>R: AdminUiResponse (definition)
    R->>BFF: GET /proxy/{svc}/v1/admin/{resource} (normalized)
    BFF-->>R: rows (data-unwrap across known resource keys)
    R->>B: render DataTable/Form/Card/Chart/Native
    B->>R: submit form
    R->>BFF: POST /proxy/{svc}/v1/admin/{resource} (POST-only renderer contract)
    SVC-->>R: updated AdminUiResponse → re-render
    alt failure after retries
        R->>B: error panel + retry affordance
    end
```

### 2.5 Request Lifecycle - Organization creation

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant C as CreateOrganizationPage
    participant BFF as Sentin8:BFF
    participant SYS as Sentin8:Sys
    participant P as AuthProvider
    B->>C: #/org/create
    C->>C: slug auto-derivation + debounced GET /v1/slug-available/{slug}
    C->>BFF: PUT-targeted POST /v1/o {slug, display_name, custom_domain}
    SYS-->>BFF: org created
    BFF-->>C: organization
    C->>P: refreshAndInit() - POST /auth/refresh + re-init (new scopes)
    C->>B: route #/home?org={id}
```

## 3. Data Model

The console holds no server data of its own. Client-held state:

| State | Holder | Lifetime | Purpose |
|---|---|---|---|
| Auth state (`isAuthenticated, token('bff-session') marker, userId, organizationId, environmentId, scopes, featureVersion`) | `AuthProvider` | tab session | Session-driven gating and shell identity |
| CSRF token | `AuthProvider` → `ApiClient` | tab session | `X-BFF-CSRF` on mutations |
| Derived URLs (`_bffBaseUrl = https://bff.<host>`, `_sentin8Domain`) | `AuthProvider` | tab session | Single backend authority |
| Service catalog (`VerticalService` list + pages) | fetched by shell/RFW | render scope | Dynamic nav + tab bar |
| RFW definitions (`AdminUiPage`/`AdminUiResponse`) | `RfwCache` (SDK) | page session | Page-definition reuse |
| Nav collapse boolean | `localStorage['dash.rail.collapsed']` | persistent | Shell ergonomics |
| Correlation id (`dsh-<epoch>-<rand>`) | `observability.dart` | tab session | Request tracing |
| Logger ring (1000) / metrics / alert windows | `observability.dart` | tab session | In-memory diagnostics |

Platform-scoped RFW routes use the platform system org/env ids
(`00000000-0000-0000-0000-000000000001/2`) as target context.

Data sources consumed (read models, all via BFF proxy): orgs, orgs' envs,
memberships + user enrichment, branding (org/env/merged), vertical services,
audit entries, app store listings/instances, scope catalog, bootstrap
memberships, readiness/health.

## 4. API Surface

All calls go to the BFF: session routes and `/proxy/{service}/...`. Mutations
carry `X-BFF-CSRF`; scoped calls carry `X-BFF-Target-Env-Id` or
`X-BFF-Target-Org-Id` and duplicate it into `?target_env_id=`/`?target_org_id=`.

**Session (BFF, browser fetch):**

| Endpoint | Use |
|---|---|
| `GET /auth/session` | bootstrap session (`user, scopes, org_id, env_id, csrf_token`) |
| `GET /auth/login` | redirect into OAuth PKCE flow |
| `GET /auth/sign-up` | redirect into sign-up flow |
| `POST /auth/refresh` | refresh session + re-init (scope pickup after org/env creation) |
| `POST /auth/sign-out` | end session, redirect `#/sign-in` |
| `WS /ws` | live domain-event channel (§5) |

**Through `ApiClient` → `/proxy/{service}`:**

| Service | Endpoints used |
|---|---|
| sys | `GET /v1/bootstrap` · `GET/POST /v1/o` · `GET/PUT/DELETE /v1/org/{id}` · `GET /v1/e?org_id=` · `POST /v1/e` · `GET /v1/env/{id}` · `DELETE /v1/env/{id}` · `PUT /v1/env/{id}/services` · `GET /v1/org/{id}/memberships` · `GET /v1/slug-available/{slug}` · `GET /v1/verticals/services` · `GET/PUT /v1/org/{id}/branding` · `GET/PUT /v1/env/{id}/branding` · `GET /v1/env/{id}/branding/merged` · `GET /v1/audit` · `GET /v1/readiness` · `GET /v1/health` · `GET /v1/scopes/catalog` |
| auth | `GET /v1/admin/users/{userId}` · `GET /v1/admin/audit` (fallback) |
| app | `GET/POST /v1/app/store/listings` · `PUT /v1/app/store/listings/{id}` · `DELETE /v1/app/store/listings/{id}` · `GET /v1/app/admin/instances?envId=` · `GET /v1/app/admin/instances/{id}` · `DELETE /v1/app/admin/instances/{id}` · `POST /v1/app/setup` |
| any service (RFW) | `GET /v1/admin/ui/{page}[?type=]` · `GET/POST /v1/admin/{resource}` (+ absolute `/v1/...`) |
| stat (unwired widget) | `GET /v1/data/traffic` |
| per-service health (unwired page) | `GET /v1/health` |

**Client routes (hash):** `#/` · `#/bootstrap` · `#/sign-in` · `#/sign-out` ·
`#/org` · `#/org/create` · `#/auth/callback` · `#/home?org=` · `#/home?env=` ·
`#/org/create` · `#/env/create?org=` · `#/settings?org|env=` ·
`#/sentin8ors?org=` · `#/branding?org|env=` · `#/audit?env=` · RFW catch-all
`#/{service}/{page?}` with `overview` default and extra props
(`listing_id, instance_id, app_id, app_instance_id, type`); unresolved routes →
`NotFoundPage`.

**Emits:** none - the console is a consumer; domain events are emitted by the
services it operates (observed client-side over `/ws`).

## 5. Cross-Cutting Concerns

- **Authentication/token verification**: browser holds only the HttpOnly BFF
  session cookie; the BFF performs backend PKCE/exchange and transparent
  refresh. No token is ever readable from the app.
- **Tenant resolution**: per-request `X-BFF-Target-Env-Id`/`Target-Org-Id`
  (mutually exclusive, env preempts) + duplicated query params; the BFF binds
  tenant via RFC 8693 token exchange before proxying.
- **CSRF**: `X-BFF-CSRF` from the session payload on every mutation.
- **Authorization UX**: `RlsGuard` gate order G0 session → G1 org membership
  (bootstrap, 5-settle-window retries) → G2 env fetch (3 retries;
  404 = blocked) → G3 feature map (missing key defaults enabled). Client
  guards never replace backend enforcement; ambiguous failures default to
  allowing the render so backend RLS renders what the caller may see.
- **Realtime**: `BffWebSocket` to `/ws` with subscribe message
  `{'action':'subscribe','types':[...]}`; consumed events: `sentin8:sys.org.created/updated`
  (org picker), `sentin8:sys.env.created/updated` (org home),
  `sentin8:stat.traffic.snapshot` (metrics, unwired). Reconnect: 1 s → 2^n,
  capped at 30 s after 5 failures. *Note:* `/ws` is documented as the chat
  tier; the documented domain-event tier is SSE `/subscribe`, which dash does
  not use yet (see Open Questions).
- **Correlation**: `x-sentin8-correlation-id` on every request; errors also
  surfaced through in-memory metrics/alerts.
- **Post-only mutations (RFW)**: form submissions are POSTs; update/delete
  semantics ride POST-alias routes per the renderer contract.
- **TLS/hosting posture**: served by Sentin8:Web behind the proxy (SPA
  fallback, asset streaming, `GET /v1/app/runtime/context`); single build per
  platform; no CDN fonts requirement beyond graceful fallback (Quicksand via
  bundled loader behavior with platform fallbacks).
- **i18n / a11y**: English-only strings; semantics enabled for ARIA-driven
  automation and assistive tech.

## 6. Failure Modes & Recovery

```mermaid
flowchart TD
    R[Guard / page fetch] -->|success| OK[normal render]
    R -->|401-family at bootstrap| TEARDOWN[session teardown → #/sign-in]
    R -->|403 policy identity invalidation| RETRY_A[retry 6 × 750ms]
    R -->|502/503/504 fresh-env TLS race| RETRY_A
    RETRY_A -->|recovered| OK
    RETRY_A -->|exhausted| ERR[error panel + Retry / Back to Organizations]
    R -->|RlsGuard bootstrap 403/404| RETRY_B[5 attempts 1/2/4/8s]
    RETRY_B -->|recovered| OK
    RETRY_B -->|exhausted| FORBIDDEN[_Forbidden panel: not member / env missing]
    R -->|other network error| ALLOW[default allow → backend RLS decides]
    R -->|env 404| BLOCK[notMember / envNotFound state]
    WS[WebSocket drop] -->|exponential backoff 1s→30s| RECONN[reconnect + resubscribe]
```

- **Session expiry mid-use**: proxied calls transparently refresh server-side
  in the BFF; client-visible 401s surface as `ApiException`.
- **Post-lifecycle scope lag**: `refreshAndInit()` guarantees new org/env
  grants are picked up before routing into them.
- **Identity propagation window**: bootstrap/guard settle-window retries cover
  role/cache propagation after creation flows.
- **Static hosting**: SPA fallback serves every deep link; Sentinel
  web-registry miss on a hostname is a Sentin8:Web concern, not the app's.

## 7. Concurrency & Performance Model

- Single-isolate Flutter Web; no background workers.
- Request load is naturally low (console usage); no pooling beyond browser.
- Recurring work: WebSocket reconnect loop only (no polling timers in active
  pages).
- Caches: `RfwCache` for admin-UI definitions; service catalog fetched per
  shell render; no optimistic updates (server truth per action).
- Build profile: `flutter build web --release --no-tree-shake-icons` via the
  root `build-flutter` target; tests run against Chrome
  (`make test-flutter`).

## 8. Invariants, Insecure-Defaults Rejected, Unsafe Rationale

1. Only `https://bff.<current host>` is ever addressed; no other backend.
2. `X-BFF-Target-Env-Id` and `X-BFF-Target-Org-Id` are never sent together.
3. Every mutation carries `X-BFF-CSRF`; session token never leaves HttpOnly
   cookie storage.
4. No service/vertical name is compiled into routes, widgets, or clients -
   everything is runtime metadata.
5. RFW admin mutations are POSTs; renderer never issues direct
   `DELETE`/`PUT` to services.
6. Client gates are advisory; enforcement is always backend RLS + Shield.
7. No `provider`-package state injection despite the dependency (direct
   singleton access) and no use of the `http` package for BFF traffic (browser
   `fetch` guarantees cookie + CORS semantics).
8. No unsafe/Dart-FFI usage; browser bindings via `package:web` only.

## 9. Testing Strategy

```mermaid
graph TD
    U["Widget/unit tests (test/) - page behavior, slug derivation, selectors"]
    E["E2E browser tests (e2e-ts, Playwright + chrome platform)<br/>driven via semantics DOM + window.sentin8Test* bridges<br/>real BFF → real services; no direct SQL/backend calls"]
    U --> E
```

- The app-level suite covers page rendering and widget logic (`flutter test
  --platform chrome` via `make test-flutter`).
- E2E journeys (sign-in, org/env creation, listing creation via RFW, sign-out)
  operate exclusively through the UI and BFF proxy, mirroring the platform's
  e2e testing rules.
- Deliberately not covered here: BFF/service behavior, backend authorization
  matrix, vertical admin-page content (each service's own tests + RFW contract
  tests).

## 10. Open Questions

- **Unreachable code cluster**: the go_router-era router/app/middleware, the
  duplicate shell pages, the native app-store/instance/setup/health pages, and
  the metrics table are compiled but not routed. Delete-in-favor-of-RFW or
  promote-to-native is an unresolved product/architecture decision.
- **Event channel mismatch**: dash consumes domain events over `/ws`, which
  the BFF contract assigns to chat; migrating live updates to SSE
  `/subscribe` (and reserving `/ws` for chat) is pending.
- **Unused dependencies** (`provider`, `http`) and dead statics
  (`DefaultBaseUrl`, org/env funnel metrics) should be removed or wired.
- **Theme consolidation** with `sdk/flutter/sentin8` (dash currently hides the
  SDK's tokens) - unify tokens/buttons/tables into the SDK.
- **Idempotency keys** for mutating console operations (org/env creation,
  listing install) are not client-generated; the platform's idempotency story
  for BFF proxies is pending.
- **Unbranded web manifest** leftovers and the branding theme-mode default
  inconsistency between the two env branding editors.
- **Invite/user-settings stubs** need their end-to-end product design
  (membership invitation API + user-profile destination).

---

**Design attribution:** sentin8:dash and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

