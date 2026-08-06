import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

test('hardening matrix contains exactly 54 unique governed cases', () => {
  const matrix = readFileSync(
    join(process.cwd(), 'governance', 'hardening-matrix.md'),
    'utf8',
  );
  const cases = [...matrix.matchAll(/^\| (C\d{2}) \|/gm)].map((match) => match[1]);
  assert.equal(cases.length, 54);
  assert.equal(new Set(cases).size, 54);
  assert.equal(cases[0], 'C01');
  assert.equal(cases[cases.length - 1], 'C54');
});

test('source-versioned legal policies expose governed frontmatter', () => {
  for (const filename of ['privacy.md', 'terms.md', 'acceptable-use.md']) {
    const policy = readFileSync(join(process.cwd(), 'legal', filename), 'utf8');
    assert.match(policy, /^---\n/);
    assert.match(policy, /effectiveDate: "\d{4}-\d{2}-\d{2}"/);
    assert.match(policy, /revisionId: "[a-z0-9-]+"/);
    assert.match(policy, /reviewStatus: "operational-draft"/);
  }
});

test('deployed routes contain no legacy AO-PDF product naming', () => {
  const files = [
    'app/layout.tsx',
    'components/navbar.tsx',
    'components/footer.tsx',
    'lib/pdf-tools.ts',
  ];
  for (const filename of files) {
    const source = readFileSync(join(process.cwd(), filename), 'utf8');
    assert.doesNotMatch(source, /AxiomOrdoPDF|axiomordopdf/);
  }
});
