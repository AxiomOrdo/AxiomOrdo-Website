# AO-PDF Document Assurance V1

Packet: `AOPDF-DOCUMENT-ASSURANCE-V1`
Lifecycle: `EXECUTION`
Implementation base: `6db4fcf980d43e50f59ab8da98fee76349f30fc8`

Verification-and-freeze packet: `AOPDF-DOCUMENT-ASSURANCE-V1-VERIFICATION-AND-FREEZE`
Lifecycle: `REVIEW`

## Supported-browser contract

This frozen AO-PDF product version supports Chromium through the repository's
Playwright `chromium` desktop and `mobile-chromium` projects. The verification
baseline is the Playwright-managed Chromium build used by the pinned
`@playwright/test` dependency. Chromium-derived browsers outside that exact
baseline may work, but are not verified by this packet.

Firefox and WebKit/Safari are unverified and unsupported for Document Assurance
V1. No compatibility claim is made for them. This boundary is material because
the assurance workflows require browser implementations of Web Workers, Web
Crypto and `OffscreenCanvas`, including `convertToBlob()`.

## Processing boundary

Inspection, comparison, hashing and redaction execute browser-locally. PDF.js
parsing uses its same-origin module worker; rendering, hashing, schema validation
and bundle assembly remain local browser operations. Document bytes, source
filenames, extracted text and hashes are not included in telemetry. Inputs are
never mutated. Every result is a new download. Session history is explicit
tab-scoped metadata in `sessionStorage`; it stores no source filename, content,
extracted text or digest.

Evidence manifests use schema `aopdf.document-assurance.v1`, SHA-256 through Web
Crypto, stable key sorting, tool version, operation, settings, an ISO timestamp,
ordered source hashes and output-artifact hashes. They record byte equality only
and do not prove authenticity, ownership, chronology, legal admissibility or
chain of custody.

## Capability and content-class matrix

| Content class | Inspect | Compare | Permanent redaction | V1 boundary |
| --- | --- | --- | --- | --- |
| Extractable text | detected and counted | text and rendered page compared | supported visible pixels; source text objects are not copied | no semantic interpretation |
| Scanned/raster images | image paints detected | rendered page compared | supported visible pixels | no OCR |
| Vector graphics/outlines | path operations counted | rendered page compared | supported visible pixels | reconstruction rasterizes vectors |
| Annotations | count and warning | count and rendered appearance compared | rejected | annotation semantics are not interpreted |
| Attachments | presence detected where parser exposes it | non-rendered attachment contents not compared | rejected | attachment safety is not assessed |
| AcroForm/XFA | presence and warning | visible render/count only | rejected | form logic is not interpreted |
| Metadata | field names reported | not treated as page equivalence | removed from new output | values are not transmitted |
| JavaScript signals | warning only | non-rendered behavior not compared | rejected | warning is not a threat verdict |
| Incremental revisions | EOF-marker warning | rendered current view only | rejected | historical revisions are not reconstructed |
| Encrypted PDFs | rejected at admission | rejected at admission | rejected at admission | password handling unavailable |
| Malformed PDFs | governed parse failure | governed parse failure | governed parse failure | no recovery claim |

## Permanent-redaction method and verification

For admitted simple PDFs, every page is rendered at 144 DPI into a fresh
`OffscreenCanvas`. User-specified rectangles replace pixels on that canvas. A
new PDF is built from the resulting PNG page images; no page, content stream,
font, image object, form, annotation, attachment, metadata or incremental update
is copied from the source.

The worker reopens the output and requires all of the following before download:

- zero extractable text items;
- no AcroForm, attachment or JavaScript signal;
- exactly one end-of-file marker;
- the expected page count.

Failure disables delivery with `REDACTION_VERIFICATION_FAILED`. This verification
is bounded to generated structure. It does not decide whether the user's selected
rectangle is substantively sufficient and does not create an authenticity,
admissibility or chain-of-custody claim.

The Chromium export test also invokes the independent `pypdf 6.15.0` reader
through `tests/evidence/verify_redacted_pdf.py`. It strictly reopens the actual
browser download and asserts the expected page count, zero extractable text,
absence of attachments and forms, absence of annotations and encryption, an
image-only page-resource shape, one terminal EOF marker, no incremental-update
pointer, and absence of a supplied source-text marker. These assertions establish
only the tested recovery resistance and structural properties of that generated
fixture; they do not establish universal irrecoverability.

The pinned setup and focused reproduction command are documented in
`tests/evidence/README.md`.

## Comparison and inspection language

Comparison separates extracted-text changes, page geometry, annotation counts
and 96 DPI rendered-page hashes. A changed render detects appearance differences,
including image changes, but a matching render does not prove semantic or legal
equivalence. Inspection separates facts, warnings, limitations and recommendations;
warnings are not proven threats.

## Dependency and licence record

| Package | Version | Licence | Purpose | Decision |
| --- | --- | --- | --- | --- |
| `pdf-lib` | `1.17.1` | MIT | existing PDF creation and admission | retained |
| `pdfjs-dist` | `5.4.624` | Apache-2.0 | browser-worker parsing, extraction and rendering | admitted |
| `jszip` | `3.10.1` | MIT OR GPL-3.0-or-later (MIT option) | existing local archive generation | retained |
| `nanoid` | `3.3.17` | MIT | patched transitive PostCSS dependency | pinned by override |
| `pypdf` | `6.15.0` | BSD-3-Clause | independent-reader evidence only | pinned with artifact hashes; not shipped |

No server-side document processing, OCR, encryption support or document-content
persistence is present. A later commercial foundation is retained as disabled,
separately compiled server source; it is excluded from the static product and
cannot activate without the gates in `commercial-foundation.md`.
