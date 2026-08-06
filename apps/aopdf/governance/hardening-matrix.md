# AO-PDF Hardening Matrix

This authority contains exactly 54 governed cases. Oversized and sensitive
fixtures are generated during tests and are never committed. `local-only`
means that no document byte or document-derived measurement may cross the
network boundary.

| ID | Operation | Corpus class | Expected admission | Stable error | Expected output | Metadata expectation | Network expectation | Browser coverage | Evidence location |
|---|---|---|---|---|---|---|---|---|---|
| C01 | merge | two valid PDFs | admit | — | one PDF, summed pages | new document, no source info copy | local-only | Chromium, Firefox, WebKit | `tests/pdf-operations.test.ts` |
| C02 | merge | 20 valid PDFs | admit | — | canonical merged PDF | new document | local-only | Chromium | `tests/admission.test.ts` |
| C03 | merge | 21 PDFs | reject | INPUT_COUNT_INVALID | none | n/a | no processing request | all | `tests/admission.test.ts` |
| C04 | merge | 100 MiB boundary files | admit | — | merged PDF | new document | local-only | Chromium | generated fixture |
| C05 | merge | aggregate over 250 MiB | reject | AGGREGATE_SIZE_LIMIT | none | n/a | no processing request | all | generated fixture |
| C06 | merge | 501 aggregate pages | reject | PAGE_COUNT_LIMIT | none | n/a | local parse only | all | generated fixture |
| C07 | split | selected page range | admit | — | selected-page PDF | new document | local-only | all | `tests/pdf-operations.test.ts` |
| C08 | split | 200-page every-page | admit | — | 200-entry ZIP | new documents | local-only | Chromium | generated fixture |
| C09 | split | 201-page every-page | reject | PAGE_COUNT_LIMIT | none | n/a | local parse only | all | generated fixture |
| C10 | split | empty selection | reject | SELECTION_INVALID | none | n/a | no worker request | all | `tests/admission.test.ts` |
| C11 | split | malformed range | reject | SELECTION_INVALID | none | n/a | no worker request | mobile Chromium | browser test |
| C12 | split | rotated unusual-size pages | admit | — | selected-page PDF | no full-source preservation claim | local-only | WebKit | generated fixture |
| C13 | compress | ordinary PDF | admit | — | structurally rebuilt PDF | supported info dictionary preserved | local-only | all | `tests/pdf-operations.test.ts` |
| C14 | compress | image-heavy PDF | admit within estimate | — | PDF, size may grow | supported info dictionary preserved | local-only | Chromium | generated fixture |
| C15 | compress | encrypted PDF | reject | ENCRYPTED_PDF_UNSUPPORTED | none | unchanged source | local parse only | all | generated fixture |
| C16 | compress | malformed PDF | reject | PDF_CORRUPTED | none | n/a | local parse only | all | `tests/admission.test.ts` |
| C17 | compress | memory estimate over 1 GiB | reject | ESTIMATED_MEMORY_LIMIT | none | n/a | no worker request | all | generated fixture |
| C18 | compress | worker allocation failure | fail | WORKER_MEMORY_FAILURE | none | n/a | governed event only | Chromium | `tests/worker-client.test.ts` |
| C19 | rotate | metadata-bearing PDF | admit | — | every page rotated | supported info dictionary preserved | local-only | all | `tests/pdf-operations.test.ts` |
| C20 | rotate | pre-rotated pages | admit | — | composed rotation | supported info dictionary preserved | local-only | Firefox | generated fixture |
| C21 | rotate | 3-point page boundary | admit | — | rotated PDF | supported info dictionary preserved | local-only | Chromium | generated fixture |
| C22 | rotate | page below 3 points | reject | PAGE_GEOMETRY_UNSUPPORTED | none | unchanged source | local parse only | all | generated fixture |
| C23 | rotate | 14,400-point page boundary | admit | — | rotated PDF | supported info dictionary preserved | local-only | Chromium | generated fixture |
| C24 | rotate | page above 14,400 points | reject | PAGE_GEOMETRY_UNSUPPORTED | none | unchanged source | local parse only | all | generated fixture |
| C25 | delete-pages | valid selection | admit | — | PDF with selected pages removed | supported info dictionary preserved | local-only | all | `tests/pdf-operations.test.ts` |
| C26 | delete-pages | delete every page | reject | SELECTION_INVALID | none | unchanged source | local-only | all | `tests/pdf-operations.test.ts` |
| C27 | delete-pages | out-of-range page | reject | SELECTION_INVALID | none | unchanged source | no worker request | mobile Chromium | browser test |
| C28 | delete-pages | 500-page scanned PDF | admit within estimate | — | remaining-page PDF | supported info dictionary preserved | local-only | Chromium | generated fixture |
| C29 | delete-pages | cancelled worker | cancel | OPERATION_CANCELLED | none | unchanged source | cancelled event only | all | `tests/worker-client.test.ts` |
| C30 | delete-pages | stale worker response | ignore | — | only active result accepted | active contract only | governed event only | Chromium | `tests/worker-client.test.ts` |
| C31 | watermark | printable Latin text | admit | — | watermarked PDF | supported info dictionary preserved | local-only | all | `tests/pdf-operations.test.ts` |
| C32 | watermark | 120-character text | admit | — | watermarked PDF | supported info dictionary preserved | local-only | Chromium | `tests/pdf-operations.test.ts` |
| C33 | watermark | 121-character text | reject | WATERMARK_TEXT_INVALID | none | unchanged source | no worker request | all | `tests/pdf-operations.test.ts` |
| C34 | watermark | non-printable text | reject | WATERMARK_TEXT_INVALID | none | unchanged source | no worker request | all | `tests/pdf-operations.test.ts` |
| C35 | watermark | runtime timeout | fail | PROCESSING_TIMEOUT | none | unchanged source | governed event only | Chromium | `tests/worker-client.test.ts` |
| C36 | watermark | route change during processing | cancel | OPERATION_CANCELLED | none | unchanged source | cancelled event only | mobile Chromium | browser test |
| C37 | page-numbers | metadata-bearing PDF | admit | — | numbered PDF | supported info dictionary preserved | local-only | all | `tests/pdf-operations.test.ts` |
| C38 | page-numbers | rotated pages | admit | — | numbered at selected page coordinates | supported info dictionary preserved | local-only | Firefox | generated fixture |
| C39 | page-numbers | 500 pages | admit within estimate | — | 500-page PDF | supported info dictionary preserved | local-only | Chromium | generated fixture |
| C40 | page-numbers | 501 pages | reject | PAGE_COUNT_LIMIT | none | unchanged source | local parse only | all | generated fixture |
| C41 | page-numbers | picker dismissed | cancel save | SAVE_CANCELLED | generated locally, not saved | output generated | governed cancelled event only | Chromium | `tests/download-contract.test.ts` |
| C42 | page-numbers | writable stream failure | fail delivery | DOWNLOAD_INITIATION_FAILED | generated locally | output generated | governed failure event only | Chromium | `tests/download-contract.test.ts` |
| C43 | flatten | tested AcroForm fields | admit | — | admitted widgets flattened | supported info dictionary preserved | local-only | all | `tests/pdf-operations.test.ts` |
| C44 | flatten | XFA form | reject | FORM_TYPE_UNSUPPORTED | none | unchanged source | local-only | Chromium | generated fixture |
| C45 | flatten | signature field | reject | FORM_TYPE_UNSUPPORTED | none | unchanged source | local-only | all | generated fixture |
| C46 | flatten | unsupported button widget | reject | FORM_TYPE_UNSUPPORTED | none | unchanged source | local-only | all | generated fixture |
| C47 | flatten | annotation-bearing PDF | admit without preservation claim | — | flattened supported widgets | annotation preservation unclaimed | local-only | WebKit | generated fixture |
| C48 | flatten | fallback anchor failure | fail delivery | DOWNLOAD_FALLBACK_FAILED | generated locally | output generated | governed failure event only | Firefox, WebKit | `tests/download-contract.test.ts` |
| C49 | images-to-pdf | JPG and PNG set | admit | — | one page per image | no optional descriptive metadata | local-only | all | `tests/pdf-operations.test.ts` |
| C50 | images-to-pdf | 40 MP image boundary | admit | — | one-page PDF | no optional descriptive metadata | local-only | Chromium | generated fixture |
| C51 | images-to-pdf | image over 40 MP | reject | IMAGE_DIMENSIONS_LIMIT | none | n/a | no worker request | all | `tests/admission.test.ts` |
| C52 | images-to-pdf | aggregate over 200 MP | reject | IMAGE_DIMENSIONS_LIMIT | none | n/a | no worker request | all | generated fixture |
| C53 | images-to-pdf | unsupported image type | reject | FILE_TYPE_UNSUPPORTED | none | n/a | no worker request | all | `tests/admission.test.ts` |
| C54 | images-to-pdf | fallback browser download | initiate only | — | “Download started” | no optional descriptive metadata | local-only plus governed event | Firefox, WebKit, mobile Chromium | `tests/download-contract.test.ts` |
