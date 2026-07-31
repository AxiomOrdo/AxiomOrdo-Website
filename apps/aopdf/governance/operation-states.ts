import type { AdmittedToolSlug } from './tool-limits';
import type { OperationErrorCode } from './operation-errors';

export type OperationState =
  | 'idle'
  | 'validating'
  | 'ready'
  | 'processing'
  | 'saving'
  | 'downloading'
  | 'success'
  | 'cancelled'
  | 'failed';

export interface OperationSummary {
  readonly tool: AdmittedToolSlug;
  readonly filesProcessed: number;
  readonly sourcePageCount: number;
  readonly outputPageCount: number;
  readonly durationMs: number;
  readonly delivery: 'native-save' | 'browser-download';
}

export interface OperationFailure {
  readonly code: OperationErrorCode;
  readonly state: 'cancelled' | 'failed';
}
