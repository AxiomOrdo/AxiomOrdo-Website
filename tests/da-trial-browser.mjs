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
    if(process.env.DA_DEBUG){
      page.on('request', request => console.log('REQUEST',request.method(),new URL(request.url()).pathname));
      page.on('response', response => console.log('RESPONSE',response.status(),new URL(response.url()).pathname));
      page.on('pageerror', error => console.log('PAGE ERROR',error.message));
    }
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/da');
    await page.getByRole('button', {name:'Start a sample trial'}).click();
    await page.waitForURL('**/da/workspace/');
    await page.waitForFunction(() => document.querySelector('#da-session-time')?.textContent.includes('remaining'));
    assert.equal(await page.locator('#saveCase').isDisabled(),true);
    await page.locator('#file').setInputFiles({name:'fictional.txt',mimeType:'text/plain',buffer:Buffer.from('Fictional file notes retained until explicit replacement.')});
    await page.waitForFunction(() => document.querySelector('#notes')?.readOnly === true);
    page.once('dialog', dialog => dialog.dismiss());
    await page.getByRole('button', {name:'Use fictional example',exact:true}).click();
    assert.equal(await page.locator('#notes').inputValue(), 'Fictional file notes retained until explicit replacement.');
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', {name:'Use fictional example',exact:true}).click();
    assert.ok((await page.locator('#notes').inputValue()).startsWith('Fictional sample:'));
    assert.equal(await page.locator('#notes').evaluate(input => input.readOnly), false);
    assert.equal(await page.locator('#ack').isChecked(), false);
    assert.equal(await page.locator('#lineAck').isChecked(), false);
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
    const first = page.locator('#sections input[type=checkbox]').first();
    if (!(await page.locator('#sections input:checked').count())) await first.check();
    await page.evaluate(async () => {await invalidation;});
    let invalidations = 0;
    const countInvalidations = request => {if(request.url().endsWith('/invalidate')) invalidations++};
    page.on('request', countInvalidations);
    const cleared = page.waitForResponse(response => response.url().endsWith('/invalidate') && response.status() === 200);
    await page.getByRole('button', {name:'Clear headings',exact:true}).click();
    await cleared;
    page.off('request', countInvalidations);
    assert.equal(invalidations, 1, 'Bulk selection must revoke once');
    assert.equal(await page.locator('#sections input:checked').count(), 0);
    await page.getByRole('searchbox', {name:'Find a report heading'}).fill('alarm');
    assert.equal(await page.locator('#sections label:visible').count(), 1);
    await page.getByRole('searchbox', {name:'Find a report heading'}).fill('');
    await page.locator('#sections input[value="ALARM"]').check();
    await page.locator('#sections input[value="custom:sample_observations"]').check();
    const row = page.locator('#points fieldset').first();
    assert.equal(await page.locator('#da-review-progress').innerText(), '0 of 1 note decisions confirmed');
    await page.getByRole('button', {name:'Go to next unreviewed note'}).click();
    assert.equal(await row.locator('select').first().evaluate(input => input === document.activeElement), true);
    await row.getByLabel(/^Decision /).selectOption('include');
    await row.getByLabel(/^Report section /).selectOption('ALARM');
    await row.getByLabel('I have reviewed this note and decision').check();
    assert.equal(await page.locator('#da-review-progress').innerText(), '1 of 1 note decisions confirmed');
    for(const action of ['Save synthetic case','Export section profile']){
      if(action==='Export section profile'){
        const details=page.locator('details').filter({has:page.getByText('Custom headings and saved section profiles',{exact:true})});
        if((await details.getAttribute('open'))===null) await page.getByText('Custom headings and saved section profiles',{exact:true}).click();
      }
      const pendingExport=page.waitForEvent('download');
      await page.getByRole('button', {name:action,exact:true}).click();
      await pendingExport;
      await page.waitForFunction(() => document.querySelector('#da-review-progress')?.textContent === '0 of 1 note decisions confirmed');
      assert.equal(await page.getByRole('button', {name:'Go to next unreviewed note'}).isEnabled(),true);
      await row.getByLabel('I have reviewed this note and decision').check();
    }
    await page.getByRole('button', {name:'Review decisions and create draft',exact:true}).click();
    const word = page.getByRole('link', {name:'Download Word review draft (.docx)',exact:true});
    await word.waitFor();
    const href = await word.getAttribute('href');
    assert.ok((await page.locator('#da-step').innerText()).includes('Step 3'));
    await page.getByRole('searchbox', {name:'Find a report heading'}).fill('no matching heading');
    assert.equal(await word.count(), 1, 'Display-only search must retain the draft');
    assert.equal((await context.request.get(base + href)).status(), 200);
    await page.getByRole('searchbox', {name:'Find a report heading'}).fill('');
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
    assert.equal(await page.locator('#da-review-progress').innerText(), '0 of 1 note decisions confirmed');
    await page.route('**/da/session', route => route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({expires_in:1,lifetime:900})}));
    await page.reload();
    await page.waitForFunction(() => document.querySelector('#da-session-time')?.textContent === 'Session ended');
    assert.ok((await page.locator('#da-session-message').innerText()).includes('Copy any sample text'));
    assert.equal(await page.locator('#save').isDisabled(), true);
    assert.equal(await page.getByRole('link', {name:'Return to trial start',exact:true}).getAttribute('href'), '/da');
    await page.unroute('**/da/session');
    await page.route('**/da/session', route => route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({expires_in:90,lifetime:900})}));
    await page.goto(base + '/da/workspace/notes');
    await page.waitForFunction(() => document.querySelector('#da-session-message')?.textContent.includes('Copy your sample notes'));
    assert.ok((await page.locator('#da-session-message').innerText()).includes('Case saving becomes available on the review worksheet'));
    assert.deepEqual(errors, []);
    console.log(`PASS ${viewport.width}px: example consent, heading search/bulk selection, review progress, Word, retained holds, isolation, revocation and expiry guidance`);
    await context.close();
  }
} finally {
  await browser.close();
  await rm(directory, {recursive:true,force:true});
}
