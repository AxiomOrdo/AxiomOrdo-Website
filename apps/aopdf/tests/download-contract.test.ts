import assert from 'node:assert/strict';
import test from 'node:test';
import { deliverOutput } from '../governance/download-contract';

function code(error: unknown): string {
  return (error as { code?: string }).code ?? '';
}

test('native save completes only after the writable stream closes', async () => {
  const calls: string[] = [];
  const result = await deliverOutput({
    data: new Uint8Array([1]),
    filename: 'document.pdf',
    mimeType: 'application/pdf',
    windowObject: {
      setTimeout,
      showSaveFilePicker: async () => ({
        createWritable: async () => ({
          write: async () => { calls.push('write'); },
          close: async () => { calls.push('close'); },
        }),
      }),
    } as never,
  });
  assert.deepEqual(calls, ['write', 'close']);
  assert.deepEqual(result, { delivery: 'native-save', message: 'Saved' });
});

test('picker dismissal is cancellation, while stream failure is delivery failure', async () => {
  await assert.rejects(
    () =>
      deliverOutput({
        data: new Uint8Array([1]),
        filename: 'document.pdf',
        mimeType: 'application/pdf',
        windowObject: {
          setTimeout,
          showSaveFilePicker: async () => {
            throw new DOMException('dismissed', 'AbortError');
          },
        } as never,
      }),
    (error) => code(error) === 'SAVE_CANCELLED',
  );
  await assert.rejects(
    () =>
      deliverOutput({
        data: new Uint8Array([1]),
        filename: 'document.pdf',
        mimeType: 'application/pdf',
        windowObject: {
          setTimeout,
          showSaveFilePicker: async () => ({
            createWritable: async () => {
              throw new Error('stream unavailable');
            },
          }),
        } as never,
      }),
    (error) => code(error) === 'DOWNLOAD_INITIATION_FAILED',
  );
});

test('fallback reports initiation and revokes its object URL', async () => {
  const calls: string[] = [];
  const result = await deliverOutput({
    data: new Uint8Array([1]),
    filename: 'document.pdf',
    mimeType: 'application/pdf',
    windowObject: { setTimeout } as never,
    documentObject: {
      body: { appendChild: () => calls.push('append') },
      createElement: () => ({
        href: '',
        download: '',
        click: () => calls.push('click'),
        remove: () => calls.push('remove'),
      }),
    } as never,
    urlObject: {
      createObjectURL: () => 'blob:aopdf-test',
      revokeObjectURL: () => calls.push('revoke'),
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(result, {
    delivery: 'browser-download',
    message: 'Download started',
  });
  assert.deepEqual(calls, ['append', 'click', 'remove', 'revoke']);
});

test('fallback creation or invocation failures are governed', async () => {
  await assert.rejects(
    () =>
      deliverOutput({
        data: new Uint8Array([1]),
        filename: 'document.pdf',
        mimeType: 'application/pdf',
        windowObject: { setTimeout } as never,
        documentObject: {
          body: { appendChild: () => undefined },
          createElement: () => {
            throw new Error('blocked');
          },
        } as never,
        urlObject: {
          createObjectURL: () => 'blob:aopdf-test',
          revokeObjectURL: () => undefined,
        },
      }),
    (error) => code(error) === 'DOWNLOAD_FALLBACK_FAILED',
  );
});
