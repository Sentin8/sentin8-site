# Sentin8:Site - Business Requirements & Functionality

> Audience: product owners, business analysts, and anyone evaluating
> what sentin8.dev **does for the business**. For architecture read
> `README.md`; for wire-level detail read `DESIGN.md`.

## 1. Business Purpose

- **Explain the platform to the market**: every service, app, and SDK
  with its use cases and API surface - the "what is this and why
  should I build on it" layer the repos don't carry.
- **Differentiate on security**: the five pillars (post-quantum TLS,
  one identity plane, live authorization, mandatory tenant isolation,
  zero static secrets) are the platform's main selling point - they get
  first-page placement.
- **Funnel to verticals**: one showcase section routes visitors to
  each `{vertical}.dev` product site.
- **Never drift from the truth**: architecture/business deep-dives are
  harvested from the unit repositories at build time - the site can't
  overpromise what the code doesn't do.

## 2. Business Scope

| Capability | Delivered by |
|---|---|
| Landing with every unit | `site.json`-driven card grids (17 services, 2 starters, 2 apps, 2 SDKs) |
| Security showcase | `/docs/security` + landing pillar strip |
| Per-product detail | `/docs/services/{svc}` - use cases + API tables |
| Developer onboarding | `/docs/developers` (single-repo story), `/docs/samples` |
| Remote UI explanation | `/docs/developers/remote-ui` |
| Harvested deep-dives | `/docs/reference/{unit}` - README/DESIGN/BUSINESS/SECURITY per unit |
| Vertical routing | showcase cards → `{vertical}.dev` |

**Not owned (business boundary):**

| Concern | Owner |
|---|---|
| Shared theme/components/harvester | `sentin8-site-engine` |
| Vertical product content | each `{vertical}-site` repo |
| Unit documentation itself | each unit repository |
| DNS/domains | operator (WEB-10) |

## 3. Business Capabilities

| Area | Rule |
|---|---|
| Product pages | Every platform unit gets: overview, use cases, API surface with scopes, deep-dive links - no orphan units |
| Security claims | Only what canonical `SECURITY.md` states - never stronger marketing |
| Cross-links | Vertical showcase links are absolute `https://{vertical}.dev/` URLs |
| Freshness | Weekly scheduled rebuild harvests current repo docs without site commits |

## 4. Events (Outbound)

None - this is a static site; no platform events are emitted or
consumed.

## 5. Business Rules & Invariants

1. A unit appearing in the navbar always has an authored page.
2. Reference pages always name their source repository.
3. Broken links block the build (deployed sites have zero dead
   internal links).
4. The site works offline for local dev (sibling-folder harvest).

## 6. Target-User Roles & Use Cases

| Persona | What they do |
|---|---|
| Architect evaluating the platform | reads landing + security + service pages |
| Developer building on Sentin8 | follows quickstart → samples → reference deep-dives |
| Vertical customer | lands from `{vertical}.dev` to understand the platform underneath |
| Security/compliance reviewer | reads the five pillars + canonical SECURITY.md |

## 7. KPIs / Success Criteria

- Complete coverage: every shipped unit has a page (build-enforced).
- Search: every page in the offline local index.
- Zero broken links in production (build-enforced).

## 8. Dependencies & Reliance

| Relies on | For |
|---|---|
| `@sentin8/site-engine` | theme, components, config factories, harvester |
| Unit repos (public) | harvested reference content |
| `sentin8-ci` `site.yml` | build + deploy lane |
| GitHub Pages | hosting with custom domain |

## 9. Acceptance Criteria

1. `npm run harvest && npm run build` passes with zero broken links.
2. Landing shows all units with correct links; navbar dropdowns match
   `site.json`.
3. Reference section renders every unit repo's trio with working
   Mermaid diagrams.
4. Push to `main` deploys; the weekly schedule refreshes harvested
   content.

## 10. Open Business Questions

- When to add interactive API explorers (needs a public demo fleet).
- i18n markets.

---

**Architecture & Design:** Sentin8:Site and its underlying concepts were designed by [Hamid Jahanzad](https://www.linkedin.com/in/hamidjahanzad/).