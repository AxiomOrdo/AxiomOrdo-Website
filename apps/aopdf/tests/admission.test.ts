import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { admitInputs, type AdmissionInput } from '../governance/admission';
import { MEBIBYTE } from '../governance/tool-limits';

async function pdfInput(
  name = 'document.pdf',
  pageCount = 1,
  size?: number,
  dimensions: [number, number] = [300, 400],
): Promise<AdmissionInput> {
  const document = await PDFDocument.create({ updateMetadata: false });
  for (let index = 0; index < pageCount; index += 1) {
    document.addPage(dimensions);
  }
  const bytes = await document.save({ useObjectStreams: false });
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  return {
    name,
    mimeType: 'application/pdf',
    size: size ?? bytes.byteLength,
    bytes: buffer,
  };
}

async function errorCode(action: () => Promise<unknown>): Promise<string> {
  try {
    await action();
  } catch (error) {
    return (error as { code?: string }).code ?? '';
  }
  return '';
}

test('admission enforces input count before type and size checks', async () => {
  assert.equal(
    await errorCode(() => admitInputs({ tool: 'merge', inputs: [] })),
    'INPUT_COUNT_INVALID',
  );
  const invalid = await pdfInput('wrong.exe', 1, 101 * MEBIBYTE);
  assert.equal(
    await errorCode(() =>
      admitInputs({ tool: 'merge', inputs: [invalid] }),
    ),
    'INPUT_COUNT_INVALID',
  );
});

test('admission requires governed MIME and extension pairs', async () => {
  const first = await pdfInput('first.exe');
  const second = await pdfInput('second.pdf');
  assert.equal(
    await errorCode(() =>
      admitInputs({ tool: 'merge', inputs: [first, second] }),
    ),
    'FILE_TYPE_UNSUPPORTED',
  );
});

test('individual and aggregate file boundaries are stable', async () => {
  const exact = await pdfInput('exact.pdf', 1, 100 * MEBIBYTE);
  await admitInputs({ tool: 'rotate', inputs: [exact] });

  const over = await pdfInput('over.pdf', 1, 100 * MEBIBYTE + 1);
  assert.equal(
    await errorCode(() => admitInputs({ tool: 'rotate', inputs: [over] })),
    'FILE_TOO_LARGE',
  );

  const inputs = await Promise.all([
    pdfInput('one.pdf', 1, 90 * MEBIBYTE),
    pdfInput('two.pdf', 1, 90 * MEBIBYTE),
    pdfInput('three.pdf', 1, 70 * MEBIBYTE + 1),
  ]);
  assert.equal(
    await errorCode(() => admitInputs({ tool: 'merge', inputs })),
    'AGGREGATE_SIZE_LIMIT',
  );
});

test('corrupted and encrypted PDFs have distinct governed failures', async () => {
  const malformed: AdmissionInput = {
    name: 'broken.pdf',
    mimeType: 'application/pdf',
    size: 5,
    bytes: Uint8Array.from([1, 2, 3, 4, 5]).buffer,
  };
  assert.equal(
    await errorCode(() => admitInputs({ tool: 'rotate', inputs: [malformed] })),
    'PDF_CORRUPTED',
  );

  const valid = await pdfInput();
  const source = Buffer.from(valid.bytes).toString('latin1');
  const encryptedBytes = Buffer.from(
    source.replace(/\/Root (\d+ \d+ R)/, '/Root $1\n/Encrypt $1'),
    'latin1',
  );
  assert.equal(
    await errorCode(() =>
      admitInputs({
        tool: 'rotate',
        inputs: [{
          ...valid,
          name: 'encrypted.pdf',
          size: encryptedBytes.byteLength,
          bytes: encryptedBytes.buffer.slice(
            encryptedBytes.byteOffset,
            encryptedBytes.byteOffset + encryptedBytes.byteLength,
          ) as ArrayBuffer,
        }],
      }),
    ),
    'ENCRYPTED_PDF_UNSUPPORTED',
  );
});

test('page geometry and page-count limits include exact boundaries', async () => {
  await admitInputs({
    tool: 'rotate',
    inputs: [await pdfInput('minimum.pdf', 1, undefined, [3, 3])],
  });
  await admitInputs({
    tool: 'rotate',
    inputs: [await pdfInput('maximum.pdf', 1, undefined, [14_400, 14_400])],
  });
  const tooSmall = await pdfInput('too-small.pdf', 1, undefined, [2, 300]);
  const tooLarge = await pdfInput('too-large.pdf', 1, undefined, [14_401, 300]);
  const tooManySplitPages = await pdfInput('many.pdf', 201);
  assert.equal(
    await errorCode(() =>
      admitInputs({
        tool: 'rotate',
        inputs: [tooSmall],
      }),
    ),
    'PAGE_GEOMETRY_UNSUPPORTED',
  );
  assert.equal(
    await errorCode(() =>
      admitInputs({
        tool: 'rotate',
        inputs: [tooLarge],
      }),
    ),
    'PAGE_GEOMETRY_UNSUPPORTED',
  );
  assert.equal(
    await errorCode(() =>
      admitInputs({
        tool: 'split',
        inputs: [tooManySplitPages],
        splitEveryPage: true,
      }),
    ),
    'PAGE_COUNT_LIMIT',
  );
});

test('image and estimated-working-memory limits reject before execution', async () => {
  const image = (name: string, pixels: number): AdmissionInput => ({
    name,
    mimeType: 'image/png',
    size: 1,
    bytes: new ArrayBuffer(1),
    imagePixels: pixels,
  });
  assert.equal(
    await errorCode(() =>
      admitInputs({
        tool: 'images-to-pdf',
        inputs: [image('large.png', 40_000_001)],
      }),
    ),
    'IMAGE_DIMENSIONS_LIMIT',
  );

  const memoryInputs = await Promise.all([
    pdfInput('one.pdf', 200, 90 * MEBIBYTE),
    pdfInput('two.pdf', 200, 80 * MEBIBYTE),
    pdfInput('three.pdf', 100, 80 * MEBIBYTE),
  ]);
  assert.equal(
    await errorCode(() =>
      admitInputs({ tool: 'merge', inputs: memoryInputs }),
    ),
    'ESTIMATED_MEMORY_LIMIT',
  );
});
