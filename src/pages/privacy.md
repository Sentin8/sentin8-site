---
title: Privacy Policy
description: How the Sentin8 platform and the sentin8.dev website handle personal data.
---

# Privacy Policy

Sentin8 is an infrastructure platform for regulated industries. This policy
explains what personal data the platform and this website process, why, and
the guarantees that protect it.

## The short version

- This website is fully static. It sets **no cookies**, embeds **no
  third-party trackers**, and sends **no analytics** about your visit
  anywhere. The only client-side font/asset loads come from this site's own
  origin.
- Tenant deployments of Sentin8 are the **data controllers** for the personal
  data in their environments. The platform stores tenant data only inside
  the tenant's own database, isolated by mandatory row-level security.
- We do not sell, rent, or share personal data with third parties for
  marketing or advertising. Ever.

## What the platform processes

Sentin8 is a **platform**, not a hosted consumer service. A tenant
organization (for example a bank or a hotel operator) deploys and operates
its own Sentin8 environment. The tenant is the data controller for the
personal data inside that environment.

| Data | Where it lives | Who controls it |
|---|---|---|
| End-user accounts (email, credentials, M factors) | The tenant's environment database | The tenant |
| Authentication events and audit trail | The tenant's environment database | The tenant |
| Application business data | The tenant's environment database | The tenant |

## How the platform protects that data

The security measures below apply to every tenant environment **by
construction** - they are not optional configuration:

1. **Mandatory tenant isolation.** Every tenant table is protected by
   PostgreSQL row-level security with `FORCE ROW LEVEL SECURITY`. No role
   on the platform carries `BYPASSRLS`. A database connection simply cannot
   read another tenant's rows.
2. **Post-quantum TLS, exclusively.** Every connection - browser to edge,
   service to service, service to database - negotiates post-quantum key
   exchange (X25519MLKEM768) with ML-DSA-65 certificate signatures. There is
   no classical fallback.
3. **One identity plane.** Sentin8:Auth is the only token issuer. No
   service mints its own credentials or sessions.
4. **Live authorization.** Access is decided per request against live
   role assignments - never against long-lived embedded claims.
5. **Certificate-only workload identity.** Every server process
   authenticates with a cryptographic client certificate. There are no
   database passwords, static API keys, or client secrets anywhere on the
   platform.
6. **No plaintext secrets.** Provider tokens, payment credentials, and
   private keys are stored by reference only - the database never holds the
   secret material.

## Cookies and tracking

sentin8.dev itself serves static pages. It does not:

- set first-party cookies (besides any your browser stores for the site's
  own operation),
- load third-party analytics, ads, or tracking scripts,
- fingerprint visitors.

Tenant-hosted sign-in pages (the Sentin8:Auth hosted UI) use strictly
necessary session cookies only, scoped to the tenant's own domain. Those
cookies exist to keep you signed in and to protect against cross-site
request forgery. They are never used for advertising or profiling.

## Data retention

We retain:

- **This website:** nothing. There is no server-side visitor log for
  sentin8.dev beyond what the hosting provider (GitHub Pages) processes to
  serve pages.
- **Tenant environments:** retention is set by the tenant, the data
  controller. The platform provides the audit and deletion surfaces the
  tenant needs to implement its own retention policy.

## Your rights

Because the tenant is the data controller for its environment, requests
about personal data inside a tenant environment (access, correction,
deletion, export) should be directed to that tenant. We do not have access
to tenant environment data - the isolation described above is enforced
against us too.

For questions about this policy or the sentin8.dev website itself, contact
the maintainers via the repository's public channels.

## Changes

This policy may be updated to keep it accurate. The canonical version always
lives at this address.

---

**Architecture & Design:** Sentin8 and its underlying concepts were designed by [Hamid Jahanzad](https://www.linkedin.com/in/hamidjahanzad/).
