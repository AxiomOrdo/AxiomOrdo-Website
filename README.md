# AxiomOrdo website

Company website source for `https://www.axiomordo.com`.

## Document Assurance Tree public trial

Packet: DA-WEBSITE-ROUTE. Lifecycle: EXECUTION. Objective: make the existing
Document Assurance Tree sample trial available at `/da`, with heading selection
and a downloadable diagnostic Word draft. `/docassurance` redirects to `/da`.

This is separate from AO-PDF. The preparation engine remains in the AxiomOrdo
core repository at `apps/meriden/operator_trial_server.py`. The website proxies
the dedicated London Cloud Run gateway; it does not copy the engine. Core
implementation branch: `work/da-usability-upgrade`, source
`ee1c613ecc879dfb2ebe89fa806c9ad01c81a590`.

Use fictional sample information only. The server uses temporary isolated sessions;
access lasts at most 15 minutes and can end earlier after restart. No account,
durable history or inference service is added. Existing report holds remain;
Word downloads are diagnostic drafts, not approved professional reports.
The trial's `/da/privacy` page explains server processing and session handling.

Vercel must build the Vite `dist` output, including the existing AO-PDF static
export; `vercel.json` declares this explicitly. The root homepage links to the
trial. The existing legacy environment reference is guarded so the browser does
not stop at the noninteractive fallback HTML.

## Verification

```sh
npm ci
npm run build
npm run test:google-start
DA_BASE_URL=https://www.axiomordo.com node tests/da-trial-browser.mjs
```

The build installs existing AO-PDF dependencies and creates its static export.
The Google Start checks use Playwright; install Chromium in `apps/aopdf` when
needed. The DA check exercises the actual notes/heading/custom-heading workflow,
validates downloaded Word XML and preserved report holds, and checks anonymous
isolation plus download revocation on desktop and mobile.

Local build, nine website tests and the DA browser flow have passed.
The public www domain also passed desktop (1280 px) and mobile (390 px) checks:
notes, standard/custom headings, actual Word XML, preserved service-return hold,
anonymous isolation and revoked old downloads. `/docassurance` redirects to `/da`;
slashless workspace links redirect to the required trailing-slash URL.

Public-check packet: DA-PUBLIC-TRIAL-LIVE-CHECK. Lifecycle: QUALIFICATION.
Status: VERIFIED for the sample-only public trial. No professional service or
merged-main readiness is asserted.

Deployed website source: `0bfd00a0e13ea5e663b3bb1cdd33dc7ec10ff862`.
Production Vercel deployment: `dpl_GQTXU7RaPShfDEmQpuAHFqnZateH` (READY),
built from that exact pushed commit. Runtime source:
`ee1c613ecc879dfb2ebe89fa806c9ad01c81a590`, Cloud Run revision
`da-trial-00003-h44` in the dedicated Meriden London project.
This later documentation update does not change either deployed application.
The source branches are not a claim of merged-main GitHub CI qualification.
The shared static-export audit initially blocked on Next.js 16.4.0 advisories.
A bounded patch to Next.js and its matching ESLint configuration at 16.4.4 restores
the existing audit gate with four documented static-export exceptions. Its
allowlist was not expanded. The patch passed typecheck, lint, 53 unit tests,
CSP verification and the browser rerun (38 passed, four existing skips). An initial
cold development-server refresh reset one redaction test; the targeted recheck
and full rerun passed. No tests were weakened. No Next.js application server is
deployed for the Document Assurance Python gateway.


## Usability upgrade verified 5 November 2026

The hosted gateway now adds fictional examples with replacement consent, searchable
headings, one-request bulk selection changes, note-confirmation progress and
page-appropriate session expiry/recovery guidance. Existing Word and source-review
holds remain. Browser checks from `9c642528eac36d50b772001a0b21bc32713bb2fd` passed
on the public www route at desktop and mobile widths, including case/profile export
counter resets, real Word XML, isolation and revoked links. Client expiry guidance
is simulated in the browser test; actual server expiry is covered separately by
gateway tests. Core app/contract checks passed 1,340 tests with 15 existing opt-in
skips, plus lint, types and fingerprints.

This upgrade changed the backend image only. The deployed frontend source and
Vercel deployment above remain current; this branch's added browser tests and
status documentation do not imply a new frontend release or merged-main CI.
