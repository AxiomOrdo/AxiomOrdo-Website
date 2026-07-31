import type { OperationErrorCode } from '@/governance/operation-errors';
import type { AdmittedToolSlug } from '@/governance/tool-limits';

export type WorkerOptions =
  | { readonly kind: 'none' }
  | { readonly kind: 'split'; readonly indices?: number[]; readonly everyPage: boolean }
  | { readonly kind: 'rotate'; readonly angle: 90 | 180 | 270 }
  | { readonly kind: 'delete-pages'; readonly indices: number[] }
  | { readonly kind: 'watermark'; readonly text: string }
  | {
      readonly kind: 'page-numbers';
      readonly position: 'bottom-center' | 'bottom-right' | 'top-center';
    };

export interface WorkerInput {
  readonly bytes: ArrayBuffer;
  readonly mimeType: 'application/pdf' | 'image/jpeg' | 'image/png';
}

export interface WorkerRequest {
  readonly type: 'execute';
  readonly operationId: string;
  readonly tool: AdmittedToolSlug;
  readonly inputs: WorkerInput[];
  readonly sourcePageCount: number;
  readonly options: WorkerOptions;
}

export interface WorkerSuccess {
  readonly type: 'success';
  readonly operationId: string;
  readonly output: ArrayBuffer;
  readonly mimeType: 'application/pdf' | 'application/zip';
  readonly outputPageCount: number;
}

export interface WorkerFailure {
  readonly type: 'failure';
  readonly operationId: string;
  readonly errorCode: OperationErrorCode;
}

export type WorkerResponse = WorkerSuccess | WorkerFailure;
