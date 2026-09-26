import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
function redirect(path) {
  for (const rule of config.redirects) {
    if (rule.has) continue;
    const pattern = '^' + rule.source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(':path\\*', '(.*)') + '$';
    const match = path.match(new RegExp(pattern));
    if (match) return { destination: rule.destination.replace(':path*', match[1] ?? ''), permanent: rule.permanent };
  }
  return null;
}
for (const [from, to] of [
  ['/meriden-compliance', 'https://www.meridencompliance.com/'],
  ['/meriden', 'https://www.meridencompliance.com/'],
  ['/meriden-compliance/insights', 'https://www.meridencompliance.com/insights'],
  ['/meriden-compliance/insights/maritime-ai/why-ai-policies-fail', 'https://www.meridencompliance.com/insights/maritime-ai/why-ai-policies-fail'],
  ['/meriden-compliance/insights/maritime-qhse/false-assurance-maritime-compliance/', 'https://www.meridencompliance.com/insights/maritime-qhse/false-assurance-maritime-compliance/'],
  ['/meriden-compliance/insights/human-factors', 'https://www.meridencompliance.com/insights'],
  ['/articles/false-assurance-maritime-compliance.html', 'https://www.meridencompliance.com/insights/maritime-qhse/false-assurance-maritime-compliance'],
  ['/meriden-qhse-hub/index.html', 'https://www.meridencompliance.com/insights/maritime-qhse'],
]) test(`permanently routes ${from} to Meriden`, () => assert.deepEqual(redirect(from), { destination: to, permanent: true }));

test('group brand page has store and article links without duplicate publication sitemap URLs', () => {
  const page = readFileSync('dist/architecture-v2/routes/platforms/meriden.html', 'utf8');
  assert.match(page, /https:\/\/www\.meridencompliance\.com\/shop/);
  assert.match(page, /https:\/\/www\.meridencompliance\.com\/insights/);
  assert.doesNotMatch(readFileSync('dist/sitemap.xml', 'utf8'), /<loc>[^<]*\/meriden-compliance(?:\/|<)/);
});
test('unrelated product and legal redirects are preserved', () => {
  assert.equal(redirect('/gatezero').destination, 'https://gate-zero.tech/');
  assert.equal(redirect('/aopdf/privacy/').destination, '/ao-pdf/privacy/');
  assert.equal(redirect('/platforms/meriden'), null);
});
