---
sidebar_position: 2
---

# Flutter SDK - the `sentin8_flutter` package

One Flutter package for every app: native **and** web infrastructure
from a single import - bootstrap, BFF client, shell, theme, RFW
renderer, SSE client. Apps never copy infrastructure; they import it.

## What's inside

| Piece | Role |
|---|---|
| `fetchRuntimeContext()` | resolves `AppRuntimeContext` from the app's own origin - auth domain, branding, feature flags; **fails closed** to `BootstrapErrorPage` |
| `Bff8ApiClient` | the only backend access path: `/proxy/{service}/...` with the BFF session cookie + CSRF headers; no direct-service clients exist |
| `Auth8Provider` | the auth flow against Sentin8:Auth (branding-aware) |
| Shell components | app chrome, navigation, glass-panel design system (Inter, 4px grid, Royal Gold accent) |
| RFW renderer | renders remote admin UI definitions from any service (`GET /v1/admin/ui/{page}`) |
| `NotificationSseClient` | `/subscribe` SSE with exponential reconnect |

## App rules

- **No Flutter app calls backend services directly.** All traffic
  routes through the BFF - tokens never reach the client bundle.
- **Bootstrap is fail-closed**: an unknown host or missing runtime
  context renders the error scaffold, never a guessed config.
- **Every page's backend reads are hooks** (`DataState<T>`), not bare
  futures.
- **Branding derives from `AppRuntimeContext`** - display-name fallback
  chain (instance → org → slug), colors, logo URLs, theme mode.

## Sample

```dart
import 'package:sentin8_flutter/sentin8_flutter.dart';

final ctx = await fetchRuntimeContext();   // own origin, fail-closed
final bff = Bff8ApiClient(origin: ctx.origin);
final accounts = await bff.post(
  'ledger', '/v1/accounts/search',
  body: {'query': ''},
);
```

## Deep dive

[Flutter package reference](/docs/reference/flutter/) - harvested from
`Sentin8/sentin8-flutter`.