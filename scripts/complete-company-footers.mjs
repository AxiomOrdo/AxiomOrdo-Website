import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const company = JSON.parse(readFileSync(join(repositoryRoot, 'src/lib/corporate-notices.json'), 'utf8')).company;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

// Ignore script, style and comment contents: strings in a bundle are not visible footers.
function protectEmbeddedContent(html) {
  const embedded = [];
  const masked = html.replace(/<!--[^]*?-->|<(script|style)\b[^>]*>[^]*?<\/\1\s*>/gi, (content) => {
    embedded.push(content);
    return `\u0000COMPANY_EMBED_${embedded.length - 1}\u0000`;
  });
  return { masked, restore: (value) => value.replace(/\u0000COMPANY_EMBED_(\d+)\u0000/g, (_, index) => embedded[Number(index)]) };
}

export function hasCompleteCompanyFooter(html) {
  const { masked } = protectEmbeddedContent(html);
  const footers = masked.match(/<footer\b[^>]*>[^]*?<\/footer\s*>/gi) ?? [];
  return footers.some((footer) => [company.legalName, company.companyNumber, company.jurisdiction, company.registeredOffice, company.contactEmail, company.companyRegisterUrl].every((value) => footer.includes(escapeHtml(value))));
}

export function completeCompanyFooter(html, outputPath) {
  const normalizedPath = outputPath.replaceAll('\\', '/');
  // Next's source footer must match its hydration tree; the root SPA owns its fallback.
  if (normalizedPath === 'index.html' || normalizedPath.startsWith('ao-pdf/')) return html;
  if (hasCompleteCompanyFooter(html)) return html;
  const { masked, restore } = protectEmbeddedContent(html);
  const existingFooter = masked.match(/<footer\b[^>]*>[^]*?<\/footer\s*>/i)?.[0] ?? '';
  const missing = (value) => !existingFooter.includes(escapeHtml(value));
  const parts = [];
  if (missing(company.legalName)) parts.push(`<p>${escapeHtml(company.legalName)}</p>`);
  if (missing(company.jurisdiction)) parts.push(`<p>Registered in ${escapeHtml(company.jurisdiction)}</p>`);
  if (missing(company.companyNumber)) parts.push(`<p>Company number <a href="${escapeHtml(company.companyRegisterUrl)}">${escapeHtml(company.companyNumber)}</a></p>`);
  else if (missing(company.companyRegisterUrl)) parts.push(`<p><a href="${escapeHtml(company.companyRegisterUrl)}">Companies House record</a></p>`);
  if (missing(company.registeredOffice)) parts.push(`<p>Registered office: ${escapeHtml(company.registeredOffice)}</p>`);
  if (missing(company.contactEmail)) parts.push(`<p>Contact: <a href="mailto:${escapeHtml(company.contactEmail)}">${escapeHtml(company.contactEmail)}</a></p>`);
  const identifiers = `<div data-company-identifiers="true">${parts.join('')}</div>`;
  // Only complete trusted build HTML; never append outside the document on malformed input.
  if (/<\/footer\s*>/i.test(masked)) return restore(masked.replace(/<\/footer\s*>/i, `${identifiers}</footer>`));
  if (/<\/body\s*>/i.test(masked)) return restore(masked.replace(/<\/body\s*>/i, `<footer aria-label="Company information">${identifiers}</footer></body>`));
  throw new Error(`Missing closing body for company footer: ${outputPath}`);
}

export function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en')).flatMap((entry) => {
    const file = join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.isFile() && /\.html$/i.test(entry.name) ? [file] : [];
  });
}

export function completeCompanyFooters(outputRoot = join(repositoryRoot, 'dist')) {
  let changed = 0;
  const files = htmlFiles(outputRoot);
  for (const file of files) {
    const before = readFileSync(file, 'utf8');
    const after = completeCompanyFooter(before, relative(outputRoot, file));
    if (after !== before) { writeFileSync(file, after); changed += 1; }
  }
  return { scanned: files.length, changed };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(completeCompanyFooters()));
}
