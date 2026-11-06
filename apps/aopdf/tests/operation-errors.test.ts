import assert from 'node:assert/strict';
import test from 'node:test';
import { OperationError, toOperationError } from '../governance/operation-errors';

test('existing governed errors retain identity and their explicit code before message classification', () => {
  const original = new OperationError('PROCESSING_TIMEOUT');
  // A library message must not override an already-classified operation error.
  original.message = 'encrypted memory allocation';
  assert.equal(toOperationError(original), original);
  assert.equal(toOperationError(original).code, 'PROCESSING_TIMEOUT');
  assert.equal(toOperationError(original).message, 'encrypted memory allocation');
});

test('encryption messages take precedence over memory classification', () => {
  for (const error of [
    new Error('Encrypted document'), new Error('PASSWORD needed'),
    new Error('Encryption is unsupported'), new Error('encrypted memory allocation'),
    new RangeError('password allocation failure'),
  ]) {
    const result = toOperationError(error);
    assert.equal(result.code, 'ENCRYPTED_PDF_UNSUPPORTED');
    assert.equal(result.message, 'Encrypted PDFs are not supported.');
  }
});

test('RangeError and memory/allocation/array-buffer messages map to worker memory failure', () => {
  for (const error of [
    new RangeError('index outside range'), new Error('MEMORY unavailable'),
    new Error('Allocation failed'), new Error('Array Buffer could not be created'),
  ]) {
    const result = toOperationError(error);
    assert.equal(result.code, 'WORKER_MEMORY_FAILURE');
    assert.equal(result.message, 'The browser stopped the PDF worker because memory was unavailable.');
  }
});

test('unknown errors and non-Error values use the safe fallback without exposing raw messages', () => {
  for (const value of [
    new Error('private document title'), null, undefined, 0,
    'encrypted memory', { message: 'encrypted memory', code: 'PROCESSING_TIMEOUT' },
  ]) {
    const result = toOperationError(value);
    assert.ok(result instanceof OperationError);
    assert.equal(result.code, 'PROCESSING_FAILED');
    assert.equal(result.message, 'The PDF operation could not be completed.');
    assert.equal(result.name, 'OperationError');
  }
});
