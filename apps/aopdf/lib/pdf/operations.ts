import {
  degrees,
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFOptionList,
  PDFRadioGroup,
  PDFTextField,
  rgb,
  StandardFonts,
} from 'pdf-lib';
import {
  captureSupportedMetadata,
  restoreSupportedMetadata,
} from '@/governance/metadata-contract';
import { OperationError } from '@/governance/operation-errors';

export type PdfInput = ArrayBuffer | Uint8Array;

export async function mergePdfs(inputs: PdfInput[]): Promise<Uint8Array> {
  if (inputs.length < 2) throw new OperationError('INPUT_COUNT_INVALID');

  const output = await PDFDocument.create({ updateMetadata: false });
  for (const input of inputs) {
    const source = await PDFDocument.load(input, { updateMetadata: false });
    const pages = await output.copyPages(source, source.getPageIndices());
    pages.forEach((page) => output.addPage(page));
  }
  return output.save({ useObjectStreams: true });
}

export async function extractPages(
  input: PdfInput,
  indices: number[],
): Promise<Uint8Array> {
  if (indices.length === 0) throw new OperationError('SELECTION_INVALID');
  const source = await PDFDocument.load(input, { updateMetadata: false });
  validateIndices(indices, source.getPageCount());
  const output = await PDFDocument.create({ updateMetadata: false });
  const pages = await output.copyPages(source, indices);
  pages.forEach((page) => output.addPage(page));
  return output.save({ useObjectStreams: true });
}

export async function splitEveryPage(input: PdfInput): Promise<Uint8Array[]> {
  const source = await PDFDocument.load(input, { updateMetadata: false });
  return Promise.all(
    source.getPageIndices().map(async (index) => {
      const output = await PDFDocument.create({ updateMetadata: false });
      const [page] = await output.copyPages(source, [index]);
      output.addPage(page);
      return output.save({ useObjectStreams: true });
    }),
  );
}

export async function optimizePdf(input: PdfInput): Promise<Uint8Array> {
  const source = await PDFDocument.load(input, { updateMetadata: false });
  const metadata = captureSupportedMetadata(source);
  const output = await PDFDocument.create({ updateMetadata: false });
  const pages = await output.copyPages(source, source.getPageIndices());
  pages.forEach((page) => output.addPage(page));
  restoreSupportedMetadata(output, metadata);
  return output.save({ useObjectStreams: true });
}

export async function rotateAllPages(
  input: PdfInput,
  angle: 90 | 180 | 270,
): Promise<Uint8Array> {
  const document = await PDFDocument.load(input, { updateMetadata: false });
  const metadata = captureSupportedMetadata(document);
  document.getPages().forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  });
  restoreSupportedMetadata(document, metadata);
  return document.save({ useObjectStreams: true });
}

export async function deletePages(
  input: PdfInput,
  indices: number[],
): Promise<Uint8Array> {
  const source = await PDFDocument.load(input, { updateMetadata: false });
  const metadata = captureSupportedMetadata(source);
  validateIndices(indices, source.getPageCount());
  const toDelete = new Set(indices);
  if (toDelete.size >= source.getPageCount()) {
    throw new OperationError('SELECTION_INVALID');
  }
  [...toDelete]
    .sort((left, right) => right - left)
    .forEach((index) => source.removePage(index));
  restoreSupportedMetadata(source, metadata);
  return source.save({ useObjectStreams: true });
}

export async function addTextWatermark(
  input: PdfInput,
  text: string,
): Promise<Uint8Array> {
  const value = text.trim();
  if (
    !value ||
    value.length > 120 ||
    !/^[\x20-\x7e\u00a0-\u00ff]+$/.test(value)
  ) {
    throw new OperationError('WATERMARK_TEXT_INVALID');
  }
  const document = await PDFDocument.load(input, { updateMetadata: false });
  const metadata = captureSupportedMetadata(document);
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  document.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    page.drawText(value, {
      x: width / 4,
      y: height / 2,
      size: 40,
      font,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.3,
      rotate: degrees(45),
    });
  });
  restoreSupportedMetadata(document, metadata);
  return document.save({ useObjectStreams: true });
}

export async function addPageNumbers(
  input: PdfInput,
  position: 'bottom-center' | 'bottom-right' | 'top-center',
): Promise<Uint8Array> {
  const document = await PDFDocument.load(input, { updateMetadata: false });
  const metadata = captureSupportedMetadata(document);
  const font = await document.embedFont(StandardFonts.Helvetica);
  document.getPages().forEach((page, index) => {
    const { width, height } = page.getSize();
    const label = String(index + 1);
    const labelWidth = font.widthOfTextAtSize(label, 12);
    const x =
      position === 'bottom-right'
        ? width - labelWidth - 30
        : (width - labelWidth) / 2;
    const y = position === 'top-center' ? height - 30 : 30;
    page.drawText(label, { x, y, size: 12, font, color: rgb(0.3, 0.3, 0.3) });
  });
  restoreSupportedMetadata(document, metadata);
  return document.save({ useObjectStreams: true });
}

export async function flattenFormFields(input: PdfInput): Promise<Uint8Array> {
  const document = await PDFDocument.load(input, { updateMetadata: false });
  const metadata = captureSupportedMetadata(document);
  const form = document.getForm();
  if (form.hasXFA()) throw new OperationError('FORM_TYPE_UNSUPPORTED');
  if (
    form
      .getFields()
      .some(
        (field) =>
          !(
            field instanceof PDFTextField ||
            field instanceof PDFCheckBox ||
            field instanceof PDFRadioGroup ||
            field instanceof PDFDropdown ||
            field instanceof PDFOptionList
          ),
      )
  ) {
    throw new OperationError('FORM_TYPE_UNSUPPORTED');
  }
  form.flatten();
  restoreSupportedMetadata(document, metadata);
  return document.save({ useObjectStreams: true });
}

export async function imagesToPdf(
  images: Array<{ bytes: PdfInput; type: 'image/jpeg' | 'image/png' }>,
): Promise<Uint8Array> {
  if (images.length === 0) throw new OperationError('INPUT_COUNT_INVALID');
  const document = await PDFDocument.create({ updateMetadata: false });
  for (const image of images) {
    const embedded =
      image.type === 'image/jpeg'
        ? await document.embedJpg(image.bytes)
        : await document.embedPng(image.bytes);
    const page = document.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width: embedded.width,
      height: embedded.height,
    });
  }
  return document.save({ useObjectStreams: true });
}

function validateIndices(indices: number[], pageCount: number): void {
  if (
    indices.some(
      (index) => !Number.isInteger(index) || index < 0 || index >= pageCount,
    )
  ) {
    throw new OperationError('SELECTION_INVALID');
  }
}
