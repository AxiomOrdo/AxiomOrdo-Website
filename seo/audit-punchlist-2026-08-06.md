# SEO-GOD post-promotion audit punch list — 2026-08-06

Site: https://axiomordo.com
OpenSEO audit: `6b8b7436-b7d1-4de2-8aea-e85b6ea98348`
Money-page prioritisation: OpenSEO depth/internal-link proxy; no money-page list was supplied.

The deployed crawl fetched 90 pages. No pages were blocked. Lighthouse produced no usable performance data: 20 of 20 runs failed.

## Promotion result

The prior audit reported 455 issues. This audit reports 282. The route prerendering change resolved 184 previously observed rows: 46 `missing-title`, 46 `duplicate-meta-description`, 46 `missing-h1`, and 46 `duplicate-content` findings. Eleven new or changed findings appeared from newer remote content merged during promotion, so the arithmetic is `455 - 184 + 11 = 282`.

## Remaining class 1 — breakage on money pages

No broken-page, broken-internal-link, server-error, or redirect-loop findings.

## Remaining class 2 — titles and meta descriptions

- `duplicate-meta-description` — 24 URLs remain, primarily non-architecture pages such as the root, author, platform, and insight routes. Give each delivered page a unique description.
- `duplicate-title` — 24 URLs remain in the same non-architecture content set. Give each delivered page a unique title.
- `missing-meta-description` — 1 URL remains: `/meriden/checklist.html`.
- `title-too-long` — 9 URLs; shorten each affected title to roughly 50–60 characters.
- `meta-description-too-long` — 4 URLs; shorten each affected description to roughly 70–160 characters.
- `meta-description-too-short` — 3 URLs: `/aopdf/privacy/`, `/aopdf/terms/`, `/aopdf/acceptable-use/`.

## Remaining class 3 — crawlability and internal linking

- `orphan-page` — 47 URLs remain. Add intentional internal links from relevant hubs, or document intentional exclusions.
- `no-outgoing-links` — 21 URLs remain. Add relevant next-step links where the page is intended to be indexable.

## Remaining class 4 — content and headings

- `thin-content` — 79 URLs remain. Expand with genuinely useful content, noindex, or consolidate.
- `duplicate-content` — 2 URLs remain. Choose canonical URLs and use redirects/canonical tags where appropriate.
- `missing-h1` — 21 URLs remain outside the prerendered architecture route set. Add one meaningful server-rendered H1 per indexable page.
- `heading-order-skip` — 47 URLs remain. Correct heading hierarchy after route content is server-rendered.

## Class 5 — performance

No performance findings can be claimed. Lighthouse failed for all 20 attempted pages; investigate the OpenSEO/Lighthouse execution environment before using performance results.

Owner for remaining content and metadata: website application owner. Owner for hosting, redirect, CDN, or Lighthouse-environment work: deployment/hosting administrator.
