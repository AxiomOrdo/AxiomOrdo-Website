import { PDFDocument } from 'pdf-lib';
import { OperationError } from './operation-errors';
import {
  TOOL_LIMITS,
  type AdmittedToolSlug,
  type ToolLimits,
} from './tool-limits';

export interface AdmissionInput {
  readonly name: string;
  readonly mimeType: string;
  readonly size: number;
  readonly bytes: ArrayBuffer;
  readonly imagePixels?: number;
}

export interface AdmittedInput extends AdmissionInput {
  readonly pageCount: number;
}

export interface AdmissionResult {
  readonly inputs: AdmittedInput[];
  readonly aggregateBytes: number;
  readonly aggregatePages: number;
  readonly aggregateImagePixels: number;
  readonly estimatedWorkingBytes: number;
}

const PDF_MIME = 'application/pdf';
const IMAGE_MIMES = new Set(['image/jpeg', 'image/png']);
const PAGE_OBJECT_OVERHEAD = 65_536;
const OUTPUT_DOCUMENT_OVERHEAD = 262_144;

function isAllowedType(tool: AdmittedToolSlug, input: AdmissionInput): boolean {
  if (tool === 'images-to-pdf') {
    return (
      IMAGE_MIMES.has(input.mimeType) &&
      /\.(?:jpe?g|png)$/i.test(input.name)
    );
  }
  return input.mimeType === PDF_MIME && /\.pdf$/i.test(input.name);
}

function estimateWorkingBytes(args: {
  tool: AdmittedToolSlug;
  aggregateBytes: number;
  aggregatePages: number;
  aggregateImagePixels: number;
  outputDocuments: number;
}): number {
  const multipliers: Record<AdmittedToolSlug, number> = {
    merge: 4,
    split: 4,
    compress: 4,
    rotate: 3,
    'delete-pages': 3,
    watermark: 3,
    'page-numbers': 3,
    flatten: 3,
    'images-to-pdf': 2,
  };
  return Math.ceil(
    args.aggregateBytes * multipliers[args.tool] +
      args.aggregateImagePixels * 4 +
      args.aggregatePages * PAGE_OBJECT_OVERHEAD +
      args.outputDocuments * OUTPUT_DOCUMENT_OVERHEAD,
  );
}

function assertInputCount(count: number, limits: ToolLimits): void {
  if (count < limits.minFiles || count > limits.maxFiles) {
    throw new OperationError('INPUT_COUNT_INVALID');
  }
}

export async function admitInputs(args: {
  tool: AdmittedToolSlug;
  inputs: AdmissionInput[];
  splitEveryPage?: boolean;
  selectedPageCount?: number;
}): Promise<AdmissionResult> {
  const limits = TOOL_LIMITS[args.tool];
  assertInputCount(args.inputs.length, limits);

  if (args.inputs.some((input) => !isAllowedType(args.tool, input))) {
    throw new OperationError('FILE_TYPE_UNSUPPORTED');
  }
  if (args.inputs.some((input) => input.size > limits.maxFileBytes)) {
    throw new OperationError('FILE_TOO_LARGE');
  }

  const aggregateBytes = args.inputs.reduce((sum, input) => sum + input.size, 0);
  if (aggregateBytes > limits.maxAggregateBytes) {
    throw new OperationError('AGGREGATE_SIZE_LIMIT');
  }

  const aggregateImagePixels = args.inputs.reduce(
    (sum, input) => sum + (input.imagePixels ?? 0),
    0,
  );
  if (
    args.inputs.some(
      (input) =>
        input.imagePixels !== undefined &&
        input.imagePixels > (limits.maxImagePixels ?? Number.POSITIVE_INFINITY),
    ) ||
    aggregateImagePixels >
      (limits.maxAggregateImagePixels ?? Number.POSITIVE_INFINITY)
  ) {
    throw new OperationError('IMAGE_DIMENSIONS_LIMIT');
  }

  const admitted: AdmittedInput[] = [];
  for (const input of args.inputs) {
    if (args.tool === 'images-to-pdf') {
      admitted.push({ ...input, pageCount: 1 });
      continue;
    }

    let document: PDFDocument;
    try {
      document = await PDFDocument.load(input.bytes, {
        ignoreEncryption: false,
        updateMetadata: false,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        /encrypted|password|encryption/i.test(error.message)
      ) {
        throw new OperationError('ENCRYPTED_PDF_UNSUPPORTED');
      }
      throw new OperationError('PDF_CORRUPTED');
    }

    const unsupportedGeometry = document.getPages().some((page) => {
      const { width, height } = page.getSize();
      return (
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width < limits.minPagePoints ||
        height < limits.minPagePoints ||
        width > limits.maxPagePoints ||
        height > limits.maxPagePoints
      );
    });
    if (unsupportedGeometry) {
      throw new OperationError('PAGE_GEOMETRY_UNSUPPORTED');
    }
    admitted.push({ ...input, pageCount: document.getPageCount() });
  }

  const aggregatePages = admitted.reduce(
    (sum, input) => sum + input.pageCount,
    0,
  );
  if (aggregatePages > limits.maxAggregatePages) {
    throw new OperationError('PAGE_COUNT_LIMIT');
  }
  if (
    args.splitEveryPage &&
    aggregatePages > (limits.maxSplitOutputs ?? Number.POSITIVE_INFINITY)
  ) {
    throw new OperationError('PAGE_COUNT_LIMIT');
  }
  if (
    args.selectedPageCount !== undefined &&
    (args.selectedPageCount < 1 || args.selectedPageCount > aggregatePages)
  ) {
    throw new OperationError('SELECTION_INVALID');
  }

  const outputDocuments = args.splitEveryPage ? aggregatePages : 1;
  const estimatedWorkingBytes = estimateWorkingBytes({
    tool: args.tool,
    aggregateBytes,
    aggregatePages,
    aggregateImagePixels,
    outputDocuments,
  });
  if (estimatedWorkingBytes > limits.maxEstimatedWorkingBytes) {
    throw new OperationError('ESTIMATED_MEMORY_LIMIT');
  }

  return {
    inputs: admitted,
    aggregateBytes,
    aggregatePages,
    aggregateImagePixels,
    estimatedWorkingBytes,
  };
}
