import {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts,
} from 'pdf-lib';

export type PdfInput = ArrayBuffer | Uint8Array;

export async function mergePdfs(inputs: PdfInput[]): Promise<Uint8Array> {
  if (inputs.length < 2) throw new Error('Merge requires at least two PDFs.');

  const output = await PDFDocument.create();
  for (const input of inputs) {
    const source = await PDFDocument.load(input);
    const pages = await output.copyPages(source, source.getPageIndices());
    pages.forEach((page) => output.addPage(page));
  }
  return output.save({ useObjectStreams: true });
}

export async function extractPages(
  input: PdfInput,
  indices: number[],
): Promise<Uint8Array> {
  if (indices.length === 0) throw new Error('At least one page is required.');
  const source = await PDFDocument.load(input);
  validateIndices(indices, source.getPageCount());
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indices);
  pages.forEach((page) => output.addPage(page));
  return output.save({ useObjectStreams: true });
}

export async function splitEveryPage(input: PdfInput): Promise<Uint8Array[]> {
  const source = await PDFDocument.load(input);
  return Promise.all(
    source.getPageIndices().map(async (index) => {
      const output = await PDFDocument.create();
      const [page] = await output.copyPages(source, [index]);
      output.addPage(page);
      return output.save({ useObjectStreams: true });
    }),
  );
}

export async function optimizePdf(input: PdfInput): Promise<Uint8Array> {
  const source = await PDFDocument.load(input);
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, source.getPageIndices());
  pages.forEach((page) => output.addPage(page));
  return output.save({ useObjectStreams: true });
}

export async function rotateAllPages(
  input: PdfInput,
  angle: 90 | 180 | 270,
): Promise<Uint8Array> {
  const document = await PDFDocument.load(input);
  document.getPages().forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  });
  return document.save({ useObjectStreams: true });
}

export async function deletePages(
  input: PdfInput,
  indices: number[],
): Promise<Uint8Array> {
  const source = await PDFDocument.load(input);
  validateIndices(indices, source.getPageCount());
  const toDelete = new Set(indices);
  const keep = source.getPageIndices().filter((index) => !toDelete.has(index));
  if (keep.length === 0) throw new Error('Cannot delete every page.');
  return extractPages(input, keep);
}

export async function addTextWatermark(
  input: PdfInput,
  text: string,
): Promise<Uint8Array> {
  const value = text.trim();
  if (!value) throw new Error('Watermark text is required.');
  const document = await PDFDocument.load(input);
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
  return document.save({ useObjectStreams: true });
}

export async function addPageNumbers(
  input: PdfInput,
  position: 'bottom-center' | 'bottom-right' | 'top-center',
): Promise<Uint8Array> {
  const document = await PDFDocument.load(input);
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
  return document.save({ useObjectStreams: true });
}

export async function flattenFormFields(input: PdfInput): Promise<Uint8Array> {
  const document = await PDFDocument.load(input);
  document.getForm().flatten();
  return document.save({ useObjectStreams: true });
}

export async function imagesToPdf(
  images: Array<{ bytes: PdfInput; type: 'image/jpeg' | 'image/png' }>,
): Promise<Uint8Array> {
  if (images.length === 0) throw new Error('At least one JPG or PNG is required.');
  const document = await PDFDocument.create();
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
    throw new Error('Page selection is outside the document bounds.');
  }
}
