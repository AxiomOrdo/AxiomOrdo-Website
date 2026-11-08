import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { createServer } from 'node:http';
import test from 'node:test';
import playwright from '../apps/aopdf/node_modules/playwright/index.js';

const config = JSON.parse(readFileSync('vercel.json','utf8'));
const publicRoot = resolve('public');
const mime = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const fixture = createServer((req,res) => {
  try {
    const path = new URL(req.url,'http://fixture.invalid').pathname;
    const direct = resolve(publicRoot, `.${path}`);
    const directIndex = resolve(direct, 'index.html');
    const staticFile = existsSync(direct) && statSync(direct).isFile() ? direct
      : existsSync(directIndex) ? directIndex : undefined;
    let asset = path;
    for(const rule of staticFile ? [] : config.rewrites) {
      if(rule.source === path) { asset = rule.destination; break; }
      const token = rule.source.includes(':path*') ? ':path*' : rule.source.includes(':slug') ? ':slug' : null;
      if(!token) continue;
      const [prefix,suffix] = rule.source.split(token);
      if(path.startsWith(prefix) && path.endsWith(suffix)) {
        const segment = path.slice(prefix.length,suffix ? -suffix.length : undefined);
        if(token === ':slug' && segment.includes('/')) continue;
        asset = rule.destination.replace(token,segment); break;
      }
    }
    let file = path === '/' ? resolve('dist/index.html') : staticFile ?? resolve(publicRoot,`.${asset.startsWith('/ao-pdf/_next/') ? decodeURIComponent(asset) : asset}`);
    if(!file.startsWith(`${publicRoot}/`) && path !== '/') throw new Error('outside fixture');
    if(existsSync(file) && statSync(file).isDirectory()) file = resolve(file,'index.html');
    if(path.startsWith('/ao-pdf/')) for(const header of config.headers.find(r => r.source === '/ao-pdf/(.*)').headers) res.setHeader(header.key,header.value);
    res.setHeader('Content-Type',mime[extname(file)] ?? 'application/octet-stream');
    res.end(readFileSync(file));
  } catch { res.writeHead(404);res.end('Not found'); }
});

test('breadcrumbs remain visible, keyboard accessible and stable with hydration or JavaScript disabled', async () => {
  await new Promise(r => fixture.listen(0,'127.0.0.1',r));
  const origin = `http://127.0.0.1:${fixture.address().port}`;
  const browser = await playwright.chromium.launch();
  const paths = ['/meriden/resources','/platforms/meriden','/company/about','/legal/ico-registration/','/ards','/meriden/psc-checklist','/meriden-compliance/insights/maritime-qhse/false-assurance-maritime-compliance','/ao-pdf/','/ao-pdf/tools/merge/','/ao-pdf/limits/','/ao-pdf/privacy/'];
  try {
    for(const javaScriptEnabled of [false,true]) for(const width of [360,1280]) {
      const context = await browser.newContext({javaScriptEnabled,viewport:{width,height:900}});
      await context.route('**/*',r => new URL(r.request().url()).origin === origin ? r.continue() : r.abort());
      const page = await context.newPage();
      for(const path of paths.filter(p => !process.env.BREADCRUMB_DEBUG_PATH || p === process.env.BREADCRUMB_DEBUG_PATH)) {
        const errors=[];
        const listener = error => errors.push(error.message);
        page.on('pageerror',listener);
        const response = await page.goto(origin+path,{waitUntil:'networkidle'});
        assert.equal(response.status(),200,path);
        const nav = page.getByRole('navigation',{name:'Breadcrumb',exact:true});
        try { await nav.waitFor({state:'visible',timeout:5000}); } catch(error) { throw new Error(`${path}, width=${width}, JavaScript=${javaScriptEnabled}: ${error.message}; exceptions=${JSON.stringify(errors)}; ${await page.locator('body').textContent().then(s => s.slice(0,160))}`); }
        const before = await nav.textContent();
        await page.waitForTimeout(100);
        assert.equal(await nav.textContent(),before,`${path}: hydration stability`);
        assert.equal(await page.getByRole('navigation',{name:'Breadcrumb',exact:true}).count(),1);
        assert.ok(await page.evaluate(() => {
          const nav=document.querySelector('nav[aria-label="Breadcrumb"]');
          const rect=nav.getBoundingClientRect();
          return rect.left >= 0 && rect.right <= innerWidth && nav.scrollWidth <= nav.clientWidth;
        }),`${path}: fits ${width}px`);
        await nav.locator('a').first().focus();
        assert.equal(await page.locator(':focus').getAttribute('href'),'/');
        assert.equal(await nav.locator('a[aria-current="page"]').count(),0);
        assert.deepEqual(errors,[],`${path}: browser exceptions`);
        page.off('pageerror',listener);
      }
      await page.goto(origin+'/',{waitUntil:'networkidle'});
      assert.equal(await page.getByRole('navigation',{name:'Breadcrumb',exact:true}).count(),0);
      await context.close();
    }
  } finally { await browser.close();await new Promise(r => fixture.close(r)); }
});
