import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import playwright from '../apps/aopdf/node_modules/playwright/index.js';

const config = JSON.parse(readFileSync('vercel.json','utf8'));
const walk = dir => readdirSync(dir,{withFileTypes:true}).sort((a,b) => a.name.localeCompare(b.name)).flatMap(e => e.isDirectory() ? walk(join(dir,e.name)) : e.name.endsWith('.html') ? [join(dir,e.name)] : []);
function resolveRoute(path) {
  for(const rule of config.rewrites) {
    if(rule.source === path) return `public${rule.destination}`;
    for(const token of [':path*',':slug']) {
      if(!rule.source.includes(token)) continue;
      const [prefix,suffix] = rule.source.split(token);
      if(path.startsWith(prefix) && path.endsWith(suffix)) {
        const segment = path.slice(prefix.length,suffix ? -suffix.length : undefined);
        if(token === ':slug' && segment.includes('/')) continue;
        return `public${rule.destination.replace(token,segment)}`;
      }
    }
  }
  return `public${path.endsWith('/') ? `${path}index.html` : path}`;
}
const candidates = new Set([
  ...walk('public/architecture-v2/routes'),
  ...walk('public/ao-pdf'),
  ...config.rewrites.filter(r => !r.source.includes(':')).map(r => `public${r.destination}`),
]);

test('every public rendered inner page has one matching initial-HTML breadcrumb trail', async t => {
  const browser = await playwright.chromium.launch({headless:true});
  const context = await browser.newContext({javaScriptEnabled:false});
  await context.route('**/*',r => r.abort());
  const page = await context.newPage();
  let checked = 0;
  try {
    for(const file of [...candidates].sort()) {
      const html = readFileSync(file,'utf8');
      await page.setContent(html,{waitUntil:'domcontentloaded'});
      const result = await page.evaluate(() => {
        const find = value => Array.isArray(value) ? value.flatMap(find) : value && typeof value === 'object' ? [...(value['@type'] === 'BreadcrumbList' ? [value] : []), ...find(value['@graph'])] : [];
        return {
          canonical:document.querySelector('link[rel="canonical"]')?.href,
          noindex:document.querySelector('meta[name="robots"]')?.content.includes('noindex'),
          schemas:[...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(n => find(JSON.parse(n.textContent))),
          navs:[...document.querySelectorAll('nav[aria-label="Breadcrumb"]')].map(nav => ({
            ordered:!!nav.querySelector('ol'),
            items:[...nav.querySelectorAll('li')].map(li => ({name:li.textContent.replace(/›/g,'').trim(),href:li.querySelector('a')?.getAttribute('href'),current:!!li.querySelector('[aria-current="page"]')})),
          })),
        };
      });
      if(result.noindex || /(?:^|\/)404(?:\/|\.)/.test(file)) { assert.equal(result.schemas.length,0,file); assert.equal(result.navs.length,0,file); continue; }
      assert.ok(result.canonical, `${file}: public page canonical`);
      const path = new URL(result.canonical).pathname;
      // Only route destinations served by this website; exclude internal template copies.
      if(resolveRoute(path) !== file) continue;
      if(path === '/') { assert.equal(result.schemas.length,0); assert.equal(result.navs.length,0); continue; }
      checked++;
      assert.equal(result.schemas.length,1,`${path}: one BreadcrumbList`);
      assert.equal(result.navs.length,1,`${path}: one navigation`);
      const nav = result.navs[0], items = result.schemas[0].itemListElement;
      assert.ok(nav.ordered); assert.ok(items.length >= 2); assert.equal(items.length,nav.items.length);
      items.forEach((item,i) => {
        assert.equal(item['@type'],'ListItem'); assert.equal(item.position,i+1);
        assert.equal(item.name,nav.items[i].name,`${path}: matching label`);
        assert.equal(new URL(item.item).origin,'https://www.axiomordo.com');
        assert.ok(new URL(item.item).pathname === '/' || existsSync(resolveRoute(new URL(item.item).pathname)),`${path}: ancestor ${item.item}`);
        if(i < items.length-1) assert.equal(new URL(nav.items[i].href,result.canonical).href,item.item);
        else { assert.equal(nav.items[i].href,undefined); assert.ok(nav.items[i].current); assert.equal(item.item,result.canonical); }
      });
      assert.equal(items[0].name,'Home'); assert.equal(items[0].item,'https://www.axiomordo.com/');
    }
    assert.ok(checked > 50,`checked ${checked} public routes`);
    t.diagnostic(`Verified ${checked} public inner pages from deployment routes.`);
  } finally { await browser.close(); }
});
