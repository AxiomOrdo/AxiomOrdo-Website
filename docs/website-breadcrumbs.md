# Website breadcrumbs

Packet: `WEBSITES-BREADCRUMBS-V1`
Lifecycle stage: `EXECUTION`
Objective: render accessible breadcrumb navigation and matching JSON-LD on public inner pages of both group websites.

Repository identity, canonical hosts, render paths, and the owner's approved visible-plus-JSON-LD design are PROVEN dependencies. Publication and Search Console access are outside this execution packet. No runtime, regulatory, catalogue, purchase, or customer-processing authority is created.

## Rendering

The architecture prerenderer uses the authored navigation/card names and known public parents. It writes the ordered navigation and one `BreadcrumbList` from the same trail. The template does not rebuild breadcrumbs from `location.pathname`. Internal templates remain without breadcrumb navigation.

The same build step updates its explicit list of authored static deployment destinations, including the ICO page, idempotently. It retains their canonical URLs and other structured data. AO-PDF renders its trails with a server component using existing tool names; each tool and the limits page has its own canonical. Canonical AO-PDF paths retain their trailing slash.

The group homepage, private/noindex pages, errors, redirect sources, and internal build assets have no breadcrumb structured data. Ancestors are links; the current page is unlinked and marked `aria-current="page"`. Labels wrap on mobile. HTML escaping and JSON serialization preserve authored text without allowing script markup.

AO-PDF's CSP hash inventory excludes `application/ld+json` data blocks. It still checks all executable inline bodies, external flight assets, prohibited CSP directives and required response headers. The deployment CSP itself is unchanged.

## Local checks

Run from the repository root:

```sh
npm run build
node --test tests/breadcrumbs.test.mjs tests/breadcrumb-rendering.test.mjs tests/csp-data-scripts.test.mjs
node --test tests/breadcrumbs.browser.test.mjs
npm run test:google-start
npm run typecheck --prefix apps/aopdf
npm run lint --prefix apps/aopdf
npm run verify:csp --prefix apps/aopdf
```

The route audit covers public deployment destinations and checks initial HTML, canonical URLs, existing ancestors, labels, positions, duplicates and exclusions. The browser fixture follows deployment rewrites, applies AO-PDF response headers and decodes encoded Next.js asset filenames only within its static asset subtree. The browser matrix checks representative routes at 360px and 1280px, with JavaScript enabled and disabled, including hydration and focus.

Validated locally on 8 November 2026: 97 public inner pages, the escaping/CSP tests, the browser matrix, nine existing website regressions, builds, typecheck, lint and CSP verification. Independent source review found no blocking issue. These results do not establish deployment, indexing, Google rich-result eligibility or production readiness.

Publishing, live URL inspection and Search Console remain separate. Run Google's Rich Results Test on representative pages and inspect the deployed URLs through the authorized Google property before reporting Google validation.

Google code-mode validation was attempted on the generated `/platforms/meriden` page. The Rich Results Test returned “Something went wrong — Log in and try again” behind its reCAPTCHA integration. No Google validation result was obtained. An authenticated owner must complete representative Google tests; this does not block the separately reported local implementation checks. No deployment or Search Console request was made.

## Production publication candidate

Packet `WEBSITES-BREADCRUMBS-PUBLISH-V1`, lifecycle PROMOTION, publishes only the breadcrumb change from each site's existing production source. AxiomOrdo uses deployed source `e90cdefeb9009cd2a2c3df4029a92460788a765c`; its company disclosures, notices, footer postprocessor and deployment configuration are preserved. The separate repair branch remains preserved and is not included by this publication. Publication authorization is the owner's instruction “publish the changes”.

The Company Site Gate now runs the new breadcrumb HTML, escaping, CSP data-block and browser tests. Its path filters include the breadcrumb helper and tests. The publication checks also preserve the deployed corporate-notice and footer audits.

The publication CI exposed an older AO-PDF test that assumed canonical-host redirects occupied the first three positions. The deployed source already places the exact `/da/workspace` slash-normalization rule first. The test now asserts that existing exception and all three contiguous canonical-host rules explicitly; deployment redirects are unchanged. The focused regression and all 53 AO-PDF unit tests passed locally after this correction.

The existing AO-PDF keyboard browser test now scopes the logo link to the header banner, because the breadcrumb correctly adds another AO-PDF link. Browser projects run serially against their shared Next development server, avoiding observed cross-project reload/resource failures. The affected desktop/mobile keyboard and redaction cases passed locally, 4/4; no runtime PDF behavior or limits changed. Test-generated Next agent guidance and development-only type references were removed/restored to the pre-test state.
