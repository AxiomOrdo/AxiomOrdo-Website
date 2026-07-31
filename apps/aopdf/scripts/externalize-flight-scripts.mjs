import { createHash } from 'node:crypto';
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const exportRoot = join(appRoot, 'out');
const scriptRoot = join(exportRoot, '_next', 'static', 'aopdf-flight');

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = join(directory, entry.name);
    if (entry.isDirectory()) return htmlFiles(target);
    return target.endsWith('.html') ? [target] : [];
  });
}

mkdirSync(scriptRoot, { recursive: true });

let externalizedCount = 0;
for (const filename of htmlFiles(exportRoot)) {
  const html = readFileSync(filename, 'utf8');
  const externalized = html.replace(
    /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi,
    (tag, attributes = '', body = '') => {
      if (!body.includes('self.__next_f.push')) return tag;

      const digest = createHash('sha256').update(body).digest('hex');
      const assetName = `${digest}.js`;
      writeFileSync(join(scriptRoot, assetName), body, 'utf8');
      externalizedCount += 1;
      return `<script${attributes} src="/aopdf/_next/static/aopdf-flight/${assetName}.js"></script>`;
    },
  );
  writeFileSync(filename, externalized, 'utf8');
}

if (externalizedCount === 0) {
  throw new Error('No Next.js flight payloads were externalized.');
}

console.log(
  `Externalized ${externalizedCount} Next.js flight payloads under ${relative(appRoot, scriptRoot)}.`,
);
