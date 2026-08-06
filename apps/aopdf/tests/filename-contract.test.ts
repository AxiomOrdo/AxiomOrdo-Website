import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canonicalOutputFilename,
  sanitizeSourceBasename,
} from '../governance/filename-contract';

test('source basenames remove illegal characters, cap length and fall back', () => {
  assert.equal(sanitizeSourceBasename('  bad<>:"/\\|?* name.pdf'), 'bad-name');
  assert.equal(sanitizeSourceBasename('...pdf'), 'document');
  assert.equal(sanitizeSourceBasename('   .pdf'), 'document');
  assert.equal(sanitizeSourceBasename(`${'a'.repeat(100)}.pdf`).length, 80);
});

test('canonical filenames follow the governed operation contract', () => {
  assert.equal(
    canonicalOutputFilename({
      tool: 'merge',
      fileCount: 3,
      outputPageCount: 7,
    }),
    'ao-pdf-merged-3-files.pdf',
  );
  assert.equal(
    canonicalOutputFilename({
      tool: 'split',
      sourceName: 'report.pdf',
      fileCount: 1,
      outputPageCount: 3,
      canonicalRange: '1-3',
    }),
    'report-ao-pdf-pages-1-3.pdf',
  );
  assert.equal(
    canonicalOutputFilename({
      tool: 'split',
      sourceName: 'report.pdf',
      fileCount: 1,
      outputPageCount: 10,
      splitEveryPage: true,
    }),
    'report-ao-pdf-split-10-pages.zip',
  );
  assert.equal(
    canonicalOutputFilename({
      tool: 'images-to-pdf',
      fileCount: 4,
      outputPageCount: 4,
    }),
    'ao-pdf-images-4.pdf',
  );
});
