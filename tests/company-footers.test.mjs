import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { company, completeCompanyFooter, completeCompanyFooters, hasCompleteCompanyFooter, htmlFiles } from '../scripts/complete-company-footers.mjs';

const document = '<!doctype html><html><body><main>Article</main></body></html>';
test('adds semantic company identifiers without styles or scripts', () => {
  const output = completeCompanyFooter(document, 'articles/example.html');
  assert.ok(hasCompleteCompanyFooter(output));
  assert.match(output, /<footer aria-label="Company information">/);
  assert.doesNotMatch(output, /<script|style=|VAT/i);
});
test('augments a partial footer, preserving product links and existing identifiers', () => {
  const input = `<body><footer>© ${company.legalName} · ${company.companyNumber}<a href="/privacy/">Product privacy</a></footer></body>`;
  const output = completeCompanyFooter(input, 'meriden/index.html');
  assert.ok(hasCompleteCompanyFooter(output));
  assert.equal(output.split(company.legalName).length - 1, 1);
  // The existing number and the new registry URL each contain the company number.
  assert.equal(output.split(company.companyNumber).length - 1, 2);
  assert.match(output, /href="\/privacy\/">Product privacy/);
  assert.equal(completeCompanyFooter(output, 'meriden/index.html'), output);
});
test('does not treat founder body details as a complete footer', () => {
  const input = `<body><main>${company.companyNumber} ${company.registeredOffice}</main><footer>Links</footer></body>`;
  assert.ok(hasCompleteCompanyFooter(completeCompanyFooter(input, 'company/founder.html')));
});
test('preserves embedded scripts, comments, CSP and frames byte for byte', () => {
  const embed = `<script>const sample = '</footer></body>';</script><!-- </footer> --><iframe src="https://external.example/"></iframe>`;
  const input = `<html><head><meta http-equiv="Content-Security-Policy" content="script-src 'none'; style-src 'none'"></head><BODY>${embed}</BODY></html>`;
  const output = completeCompanyFooter(input, 'ards-gateway/index.html');
  assert.ok(output.includes(embed));
  assert.ok(output.includes("content=\"script-src 'none'; style-src 'none'\""));
  assert.ok(hasCompleteCompanyFooter(output));
  assert.equal(completeCompanyFooter(output, 'ards-gateway/index.html'), output);
});
test('preserves Next hydration HTML and root SPA fallback', () => {
  for (const path of ['ao-pdf/index.html', 'ao-pdf/privacy/index.html', 'ao-pdf\\404\\index.html', 'index.html']) {
    assert.equal(completeCompanyFooter(document, path), document);
  }
  const source = readFileSync(new URL('../apps/aopdf/components/footer.tsx', import.meta.url), 'utf8');
  for (const field of ['legalName', 'companyNumber', 'jurisdiction', 'registeredOffice', 'contactEmail', 'companyRegisterUrl']) assert.ok(source.includes(`corporate.company.${field}`));
  for (const link of ['/privacy', '/terms', '/acceptable-use']) assert.ok(source.includes(`href="${link}"`));
});
test('audits every generated HTML file, leaving external iframe content outside scope', () => {
  const root = mkdtempSync(join(tmpdir(), 'company-footers-'));
  try {
    const pages = ['articles/a.html', 'ards-gateway/index.html', 'meriden/index.html', 'legal/ico-registration/index.html'];
    for (const path of pages) {
      const file = join(root, path);
      mkdirSync(join(file, '..'), { recursive: true });
      writeFileSync(file, document);
    }
    assert.deepEqual(completeCompanyFooters(root), { scanned: pages.length, changed: pages.length });
    assert.equal(completeCompanyFooters(root).changed, 0);
    for (const file of htmlFiles(root)) assert.ok(hasCompleteCompanyFooter(readFileSync(file, 'utf8')), file);
  } finally { rmSync(root, { recursive: true }); }
});
test('fails closed for malformed standalone build HTML', () => {
  assert.throws(() => completeCompanyFooter('<html><main>Unclosed', 'broken.html'), /Missing closing body/);
});
test('AO-PDF error pages mount shared footer with Next basePath-aware links', () => {
  const source = readFileSync(new URL('../apps/aopdf/app/not-found.tsx', import.meta.url), 'utf8');
  assert.match(source, /import Footer from '@\/components\/footer'/);
  assert.match(source, /<Footer\s*\/>/);
  assert.match(source, /<Link href="\/"/);
  assert.match(source, /<Link href="\/tools"/);
  assert.doesNotMatch(source, /href="\/ao-pdf/);
});
test('ICO registration and ARDS source pages receive visible, idempotent output footers', () => {
  for (const path of ['legal/ico-registration/index.html', 'ards-gateway/index.html']) {
    const source = readFileSync(new URL(`../public/${path}`, import.meta.url), 'utf8');
    const output = completeCompanyFooter(source, path);
    assert.ok(hasCompleteCompanyFooter(output), path);
    assert.match(output, /<body\b[^>]*>[^]*<footer\b[^>]*>[^]*<\/footer>[^]*<\/body>/i);
    assert.equal((source.match(/<script\b/gi) ?? []).length, (output.match(/<script\b/gi) ?? []).length);
    assert.equal(completeCompanyFooter(output, path), output);
  }
});
