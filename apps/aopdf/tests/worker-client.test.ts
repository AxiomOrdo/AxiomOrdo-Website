import assert from 'node:assert/strict';
import test from 'node:test';
import { startWorkerOperation } from '../workers/client';
import type { WorkerRequest, WorkerResponse } from '../workers/protocol';

class FakeWorker {
  onmessage: ((event: MessageEvent<WorkerResponse>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  terminated = false;
  posted?: WorkerRequest;

  postMessage(request: WorkerRequest): void {
    this.posted = request;
  }

  terminate(): void {
    this.terminated = true;
  }

  respond(response: WorkerResponse): void {
    this.onmessage?.({ data: response } as MessageEvent<WorkerResponse>);
  }

  fail(): void {
    this.onerror?.({} as ErrorEvent);
  }
}

function request(operationId: string): WorkerRequest {
  return {
    type: 'execute',
    operationId,
    tool: 'rotate',
    inputs: [{
      bytes: new ArrayBuffer(1),
      mimeType: 'application/pdf',
    }],
    sourcePageCount: 1,
    options: { kind: 'rotate', angle: 90 },
  };
}

function code(error: unknown): string {
  return (error as { code?: string }).code ?? '';
}

test('worker cancellation terminates execution and clears its timer', async () => {
  const originalWindow = globalThis.window;
  let activeTimers = 0;
  globalThis.window = {
    setTimeout: (() => {
      activeTimers += 1;
      return 1;
    }) as never,
    clearTimeout: (() => {
      activeTimers -= 1;
    }) as never,
  } as unknown as Window & typeof globalThis;
  try {
    const worker = new FakeWorker();
    const operation = startWorkerOperation(request('cancel'), () => worker as never);
    operation.cancel();
    await assert.rejects(operation.result, (error) => code(error) === 'OPERATION_CANCELLED');
    assert.equal(worker.terminated, true);
    assert.equal(activeTimers, 0);
  } finally {
    globalThis.window = originalWindow;
  }
});

test('stale responses cannot settle a newer operation identifier', async () => {
  const originalWindow = globalThis.window;
  globalThis.window = {
    setTimeout,
    clearTimeout,
  } as unknown as Window & typeof globalThis;
  try {
    const worker = new FakeWorker();
    const operation = startWorkerOperation(request('active'), () => worker as never);
    worker.respond({
      type: 'success',
      operationId: 'stale',
      output: new ArrayBuffer(1),
      mimeType: 'application/pdf',
      outputPageCount: 9,
    });
    worker.respond({
      type: 'success',
      operationId: 'active',
      output: new ArrayBuffer(1),
      mimeType: 'application/pdf',
      outputPageCount: 1,
    });
    assert.equal((await operation.result).outputPageCount, 1);
    assert.equal(worker.terminated, true);
  } finally {
    globalThis.window = originalWindow;
  }
});

test('unexpected worker failure maps to WORKER_MEMORY_FAILURE', async () => {
  const originalWindow = globalThis.window;
  globalThis.window = {
    setTimeout,
    clearTimeout,
  } as unknown as Window & typeof globalThis;
  try {
    const worker = new FakeWorker();
    const operation = startWorkerOperation(request('memory'), () => worker as never);
    worker.fail();
    await assert.rejects(
      operation.result,
      (error) => code(error) === 'WORKER_MEMORY_FAILURE',
    );
  } finally {
    globalThis.window = originalWindow;
  }
});

test('timeout callback hard-terminates the worker', async () => {
  const originalWindow = globalThis.window;
  let callback: (() => void) | undefined;
  globalThis.window = {
    setTimeout: ((handler: () => void) => {
      callback = handler;
      return 1;
    }) as never,
    clearTimeout: (() => undefined) as never,
  } as unknown as Window & typeof globalThis;
  try {
    const worker = new FakeWorker();
    const operation = startWorkerOperation(request('timeout'), () => worker as never);
    callback?.();
    await assert.rejects(
      operation.result,
      (error) => code(error) === 'PROCESSING_TIMEOUT',
    );
    assert.equal(worker.terminated, true);
  } finally {
    globalThis.window = originalWindow;
  }
});
