import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectionText } from '../lib/assurance/reporting';
import { ASSURANCE_SCHEMA_VERSION, type InspectionReport } from '../lib/assurance/types';

const report: InspectionReport = {
  schema: ASSURANCE_SCHEMA_VERSION, reportType: 'inspection', pageCount: 2,
  pdfVersion: '1.7', incrementalRevisionMarkers: 3,
  hasAcroForm: true, hasXfa: false, hasAttachments: true, hasJavaScript: false,
  metadataFields: [], pages: [], findings: [
    { kind: 'fact', code: 'FIXTURE_FACT', message: 'A fixture fact.' },
    { kind: 'warning', code: 'FIXTURE_WARNING', message: 'A fixture warning.' },
    { kind: 'limitation', code: 'FIXTURE_LIMITATION', message: 'A fixture limitation.' },
  ],
};

test('inspection text preserves factual fields, ordered finding classifications, disclaimer and final newline', () => {
  assert.equal(inspectionText(report), [
    'AO-PDF LOCAL INSPECTION REPORT', 'Pages: 2', 'PDF version: 1.7',
    'Incremental revision markers: 3', 'AcroForm: detected', 'XFA: not detected',
    'Attachments: detected', 'JavaScript: not detected', '', 'Findings:',
    '- [fact] FIXTURE_FACT: A fixture fact.',
    '- [warning] FIXTURE_WARNING: A fixture warning.',
    '- [limitation] FIXTURE_LIMITATION: A fixture limitation.', '',
    'Detected facts and warnings are not threat determinations.', '',
  ].join('\n'));
});

test('inspection text handles undetected version, empty findings and inverted detection flags', () => {
  const text = inspectionText({
    ...report, pdfVersion: null, findings: [], hasAcroForm: false,
    hasXfa: true, hasAttachments: false, hasJavaScript: true,
  });
  assert.match(text, /^PDF version: not detected$/m);
  assert.match(text, /^AcroForm: not detected$/m);
  assert.match(text, /^XFA: detected$/m);
  assert.match(text, /^Attachments: not detected$/m);
  assert.match(text, /^JavaScript: detected$/m);
  assert.match(text, /Findings:\n\nDetected facts and warnings are not threat determinations\.\n$/);
});
