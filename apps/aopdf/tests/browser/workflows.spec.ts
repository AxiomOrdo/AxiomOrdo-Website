import { expect, test } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';

async function pdfFixture(pageCount = 2): Promise<Buffer> {
  const document = await PDFDocument.create({ updateMetadata: false });
  document.setTitle('Browser fixture');
  for (let index = 0; index < pageCount; index += 1) {
    document.addPage([300, 400]);
  }
  return Buffer.from(await document.save({ useObjectStreams: false }));
}

const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

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
    page.on('request', (request) => {
      if (request.method() !== 'GET') transmittedBodies.push(request.postData() ?? '');
    });

    await page.goto(`/aopdf/tools/${tool}/`);
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
      await input.setInputFiles([
        { name: 'first.png', mimeType: 'image/png', buffer: onePixelPng },
        { name: 'second.png', mimeType: 'image/png', buffer: onePixelPng },
      ]);
    } else {
      const buffer = await pdfFixture();
      const files = [
        { name: 'fixture.pdf', mimeType: 'application/pdf', buffer },
      ];
      if (tool === 'merge') {
        files.push({
          name: 'second.pdf',
          mimeType: 'application/pdf',
          buffer: await pdfFixture(1),
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
    const download = await downloadPromise;
    await expect(page.getByText('Download started. Your browser is handling the download.')).toBeVisible();
    expect(download.suggestedFilename()).toMatch(/^.*aopdf.*\.(pdf|zip)$/);
    await expect(page.getByRole('heading', { name: 'Local processing summary' })).toBeVisible();

    const transmitted = transmittedBodies.join('\n');
    expect(transmitted).not.toContain('%PDF');
    expect(transmitted).not.toContain('fixture.pdf');
    expect(transmitted).not.toContain('Browser fixture');
  });
}

test('limits and legal routes are reachable', async ({ page }) => {
  for (const route of ['limits', 'privacy', 'terms', 'acceptable-use']) {
    await page.goto(`/aopdf/${route}/`);
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('operation controls remain usable at governed responsive widths', async ({ page }) => {
  for (const width of [320, 375, 768]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/aopdf/tools/rotate/');
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
  await page.goto('/aopdf/tools/merge/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'AOPDF' })).toBeFocused();
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
