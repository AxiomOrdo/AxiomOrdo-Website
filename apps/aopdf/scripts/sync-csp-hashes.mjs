import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const exportRoot = join(appRoot, 'out');
const configPath = resolve(appRoot, '..', '..', 'vercel.json');

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(target);
    return target.endsWith('.html') ? [target] : [];
  });
}

const hashes = new Set();
for (const filename of htmlFiles(exportRoot)) {
  const html = readFileSync(filename, 'utf8');
  for (const match of html.matchAll(
    /<script(?:\s[^>]*)?>([\s\S]*?)<\/script[^>]*>/gi,
  )) {
    if (!match[1]) continue;
    hashes.add(
      `'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`,
    );
  }
}

if (hashes.size === 0) {
  throw new Error('No static inline scripts were found for the AOPDF CSP.');
}

const source = readFileSync(configPath, 'utf8');
const config = JSON.parse(source);
const rule = config.headers?.find((candidate) => candidate.source === '/aopdf/(.*)');
const header = rule?.headers?.find(
  (candidate) => candidate.key === 'Content-Security-Policy',
);
if (!header) throw new Error('AOPDF CSP header is missing.');

const previousValue = header.value;
const nextValue = previousValue.replace(
  /script-src 'self'(?: 'sha256-[^']+')*;/,
  `script-src 'self' ${[...hashes].sort().join(' ')};`,
);
if (previousValue === nextValue) {
  console.log(`AOPDF CSP already contains ${hashes.size} synchronized hash.`);
  process.exit(0);
}

const previousJsonValue = JSON.stringify(previousValue);
const nextJsonValue = JSON.stringify(nextValue);
if (!source.includes(previousJsonValue)) {
  throw new Error('AOPDF CSP source value could not be located exactly.');
}
writeFileSync(
  configPath,
  source.replace(previousJsonValue, nextJsonValue),
  'utf8',
);

console.log(`Synchronized ${hashes.size} AOPDF CSP hash.`);
