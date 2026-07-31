import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createOperationFinishedEvent,
  createToolSelectedEvent,
} from '../governance/telemetry-contract';

test('telemetry constructors coerce only governed enums and durations', () => {
  assert.deepEqual(createToolSelectedEvent('merge'), {
    name: 'aopdf_tool_selected',
    tool: 'merge',
  });
  assert.deepEqual(
    createOperationFinishedEvent({
      tool: 'rotate',
      outcome: 'failure',
      durationMs: 150_000.8,
      errorCode: 'PROCESSING_TIMEOUT',
    }),
    {
      name: 'aopdf_operation_finished',
      tool: 'rotate',
      outcome: 'failure',
      durationMs: 120_000,
      errorCode: 'PROCESSING_TIMEOUT',
    },
  );
});

test('telemetry constructors reject arbitrary and nested data', () => {
  assert.throws(() => createToolSelectedEvent('arbitrary'), /Unknown admitted/);
  assert.throws(
    () =>
      createOperationFinishedEvent({
        tool: 'merge',
        outcome: { value: 'success' },
        durationMs: 1,
      }),
    /Unknown telemetry outcome/,
  );
  assert.throws(
    () =>
      createOperationFinishedEvent({
        tool: 'merge',
        outcome: 'success',
        durationMs: 1,
        filename: 'sensitive.pdf',
      } as never),
    /Unknown telemetry property/,
  );
  assert.throws(
    () =>
      createOperationFinishedEvent({
        tool: 'merge',
        outcome: 'failure',
        durationMs: 1,
        errorCode: new Error('raw exception'),
      }),
    /Unknown operation error code/,
  );
});

test('permitted events contain no document-derived properties', () => {
  const serialized = JSON.stringify(
    createOperationFinishedEvent({
      tool: 'flatten',
      outcome: 'cancelled',
      durationMs: 12.5,
      errorCode: 'OPERATION_CANCELLED',
    }),
  );
  for (const prohibited of [
    'filename',
    'fileSize',
    'pageCount',
    'contents',
    'text',
    'metadata',
    'options',
  ]) {
    assert.equal(serialized.includes(prohibited), false);
  }
});
