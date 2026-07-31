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

async function createMetadataPdf(pageCount = 1): Promise<Uint8Array> {
  const document = await PDFDocument.create({ updateMetadata: false });
  for (let index = 0; index < pageCount; index += 1) {
    document.addPage([300, 400]);
  }
  document.setTitle('Governed title');
  document.setAuthor('AxiomOrdo');
  document.setSubject('Metadata fixture');
  document.setKeywords(['one', 'two']);
  document.setCreator('AOPDF fixture');
  document.setProducer('AOPDF test');
  document.setCreationDate(new Date('2024-01-02T03:04:05.000Z'));
  document.setModificationDate(new Date('2025-02-03T04:05:06.000Z'));
  return document.save({ useObjectStreams: false });
}

function supportedMetadata(document: PDFDocument) {
  return {
    title: document.getTitle(),
    author: document.getAuthor(),
    subject: document.getSubject(),
    keywords: document.getKeywords(),
    creator: document.getCreator(),
    producer: document.getProducer(),
    creationDate: document.getCreationDate()?.toISOString(),
    modificationDate: document.getModificationDate()?.toISOString(),
  };
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
  await assert.rejects(
    () => deletePages(twoPages, [0, 1]),
    (error) => (error as { code?: string }).code === 'SELECTION_INVALID',
  );
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

test('single-document transformations preserve supported information fields', async () => {
  const source = await createMetadataPdf();
  const deleteSource = await createMetadataPdf(2);
  const expected = supportedMetadata(
    await PDFDocument.load(source, { updateMetadata: false }),
  );
  const outputs = [
    await optimizePdf(source),
    await rotateAllPages(source, 90),
    await deletePages(deleteSource, [1]),
    await addTextWatermark(source, 'DRAFT'),
    await addPageNumbers(source, 'bottom-center'),
    await flattenFormFields(source),
  ];

  for (const output of outputs) {
    const actual = supportedMetadata(
      await PDFDocument.load(output, { updateMetadata: false }),
    );
    assert.deepEqual(actual, expected);
  }
});

test('merge, extract, split, and images create new documents without source metadata', async () => {
  const source = await createMetadataPdf();
  const plain = await createPdf(1);
  const outputs = [
    await mergePdfs([source, plain]),
    await extractPages(source, [0]),
    ...(await splitEveryPage(source)),
  ];
  for (const output of outputs) {
    const document = await PDFDocument.load(output, { updateMetadata: false });
    assert.equal(document.getTitle(), undefined);
    assert.equal(document.getAuthor(), undefined);
    assert.equal(document.getSubject(), undefined);
  }
});

test('flatten removes supported interactive form fields', async () => {
  const document = await PDFDocument.create();
  const page = document.addPage([300, 400]);
  const form = document.getForm();
  const text = form.createTextField('reference');
  text.addToPage(page, { x: 20, y: 330, width: 180, height: 24 });
  text.setText('AO-001');
  const checkbox = form.createCheckBox('approved');
  checkbox.addToPage(page, { x: 20, y: 290, width: 20, height: 20 });
  checkbox.check();
  const radio = form.createRadioGroup('priority');
  radio.addOptionToPage('high', page, {
    x: 20,
    y: 250,
    width: 20,
    height: 20,
  });
  radio.select('high');
  const dropdown = form.createDropdown('region');
  dropdown.addOptions(['north', 'south']);
  dropdown.addToPage(page, { x: 20, y: 200, width: 120, height: 24 });
  dropdown.select('north');
  const options = form.createOptionList('scope');
  options.addOptions(['one', 'two']);
  options.addToPage(page, { x: 20, y: 100, width: 120, height: 70 });
  options.select('two');

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
  const admitted = PDF_TOOLS.map((tool) => tool.slug);
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
