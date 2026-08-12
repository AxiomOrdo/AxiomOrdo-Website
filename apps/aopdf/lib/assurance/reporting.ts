import {
  ASSURANCE_SCHEMA_VERSION,
  type ComparisonReport,
  type Finding,
  type InspectionReport,
  type PageDifference,
  type PageSnapshot,
} from './types';

export function buildComparisonReport(
  left: readonly PageSnapshot[],
  right: readonly PageSnapshot[],
): ComparisonReport {
  const pageCount = Math.max(left.length, right.length);
  const pages: PageDifference[] = [];
  for (let index = 0; index < pageCount; index += 1) {
    const leftPage = left[index];
    const rightPage = right[index];
    if (!leftPage || !rightPage) {
      pages.push({
        page: index + 1,
        status: leftPage ? 'removed' : 'added',
        textChanged: true,
        renderedPageChanged: true,
        geometryChanged: true,
        annotationCountChanged: true,
      });
      continue;
    }
    const textChanged = leftPage.extractedText !== rightPage.extractedText;
    const geometryChanged =
      leftPage.widthPoints !== rightPage.widthPoints ||
      leftPage.heightPoints !== rightPage.heightPoints ||
      leftPage.rotation !== rightPage.rotation;
    const annotationCountChanged =
      leftPage.annotationCount !== rightPage.annotationCount;
    const renderedPageChanged =
      leftPage.renderedSha256 && rightPage.renderedSha256
        ? leftPage.renderedSha256 !== rightPage.renderedSha256
        : null;
    const changed =
      textChanged || geometryChanged || annotationCountChanged || renderedPageChanged !== false;
    pages.push({
      page: index + 1,
      status: changed ? 'changed' : 'unchanged',
      textChanged,
      renderedPageChanged,
      geometryChanged,
      annotationCountChanged,
    });
  }
  const findings: Finding[] = [
    {
      kind: 'fact',
      code: 'TEXT_EXTRACTION_COMPARED',
      message: 'Extracted text was compared page by page without semantic interpretation.',
    },
    {
      kind: 'fact',
      code: 'RENDERED_PAGES_COMPARED',
      message: 'Rendered page hashes were compared to detect textual, image, vector, and annotation appearance changes.',
    },
    {
      kind: 'limitation',
      code: 'NO_SEMANTIC_EQUIVALENCE',
      message: 'The report does not establish semantic, contractual, regulatory, or legal equivalence.',
    },
    {
      kind: 'limitation',
      code: 'RENDER_RESOLUTION_BOUNDED',
      message: 'Rendered comparison uses a fixed 96 DPI view and may not expose sub-pixel or non-rendered structural differences.',
    },
  ];
  return {
    schema: ASSURANCE_SCHEMA_VERSION,
    reportType: 'comparison',
    leftPageCount: left.length,
    rightPageCount: right.length,
    extractedTextChanged: pages.some((page) => page.textChanged),
    pages,
    findings,
  };
}

export function inspectionText(report: InspectionReport): string {
  return [
    'AO-PDF LOCAL INSPECTION REPORT',
    `Pages: ${report.pageCount}`,
    `PDF version: ${report.pdfVersion ?? 'not detected'}`,
    `Incremental revision markers: ${report.incrementalRevisionMarkers}`,
    `AcroForm: ${report.hasAcroForm ? 'detected' : 'not detected'}`,
    `XFA: ${report.hasXfa ? 'detected' : 'not detected'}`,
    `Attachments: ${report.hasAttachments ? 'detected' : 'not detected'}`,
    `JavaScript: ${report.hasJavaScript ? 'detected' : 'not detected'}`,
    '',
    'Findings:',
    ...report.findings.map((finding) => `- [${finding.kind}] ${finding.code}: ${finding.message}`),
    '',
    'Detected facts and warnings are not threat determinations.',
    '',
  ].join('\n');
}

export function comparisonText(report: ComparisonReport): string {
  return [
    'AO-PDF LOCAL DOCUMENT COMPARISON',
    `Left pages: ${report.leftPageCount}`,
    `Right pages: ${report.rightPageCount}`,
    `Extracted text changed: ${report.extractedTextChanged ? 'yes' : 'no'}`,
    '',
    ...report.pages.map(
      (page) =>
        `Page ${page.page}: ${page.status}; text=${page.textChanged ? 'changed' : 'same'}; rendered=${page.renderedPageChanged === null ? 'unavailable' : page.renderedPageChanged ? 'changed' : 'same'}; geometry=${page.geometryChanged ? 'changed' : 'same'}; annotations=${page.annotationCountChanged ? 'changed' : 'same'}`,
    ),
    '',
    ...report.findings.map((finding) => `[${finding.kind}] ${finding.message}`),
    '',
  ].join('\n');
}
