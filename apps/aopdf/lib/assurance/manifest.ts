import type { AdmittedToolSlug } from '@/governance/tool-limits';
import { sha256Hex } from './hash';
import {
  AOPDF_TOOL_VERSION,
  ASSURANCE_SCHEMA_VERSION,
  type EvidenceManifest,
  type OutputDigest,
  type SourceDigest,
} from './types';

export interface ManifestArtifact {
  readonly role: string;
  readonly mediaType: string;
  readonly bytes: Uint8Array;
}

function sortObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObject);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, sortObject(item)]),
    );
  }
  return value;
}

export function stableJson(value: unknown): string {
  return `${JSON.stringify(sortObject(value), null, 2)}\n`;
}

export async function createEvidenceManifest(args: {
  operation: AdmittedToolSlug;
  createdAt: string;
  settings: Readonly<Record<string, string | number | boolean>>;
  sources: readonly (ArrayBuffer | Uint8Array)[];
  outputs: readonly ManifestArtifact[];
  claims: readonly string[];
  limitations: readonly string[];
}): Promise<EvidenceManifest> {
  if (!Number.isFinite(Date.parse(args.createdAt))) {
    throw new TypeError('Manifest timestamp must be an ISO-compatible date.');
  }
  const sources: SourceDigest[] = await Promise.all(
    args.sources.map(async (source, index) => ({
      index,
      byteLength: source.byteLength,
      sha256: await sha256Hex(source),
    })),
  );
  const outputs: OutputDigest[] = await Promise.all(
    args.outputs.map(async (output) => ({
      role: output.role,
      mediaType: output.mediaType,
      byteLength: output.bytes.byteLength,
      sha256: await sha256Hex(output.bytes),
    })),
  );
  const hashLimitation =
    'SHA-256 records byte equality only; it does not prove authenticity, ownership, chronology, legal admissibility, or chain of custody.';
  return {
    schema: ASSURANCE_SCHEMA_VERSION,
    operation: args.operation,
    toolVersion: AOPDF_TOOL_VERSION,
    createdAt: new Date(args.createdAt).toISOString(),
    processingBoundary: 'browser-local',
    settings: sortObject(args.settings) as Record<string, string | number | boolean>,
    sources,
    outputs,
    claims: [...args.claims],
    limitations: args.limitations.includes(hashLimitation)
      ? [...args.limitations]
      : [...args.limitations, hashLimitation],
  };
}

export function evidenceManifestText(manifest: EvidenceManifest): string {
  const lines = [
    'AO-PDF LOCAL EVIDENCE MANIFEST',
    `Operation: ${manifest.operation}`,
    `Tool version: ${manifest.toolVersion}`,
    `Created: ${manifest.createdAt}`,
    `Processing boundary: ${manifest.processingBoundary}`,
    '',
    'Source SHA-256 digests:',
    ...manifest.sources.map(
      (source) => `- Source ${source.index + 1}: ${source.sha256} (${source.byteLength} bytes)`,
    ),
    '',
    'Output SHA-256 digests:',
    ...(manifest.outputs.length
      ? manifest.outputs.map(
          (output) => `- ${output.role}: ${output.sha256} (${output.byteLength} bytes; ${output.mediaType})`,
        )
      : ['- None']),
    '',
    'Bounded claims:',
    ...manifest.claims.map((claim) => `- ${claim}`),
    '',
    'Limitations:',
    ...manifest.limitations.map((limitation) => `- ${limitation}`),
    '',
    'A hash records byte equality only. It does not prove authenticity, ownership, chronology, legal admissibility, or chain of custody.',
    '',
  ];
  return lines.join('\n');
}
