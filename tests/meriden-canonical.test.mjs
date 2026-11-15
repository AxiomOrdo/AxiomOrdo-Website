import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
const source = readFileSync(new URL('../src/App.tsx', import.meta.url),'utf8');
const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url),'utf8'));
test('legacy Meriden sales routes go to canonical site without intercepting insights',()=>{
 for(const path of ['/meriden-compliance','/meriden-compliance/']) {
  assert.ok(config.redirects.some(r=>r.source===path && r.destination==='https://www.meridencompliance.com/'));
 }
 assert.ok(!config.redirects.some(r=>r.source.startsWith('/meriden-compliance/:')));
});
test('Meriden component has no obsolete subscriptions or fabricated platform claims',()=>{
 const page=source.slice(source.indexOf('function MeridenPage()'),source.indexOf('function ARDSPage()'));
 assert.ok(page.includes('https://www.meridencompliance.com/'));
 for(const text of ['£149','£349','Start Free Trial','Unlimited vessels','API access','SLA included']) assert.ok(!page.includes(text),text);
 const brand=source.slice(source.indexOf('key: "meriden"'),source.indexOf('const unreleasedBrandKeys'));
 assert.ok(!brand.includes('Fleet overview'));
 assert.ok(brand.includes('AI governance'));
});
