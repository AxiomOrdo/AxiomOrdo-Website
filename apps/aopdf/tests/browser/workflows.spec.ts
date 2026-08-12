import { expect, test } from '@playwright/test';
import JSZip from 'jszip';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

async function pdfFixture(pageCount = 2): Promise<Buffer> {
  const document = await PDFDocument.create({ updateMetadata: false });
  document.setTitle('Browser fixture');
  const font = await document.embedFont(StandardFonts.Helvetica);
  for (let index = 0; index < pageCount; index += 1) {
    const page = document.addPage([300, 400]);
    page.drawText('SECRET Browser fixture', { x: 60, y: 300, size: 18, font });
  }
  return Buffer.from(await document.save({ useObjectStreams: false }));
}

async function annotatedPdfFixture(): Promise<Buffer> {
  const document = await PDFDocument.create({ updateMetadata: false });
  const page = document.addPage([300, 400]);
  const field = document.getForm().createTextField('reviewer');
  field.addToPage(page, { x: 30, y: 30, width: 100, height: 20 });
  return Buffer.from(await document.save({ useObjectStreams: false }));
}

async function scannedPdfFixture(): Promise<Buffer> {
  const document = await PDFDocument.create({ updateMetadata: false });
  const image = await document.embedPng(onePixelPng);
  const page = document.addPage([100, 100]);
  page.drawImage(image, { x: 0, y: 0, width: 100, height: 100 });
  return Buffer.from(await document.save({ useObjectStreams: false }));
}

const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

const tools = [
  'merge',
  'split',
  'compress',
  'rotate',
  'delete-pages',
  'watermark',
  'page-numbers',
  'flatten',
  'images-to-pdf',
  'inspect',
  'compare',
  'evidence-manifest',
  'redact',
] as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'showSaveFilePicker', {
      configurable: true,
      value: undefined,
    });
  });
});

for (const tool of tools) {
  test(`${tool} completes through the browser-local worker`, async ({ page }) => {
    const transmittedBodies: string[] = [];
    const sourceBuffers: Buffer[] = [];
    page.on('request', (request) => {
      if (request.method() !== 'GET') transmittedBodies.push(request.postData() ?? '');
    });

    await page.goto(`/ao-pdf/tools/${tool}/`);
    await expect(
      page.getByText('This release supports Chromium on desktop and mobile.'),
    ).toBeVisible();
    await expect(
      page.getByText('Firefox and Safari/WebKit are unverified and unsupported.'),
    ).toBeVisible();
    await page.waitForFunction(() => typeof window.va === 'function');
    await page.waitForFunction((expectedTool) => {
      const queue = (
        window as unknown as {
          vaq?: Array<
            [
              string,
              {
                name?: string;
                data?: Record<string, unknown>;
              },
            ]
          >;
        }
      ).vaq;
      return queue?.some(
        ([kind, event]) =>
          kind === 'event' &&
          event.name === 'aopdf_tool_selected' &&
          event.data?.tool === expectedTool &&
          Object.keys(event.data).length === 1,
      );
    }, tool);
    const input = page.locator('input[type=file]');
    if (tool === 'images-to-pdf') {
      sourceBuffers.push(onePixelPng, onePixelPng);
      await input.setInputFiles([
        { name: 'first.png', mimeType: 'image/png', buffer: onePixelPng },
        { name: 'second.png', mimeType: 'image/png', buffer: onePixelPng },
      ]);
    } else {
      const buffer = await pdfFixture();
      sourceBuffers.push(buffer);
      const files = [
        { name: 'fixture.pdf', mimeType: 'application/pdf', buffer },
      ];
      if (tool === 'merge' || tool === 'compare') {
        const second = await pdfFixture(1);
        sourceBuffers.push(second);
        files.push({
          name: 'second.pdf',
          mimeType: 'application/pdf',
          buffer: second,
        });
      }
      await input.setInputFiles(files);
    }

    await expect(page.getByText(/file(s)? ready/)).toBeVisible();
    if (tool === 'delete-pages') {
      await page.getByLabel('Pages to delete').fill('1');
    }

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Process locally' }).click();
    const download = await Promise.race([
      downloadPromise,
      page.getByText(/\([A-Z_]+\)$/).waitFor({ timeout: 15_000 }).then(async () => {
        throw new Error(`Workflow failed: ${await page.getByText(/\([A-Z_]+\)$/).textContent()}`);
      }),
    ]);
    await expect(page.getByText('Download started. Your browser is handling the download.')).toBeVisible();
    expect(download.suggestedFilename()).toMatch(/^.*ao-pdf.*\.(pdf|zip)$/);
    await expect(page.getByRole('heading', { name: 'Local processing summary' })).toBeVisible();

    const transmitted = transmittedBodies.join('\n');
    expect(transmitted).not.toContain('%PDF');
    expect(transmitted).not.toContain('fixture.pdf');
    expect(transmitted).not.toContain('Browser fixture');
    expect(transmitted).not.toContain('CONFIDENTIAL');
    expect(transmitted).not.toContain('1,20,20,20,10');
    for (const source of sourceBuffers) expect(transmitted).not.toContain(digest(source));
    const sessionState = await page.evaluate(() => JSON.stringify({ ...window.sessionStorage }));
    expect(sessionState).not.toContain('fixture');
    expect(sessionState).not.toContain('Browser fixture');
    for (const source of sourceBuffers) expect(sessionState).not.toContain(digest(source));
  });
}

test('redaction bundle contains a reopenable image-only PDF and bounded verification', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Detailed artifact inspection runs once in Chromium.');
  await page.goto('/ao-pdf/tools/redact/');
  const source = await pdfFixture(1);
  await page.locator('input[type=file]').setInputFiles({
    name: 'sensitive.pdf',
    mimeType: 'application/pdf',
    buffer: source,
  });
  await page.getByLabel('Redaction rectangles').fill('1,15,15,70,25');
  await expect(page.getByText(/tested recovery resistance only/i)).toBeVisible();
  await expect(page.getByText(/responsible for selecting rectangles/i)).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Process locally' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  assertPath(path);
  const archive = await JSZip.loadAsync(await import('node:fs/promises').then((fs) => fs.readFile(path)));
  const redacted = await archive.file('redacted.pdf')?.async('uint8array');
  const verification = await archive.file('redaction-verification.json')?.async('string');
  const manifest = await archive.file('evidence-manifest.json')?.async('string');
  expect(redacted).toBeTruthy();
  expect(verification).toContain('"passed": true');
  expect(manifest).toContain('does not prove');
  expect(Buffer.from(redacted as Uint8Array).includes(Buffer.from('SECRET'))).toBe(false);
  const reopened = await PDFDocument.load(redacted as Uint8Array, { updateMetadata: false });
  expect(reopened.getPageCount()).toBe(1);
  expect(reopened.getForm().getFields()).toHaveLength(0);
  const parsedManifest = JSON.parse(manifest as string) as {
    sources: Array<{ sha256: string }>;
    outputs: Array<{ role: string; sha256: string }>;
  };
  expect(parsedManifest.sources[0]?.sha256).toBe(digest(source));
  expect(parsedManifest.outputs.find((output) => output.role === 'redacted.pdf')?.sha256)
    .toBe(digest(redacted as Uint8Array));
  await import('node:fs/promises').then((fs) =>
    fs.writeFile(testInfo.outputPath('redacted-output.pdf'), redacted as Uint8Array),
  );
  const readerEvidence = JSON.parse(
    execFileSync(
      process.env.AOPDF_PYPDF_PYTHON ?? 'python3',
      [
        resolve(process.cwd(), 'tests/evidence/verify_redacted_pdf.py'),
        testInfo.outputPath('redacted-output.pdf'),
        '--expected-pages',
        '1',
        '--forbidden-text',
        'SECRET',
      ],
      { encoding: 'utf8' },
    ),
  ) as {
    passed: boolean;
    reader: string;
    assertions: Record<string, boolean>;
  };
  expect(readerEvidence.passed).toBe(true);
  expect(readerEvidence.reader).toBe('pypdf 6.15.0');
  expect(Object.values(readerEvidence.assertions).every(Boolean)).toBe(true);
});

test('scanned page redaction completes without OCR', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Scanned artifact flow runs once in Chromium.');
  await page.goto('/ao-pdf/tools/redact/');
  await page.locator('input[type=file]').setInputFiles({
    name: 'scan.pdf',
    mimeType: 'application/pdf',
    buffer: await scannedPdfFixture(),
  });
  await page.getByLabel('Redaction rectangles').fill('1,10,10,30,30');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Process locally' }).click();
  await downloadPromise;
  await expect(page.getByText('Download started. Your browser is handling the download.')).toBeVisible();
});

test('redaction rejects annotated content instead of weakening the claim', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Unsupported-content flow runs once in Chromium.');
  await page.goto('/ao-pdf/tools/redact/');
  await page.locator('input[type=file]').setInputFiles({
    name: 'annotated.pdf',
    mimeType: 'application/pdf',
    buffer: await annotatedPdfFixture(),
  });
  await page.getByRole('button', { name: 'Process locally' }).click();
  await expect(page.getByText(/\(REDACTION_CONTENT_UNSUPPORTED\)$/)).toBeVisible();
});

test('malformed and encrypted files fail with distinct governed errors', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Admission failures run once in Chromium.');
  await page.goto('/ao-pdf/tools/inspect/');
  const input = page.locator('input[type=file]');
  await input.setInputFiles({
    name: 'broken.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from([1, 2, 3, 4, 5]),
  });
  await expect(page.getByText(/\(PDF_CORRUPTED\)$/)).toBeVisible();

  const valid = await pdfFixture(1);
  const encrypted = Buffer.from(
    valid.toString('latin1').replace(/\/Root (\d+ \d+ R)/, '/Root $1\n/Encrypt $1'),
    'latin1',
  );
  await input.setInputFiles({
    name: 'encrypted.pdf',
    mimeType: 'application/pdf',
    buffer: encrypted,
  });
  await expect(page.getByText(/\(ENCRYPTED_PDF_UNSUPPORTED\)$/)).toBeVisible();
});

function assertPath(path: string | null): asserts path is string {
  expect(path).not.toBeNull();
}

test('limits and legal routes are reachable', async ({ page }) => {
  for (const route of ['limits', 'privacy', 'terms', 'acceptable-use']) {
    await page.goto(`/ao-pdf/${route}/`);
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('operation controls remain usable at governed responsive widths', async ({ page }) => {
  for (const width of [320, 375, 768]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/ao-pdf/tools/rotate/');
    await page.locator('input[type=file]').setInputFiles({
      name: 'fixture.pdf',
      mimeType: 'application/pdf',
      buffer: await pdfFixture(),
    });
    const processButton = page.getByRole('button', { name: 'Process locally' });
    await expect(processButton).toBeVisible();
    expect((await processButton.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }
});

test('keyboard navigation and reduced motion remain functional', async (
  { page },
  testInfo,
) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ao-pdf/tools/merge/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'AO-PDF' })).toBeFocused();
  await page.keyboard.press('Tab');
  if (testInfo.project.name === 'mobile-chromium') {
    const menuButton = page.getByRole('button', { name: 'Open navigation' });
    await expect(menuButton).toBeFocused();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await expect(
      page
        .getByRole('navigation', { name: 'Mobile navigation' })
        .getByRole('link', { name: 'Tools' }),
    ).toBeFocused();
  } else {
    await expect(
      page
        .getByRole('navigation', { name: 'Primary navigation' })
        .getByRole('link', { name: 'Tools' }),
    ).toBeFocused();
  }
  const fileButton = page.getByRole('button', { name: /Drop files here/ });
  await fileButton.focus();
  await expect(fileButton).toBeFocused();
});
