---
title: "Sentin8:Auth-UI — Business rules (BRD)"
sidebar_label: "Business rules (BRD)"
mdx:
  format: md
custom_edit_url: https://github.com/Sentin8/sentin8-auth-ui/edit/main/BUSINESS.md
---
# BUSINESS.md: Sentin8 Auth Hosted UI (auth-ui) — Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating what the
> Sentin8:Auth hosted UI **does for the business**. For architecture read
> `auth-ui/README.md`; for wire-level detail read `auth-ui/DESIGN.md`.

## 1. Business Purpose

- Provide tenants and their users with a professional, brandable sign-in
  experience that reflects each organization's identity instead of a generic
  login page.
- Guarantee that every authentication journey — password sign-in, MFA,
  account recovery, consent, device approval, teller-assisted login, and
  wallet sign-in — happens inside the identity service's own security
  boundary, so credentials are never exposed to client applications.
- Make the platform immediately usable for every OAuth client without any
  client-side authentication code: consoles, CLIs, and apps redirect to the
  hosted UI and receive a verified authorization result.
- Offer consistent branding (logo, colors, fonts, sign-in text) across the
  organization and environment hierarchy with zero per-tenant engineering.

## 2. Business Scope (What the Service Provides)

| Capability | Description |
|---|---|
| Password sign-in | Single sign-in surface reused by console, CLI (device flow), and any OAuth client. |
| Self-service registration | Sign-up with name, email, password with strength metering and terms acceptance. |
| MFA verification | Six-digit TOTP challenge step when an account requires it. |
| Password self-service | Forgotten-password request and token-based reset completion. |
| Email verification | Automated token verification page for account confirmation links. |
| OAuth consent | Consent screen showing application identity and scope descriptions, with approval/denial and callback redirection. |
| Data-sharing account consent | FDX-style flow where the user selects which accounts a data aggregator may access. |
| Device approval | Human approval page for CLI device-code sign-in (user code entry). |
| Assisted login (CIBA) | Human confirmation step for operator/teller-initiated logins, including sign-in when required. |
| Wallet sign-in | Sign-in via EUDI digital identity wallet with trusted-issuer transparency and password fallback. |
| Tenant branding | Per-tenant logo, colors, fonts, sign-in text and theme mode applied at runtime. |
| Accessible experience | Screen-reader/A11y semantics enabled for assistive technology and automated testing. |

### What the service does NOT own (business boundary)

| Concern | Owner |
|---|---|
| Credential verification, MFA policy, account lockout | Sentin8:Auth |
| Authorization codes, PKCE, consent storage | Sentin8:Auth |
| Session durability | Sentin8:Auth (session cookie) |
| Reset/verification email sending | Sentin8:Auth |
| Branding storage and resolution hierarchy | Sentin8:Auth |
| Token issuance to clients (codes/tokens) | Sentin8:Auth |

## 3. Business Capabilities

| Area | Capability | Business rule |
|---|---|---|
| Sign-in | Email + password entry | Wrong credentials show a clear failure without revealing whether the account exists. |
| Sign-in | Account lockout display | Locked accounts get an explicit message for support escalation. |
| Sign-up | Registration quality gates | Password strength is shown live; duplicate emails get a non-enumerative conflict message. |
| MFA | Code entry | A wrong code allows retry; successful verification continues the original journey. |
| Password reset | Request anonymity | Requesting a reset always shows success, whether or not the email is registered. |
| Password reset | Token confirmation | Expired or used links produce an explicit "link expired" result. |
| Consent | Scope transparency | Scopes are shown with human descriptions; standard identity scopes get fixed explanations. |
| Consent | Account selection | Consumers see masked account numbers and approve exactly the accounts they check. |
| Consent | Denial | Denying consent returns the user to the relying client with a denial result, not an error page. |
| Device approval | Code binding | Only the user code presented in the link can be approved; expired codes produce a terminal state. |
| Assisted login | Binding transparency | The user sees the binding message and short code the operator gave them before confirming. |
| Wallet | Issuer transparency | The number of trusted issuers is disclosed before the wallet interaction starts. |
| Branding | Tenant identity | Logo, colors and sign-in text reflect the visiting tenant, with platform fallbacks when unset. |

## 4. Business Events (Outbound)

The UI emits no platform domain events; its outcomes are the authorization
results of Sentin8:Auth flows:

| Outcome | Effect in the business flow |
|---|---|
| Sign-in success / MFA success | Authorization code issued to the relying client at its callback URL. |
| Consent grant | Data-sharing or app authorization proceeds with the selected accounts. |
| Consent denial | Client receives `access_denied` with its own `state`. |
| Device approval | The CLI session continues on the user's device. |
| Assisted login confirmation | The operator-initiated login completes; refusal leaves the customer unauthenticated. |
| Wallet authentication | Session established for the wallet-presented identity. |

**Inbound (consumed):** none — the UI receives browser redirects and query
parameters, not platform events.

## 5. Business Rules & Invariants

1. Credentials are submitted only to the platform's identity service, never
   to any client application or intermediary.
2. A forgotten-password request never discloses whether an account exists.
3. Consent always shows the requesting application before any data is
   released, and account selection is explicit (all presented accounts
   pre-checked but individually un-checkable).
4. Device-approval and assisted-login participants always see what they are
   approving (user code / binding message) before confirming.
5. Registration requires terms acceptance and a password meeting the
   strength policy.
6. Every authentication journey that starts from an application ends with the
   user being returned to that application — never dropped on a platform page.
7. Unbranded tenants see the platform identity; branded tenants see their own,
   with platform elements (`Powered by Sentin8`) retained.

## 6. Target-User Roles & Use Cases

| Persona | Use case |
|---|---|
| Consumer / business user | Signs in to a tenant web or mobile app through the hosted UI and resumes into that app. |
| New user | Self-registers, verifies email, and lands back in their application. |
| Security-conscious user | Completes MFA and recovers forgotten passwords without support involvement. |
| Data consumer (aggregator user) | Approves exactly which bank accounts a third party may read. |
| Operator / developer | Approves a CLI's device-code sign-in from their browser. |
| Agent / teller staff | Confirms (or refuses) a login they initiated for a customer on the phone. |
| Wallet holder | Signs in with a European digital identity wallet instead of a password. |
| Tenant brand team | Publishes logo, colors, and sign-in text with no engineering effort. |

## 7. KPIs / Success Criteria

| Area | Measure |
|---|---|
| Reliability | Every sign-in journey either completes into the client callback or shows an actionable error; users are never stranded mid-flow. |
| Security | Zero credential exposure outside the auth origin; password reset responses carry no enumeration signal. |
| UX quality | Error states name the problem (wrong code, locked account, expired link) and offer a retry path. |
| Compliance posture | Consent shows scope descriptions and per-account selection before data sharing. |
| Accessibility | Automated and assistive-technology interaction succeeds against semantic DOM. |
| Brand quality | Tenant branding renders on first paint after branding fetch without layout shift to the form. |

## 8. Dependencies & Reliance on Other Services

| Rely on | For |
|---|---|
| Sentin8:Auth | All authentication APIs, branding, consent, device/CIBA/wallet endpoints, session cookies, redirect minting. |
| Platform TLS / domain model | Single auth hostname reachable per environment; no CDN dependency (fonts/frameworks degrade gracefully offline). |

## 9. Acceptance Criteria

1. A user can complete sign-in → (MFA) → callback redirect into the
   initiating application without manual URL editing.
2. A user can self-register, verify email, and sign in.
3. A user can request a password reset and complete it with the emailed link;
   the request response is identical whether or not the email exists.
4. A user can review and grant or deny OAuth consent, including selecting
   specific accounts in data-sharing consent.
5. An operator can approve or decline a device-code sign-in from any browser.
6. A staff member can confirm or refuse an assisted login using the binding
   details shown on screen.
7. A wallet holder can authenticate with their wallet, with password fallback.
8. Tenants can change logo/colors/sign-in text and see them on the next page
   load without a rebuild.
9. Screens are operable via keyboard and assistive technology.

## 10. Open Business Questions

- Should the hosted UI offer a sign-out action for users who land there
  mid-session (currently sign-out belongs to client surfaces)?
- Is enterprise SSO (SAML/OIDC) a needed entry on the sign-in page, and for
  which tenant segment?
- Should passkey (WebAuthn) sign-in/enrollment be promoted to a live journey
  once productized, replacing the dormant screens?
- Is a supported MFA-authenticator recovery journey required at launch, or is
  support-assisted recovery acceptable?
- Per-tenant custom CSS: which subset is safe and desirable to honor?

---

**Design attribution:** sentin8:auth-ui and its underlying concepts were designed by Hamid Jahanzad <Hamid@Jahanzad.com>.

