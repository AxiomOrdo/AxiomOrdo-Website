import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const exportRoot = join(appRoot, 'out');
const vercelConfig = JSON.parse(
  readFileSync(resolve(appRoot, '..', '..', 'vercel.json'), 'utf8'),
);

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(target);
    return target.endsWith('.html') ? [target] : [];
  });
}

const generated = new Set();
for (const filename of htmlFiles(exportRoot)) {
  const html = readFileSync(filename, 'utf8');
  if (/<script(?:\s[^>]*)?>[\s\S]*?self\.__next_f\.push[\s\S]*?<\/script[^>]*>/i.test(html)) {
    throw new Error(`Inline Next.js flight payload remains in ${filename}.`);
  }
  const externalFlightSources = [
    ...html.matchAll(
      /<script[^>]+src=["'](\/ao-pdf\/_next\/static\/aopdf-flight\/[^"']+)["'][^>]*>/gi,
    ),
  ].map((match) => match[1]);
  if (externalFlightSources.length === 0) {
    throw new Error(`No external Next.js flight payloads found in ${filename}.`);
  }
  for (const source of externalFlightSources) {
    const asset = join(exportRoot, source.replace(/^\/ao-pdf\//, ''));
    if (!existsSync(asset)) {
      throw new Error(`External Next.js flight payload is missing: ${source}.`);
    }
  }
  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script[^>]*>/gi)) {
    if (!match[1]) continue;
    generated.add(
      `sha256-${createHash('sha256').update(match[1]).digest('base64')}`,
    );
  }
}

const csp = vercelConfig.headers
  ?.find((rule) => rule.source === '/ao-pdf/(.*)')
  ?.headers?.find((header) => header.key === 'Content-Security-Policy')
  ?.value;
if (typeof csp !== 'string') throw new Error('AO-PDF CSP header is missing.');
if (/script-src[^;]*(?:'unsafe-inline'|'unsafe-eval')/.test(csp)) {
  throw new Error('AO-PDF script-src contains a prohibited unsafe directive.');
}
for (const directive of [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' https://vercel.live",
  "connect-src 'self' https://vercel.live",
  "worker-src 'self' blob:",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "media-src 'none'",
  "manifest-src 'self'",
]) {
  if (!csp.includes(directive)) {
    throw new Error(`AO-PDF CSP is missing: ${directive}.`);
  }
}

const responseHeaders = new Map(
  vercelConfig.headers
    ?.find((rule) => rule.source === '/ao-pdf/(.*)')
    ?.headers?.map((header) => [header.key, header.value]),
);
for (const [key, value] of [
  ['X-Content-Type-Options', 'nosniff'],
  ['Referrer-Policy', 'no-referrer'],
  ['Cross-Origin-Opener-Policy', 'same-origin'],
  ['Cross-Origin-Resource-Policy', 'same-origin'],
  [
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  ],
]) {
  if (responseHeaders.get(key) !== value) {
    throw new Error(`AO-PDF response header mismatch: ${key}.`);
  }
}

const configured = new Set(
  [...csp.matchAll(/'sha256-([^']+)'/g)].map((match) => `sha256-${match[1]}`),
);
const missing = [...generated].filter((hash) => !configured.has(hash));
const stale = [...configured].filter((hash) => !generated.has(hash));
if (missing.length || stale.length) {
  throw new Error(
    `AO-PDF CSP hash drift: ${missing.length} missing, ${stale.length} stale.\n` +
      `Generated hashes:\n${[...generated].sort().map((hash) => `'${hash}'`).join(' ')}`,
  );
}

console.log(`AO-PDF CSP verified: ${generated.size} static inline script hashes.`);
