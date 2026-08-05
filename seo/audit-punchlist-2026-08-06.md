# SEO-GOD post-promotion audit punch list — 2026-08-06

Site: https://axiomordo.com
OpenSEO audit: `27532872-4618-46ff-b091-d4a8a792e881`
Money-page prioritisation: OpenSEO depth/internal-link proxy; no money-page list was supplied.

The final deployed crawl fetched 90 pages. No pages were blocked. Lighthouse completed 0 of 20 runs; all 20 failed, so no performance result is claimed.

## Promotion result

The baseline audit reported 455 issues. The first post-promotion audit reported 282. After the legacy compliance route correction, this final audit reports 216. The production changes resolved the route-level duplicate metadata, missing-H1, no-outgoing-link and duplicate-content findings for the prerendered legacy set. `/meriden-compliance` is now delivered with its own title, description and H1.

## Remaining class 1 — breakage on money pages

No broken-page, broken-internal-link, server-error, redirect-loop, or duplicate-content findings.

## Remaining class 2 — titles and meta descriptions

- `duplicate-title` — 2 root URL variants: `https://axiomordo.com/` and `https://www.axiomordo.com/`. The crawl treats the apex and www hosts as separate pages; enforce one host at the domain/deployment layer if both are intended to resolve.
- `duplicate-meta-description` — the same 2 root URL variants. Resolve with the same host canonicalisation decision.
- `missing-meta-description` — 1 URL: `/meriden/checklist.html`. Add a 70–160 character description in the producing HTML.
- `meta-description-too-long` — 1 URL: `/meriden/ai-readiness-pilot`; shorten the current 171-character description.

## Remaining class 3 — crawlability and internal linking

- `orphan-page` — 46 URLs remain. Add intentional internal links from relevant hubs, or document intentional exclusions.
- `no-outgoing-links` — 2 root URL variants: the apex and www homepage pages. Resolve the host pair and ensure the canonical homepage contains server-rendered links.
- `canonicalized-page` — 15 AOPDF URLs are canonicalized to their slash-form URLs. These are intentional trailing-slash canonicals from the static export, not broken-page findings.

## Remaining class 4 — content and headings

- `thin-content` — 79 URLs remain. Expand with authoritative, genuinely useful content, noindex, or consolidate; do not fill these with invented claims.
- `missing-h1` — 2 root URL variants: the apex and www homepage pages. Resolve the host pair and add a server-rendered homepage H1.
- `heading-order-skip` — 66 URLs remain, primarily the architecture template and AOPDF tools page. Correct heading hierarchy after deciding the authoritative content structure.

## Class 5 — performance

No performance findings can be claimed. Lighthouse failed for all 20 attempted pages; investigate the OpenSEO/Lighthouse execution environment before using performance results.

Owner for remaining content and metadata: website application owner. Owner for host redirects, canonicalisation, CDN, or Lighthouse-environment work: deployment/hosting administrator.
