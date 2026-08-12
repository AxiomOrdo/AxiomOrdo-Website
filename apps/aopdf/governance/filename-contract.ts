import type { AdmittedToolSlug } from './tool-limits';

const ILLEGAL_FILENAME_CHARACTERS = /[<>:"/\\|?*\u0000-\u001f]/g;
const PDF_SUFFIX = /\.pdf$/i;
const MAX_BASENAME_LENGTH = 80;

export function sanitizeSourceBasename(filename: string): string {
  const normalized = filename
    .replace(PDF_SUFFIX, '')
    .replace(ILLEGAL_FILENAME_CHARACTERS, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.\-\s]+|[.\-\s]+$/g, '')
    .slice(0, MAX_BASENAME_LENGTH);
  return normalized || 'document';
}

export function canonicalOutputFilename(args: {
  tool: AdmittedToolSlug;
  sourceName?: string;
  fileCount: number;
  outputPageCount: number;
  canonicalRange?: string;
  splitEveryPage?: boolean;
}): string {
  const base = sanitizeSourceBasename(args.sourceName ?? 'document');
  if (args.tool === 'merge') return `ao-pdf-merged-${args.fileCount}-files.pdf`;
  if (args.tool === 'images-to-pdf') {
    return `ao-pdf-images-${args.fileCount}.pdf`;
  }
  if (args.tool === 'split' && args.splitEveryPage) {
    return `${base}-ao-pdf-split-${args.outputPageCount}-pages.zip`;
  }
  if (args.tool === 'split') {
    return `${base}-ao-pdf-pages-${args.canonicalRange ?? 'selected'}.pdf`;
  }
  if (args.tool === 'inspect') return `${base}-ao-pdf-inspection.zip`;
  if (args.tool === 'compare') return 'ao-pdf-document-comparison.zip';
  if (args.tool === 'evidence-manifest') return 'ao-pdf-evidence-manifest.zip';
  if (args.tool === 'redact') return `${base}-ao-pdf-redacted-assurance.zip`;
  const operation: Record<Exclude<AdmittedToolSlug, 'merge' | 'split' | 'images-to-pdf' | 'inspect' | 'compare' | 'evidence-manifest' | 'redact'>, string> = {
    compress: 'optimized',
    rotate: 'rotated',
    'delete-pages': 'pages-removed',
    watermark: 'watermarked',
    'page-numbers': 'numbered',
    flatten: 'flattened',
  };
  return `${base}-ao-pdf-${operation[args.tool]}.pdf`;
}
