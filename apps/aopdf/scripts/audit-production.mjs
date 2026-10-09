import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const acceptedStaticExportAdvisories = new Set([
  'https://github.com/advisories/GHSA-ggr8-5vv4-36mx',
  'https://github.com/advisories/GHSA-2v37-7h3g-55p8',
  'https://github.com/advisories/GHSA-vcvr-r3jv-pc5j',
  'https://github.com/advisories/GHSA-cjq9-62q9-8jv4',
  'https://github.com/advisories/GHSA-rgj7-g3m4-5g8c',
  'https://github.com/advisories/GHSA-wq5f-xc86-pv6w',
  'https://github.com/advisories/GHSA-68fv-2mgg-jv7q',
]);

const nextConfig = readFileSync(resolve('next.config.js'), 'utf8');
if (!/output:\s*['"]export['"]/.test(nextConfig)) {
  throw new Error('Next.js advisory exception requires output: export.');
}

const audit = spawnSync('npm', ['audit', '--omit=dev', '--json'], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
});
if (audit.error) throw audit.error;

let report;
try {
  report = JSON.parse(audit.stdout);
} catch {
  throw new Error(`npm audit did not return JSON: ${audit.stderr || audit.stdout}`);
}

const blocked = [];
const accepted = [];
for (const [name, vulnerability] of Object.entries(report.vulnerabilities ?? {})) {
  const advisories = (vulnerability.via ?? []).filter(
    (item) => typeof item === 'object' && ['high', 'critical'].includes(item.severity),
  );
  for (const advisory of advisories) {
    const record = { name, severity: advisory.severity, url: advisory.url };
    if (acceptedStaticExportAdvisories.has(advisory.url)) {
      accepted.push(record);
    } else {
      blocked.push(record);
    }
  }
}

if (blocked.length > 0) {
  for (const item of blocked) {
    console.error(`BLOCKED ${item.severity} ${item.name}: ${item.url}`);
  }
  process.exit(1);
}

console.log(`AO-PDF production audit passed with ${accepted.length} documented static-export exceptions.`);
