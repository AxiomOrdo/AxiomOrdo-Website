import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { sha256Hex, utf8 } from '../lib/assurance/hash';
import {
  createEvidenceManifest,
  evidenceManifestText,
  stableJson,
} from '../lib/assurance/manifest';
import { buildComparisonReport } from '../lib/assurance/reporting';
import { parseRedactionRectangles } from '../lib/assurance/redaction-selection';
import { inspectPdf } from '../lib/assurance/browser-pdf';
import {
  clearWorkspaceHistory,
  readWorkspaceHistory,
  writeWorkspaceHistory,
} from '../lib/assurance/workspace-history';
import type { PageSnapshot, WorkspaceHistoryEntry } from '../lib/assurance/types';
import {
  assertComparisonReport,
  assertEvidenceManifest,
  assertInspectionReport,
} from '../lib/assurance/schemas';

async function textPdf(text = 'Assurance fixture'): Promise<Uint8Array> {
  const document = await PDFDocument.create({ updateMetadata: false });
  const font = await document.embedFont(StandardFonts.Helvetica);
  const page = document.addPage([300, 400]);
  page.drawText(text, { x: 60, y: 300, font, size: 18 });
  return document.save({ useObjectStreams: false });
}

test('SHA-256 and manifest serialization are deterministic for fixed inputs', async () => {
  assert.equal(
    await sha256Hex(utf8('abc')),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
  const output = { role: 'report.txt', mediaType: 'text/plain', bytes: utf8('report') };
  const manifest = await createEvidenceManifest({
    operation: 'inspect',
    createdAt: '2026-08-11T00:00:00.000Z',
    settings: { zeta: true, alpha: 1 },
    sources: [utf8('source')],
    outputs: [output],
    claims: ['Bounded claim.'],
    limitations: ['Bounded limitation.'],
  });
  assert.equal(manifest.processingBoundary, 'browser-local');
  assert.equal(manifest.sources[0]?.sha256, await sha256Hex(utf8('source')));
  assert.equal(manifest.outputs[0]?.sha256, await sha256Hex(output.bytes));
  assert.ok(stableJson(manifest).indexOf('"alpha"') < stableJson(manifest).indexOf('"zeta"'));
  assert.match(evidenceManifestText(manifest), /does not prove authenticity/i);
  assert.doesNotThrow(() => assertEvidenceManifest(manifest));
  assert.throws(
    () => assertEvidenceManifest({ ...manifest, createdAt: 'not-a-date' }),
    /manifest timestamp/,
  );
});

test('inspection distinguishes facts, warnings, and limitations', async () => {
  const document = await PDFDocument.load(await textPdf(), { updateMetadata: false });
  document.setTitle('Inspection fixture');
  const form = document.getForm();
  const field = form.createTextField('reviewer');
  field.addToPage(document.getPage(0), { x: 30, y: 30, width: 100, height: 20 });
  const report = await inspectPdf(await document.save({ useObjectStreams: false }));
  assert.equal(report.pageCount, 1);
  assert.equal(report.hasAcroForm, true);
  assert.ok(report.pages[0]?.textItemCount);
  assert.ok(report.pages[0]?.annotationCount);
  assert.ok(report.findings.some((finding) => finding.kind === 'warning'));
  assert.ok(report.findings.some((finding) => finding.kind === 'limitation'));
  assert.ok(report.metadataFields.includes('Title'));
  assert.doesNotThrow(() => assertInspectionReport(report));
});

test('inspection handles image-only, malformed, and incremental-marker cases explicitly', async () => {
  const scanned = await PDFDocument.create({ updateMetadata: false });
  const png = await scanned.embedPng(
    Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'),
  );
  const page = scanned.addPage([100, 100]);
  page.drawImage(png, { x: 0, y: 0, width: 100, height: 100 });
  const scannedReport = await inspectPdf(await scanned.save({ useObjectStreams: false }));
  assert.equal(scannedReport.pages[0]?.textItemCount, 0);
  assert.ok((scannedReport.pages[0]?.imagePaintCount ?? 0) > 0);

  await assert.rejects(
    () => inspectPdf(utf8('%PDF-1.7\nmalformed\n%%EOF')),
    (error) => (error as { code?: string }).code === 'PDF_CORRUPTED',
  );

  const ordinary = await textPdf();
  const extraMarker = new Uint8Array(ordinary.length + 7);
  extraMarker.set(ordinary);
  extraMarker.set(utf8('\n%%EOF'), ordinary.length);
  const revisionReport = await inspectPdf(extraMarker);
  assert.equal(revisionReport.incrementalRevisionMarkers, 2);
  assert.ok(revisionReport.findings.some((finding) => finding.code === 'INCREMENTAL_REVISIONS'));
});

function snapshot(overrides: Partial<PageSnapshot> = {}): PageSnapshot {
  return {
    page: 1,
    widthPoints: 300,
    heightPoints: 400,
    rotation: 0,
    extractedText: 'same',
    textItemCount: 1,
    imagePaintCount: 0,
    vectorPathCount: 0,
    annotationCount: 0,
    renderedSha256: 'a'.repeat(64),
    ...overrides,
  };
}

test('comparison reports text, render, geometry, annotation, and page-count changes separately', () => {
  const report = buildComparisonReport(
    [snapshot(), snapshot({ page: 2 })],
    [snapshot({ extractedText: 'changed', renderedSha256: 'b'.repeat(64), annotationCount: 1 })],
  );
  assert.equal(report.extractedTextChanged, true);
  assert.deepEqual(report.pages.map((page) => page.status), ['changed', 'removed']);
  assert.equal(report.pages[0]?.textChanged, true);
  assert.equal(report.pages[0]?.renderedPageChanged, true);
  assert.equal(report.pages[0]?.annotationCountChanged, true);
  assert.ok(report.findings.some((finding) => finding.code === 'NO_SEMANTIC_EQUIVALENCE'));
  assert.doesNotThrow(() => assertComparisonReport(report));
});

test('redaction rectangle parsing is stable and fails closed outside page bounds', () => {
  assert.deepEqual(parseRedactionRectangles('2,10,20,30,40\n1,0,0,10,10', 2), [
    { page: 1, xPercent: 0, yPercent: 0, widthPercent: 10, heightPercent: 10 },
    { page: 2, xPercent: 10, yPercent: 20, widthPercent: 30, heightPercent: 40 },
  ]);
  assert.throws(
    () => parseRedactionRectangles('1,90,0,20,10', 1),
    (error) => (error as { code?: string }).code === 'REDACTION_SELECTION_INVALID',
  );
});

test('workspace history stores bounded metadata only and can be cleared', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  } as Storage;
  const entry: WorkspaceHistoryEntry = {
    operation: 'inspect',
    completedAt: '2026-08-11T00:00:00.000Z',
    sourceCount: 1,
    assurance: 'generated',
  };
  const legacyEntry = { ...entry, outputFilename: 'source-ao-pdf-inspection.zip' };
  writeWorkspaceHistory(storage, [legacyEntry]);
  assert.deepEqual(readWorkspaceHistory(storage), [entry]);
  assert.doesNotMatch(
    [...values.values()].join(''),
    /source-ao-pdf|\.pdf|\.zip|%PDF|sha256/i,
  );
  clearWorkspaceHistory(storage);
  assert.deepEqual(readWorkspaceHistory(storage), []);
});
