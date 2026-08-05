# SEO-GOD audit punch list — 2026-08-06

Site: https://axiomordo.com
OpenSEO audit: `1efd386a-ca36-4dbd-bd45-4ca1eb1334b5`
Money-page prioritisation: OpenSEO depth/internal-link proxy; no money-page list was supplied.

The crawl fetched 90 pages. No pages were blocked. Lighthouse produced no usable performance data: 20 of 20 runs failed.

## Class 1 — breakage on money pages

No broken-page, broken-internal-link, server-error, or redirect-loop findings.

## Class 2 — titles and meta descriptions

- `missing-title` — 46 URLs, primarily routes rewritten to `public/architecture-v2/index.html`, including `/contact`, `/platforms`, `/platforms/meriden`, `/solutions`, `/resources`, `/industries`, `/company`, `/trust`, and `/legal`. The raw HTML has no title; JavaScript assigns `document.title` after load. Add server-rendered or prerendered, route-specific `<title>` values before considering these fixed.
- `duplicate-meta-description` — 70 URLs, including `/`, `/authors/phillip-inzaghi`, `/carbonledger`, `/clearmark`, `/emissary`, `/fuelpath`, `/goldenthread`, `/meriden-compliance`, and its insight routes. Define route-specific descriptions in the HTML delivered to crawlers.
- `duplicate-title` — 24 URLs, including `/`, `/authors/phillip-inzaghi`, `/carbonledger`, `/clearmark`, `/emissary`, `/fuelpath`, `/goldenthread`, and `/meriden-compliance`. Resolve together with the route metadata architecture; adding one shared fallback title would worsen this finding.
- `missing-meta-description` — `/meriden/checklist.html`. Add a descriptive 70–160 character meta description in the producing HTML file.
- `meta-description-too-long` — `/meriden/ai-readiness-pilot`; shorten the 171-character description.
- `meta-description-too-short` — `/aopdf/privacy/`, `/aopdf/terms/`, `/aopdf/acceptable-use/`; expand descriptions to roughly 70–160 characters.
- `title-too-long` — `/meriden-compliance/insights/maritime-qhse/false-assurance-maritime-compliance`; shorten the 96-character title.

## Class 3 — crawlability and internal linking

- `orphan-page` — 47 URLs, including `/aopdf`, `/carbonledger`, `/company/authority-policy`, `/company/governance`, `/company/partners`, `/emissary`, `/fuelpath`, `/goldenthread`, and several industry routes. Add intentional internal links from relevant navigational or hub pages, or document an intentional exclusion.
- `no-outgoing-links` — 21 URLs, including `/`, `/verilog`, `/emissary`, `/sentinel`, `/carbonledger`, `/fuelpath`, `/goldenthread`, `/clearmark`, and insight routes. Add relevant next-step links where the page is intended to be indexable.

## Class 4 — content and headings

- `thin-content` — 79 URLs, including `/`, `/contact`, `/platforms`, `/platforms/meriden`, `/verilog`, `/emissary`, `/sentinel`, `/carbonledger`, `/fuelpath`, and `/clearmark`. Expand with genuinely useful content, noindex, or consolidate.
- `duplicate-content` — 48 URLs, including `/aopdf` and `/aopdf/`, `/company` and its child routes, `/contact`, and industry routes. Choose canonical URLs and use redirects/canonical tags where appropriate.
- `missing-h1` — 67 URLs, including `/`, `/contact`, `/platforms`, `/platforms/meriden`, `/verilog`, `/emissary`, `/sentinel`, `/carbonledger`, `/fuelpath`, and `/clearmark`. Add one meaningful server-rendered H1 per indexable page.
- `heading-order-skip` — 47 URLs, including `/contact`, `/platforms`, `/solutions`, `/resources`, `/industries`, `/company`, `/trust`, and `/legal`. Correct heading hierarchy after route content is server-rendered.

## Class 5 — performance

No performance findings can be claimed. Lighthouse failed for all 20 attempted pages; investigate the OpenSEO/Lighthouse execution environment before using performance results.

Owner for route metadata and content: website application owner. Owner for any hosting, redirect, CDN, or Lighthouse-environment work: deployment/hosting administrator.
