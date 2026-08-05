import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const templatePath = join(root, "public", "architecture-v2", "index.html");
const outputRoot = join(root, "public", "architecture-v2", "routes");
const sitemapRoot = join(root, "public", "sitemaps");
const siteOrigin = "https://www.axiomordo.com";

const groups = {
  platforms: {
    title: "Regulatory intelligence platforms",
    description: "AxiomOrdo platforms convert complex regulatory obligations into traceable decisions, structured evidence and operational action.",
  },
  solutions: {
    title: "Compliance decision support",
    description: "Find AxiomOrdo by the problem you need to solve rather than by product name.",
  },
  industries: {
    title: "Regulatory intelligence by industry",
    description: "AxiomOrdo applies the same authority, provenance and replay principles while respecting domain-specific law, standards and operating reality.",
  },
  resources: {
    title: "Regulatory resources and tools",
    description: "Briefings, tools and technical material are classified by source type, jurisdiction, effective date and last verification.",
  },
  company: {
    title: "About AxiomOrdo",
    description: "AxiomOrdo develops governed systems for authority mapping, evidence provenance, compliance decisions and operational assurance.",
  },
  trust: {
    title: "Trust, security and governance",
    description: "Trust claims are separated into specific, maintainable policies rather than bundled into general assurances.",
  },
  legal: {
    title: "Legal and policy information.",
    description: "Terms and policies governing access to AxiomOrdo websites, products and services.",
  },
};

const details = {
  "/platforms/meriden": {
    title: "Meriden maritime compliance",
    description: "Meriden supports audit readiness, management-system implementation and maritime AI governance with evidence designed for real operations.",
  },
  "/contact": {
    title: "Contact AxiomOrdo",
    description: "Use the relevant route so commercial, technical and partnership enquiries reach the correct workflow.",
  },
};

const legacyRoutes = {
  "/authors/phillip-inzaghi": {
    title: "Phillip Inzaghi author",
    description: "Phillip Inzaghi writes on maritime QHSE, regulatory intelligence, AI governance, evidence provenance and auditability.",
  },
  "/verilog": {
    title: "VeriLog audit evidence",
    description: "VeriLog structures SMS documentation into a defensible audit record before the external auditor arrives.",
  },
  "/emissary": {
    title: "Emissary CBAM evidence",
    description: "Emissary structures supplier emissions data and CBAM declaration evidence before reporting deadlines.",
  },
  "/sentinel": {
    title: "Sentinel EUDR due diligence",
    description: "Sentinel traces EUDR due-diligence evidence from products and suppliers to origin and geolocation records.",
  },
  "/carbonledger": {
    title: "CarbonLedger EU ETS position",
    description: "CarbonLedger tracks verified emissions, allowance position and surrender exposure across the EU ETS year.",
  },
  "/fuelpath": {
    title: "FuelPath FuelEU Maritime",
    description: "FuelPath calculates FuelEU Maritime GHG-intensity position, pooling options and penalty exposure.",
  },
  "/goldenthread": {
    title: "Golden Thread fire-safety evidence",
    description: "Golden Thread maintains fire-safety information, change records and evidence through the building lifecycle.",
  },
  "/clearmark": {
    title: "ClearMark PFAS evidence",
    description: "ClearMark classifies SKU-level PFAS evidence and identifies targeted testing, supplier or reformulation actions.",
  },
  "/meriden-compliance": {
    title: "Meriden Compliance",
    description: "Meriden Compliance provides structured maritime management-system, audit-readiness and operational assurance support.",
  },
  "/meriden-compliance/insights": {
    title: "Meriden Compliance insights",
    description: "Evidence-led maritime compliance insights covering QHSE, AI governance, assurance, investigations and competence.",
  },
  "/meriden-compliance/insights/maritime-ai": {
    title: "Maritime AI governance insights",
    description: "Maritime AI governance analysis for controlled use, verification, competence, document control and accountability.",
  },
  "/meriden-compliance/insights/maritime-ai/why-ai-policies-fail": {
    title: "Why maritime AI policies fail",
    description: "A practical analysis of why an AI policy alone does not control AI-supported work inside a maritime safety system.",
  },
  "/meriden-compliance/insights/risk-safety": {
    title: "Maritime risk and safety insights",
    description: "Practical analysis of risk control, operational safeguards and the difference between documented and working controls.",
  },
  "/meriden-compliance/insights/investigations": {
    title: "Maritime investigations insights",
    description: "Investigation analysis covering evidence, causation, corrective action, confidentiality and defensible reporting.",
  },
  "/meriden-compliance/insights/safety-management-systems": {
    title: "Safety management systems insights",
    description: "ISM and management-system guidance covering procedures, records, implementation, review and audit-ready evidence.",
  },
  "/meriden-compliance/insights/auditing-assurance": {
    title: "Maritime auditing and assurance",
    description: "Audit and assurance analysis focused on evidence trails, controlled implementation, reviewability and corrective action.",
  },
  "/meriden-compliance/insights/human-factors": {
    title: "Maritime human factors insights",
    description: "Analysis of competence, workload, communication, decision pressure and how people interact with formal controls.",
  },
  "/meriden-compliance/insights/leadership-accountability": {
    title: "Maritime leadership and accountability",
    description: "Analysis of ownership, review duties, operational accountability and management decisions in maritime compliance.",
  },
  "/meriden-compliance/insights/training-competence": {
    title: "Maritime training and competence",
    description: "Practical analysis of training quality, competence evidence, familiarisation, supervision and paper compliance limits.",
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
  if (legacyRoutes[route]) return legacyRoutes[route];
  if (details[route]) return details[route];
  const parts = route.split("/").filter(Boolean);
  const group = groups[parts[0]];
  if (group && parts.length === 1) return group;
  const name = pretty(parts.at(-1) || "AxiomOrdo");
  const sectionName = pretty(parts[0] || "AxiomOrdo");
  const section = sectionName.toLowerCase();
  return {
    title: parts.length > 1 ? `${name} | ${sectionName}` : name,
    description: `${name} is part of AxiomOrdo's ${section} architecture, with defined scope, evidence model, outputs and next action.`,
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

const routes = [...new Set([...sitemapRoutes(), ...explicitRoutes, ...Object.keys(legacyRoutes)])]
  .filter((route) => explicitRoutes.includes(route) || legacyRoutes[route] || Object.keys(groups).some((group) => route === `/${group}` || route.startsWith(`/${group}/`)) || route.startsWith("/meriden/"))
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
