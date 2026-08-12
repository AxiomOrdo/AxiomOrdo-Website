import { PDFDocument } from 'pdf-lib';
import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { OperationError } from '@/governance/operation-errors';
import { sha256Hex } from './hash';
import {
  ASSURANCE_SCHEMA_VERSION,
  type Finding,
  type InspectionReport,
  type PageSnapshot,
  type RedactionRectangle,
  type RedactionVerification,
} from './types';

type PdfJsModule = typeof import('pdfjs-dist/types/src/pdf');

let pdfJsPromise: Promise<PdfJsModule> | undefined;

function loadPdfJs(): Promise<PdfJsModule> {
  const isBrowserRuntime =
    typeof window !== 'undefined' ||
    'importScripts' in globalThis;
  pdfJsPromise ??= isBrowserRuntime
    ? import('./pdfjs-browser-loader').then(({ loadBrowserPdfJs }) =>
        loadBrowserPdfJs() as Promise<PdfJsModule>,
      )
    : import(/* webpackIgnore: true */ 'pdfjs-dist/legacy/build/pdf.mjs') as Promise<PdfJsModule>;
  return pdfJsPromise;
}

function countAscii(bytes: Uint8Array, needle: string): number {
  const pattern = new TextEncoder().encode(needle);
  let count = 0;
  for (let index = 0; index <= bytes.length - pattern.length; index += 1) {
    let matches = true;
    for (let offset = 0; offset < pattern.length; offset += 1) {
      if (bytes[index + offset] !== pattern[offset]) {
        matches = false;
        break;
      }
    }
    if (matches) count += 1;
  }
  return count;
}

function hasAscii(bytes: Uint8Array, needle: string): boolean {
  return countAscii(bytes, needle) > 0;
}

function pdfVersion(bytes: Uint8Array): string | null {
  const header = String.fromCharCode(...bytes.slice(0, 16));
  return /^%PDF-(\d\.\d)/.exec(header)?.[1] ?? null;
}

function normalizeText(items: readonly unknown[]): string {
  return items
    .map((item) =>
      item && typeof item === 'object' && 'str' in item
        ? String((item as { str: unknown }).str)
        : '',
    )
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function load(bytes: Uint8Array): Promise<PDFDocumentProxy> {
  const { getDocument } = await loadPdfJs();
  const task = getDocument({
    data: bytes.slice(),
    isEvalSupported: false,
    useWorkerFetch: false,
    useSystemFonts: true,
  });
  try {
    return await task.promise;
  } catch (error) {
    await task.destroy();
    if (error instanceof Error && /password|encrypted/i.test(error.message)) {
      throw new OperationError('ENCRYPTED_PDF_UNSUPPORTED');
    }
    throw new OperationError('PDF_CORRUPTED');
  }
}

function canvasFor(width: number, height: number): OffscreenCanvas {
  if (typeof OffscreenCanvas === 'undefined') {
    throw new OperationError('BROWSER_RENDERING_UNSUPPORTED');
  }
  return new OffscreenCanvas(Math.max(1, Math.ceil(width)), Math.max(1, Math.ceil(height)));
}

async function renderPageHash(document: PDFDocumentProxy, pageNumber: number): Promise<string> {
  const page = await document.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 96 / 72 });
  const canvas = canvasFor(viewport.width, viewport.height);
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new OperationError('BROWSER_RENDERING_UNSUPPORTED');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({
    canvas: canvas as unknown as HTMLCanvasElement,
    canvasContext: context as unknown as CanvasRenderingContext2D,
    viewport,
  }).promise;
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return sha256Hex(await blob.arrayBuffer());
}

async function snapshotPages(
  document: PDFDocumentProxy,
  includeRenderHash: boolean,
): Promise<PageSnapshot[]> {
  const { OPS } = await loadPdfJs();
  const imageOperations = new Set<number>([
    OPS.paintImageXObject,
    OPS.paintInlineImageXObject,
    OPS.paintInlineImageXObjectGroup,
    OPS.paintImageXObjectRepeat,
    OPS.paintImageMaskXObject,
    OPS.paintImageMaskXObjectGroup,
    OPS.paintSolidColorImageMask,
  ]);
  const snapshots: PageSnapshot[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const [text, operations, annotations, renderedSha256] = await Promise.all([
      page.getTextContent(),
      page.getOperatorList(),
      page.getAnnotations({ intent: 'display' }),
      includeRenderHash ? renderPageHash(document, pageNumber) : Promise.resolve(undefined),
    ]);
    snapshots.push({
      page: pageNumber,
      widthPoints: Math.round(viewport.width * 1000) / 1000,
      heightPoints: Math.round(viewport.height * 1000) / 1000,
      rotation: viewport.rotation,
      extractedText: normalizeText(text.items),
      textItemCount: text.items.length,
      imagePaintCount: operations.fnArray.filter((item) => imageOperations.has(item)).length,
      vectorPathCount: operations.fnArray.filter((item) => item === OPS.constructPath).length,
      annotationCount: annotations.length,
      ...(renderedSha256 ? { renderedSha256 } : {}),
    });
    page.cleanup();
  }
  return snapshots;
}

export async function inspectPdf(
  input: ArrayBuffer | Uint8Array,
  options: { includeRenderHashes?: boolean } = {},
): Promise<InspectionReport> {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const document = await load(bytes);
  try {
    const [pages, metadata, attachments] = await Promise.all([
      snapshotPages(document, Boolean(options.includeRenderHashes)),
      document.getMetadata().catch(() => null),
      document.getAttachments().catch(() => null),
    ]);
    const metadataInfo = metadata?.info as Record<string, unknown> | undefined;
    const metadataFields = metadataInfo
      ? Object.keys(metadataInfo).filter((key) => metadataInfo[key] !== undefined).sort()
      : [];
    const incrementalRevisionMarkers = countAscii(bytes, '%%EOF');
    const hasAcroForm = hasAscii(bytes, '/AcroForm');
    const hasXfa = hasAscii(bytes, '/XFA');
    const hasAttachments = Boolean(attachments && Object.keys(attachments).length > 0);
    const hasJavaScript = hasAscii(bytes, '/JavaScript') || hasAscii(bytes, '/JS');
    const findings: Finding[] = [
      {
        kind: 'fact',
        code: 'PAGE_COUNT',
        message: `${pages.length} page${pages.length === 1 ? '' : 's'} parsed.`,
      },
      ...(hasAcroForm
        ? [{ kind: 'warning' as const, code: 'ACROFORM_DETECTED', message: 'An AcroForm dictionary was detected; inspect form behavior in a trusted reader.' }]
        : []),
      ...(hasXfa
        ? [{ kind: 'warning' as const, code: 'XFA_DETECTED', message: 'XFA content was detected and is not fully inspected.' }]
        : []),
      ...(hasAttachments
        ? [{ kind: 'warning' as const, code: 'ATTACHMENTS_DETECTED', message: 'Embedded attachments were detected but their safety was not assessed.' }]
        : []),
      ...(hasJavaScript
        ? [{ kind: 'warning' as const, code: 'JAVASCRIPT_SIGNAL', message: 'A JavaScript name signal was detected; this is not proof of malicious behavior.' }]
        : []),
      ...(incrementalRevisionMarkers > 1
        ? [{ kind: 'warning' as const, code: 'INCREMENTAL_REVISIONS', message: `${incrementalRevisionMarkers} end-of-file markers suggest incremental revisions.` }]
        : []),
      {
        kind: 'limitation',
        code: 'NO_THREAT_VERDICT',
        message: 'Inspection reports parser-observable facts and warnings; it does not prove a document is safe or malicious.',
      },
      {
        kind: 'recommendation',
        code: 'INDEPENDENT_REVIEW',
        message: 'Open unexpected or high-risk findings in a patched, sandboxed PDF reader.',
      },
    ];
    return {
      schema: ASSURANCE_SCHEMA_VERSION,
      reportType: 'inspection',
      pageCount: pages.length,
      pdfVersion: pdfVersion(bytes),
      incrementalRevisionMarkers,
      hasAcroForm,
      hasXfa,
      hasAttachments,
      hasJavaScript,
      metadataFields,
      pages,
      findings,
    };
  } finally {
    await document.destroy();
  }
}

export async function comparePdfSnapshots(
  input: ArrayBuffer | Uint8Array,
): Promise<PageSnapshot[]> {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const document = await load(bytes);
  try {
    return await snapshotPages(document, true);
  } finally {
    await document.destroy();
  }
}

function validateRectangles(rectangles: readonly RedactionRectangle[], pageCount: number): void {
  if (rectangles.length === 0) throw new OperationError('REDACTION_SELECTION_INVALID');
  for (const rectangle of rectangles) {
    if (
      !Number.isInteger(rectangle.page) ||
      rectangle.page < 1 ||
      rectangle.page > pageCount ||
      ![rectangle.xPercent, rectangle.yPercent, rectangle.widthPercent, rectangle.heightPercent].every(Number.isFinite) ||
      rectangle.xPercent < 0 ||
      rectangle.yPercent < 0 ||
      rectangle.widthPercent <= 0 ||
      rectangle.heightPercent <= 0 ||
      rectangle.xPercent + rectangle.widthPercent > 100 ||
      rectangle.yPercent + rectangle.heightPercent > 100
    ) {
      throw new OperationError('REDACTION_SELECTION_INVALID');
    }
  }
}

export async function redactPdfByRasterReconstruction(
  input: ArrayBuffer | Uint8Array,
  rectangles: readonly RedactionRectangle[],
): Promise<{ pdf: Uint8Array; verification: RedactionVerification }> {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const sourceInspection = await inspectPdf(bytes);
  validateRectangles(rectangles, sourceInspection.pageCount);
  if (
    sourceInspection.hasAcroForm ||
    sourceInspection.hasXfa ||
    sourceInspection.hasAttachments ||
    sourceInspection.hasJavaScript ||
    sourceInspection.incrementalRevisionMarkers > 1 ||
    sourceInspection.pages.some((page) => page.annotationCount > 0)
  ) {
    throw new OperationError('REDACTION_CONTENT_UNSUPPORTED');
  }
  const source = await load(bytes);
  try {
    const output = await PDFDocument.create({ updateMetadata: false });
    for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
      const page = await source.getPage(pageNumber);
      const pointViewport = page.getViewport({ scale: 1 });
      const renderViewport = page.getViewport({ scale: 2 });
      const canvas = canvasFor(renderViewport.width, renderViewport.height);
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new OperationError('BROWSER_RENDERING_UNSUPPORTED');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({
        canvas: canvas as unknown as HTMLCanvasElement,
        canvasContext: context as unknown as CanvasRenderingContext2D,
        viewport: renderViewport,
      }).promise;
      context.fillStyle = '#000000';
      for (const rectangle of rectangles.filter((item) => item.page === pageNumber)) {
        context.fillRect(
          (rectangle.xPercent / 100) * canvas.width,
          (rectangle.yPercent / 100) * canvas.height,
          (rectangle.widthPercent / 100) * canvas.width,
          (rectangle.heightPercent / 100) * canvas.height,
        );
      }
      const pngBytes = new Uint8Array(
        await (await canvas.convertToBlob({ type: 'image/png' })).arrayBuffer(),
      );
      const image = await output.embedPng(pngBytes);
      const outputPage = output.addPage([pointViewport.width, pointViewport.height]);
      outputPage.drawImage(image, {
        x: 0,
        y: 0,
        width: pointViewport.width,
        height: pointViewport.height,
      });
      page.cleanup();
    }
    const pdf = await output.save({ useObjectStreams: true, addDefaultPage: false });
    const outputInspection = await inspectPdf(pdf);
    const residualExtractedTextItems = outputInspection.pages.reduce(
      (sum, page) => sum + page.textItemCount,
      0,
    );
    const passed =
      residualExtractedTextItems === 0 &&
      !outputInspection.hasAcroForm &&
      !outputInspection.hasAttachments &&
      !outputInspection.hasJavaScript &&
      outputInspection.incrementalRevisionMarkers === 1;
    const verification: RedactionVerification = {
      schema: ASSURANCE_SCHEMA_VERSION,
      reportType: 'redaction-verification',
      method: 'full-page-raster-reconstruction',
      pageCount: outputInspection.pageCount,
      rectanglesApplied: rectangles.length,
      residualExtractedTextItems,
      outputHasAcroForm: outputInspection.hasAcroForm,
      outputHasAttachments: outputInspection.hasAttachments,
      outputHasJavaScript: outputInspection.hasJavaScript,
      outputIncrementalRevisionMarkers: outputInspection.incrementalRevisionMarkers,
      passed,
      supportedContentClasses: [
        'visible page text',
        'visible raster images',
        'visible vector graphics and outlines',
        'scanned page pixels',
      ],
      unsupportedContentClasses: [
        'annotations',
        'attachments',
        'AcroForm or XFA forms',
        'JavaScript-bearing documents',
        'incrementally revised documents',
        'malformed or encrypted documents',
      ],
      limitations: [
        'The output is image-only and loses selectable text, accessibility structure, links, forms, signatures, attachments, and original metadata.',
        'The user-defined rectangles determine which visible pixels are obscured; AO-PDF does not interpret whether the selected area is legally or substantively sufficient.',
        'Verification establishes bounded structural properties of the generated output, not legal admissibility or chain of custody.',
      ],
    };
    if (!passed) throw new OperationError('REDACTION_VERIFICATION_FAILED');
    return { pdf, verification };
  } finally {
    await source.destroy();
  }
}
