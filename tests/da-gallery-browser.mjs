// Explicit desktop/mobile acceptance for the actual fixed-report gallery.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir,readFile} from 'node:fs/promises';
import playwright from '../apps/aopdf/node_modules/playwright/index.js';
import JSZip from '../apps/aopdf/node_modules/jszip/lib/index.js';
const base=process.env.DA_BASE_URL||'http://127.0.0.1:8768';
assert.match(base,/^(http:\/\/127\.0\.0\.1:\d+|https:\/\/www\.axiomordo\.com)$/);
const destination=process.env.DA_GALLERY_EVIDENCE||'/tmp/da-gallery-browser';await mkdir(destination,{recursive:true});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const browser=await playwright.chromium.launch({headless:true});
try{
 for(const viewport of [{width:1365,height:1000},{width:390,height:844}]){
  const context=await browser.newContext({viewport,acceptDownloads:true});
  const page=await context.newPage();page.setDefaultTimeout(20000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const manifestResponse=await context.request.get(base+'/da/gallery/manifest');assert.equal(manifestResponse.status(),200);
  const manifest=await manifestResponse.json();assert.equal(manifest.visual_review_completed,true);assert.equal(manifest.styles.length,3);
  await page.goto(base+'/da');await page.locator('#da-report-gallery').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('.da-gallery-card').count(),3);
  assert.equal(await page.locator('textarea').count(),3);
  for(const style of manifest.styles){
   const card=page.locator(`.da-gallery-card[data-style="${style.id}"]`);
   await card.getByRole('button',{name:'Inspect report',exact:true}).click();
   const dialog=page.getByRole('dialog',{name:style.title,exact:true});await dialog.waitFor();
   assert.equal(await page.locator('#da-viewer-counter').textContent(),'Page 1 of 3');
   for(let n=0;n<3;n++){
    if(n)await dialog.getByRole('button',{name:'Next page',exact:true}).click();
    assert.equal(await page.locator('#da-viewer-counter').textContent(),`Page ${n+1} of 3`);
    await page.waitForFunction(()=>{const i=document.querySelector('#da-viewer-image');return i.complete&&i.naturalWidth>0;});
    assert.ok((await page.locator('#da-viewer-image').getAttribute('src')).endsWith(style.pages[n]));
   }
   for(const name of ['Cover','Interior','Header','Footer','Table']){
    await dialog.getByRole('button',{name,exact:true}).click();
    assert.ok((await page.locator('#da-viewer-image').getAttribute('src')).endsWith(style.views[name.toLowerCase()]));
    await page.waitForFunction(()=>{const i=document.querySelector('#da-viewer-image');return i.complete&&i.naturalWidth>0;});
   }
   const pending=page.waitForEvent('download');await dialog.getByRole('link',{name:'Download Word sample',exact:true}).click();
   const download=await pending;const filename=`${destination}/${style.id}-${viewport.width}.docx`;await download.saveAs(filename);
   assert.equal(hash(await readFile(filename)),manifest.files[style.docx].sha256);
   const zip=await JSZip.loadAsync(await readFile(filename));
   assert.match(await zip.file('word/document.xml').async('string'),/Illustrative findings/);
   assert.match(await zip.file('word/footer1.xml').async('string'),/NUMPAGES/);
   assert.match(await zip.file('word/header1.xml').async('string'),/SAMPLE/);
   // Independently fetch every report and actual rendered image advertised by the viewer.
   for(const name of new Set([style.pdf,style.docx,...style.pages,...Object.values(style.views)])){
    const response=await context.request.get(base+'/da/gallery/assets/'+name);assert.equal(response.status(),200);
    const bytes=await response.body();assert.equal(hash(bytes),manifest.files[name].sha256);
    assert.equal(response.headers()['content-type'],manifest.files[name].content_type);
   }
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
   assert.equal(await card.getByRole('button',{name:'Inspect report',exact:true}).evaluate(el=>el===document.activeElement),true);
  }
  await page.locator('#da-report-gallery').screenshot({path:`${destination}/gallery-${viewport.width}.png`});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const style=manifest.styles[2];await page.locator(`[data-style="${style.id}"]`).getByRole('link',{name:'Use this style',exact:true}).first().click();
  await page.waitForURL('**/da/business/styles/'+style.id);
  await page.getByRole('heading',{name:style.title,exact:true}).waitFor();
  const originalImage=await page.locator('.da-style-sample img').getAttribute('src');
  await page.getByLabel('Cover title',{exact:true}).fill('Safety\u00a0review');
  await page.getByRole('button',{name:'Preview settings',exact:true}).click();
  assert.match(await page.locator('#da-design-error').textContent(),/ordinary spaces/);
  const oversized='Z'.repeat(140);await page.getByLabel('Company name',{exact:true}).fill(oversized);
  assert.equal((await page.getByLabel('Company name',{exact:true}).inputValue()).length,140);
  await page.getByLabel('Cover title',{exact:true}).fill('Illustrative design review');
  await page.getByRole('button',{name:'Preview settings',exact:true}).click();
  assert.match(await page.locator('#da-design-error').textContent(),/too long/);
  await page.getByLabel('Company name',{exact:true}).fill('Fictional Harbour Team');
  await page.getByLabel('Document reference',{exact:true}).fill('SAMPLE-LOCAL-002');
  await page.getByLabel('Revision',{exact:true}).fill('DRAFT-02');
  await page.getByRole('button',{name:'Preview settings',exact:true}).click();
  assert.match(await page.locator('#da-design-summary').textContent(),/Fictional Harbour Team/);
  assert.equal(await page.locator('.da-style-sample img').getAttribute('src'),originalImage);
  const exported=page.waitForEvent('download');await page.getByRole('button',{name:'Export settings JSON',exact:true}).click();
  const settingsDownload=await exported;const settingsPath=`${destination}/settings-${viewport.width}.json`;await settingsDownload.saveAs(settingsPath);
  const settings=JSON.parse(await readFile(settingsPath,'utf8'));
  assert.equal(settings.design.style_id,style.id);assert.equal(settings.branding.company_name,'Fictional Harbour Team');
  assert.equal(settings.design.reference,'SAMPLE-LOCAL-002');assert.equal(settings.design.palette.accent,style.accent.toUpperCase());
  assert.equal(settings.tier,undefined);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.evaluate(()=>localStorage.length),0);assert.deepEqual(await context.cookies(),[]);assert.deepEqual(errors,[]);
  console.log(`PASS gallery ${viewport.width}: 3 real reports, 9 pages, details, exact hashes, Business settings and export, no entitlement grant`);
  await context.close();
 }
}finally{await browser.close();}
