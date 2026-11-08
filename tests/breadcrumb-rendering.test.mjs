import assert from 'node:assert/strict';
import test from 'node:test';
import playwright from '../apps/aopdf/node_modules/playwright/index.js';
import { breadcrumbMarkup, breadcrumbStyle } from '../scripts/breadcrumbs.mjs';

test('authored labels and URLs are escaped without losing text or JSON identity', async () => {
  const name = 'A very long maritime title: "QHSE" & <script>window.attacked=true</script> 日本語';
  const items = [{name:'Home',path:'/'},{name,path:'/resources/research?title=%22%3Cscript%3E'}];
  const markup = breadcrumbMarkup(items);
  assert.equal(markup.match(/<script\b/g).length,1);
  assert.ok(markup.includes('\\u003cscript>'));
  const browser = await playwright.chromium.launch();
  try {
    const page = await browser.newPage({viewport:{width:360,height:800}});
    await page.setContent(breadcrumbStyle+markup);
    assert.equal(await page.locator('[aria-current="page"]').textContent(),name);
    assert.equal(await page.evaluate(() => window.attacked),undefined);
    const schema = await page.locator('script').textContent().then(JSON.parse);
    assert.equal(schema.itemListElement[1].name,name);
    assert.equal(schema.itemListElement[1].item,'https://www.axiomordo.com/resources/research?title=%22%3Cscript%3E');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.keyboard.press('Tab');
    assert.equal(await page.locator(':focus').getAttribute('href'),'/');
  } finally { await browser.close(); }
});
