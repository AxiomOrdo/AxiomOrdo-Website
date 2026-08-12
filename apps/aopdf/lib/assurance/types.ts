import type { AdmittedToolSlug } from '@/governance/tool-limits';

export const ASSURANCE_SCHEMA_VERSION = 'aopdf.document-assurance.v1' as const;
export const AOPDF_TOOL_VERSION = '1.0.0' as const;
export const ASSURANCE_TOOL_SLUGS = [
  'inspect',
  'compare',
  'evidence-manifest',
  'redact',
] as const satisfies readonly AdmittedToolSlug[];
export type AssuranceTool = (typeof ASSURANCE_TOOL_SLUGS)[number];

export function isAssuranceTool(tool: AdmittedToolSlug): tool is AssuranceTool {
  return (ASSURANCE_TOOL_SLUGS as readonly string[]).includes(tool);
}

export interface SourceDigest {
  readonly index: number;
  readonly byteLength: number;
  readonly sha256: string;
}

export interface OutputDigest {
  readonly role: string;
  readonly mediaType: string;
  readonly byteLength: number;
  readonly sha256: string;
}

export interface EvidenceManifest {
  readonly schema: typeof ASSURANCE_SCHEMA_VERSION;
  readonly operation: AdmittedToolSlug;
  readonly toolVersion: typeof AOPDF_TOOL_VERSION;
  readonly createdAt: string;
  readonly processingBoundary: 'browser-local';
  readonly settings: Readonly<Record<string, string | number | boolean>>;
  readonly sources: readonly SourceDigest[];
  readonly outputs: readonly OutputDigest[];
  readonly claims: readonly string[];
  readonly limitations: readonly string[];
}

export type FindingKind = 'fact' | 'warning' | 'limitation' | 'recommendation';

export interface Finding {
  readonly kind: FindingKind;
  readonly code: string;
  readonly message: string;
  readonly page?: number;
}

export interface PageSnapshot {
  readonly page: number;
  readonly widthPoints: number;
  readonly heightPoints: number;
  readonly rotation: number;
  readonly extractedText: string;
  readonly textItemCount: number;
  readonly imagePaintCount: number;
  readonly vectorPathCount: number;
  readonly annotationCount: number;
  readonly renderedSha256?: string;
}

export interface InspectionReport {
  readonly schema: typeof ASSURANCE_SCHEMA_VERSION;
  readonly reportType: 'inspection';
  readonly pageCount: number;
  readonly pdfVersion: string | null;
  readonly incrementalRevisionMarkers: number;
  readonly hasAcroForm: boolean;
  readonly hasXfa: boolean;
  readonly hasAttachments: boolean;
  readonly hasJavaScript: boolean;
  readonly metadataFields: readonly string[];
  readonly pages: readonly PageSnapshot[];
  readonly findings: readonly Finding[];
}

export interface PageDifference {
  readonly page: number;
  readonly status: 'added' | 'removed' | 'changed' | 'unchanged';
  readonly textChanged: boolean;
  readonly renderedPageChanged: boolean | null;
  readonly geometryChanged: boolean;
  readonly annotationCountChanged: boolean;
}

export interface ComparisonReport {
  readonly schema: typeof ASSURANCE_SCHEMA_VERSION;
  readonly reportType: 'comparison';
  readonly leftPageCount: number;
  readonly rightPageCount: number;
  readonly extractedTextChanged: boolean;
  readonly pages: readonly PageDifference[];
  readonly findings: readonly Finding[];
}

export interface RedactionRectangle {
  readonly page: number;
  readonly xPercent: number;
  readonly yPercent: number;
  readonly widthPercent: number;
  readonly heightPercent: number;
}

export interface RedactionVerification {
  readonly schema: typeof ASSURANCE_SCHEMA_VERSION;
  readonly reportType: 'redaction-verification';
  readonly method: 'full-page-raster-reconstruction';
  readonly pageCount: number;
  readonly rectanglesApplied: number;
  readonly residualExtractedTextItems: number;
  readonly outputHasAcroForm: boolean;
  readonly outputHasAttachments: boolean;
  readonly outputHasJavaScript: boolean;
  readonly outputIncrementalRevisionMarkers: number;
  readonly passed: boolean;
  readonly supportedContentClasses: readonly string[];
  readonly unsupportedContentClasses: readonly string[];
  readonly limitations: readonly string[];
}

export interface WorkspaceHistoryEntry {
  readonly operation: AdmittedToolSlug;
  readonly completedAt: string;
  readonly sourceCount: number;
  readonly outputFilename: string;
  readonly assurance: 'generated' | 'verified-bounded';
}
