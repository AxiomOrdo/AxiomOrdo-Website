import { OperationError } from '@/governance/operation-errors';
import { TOOL_LIMITS } from '@/governance/tool-limits';
import type { WorkerRequest, WorkerResponse, WorkerSuccess } from './protocol';

export interface ActiveWorkerOperation {
  readonly operationId: string;
  readonly result: Promise<WorkerSuccess>;
  cancel(): void;
}

export function startWorkerOperation(
  request: WorkerRequest,
  workerFactory: () => Worker = () =>
    new Worker(new URL('./pdf-operation.worker.ts', import.meta.url), {
      type: 'module',
    }),
): ActiveWorkerOperation {
  const worker = workerFactory();
  let settled = false;
  let rejectResult: ((reason: OperationError) => void) | undefined;
  let timeout: number | undefined;

  const cleanup = () => {
    if (timeout !== undefined) {
      window.clearTimeout(timeout);
      timeout = undefined;
    }
    worker.onmessage = null;
    worker.onerror = null;
    worker.terminate();
  };

  const result = new Promise<WorkerSuccess>((resolve, reject) => {
    rejectResult = reject;
    timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new OperationError('PROCESSING_TIMEOUT'));
    }, TOOL_LIMITS[request.tool].timeoutMs);

    const finish = () => {
      cleanup();
    };

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (
        settled ||
        event.data.operationId !== request.operationId
      ) {
        return;
      }
      settled = true;
      finish();
      if (event.data.type === 'failure') {
        reject(new OperationError(event.data.errorCode));
      } else {
        resolve(event.data);
      }
    };

    worker.onerror = () => {
      if (settled) return;
      settled = true;
      finish();
      reject(new OperationError('WORKER_MEMORY_FAILURE'));
    };

    const transfers = request.inputs.map((input) => input.bytes);
    try {
      worker.postMessage(request, transfers);
    } catch {
      settled = true;
      finish();
      reject(new OperationError('WORKER_MEMORY_FAILURE'));
    }
  });

  return {
    operationId: request.operationId,
    result,
    cancel() {
      if (settled) return;
      settled = true;
      cleanup();
      rejectResult?.(new OperationError('OPERATION_CANCELLED'));
    },
  };
}
