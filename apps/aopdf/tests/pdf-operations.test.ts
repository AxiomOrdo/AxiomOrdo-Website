import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { PDF_TOOLS } from '../lib/pdf-tools';
import {
  addPageNumbers,
  addTextWatermark,
  deletePages,
  extractPages,
  flattenFormFields,
  imagesToPdf,
  mergePdfs,
  optimizePdf,
  rotateAllPages,
  splitEveryPage,
} from '../lib/pdf/operations';
import { parsePageRanges } from '../lib/pdf/page-ranges';

async function createPdf(pageCount: number): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  for (let index = 0; index < pageCount; index += 1) {
    document.addPage([300, 400]);
  }
  return document.save();
}

async function getPageCount(bytes: Uint8Array): Promise<number> {
  return (await PDFDocument.load(bytes)).getPageCount();
}

test('parsePageRanges returns unique zero-based indices', () => {
  assert.deepEqual(parsePageRanges('1-3, 2, 5', 5), [0, 1, 2, 4]);
});

test('parsePageRanges rejects malformed and out-of-bounds input', () => {
  assert.throws(() => parsePageRanges('0', 3), /Invalid page number/);
  assert.throws(() => parsePageRanges('2-4', 3), /Invalid page range/);
  assert.throws(() => parsePageRanges('2x', 3), /Invalid page number/);
});

test('merge, extract, split, and delete preserve governed page counts', async () => {
  const twoPages = await createPdf(2);
  const onePage = await createPdf(1);

  assert.equal(await getPageCount(await mergePdfs([twoPages, onePage])), 3);
  assert.equal(await getPageCount(await extractPages(twoPages, [1])), 1);

  const split = await splitEveryPage(twoPages);
  assert.equal(split.length, 2);
  assert.deepEqual(
    await Promise.all(split.map((page) => getPageCount(page))),
    [1, 1],
  );

  assert.equal(await getPageCount(await deletePages(twoPages, [0])), 1);
  await assert.rejects(() => deletePages(twoPages, [0, 1]), /every page/);
});

test('rotation is applied to every page', async () => {
  const rotated = await rotateAllPages(await createPdf(2), 90);
  const document = await PDFDocument.load(rotated);
  assert.deepEqual(
    document.getPages().map((page) => page.getRotation().angle),
    [90, 90],
  );
});

test('optimization, watermarking, and numbering retain page count', async () => {
  const source = await createPdf(2);
  assert.equal(await getPageCount(await optimizePdf(source)), 2);
  assert.equal(await getPageCount(await addTextWatermark(source, 'DRAFT')), 2);
  assert.equal(await getPageCount(await addPageNumbers(source, 'bottom-right')), 2);
});

test('flatten removes supported interactive form fields', async () => {
  const document = await PDFDocument.create();
  const page = document.addPage([300, 400]);
  const field = document.getForm().createTextField('reference');
  field.addToPage(page, { x: 20, y: 300, width: 180, height: 24 });
  field.setText('AO-001');

  const flattened = await flattenFormFields(await document.save());
  const output = await PDFDocument.load(flattened);
  assert.equal(output.getForm().getFields().length, 0);
});

test('imagesToPdf creates one page per supported image', async () => {
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  );
  const output = await imagesToPdf([{ bytes: png, type: 'image/png' }]);
  assert.equal(await getPageCount(output), 1);
});

test('only implemented tools are marked available or beta', () => {
  const admitted = PDF_TOOLS
    .filter((tool) => tool.status !== 'planned')
    .map((tool) => tool.slug);
  assert.deepEqual(admitted, [
    'merge',
    'split',
    'compress',
    'rotate',
    'delete-pages',
    'watermark',
    'page-numbers',
    'flatten',
    'images-to-pdf',
  ]);
});
