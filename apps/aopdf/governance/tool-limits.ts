export const ADMITTED_TOOL_SLUGS = [
  'merge',
  'split',
  'compress',
  'rotate',
  'delete-pages',
  'watermark',
  'page-numbers',
  'flatten',
  'images-to-pdf',
] as const;

export type AdmittedToolSlug = (typeof ADMITTED_TOOL_SLUGS)[number];

export interface ToolLimits {
  readonly maxFiles: number;
  readonly minFiles: number;
  readonly maxFileBytes: number;
  readonly maxAggregateBytes: number;
  readonly maxAggregatePages: number;
  readonly maxSplitOutputs?: number;
  readonly maxImagePixels?: number;
  readonly maxAggregateImagePixels?: number;
  readonly maxWatermarkCharacters?: number;
  readonly minPagePoints: number;
  readonly maxPagePoints: number;
  readonly timeoutMs: number;
  readonly maxEstimatedWorkingBytes: number;
  readonly limitations: readonly string[];
}

export const MEBIBYTE = 1_048_576;
export const MAX_ESTIMATED_WORKING_BYTES = 1_073_741_824;

const COMMON = {
  maxFileBytes: 100 * MEBIBYTE,
  maxAggregateBytes: 250 * MEBIBYTE,
  maxAggregatePages: 500,
  minPagePoints: 3,
  maxPagePoints: 14_400,
  timeoutMs: 120_000,
  maxEstimatedWorkingBytes: MAX_ESTIMATED_WORKING_BYTES,
} as const;

const SINGLE_PDF = {
  ...COMMON,
  minFiles: 1,
  maxFiles: 1,
} as const;

export const TOOL_LIMITS: Record<AdmittedToolSlug, ToolLimits> = {
  merge: {
    ...COMMON,
    minFiles: 2,
    maxFiles: 20,
    limitations: [
      'Encrypted PDFs are not supported.',
      'Source metadata is not copied into the new merged document.',
    ],
  },
  split: {
    ...SINGLE_PDF,
    maxSplitOutputs: 200,
    limitations: [
      'Split-every-page is limited to 200 output documents.',
      'Each output is a new document and does not retain full source metadata.',
    ],
  },
  compress: {
    ...SINGLE_PDF,
    limitations: [
      'Optimization rebuilds object streams but does not recompress images.',
      'Some documents will remain the same size or become larger.',
    ],
  },
  rotate: {
    ...SINGLE_PDF,
    limitations: ['Every page is rotated by the selected angle.'],
  },
  'delete-pages': {
    ...SINGLE_PDF,
    limitations: ['At least one page must remain in the output.'],
  },
  watermark: {
    ...SINGLE_PDF,
    maxWatermarkCharacters: 120,
    limitations: [
      'Watermark text is limited to 120 printable Latin characters.',
      'The watermark is applied to every page.',
    ],
  },
  'page-numbers': {
    ...SINGLE_PDF,
    limitations: ['Only the displayed top and bottom positions are supported.'],
  },
  flatten: {
    ...SINGLE_PDF,
    limitations: [
      'Only tested AcroForm text, checkbox, radio, dropdown, and option-list fields are supported.',
      'XFA, signature, and unsupported button widgets are rejected.',
    ],
  },
  'images-to-pdf': {
    ...COMMON,
    minFiles: 1,
    maxFiles: 20,
    maxAggregatePages: 20,
    maxImagePixels: 40_000_000,
    maxAggregateImagePixels: 200_000_000,
    limitations: [
      'Only JPG and PNG images are supported.',
      'Each image becomes one PDF page and no OCR is performed.',
    ],
  },
};

export function isAdmittedToolSlug(value: unknown): value is AdmittedToolSlug {
  return (
    typeof value === 'string' &&
    (ADMITTED_TOOL_SLUGS as readonly string[]).includes(value)
  );
}
