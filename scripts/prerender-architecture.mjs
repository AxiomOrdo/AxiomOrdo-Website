import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const templatePath = join(root, "public", "architecture-v2", "index.html");
const outputRoot = join(root, "public", "architecture-v2", "routes");
const sitemapRoot = join(root, "public", "sitemaps");
const siteOrigin = "https://www.axiomordo.com";

const groups = {
  platforms: {
    title: "Regulatory intelligence built around evidence, not assertions.",
    description: "AxiomOrdo platforms convert complex regulatory obligations into traceable decisions, structured evidence and operational action.",
  },
  solutions: {
    title: "Compliance decisions that can be explained, tested and replayed.",
    description: "Find AxiomOrdo by the problem you need to solve rather than by product name.",
  },
  industries: {
    title: "One evidence discipline across multiple regulated sectors.",
    description: "AxiomOrdo applies the same authority, provenance and replay principles while respecting domain-specific law, standards and operating reality.",
  },
  resources: {
    title: "Regulatory material with visible authority and verification status.",
    description: "Briefings, tools and technical material are classified by source type, jurisdiction, effective date and last verification.",
  },
  company: {
    title: "A regulatory intelligence group built around verifiable authority.",
    description: "AxiomOrdo develops governed systems for authority mapping, evidence provenance, compliance decisions and operational assurance.",
  },
  trust: {
    title: "Controls for security, data handling and accountable AI use.",
    description: "Trust claims are separated into specific, maintainable policies rather than bundled into general assurances.",
  },
  legal: {
    title: "Legal and policy information.",
    description: "Terms and policies governing access to AxiomOrdo websites, products and services.",
  },
};

const details = {
  "/platforms/meriden": {
    title: "Maritime compliance that survives operational scrutiny.",
    description: "Meriden supports audit readiness, management-system implementation and maritime AI governance with evidence designed for real operations.",
  },
  "/contact": {
    title: "Discuss a regulatory, evidence or implementation requirement.",
    description: "Use the relevant route so commercial, technical and partnership enquiries reach the correct workflow.",
  },
};

const explicitRoutes = [
  "/contact",
  "/platforms/meriden",
  "/meriden/ards-founding-panel",
  "/meriden/resources",
  "/meriden/psc-readiness",
  "/meriden/ai-governance",
  "/meriden/management-systems",
];

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function pretty(value) {
  return value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function routeMetadata(route) {
  if (details[route]) return details[route];
  const parts = route.split("/").filter(Boolean);
  const group = groups[parts[0]];
  if (group && parts.length === 1) return group;
  const name = pretty(parts.at(-1) || "AxiomOrdo");
  const section = pretty(parts[0] || "AxiomOrdo").toLowerCase();
  return {
    title: name,
    description: `${name} is part of AxiomOrdo's ${section} architecture. This route is established for governed content, evidence model, outputs and next action.`,
  };
}

function sitemapRoutes() {
  const routes = [];
  for (const file of readdirSync(sitemapRoot).filter((name) => name.endsWith(".xml")).sort()) {
    const xml = readFileSync(join(sitemapRoot, file), "utf8");
    for (const match of xml.matchAll(/<loc>https?:\/\/[^<]+<\/loc>/g)) {
      routes.push(match[0].replace(/^<loc>https?:\/\/[^/]+/, "").replace(/<\/loc>$/, "") || "/");
    }
  }
  return routes;
}

const routes = [...new Set([...sitemapRoutes(), ...explicitRoutes])]
  .filter((route) => explicitRoutes.includes(route) || Object.keys(groups).some((group) => route === `/${group}` || route.startsWith(`/${group}/`)) || route.startsWith("/meriden/"))
  .filter((route) => route !== "/")
  .sort();

const template = readFileSync(templatePath, "utf8");
rmSync(outputRoot, { recursive: true, force: true });

for (const route of routes) {
  const metadata = routeMetadata(route);
  const title = `${metadata.title} | AxiomOrdo`;
  const canonical = `${siteOrigin}${route}`;
  const outputPath = join(outputRoot, `${route.slice(1)}.html`);
  mkdirSync(join(outputRoot, route.slice(1, route.lastIndexOf("/"))), { recursive: true });
  const page = template
    .replace(/\n  <meta name="description"[^>]*\/>/, `\n  <meta name="description" content="${escapeHtml(metadata.description)}" />\n  <title>${escapeHtml(title)}</title>\n  <link rel="canonical" href="${escapeHtml(canonical)}" />`)
    .replace('<h1 id="title"></h1>', `<h1 id="title">${escapeHtml(metadata.title)}</h1>`)
    .replace('<p class="lede" id="lede"></p>', `<p class="lede" id="lede">${escapeHtml(metadata.description)}</p>`);
  writeFileSync(outputPath, page);
}

console.log(`prerender-architecture: generated ${routes.length} deterministic route pages`);
