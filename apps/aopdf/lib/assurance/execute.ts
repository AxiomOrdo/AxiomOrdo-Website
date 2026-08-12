import JSZip from 'jszip';
import type { WorkerOptions } from '@/workers/protocol';
import { comparePdfSnapshots, inspectPdf, redactPdfByRasterReconstruction } from './browser-pdf';
import { sha256Hex, utf8 } from './hash';
import {
  createEvidenceManifest,
  evidenceManifestText,
  stableJson,
  type ManifestArtifact,
} from './manifest';
import { buildComparisonReport, comparisonText, inspectionText } from './reporting';
import type { AssuranceTool } from './types';
import {
  assertComparisonReport,
  assertEvidenceManifest,
  assertInspectionReport,
  assertRedactionVerification,
} from './schemas';

async function assuranceBundle(args: {
  operation: AssuranceTool;
  createdAt: string;
  sources: readonly ArrayBuffer[];
  settings: Readonly<Record<string, string | number | boolean>>;
  artifacts: readonly ManifestArtifact[];
  claims: readonly string[];
  limitations: readonly string[];
}): Promise<ArrayBuffer> {
  const manifest = await createEvidenceManifest({
    operation: args.operation,
    createdAt: args.createdAt,
    sources: args.sources,
    settings: args.settings,
    outputs: args.artifacts,
    claims: args.claims,
    limitations: args.limitations,
  });
  assertEvidenceManifest(manifest);
  const archive = new JSZip();
  for (const artifact of args.artifacts) archive.file(artifact.role, artifact.bytes);
  archive.file('evidence-manifest.json', utf8(stableJson(manifest)));
  archive.file('evidence-manifest.txt', utf8(evidenceManifestText(manifest)));
  return archive.generateAsync({
    type: 'arraybuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

export async function executeAssuranceOperation(args: {
  tool: AssuranceTool;
  createdAt: string;
  sources: readonly ArrayBuffer[];
  sourcePageCount: number;
  options: WorkerOptions;
}): Promise<{
  output: ArrayBuffer;
  mimeType: 'application/zip';
  outputPageCount: number;
}> {
  let output: ArrayBuffer;
  let outputPageCount = args.sourcePageCount;
  switch (args.tool) {
    case 'inspect': {
      const report = await inspectPdf(args.sources[0] as ArrayBuffer, { includeRenderHashes: true });
      assertInspectionReport(report);
      const reportJson = utf8(stableJson(report));
      const reportText = utf8(inspectionText(report));
      output = await assuranceBundle({
        operation: args.tool,
        createdAt: args.createdAt,
        sources: args.sources,
        settings: { renderedPageHashes: true, renderDpi: 96 },
        artifacts: [
          { role: 'inspection.json', mediaType: 'application/json', bytes: reportJson },
          { role: 'inspection.txt', mediaType: 'text/plain', bytes: reportText },
        ],
        claims: ['The report records parser-observable document facts and bounded warnings.'],
        limitations: ['Findings are not proof that a document is safe, malicious, authentic, or legally valid.'],
      });
      outputPageCount = report.pageCount;
      break;
    }
    case 'compare': {
      const left = await comparePdfSnapshots(args.sources[0] as ArrayBuffer);
      const right = await comparePdfSnapshots(args.sources[1] as ArrayBuffer);
      const report = buildComparisonReport(left, right);
      assertComparisonReport(report);
      const reportJson = utf8(stableJson(report));
      const reportText = utf8(comparisonText(report));
      output = await assuranceBundle({
        operation: args.tool,
        createdAt: args.createdAt,
        sources: args.sources,
        settings: { renderedPageHashes: true, renderDpi: 96, ocr: false },
        artifacts: [
          { role: 'comparison.json', mediaType: 'application/json', bytes: reportJson },
          { role: 'comparison.txt', mediaType: 'text/plain', bytes: reportText },
        ],
        claims: ['Extracted text and rendered page appearances were compared without semantic interpretation.'],
        limitations: ['The comparison does not establish semantic, contractual, regulatory, or legal equivalence.'],
      });
      outputPageCount = Math.max(left.length, right.length);
      break;
    }
    case 'evidence-manifest': {
      const digests = await Promise.all(args.sources.map((source) => sha256Hex(source)));
      const statement = utf8([
        'AO-PDF LOCAL HASH STATEMENT',
        ...digests.map((digest, index) => `Source ${index + 1}: ${digest}`),
        '',
        'These SHA-256 values record byte equality only and do not prove authenticity, ownership, chronology, legal admissibility, or chain of custody.',
        '',
      ].join('\n'));
      output = await assuranceBundle({
        operation: args.tool,
        createdAt: args.createdAt,
        sources: args.sources,
        settings: { hashAlgorithm: 'SHA-256' },
        artifacts: [{ role: 'hash-statement.txt', mediaType: 'text/plain', bytes: statement }],
        claims: ['SHA-256 digests were calculated locally from the selected source bytes.'],
        limitations: ['A hash records byte equality only and is not authentication or legal proof.'],
      });
      break;
    }
    case 'redact': {
      if (args.options.kind !== 'redact') throw new TypeError('Invalid redaction options.');
      const result = await redactPdfByRasterReconstruction(
        args.sources[0] as ArrayBuffer,
        args.options.rectangles,
      );
      assertRedactionVerification(result.verification);
      output = await assuranceBundle({
        operation: args.tool,
        createdAt: args.createdAt,
        sources: args.sources,
        settings: {
          method: 'full-page-raster-reconstruction',
          renderDpi: 144,
          rectangles: stableJson(args.options.rectangles).trim(),
        },
        artifacts: [
          { role: 'redacted.pdf', mediaType: 'application/pdf', bytes: result.pdf },
          { role: 'redaction-verification.json', mediaType: 'application/json', bytes: utf8(stableJson(result.verification)) },
        ],
        claims: [
          'Supported visible page content was rasterized into a new PDF and selected pixels were replaced before output creation.',
          'The generated output passed the recorded bounded structural checks.',
        ],
        limitations: result.verification.limitations,
      });
      outputPageCount = result.verification.pageCount;
      break;
    }
  }
  return { output, mimeType: 'application/zip', outputPageCount };
}
