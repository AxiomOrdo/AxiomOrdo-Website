import { isAdmittedToolSlug } from '@/governance/tool-limits';
import {
  AOPDF_TOOL_VERSION,
  ASSURANCE_SCHEMA_VERSION,
  type ComparisonReport,
  type EvidenceManifest,
  type InspectionReport,
  type RedactionVerification,
} from './types';

const SHA256 = /^[0-9a-f]{64}$/;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new TypeError(`Assurance schema invalid: ${message}`);
}

export function assertEvidenceManifest(value: EvidenceManifest): void {
  assert(value.schema === ASSURANCE_SCHEMA_VERSION, 'manifest schema');
  assert(isAdmittedToolSlug(value.operation), 'manifest operation');
  assert(value.toolVersion === AOPDF_TOOL_VERSION, 'manifest tool version');
  assert(Number.isFinite(Date.parse(value.createdAt)), 'manifest timestamp');
  assert(value.processingBoundary === 'browser-local', 'manifest boundary');
  assert(
    Object.values(value.settings).every((item) =>
      ['string', 'number', 'boolean'].includes(typeof item),
    ),
    'manifest settings',
  );
  assert(
    value.sources.every(
      (source, index) =>
        source.index === index &&
        Number.isInteger(source.byteLength) &&
        source.byteLength >= 0 &&
        SHA256.test(source.sha256),
    ),
    'manifest source digests',
  );
  assert(
    value.outputs.every(
      (output) =>
        Boolean(output.role) &&
        Boolean(output.mediaType) &&
        Number.isInteger(output.byteLength) &&
        output.byteLength >= 0 &&
        SHA256.test(output.sha256),
    ),
    'manifest output digests',
  );
  assert(value.claims.every(Boolean), 'manifest claims');
  assert(value.limitations.every(Boolean), 'manifest limitations');
}

export function assertInspectionReport(value: InspectionReport): void {
  assert(value.schema === ASSURANCE_SCHEMA_VERSION, 'inspection schema');
  assert(value.reportType === 'inspection', 'inspection report type');
  assert(value.pageCount === value.pages.length && value.pageCount > 0, 'inspection pages');
  assert(value.pages.every((page, index) => page.page === index + 1), 'inspection page order');
  assert(
    value.findings.every((finding) =>
      ['fact', 'warning', 'limitation', 'recommendation'].includes(finding.kind),
    ),
    'inspection finding class',
  );
}

export function assertComparisonReport(value: ComparisonReport): void {
  assert(value.schema === ASSURANCE_SCHEMA_VERSION, 'comparison schema');
  assert(value.reportType === 'comparison', 'comparison report type');
  assert(
    value.pages.length === Math.max(value.leftPageCount, value.rightPageCount),
    'comparison page coverage',
  );
  assert(value.pages.every((page, index) => page.page === index + 1), 'comparison page order');
}

export function assertRedactionVerification(value: RedactionVerification): void {
  assert(value.schema === ASSURANCE_SCHEMA_VERSION, 'redaction schema');
  assert(value.reportType === 'redaction-verification', 'redaction report type');
  assert(value.method === 'full-page-raster-reconstruction', 'redaction method');
  assert(value.pageCount > 0 && value.rectanglesApplied > 0, 'redaction coverage');
  assert(value.passed && value.residualExtractedTextItems === 0, 'redaction verification');
  assert(value.unsupportedContentClasses.length > 0, 'redaction unsupported classes');
  assert(value.limitations.length > 0, 'redaction limitations');
}
