# AxiomOrdo website

Company website source for `https://www.axiomordo.com`.

## Branded report gallery

`https://www.axiomordo.com/da/gallery` shows three actual report designs:
AxiomOrdo Executive Professional, Meriden Minimalist and ARDS Bold/Experimental.
ARDS is an explicitly labelled demonstration identity. All three have real
three-page SAMPLE Word/PDF documents, rendered page/detail previews and downloads.
Use this style links to Business settings preview/export, with customer access
and report qualification still gated. The existing Free builder stays three sections.

The gallery assets live in the existing public Cloud Run image; Vercel routing
and frontend deployment remain unchanged. Public runtime source and exact hashes
are recorded in core `docs/document-assurance/branded-gallery-release.md`.
Verify desktop/mobile samples and download parity with:

```sh
DA_BASE_URL=https://www.axiomordo.com node tests/da-gallery-browser.mjs
```

This check downloads real reports, verifies every image/document hash, navigates
all pages/detail views, exercises Business local export and confirms no tier grant.
It does not claim customer activation or merged-main CI.

## Current Document Assurance Free builder — 5 November 2026

Public `https://www.axiomordo.com/da` now offers exactly Introduction, Discussion
and Conclusion, direct text entry, preview and a SAMPLE Word download. Locked
Pro/Business features are visible, with no invented price or active subscription.
The Free image contains no private preparation engine. It processes text in
memory, with no application cookies, saved content or browser storage. Provider
request metadata and browser form restoration remain separate privacy boundaries.

Public runtime source `666bfcf`, revision `da-trial-00005-vf4`, image
`europe-west2-docker.pkg.dev/meriden-da-trial-931795/da-trial/free@sha256:2b9690ebf4095608ca1c79a7f637664828d118861906096e85a6dae9cce6795b`.
Actual public desktop/mobile acceptance passed using
`DA_BASE_URL=https://www.axiomordo.com node tests/da-freemium-browser.mjs`:
three text fields, preview, locked-feature explanation, actual Word XML, SAMPLE
marks/attribution, forged-tier/fourth-heading rejection, old engine API denial and
no application browser persistence. No Vercel frontend redeployment was required;
existing production routing/deployment remains as recorded below.

Private Pro/Business work is in `AxiomOrdo/AxiomOrdo` on
`work/da-report-builder-tiers`; see its `docs/document-assurance/commercial-platform-status.md`.
Customer sign-in, customer documents and billing remain gated. This website change
adds acceptance tooling/status only, with no merged-main CI claim.

## Historical public trial

The following describes the previous engine-backed synthetic trial. It is retained
as historical evidence. Its advanced endpoints are no longer public. The old
`tests/da-trial-browser.mjs` applies to an explicit internal historical gateway,
not the current public Free builder.


Packet: DA-WEBSITE-ROUTE. Lifecycle: EXECUTION. Objective: make the existing
Document Assurance Tree sample trial available at `/da`, with heading selection
and a downloadable diagnostic Word draft. `/docassurance` redirects to `/da`.

This is separate from AO-PDF. The preparation engine remains in the AxiomOrdo
core repository at `apps/meriden/operator_trial_server.py`. The website proxies
the dedicated London Cloud Run gateway; it does not copy the engine. Core
implementation branch: `work/da-sample-watermark`, source
`b1403d28c55b5232f5c0ce7562a7012b7c28acfa`.

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
DA_BASE_URL=http://127.0.0.1:8767 node tests/da-trial-browser.mjs
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
`b1403d28c55b5232f5c0ce7562a7012b7c28acfa`, Cloud Run revision
`da-trial-00004-5vt` in the dedicated Meriden London project.
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


## SAMPLE-marked Word drafts

Fresh diagnostic Word downloads now repeat a large diagonal SAMPLE watermark and
"Created using AXIOMORDO technology" at the top and bottom. Default header/footer
parts are included before preparation and hashing. The public desktop/mobile
browser checks from `946658f9f0dd514e098389c070f0d12384c1e381` verified the markings,
original body text, retained return hold and downloaded-byte SHA-256 against the
change record. Core checks passed 1,341 tests (15 existing opt-in skips), lint,
types and fingerprints. An isolated LibreOffice render checked an 11-page sample;
Microsoft Word UI testing is not asserted. This backend release needs no new
frontend deployment. Source branches remain separate from main merge-readiness.
