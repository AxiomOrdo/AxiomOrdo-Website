export const OPERATION_ERROR_CODES = [
  'INPUT_COUNT_INVALID',
  'FILE_TYPE_UNSUPPORTED',
  'FILE_TOO_LARGE',
  'AGGREGATE_SIZE_LIMIT',
  'IMAGE_DIMENSIONS_LIMIT',
  'PDF_CORRUPTED',
  'ENCRYPTED_PDF_UNSUPPORTED',
  'PAGE_GEOMETRY_UNSUPPORTED',
  'PAGE_COUNT_LIMIT',
  'SELECTION_INVALID',
  'ESTIMATED_MEMORY_LIMIT',
  'PROCESSING_TIMEOUT',
  'WORKER_MEMORY_FAILURE',
  'OPERATION_CANCELLED',
  'SAVE_CANCELLED',
  'DOWNLOAD_INITIATION_FAILED',
  'DOWNLOAD_FALLBACK_FAILED',
  'WATERMARK_TEXT_INVALID',
  'FORM_TYPE_UNSUPPORTED',
  'PROCESSING_FAILED',
] as const;

export type OperationErrorCode = (typeof OPERATION_ERROR_CODES)[number];

interface ErrorDefinition {
  readonly message: string;
  readonly recovery: string;
}

export const ERROR_DEFINITIONS: Record<OperationErrorCode, ErrorDefinition> = {
  INPUT_COUNT_INVALID: {
    message: 'The number of selected files is outside this tool’s limit.',
    recovery: 'Remove files or select the minimum number shown in the limits.',
  },
  FILE_TYPE_UNSUPPORTED: {
    message: 'This file type is not supported by the selected tool.',
    recovery: 'Choose a PDF, JPG, or PNG allowed by the tool.',
  },
  FILE_TOO_LARGE: {
    message: 'A selected file exceeds the 100 MiB limit.',
    recovery: 'Choose a smaller file before trying again.',
  },
  AGGREGATE_SIZE_LIMIT: {
    message: 'The selected files exceed the 250 MiB aggregate limit.',
    recovery: 'Remove files or process them in smaller groups.',
  },
  IMAGE_DIMENSIONS_LIMIT: {
    message: 'The selected image dimensions exceed this tool’s pixel limit.',
    recovery: 'Resize the image or use fewer high-resolution images.',
  },
  PDF_CORRUPTED: {
    message: 'The PDF could not be parsed safely.',
    recovery: 'Open and re-save the PDF in a trusted editor, then try again.',
  },
  ENCRYPTED_PDF_UNSUPPORTED: {
    message: 'Encrypted PDFs are not supported.',
    recovery: 'Provide an unencrypted copy. Password unlocking remains unavailable.',
  },
  PAGE_GEOMETRY_UNSUPPORTED: {
    message: 'A page has dimensions outside the supported range.',
    recovery: 'Resize the affected page to between 3 and 14,400 points per side.',
  },
  PAGE_COUNT_LIMIT: {
    message: 'The operation exceeds its page-count limit.',
    recovery: 'Process a smaller page range or fewer documents.',
  },
  SELECTION_INVALID: {
    message: 'The selected pages or options are invalid.',
    recovery: 'Review the selection and keep at least one output page.',
  },
  ESTIMATED_MEMORY_LIMIT: {
    message: 'The estimated working-memory limit would be exceeded.',
    recovery: 'Use smaller files, fewer pages, or fewer images.',
  },
  PROCESSING_TIMEOUT: {
    message: 'Processing exceeded the 120-second time limit.',
    recovery: 'Retry with a smaller or less complex document.',
  },
  WORKER_MEMORY_FAILURE: {
    message: 'The browser stopped the PDF worker because memory was unavailable.',
    recovery: 'Close other tabs and retry with a smaller document.',
  },
  OPERATION_CANCELLED: {
    message: 'Processing was cancelled.',
    recovery: 'Adjust the options and start again when ready.',
  },
  SAVE_CANCELLED: {
    message: 'Saving was cancelled.',
    recovery: 'The PDF was generated locally. Process again when ready to save it.',
  },
  DOWNLOAD_INITIATION_FAILED: {
    message: 'The save process could not begin.',
    recovery: 'Check browser permissions and available storage, then try again.',
  },
  DOWNLOAD_FALLBACK_FAILED: {
    message: 'The browser download fallback could not start.',
    recovery: 'Allow downloads for this site or try a supported browser.',
  },
  WATERMARK_TEXT_INVALID: {
    message: 'The watermark text is outside the supported character contract.',
    recovery: 'Use 1–120 printable Latin characters.',
  },
  FORM_TYPE_UNSUPPORTED: {
    message: 'The document contains an unsupported form field type.',
    recovery: 'Use a PDF containing only the form fields listed in the limitations.',
  },
  PROCESSING_FAILED: {
    message: 'The PDF operation could not be completed.',
    recovery: 'Retry with a smaller valid document or choose another file.',
  },
};

export class OperationError extends Error {
  readonly code: OperationErrorCode;

  constructor(code: OperationErrorCode) {
    super(ERROR_DEFINITIONS[code].message);
    this.name = 'OperationError';
    this.code = code;
  }
}

export function isOperationErrorCode(value: unknown): value is OperationErrorCode {
  return (
    typeof value === 'string' &&
    (OPERATION_ERROR_CODES as readonly string[]).includes(value)
  );
}

export function toOperationError(error: unknown): OperationError {
  if (error instanceof OperationError) return error;
  if (
    error instanceof Error &&
    /encrypted|password|encryption/i.test(error.message)
  ) {
    return new OperationError('ENCRYPTED_PDF_UNSUPPORTED');
  }
  if (
    error instanceof RangeError ||
    (error instanceof Error && /memory|allocation|array buffer/i.test(error.message))
  ) {
    return new OperationError('WORKER_MEMORY_FAILURE');
  }
  return new OperationError('PROCESSING_FAILED');
}
