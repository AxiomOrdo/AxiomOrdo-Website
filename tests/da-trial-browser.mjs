// Live integration check: run only against an explicitly selected sample-trial origin.
// npm ci && (cd apps/aopdf && npm ci --ignore-scripts) supplies the existing tools.
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import playwright from '../apps/aopdf/node_modules/playwright/index.js';
import JSZip from '../apps/aopdf/node_modules/jszip/lib/index.js';

const base = process.env.DA_BASE_URL || 'http://127.0.0.1:8767';
assert.match(base, /^(http:\/\/127\.0\.0\.1:\d+|https:\/\/www\.axiomordo\.com)$/);
const directory = await mkdtemp(join(tmpdir(), 'da-browser-'));
const browser = await playwright.chromium.launch({ headless: true });
const note = 'A fictional alarm panel is located by the sample entrance.';
try {
  for (const viewport of [{width:1280,height:900}, {width:390,height:844}]) {
    const context = await browser.newContext({ viewport, acceptDownloads: true });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/da');
    await page.getByRole('button', {name:'Start a sample trial'}).click();
    await page.waitForURL('**/da/workspace/');
    await page.locator('#notes').fill(note);
    await page.locator('#propose').click();
    await page.locator('#lineAck').check();
    await page.locator('#acceptLines').click();
    await page.locator('#ack').check();
    await page.locator('#continue').click();
    await page.waitForSelector('#sections');
    // Custom headings use the current trial's own editor and validators.
    await page.getByText('Custom headings and saved section profiles', {exact:true}).click();
    await page.getByLabel('New section heading ', {exact:true}).fill('Sample observations');
    await page.getByRole('button', {name:'Add custom section',exact:true}).click();
    await page.waitForFunction(() => !!document.querySelector('#sections input[value="custom:sample_observations"]'));
    for (const checkbox of await page.locator('#sections input[type=checkbox]').all()) await checkbox.uncheck();
    await page.locator('#sections input[value="ALARM"]').check();
    await page.locator('#sections input[value="custom:sample_observations"]').check();
    const row = page.locator('#points fieldset').first();
    await row.getByLabel(/^Decision /).selectOption('include');
    await row.getByLabel(/^Report section /).selectOption('ALARM');
    await row.getByLabel('I have reviewed this note and decision').check();
    await page.getByRole('button', {name:'Review decisions and create draft',exact:true}).click();
    const word = page.getByRole('link', {name:'Download Word review draft (.docx)',exact:true});
    await word.waitFor();
    const href = await word.getAttribute('href');
    const pending = page.waitForEvent('download');
    await word.click();
    const download = await pending;
    assert.equal(download.suggestedFilename(), 'section-review-preview.docx');
    const filename = join(directory, `draft-${viewport.width}.docx`);
    await download.saveAs(filename);
    const zip = await JSZip.loadAsync(await readFile(filename));
    const xml = await zip.file('word/document.xml').async('string');
    assert.ok(xml.includes(note));
    assert.ok(xml.includes('Alarm'));
    assert.ok(xml.includes('Sample observations'));
    const evidenceLink = page.locator('a[download="changes.json"]');
    const evidence = await context.request.get(base + await evidenceLink.getAttribute('href'));
    const record = await evidence.json();
    assert.equal(record.section_docx_review.service_return_permitted, false);
    assert.ok((await page.locator('#results').innerText()).includes('holds remain'));
    const stranger = await browser.newContext();
    const isolated = await stranger.request.get(base + href);
    assert.equal(isolated.status(), 410);
    await stranger.close();
    const revoked = page.waitForResponse(response => response.url().endsWith('/invalidate') && response.status() === 200);
    await row.getByLabel('Reason or question (required for exclusions and unresolved notes) ', {exact:true}).fill('Changed sample decision.');
    await revoked;
    await page.waitForFunction(() => !document.querySelector('#results'));
    const stale = await context.request.get(base + href);
    assert.equal(stale.status(), 404);
    assert.deepEqual(errors, []);
    console.log(`PASS ${viewport.width}px: notes, custom/standard headings, actual Word, retained holds, isolation and stale link refusal`);
    await context.close();
  }
} finally {
  await browser.close();
  await rm(directory, {recursive:true,force:true});
}
