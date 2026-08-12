---
effectiveDate: "2026-08-11"
revisionId: "aopdf-privacy-2026-08-11-r2"
reviewStatus: "operational-draft"
---

# AO-PDF Privacy Notice

AO-PDF is provided by AxiomOrdo Ltd. Questions may be sent to hello@axiomordo.com.

## Browser-local document processing

The thirteen currently admitted AO-PDF workflows process document bytes locally in your browser. AO-PDF does not upload document contents to an AxiomOrdo server or retain generated files. A tab-scoped workspace history stores only operation type, completion time, source count and bounded result classification in browser session storage. It does not store source or output filenames, document contents, extracted text or hashes, and the browser clears it when the tab session ends. Your browser handles the native save or fallback download.

## Analytics

AO-PDF uses Vercel Analytics custom events and Speed Insights. A permitted event contains only the selected admitted tool, success, failure or cancellation outcome, rounded processing duration capped at 120 seconds, and a governed error code when applicable. Vercel may provide aggregated browser, operating-system and device-class dimensions.

AO-PDF does not intentionally transmit filenames, file sizes, page counts, document contents, extracted text, document metadata, user-entered processing options, generated document bytes, or exception objects.

## Processing limits

AO-PDF applies a conservative estimated working-memory limit of 1,073,741,824 bytes. This is an estimate derived from input bytes, decoded image pixels, page overhead, simultaneous outputs, serialization duplication and operation-specific multipliers. Browsers do not expose a reliable cross-browser measure of actual PDF processing memory, so the estimate is not a guarantee that processing will succeed.

## Contact

Contact AxiomOrdo Ltd at hello@axiomordo.com for privacy questions.
