# AxiomOrdo website

Company website source for `https://www.axiomordo.com`.

## Document Assurance Tree public trial

Packet: DA-WEBSITE-ROUTE. Lifecycle: EXECUTION. Objective: make the existing
Document Assurance Tree sample trial available at `/da`, with heading selection
and a downloadable diagnostic Word draft. `/docassurance` redirects to `/da`.

This is separate from AO-PDF. The preparation engine remains in the AxiomOrdo
core repository at `apps/meriden/operator_trial_server.py`. The website proxies
the dedicated London Cloud Run gateway; it does not copy the engine. Core
implementation branch: `work/da-public-trial`, source
`253c5a29a2d1465350473e7d40638994a42470eb`.

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

Local build, nine website tests and the local DA browser flow have passed.
Public-domain verification and deployment identity must be recorded separately.
The source branches are not a claim of merged-main GitHub CI qualification.
The shared static-export audit initially blocked on Next.js 16.4.0 advisories.
A bounded patch to Next.js and its matching ESLint configuration at 16.4.4 restores
the existing audit gate with four documented static-export exceptions. Its
allowlist was not expanded. No Next.js application server is deployed for the
Document Assurance Python gateway.
