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

const groupContent = {
  platforms: {
    section: "Platform portfolio",
    intro: "Each platform has a defined regulatory domain, user, evidence model and decision output.",
    cards: [
      ["Meriden", "Maritime compliance, audit readiness and management-system transition.", "/platforms/meriden"],
      ["Sentinel", "EUDR due-diligence evidence traced from product to plot.", "/sentinel"],
      ["ClearMark", "SKU-level PFAS exposure and evidence classification.", "/clearmark"],
      ["VeriLog", "Structured audit evidence before the external auditor arrives.", "/verilog"],
      ["Emissary", "CBAM embedded-carbon evidence and declaration preparation.", "/emissary"],
      ["CarbonLedger", "EU ETS position, allowance exposure and surrender preparation.", "/carbonledger"],
      ["FuelPath", "FuelEU Maritime GHG-intensity position and penalty exposure.", "/fuelpath"],
      ["Golden Thread", "Building and fire-safety evidence maintained through the asset lifecycle.", "/goldenthread"],
    ],
  },
  solutions: {
    section: "Solution areas",
    intro: "Every solution retains the authority source, interpretation, evidence and decision path.",
    cards: [
      ["Regulatory intelligence", "Convert authoritative sources into current, usable obligations.", "/solutions/regulatory-intelligence"],
      ["Authority mapping", "Link legal and regulatory text to discrete requirement units.", "/solutions/authority-mapping"],
      ["Compliance decision support", "Turn requirements and evidence into bounded operational decisions.", "/solutions/compliance-decision-support"],
      ["Evidence and provenance", "Preserve the source trail behind every conclusion.", "/solutions/evidence-provenance"],
      ["Audit and assurance", "Expose evidence gaps before they become findings.", "/solutions/audit-assurance"],
      ["Management-system implementation", "Move from policy intent to controlled implementation evidence.", "/solutions/management-system-implementation"],
      ["Regulatory data interoperability", "Exchange regulatory records through governed, machine-readable structures.", "/solutions/regulatory-data-interoperability"],
    ],
  },
  industries: {
    section: "Industries",
    intro: "Industry pages connect regulatory problems to platforms, ARDS domain packs and implementation routes.",
    cards: [
      ["Maritime", "ISM, PSC, FuelEU, EU ETS, management systems and operational assurance.", "/industries/maritime"],
      ["Chemicals and manufacturing", "PFAS, supplier evidence and market-access decisions.", "/industries/chemicals-manufacturing"],
      ["Consumer products", "SKU-level evidence, declarations and retailer requests.", "/industries/consumer-products"],
      ["Food and agriculture", "EUDR origin, geolocation and due-diligence evidence.", "/industries/food-agriculture"],
      ["Timber and furniture", "EUDR product-to-plot traceability and DDS preparation.", "/industries/timber-furniture"],
      ["Energy and emissions", "CBAM, ETS and verified emissions evidence.", "/industries/energy-emissions"],
      ["Fire and building safety", "Golden-thread records and controlled safety information.", "/industries/fire-building-safety"],
    ],
  },
  resources: {
    section: "Resource library",
    intro: "Public material clearly separates binding authority from guidance, standards, recommendations and AxiomOrdo interpretation.",
    cards: [
      ["Regulatory insights", "Evidence-led analysis of current regulatory developments.", "/resources/insights"],
      ["Regulatory briefings", "Focused summaries with source and effective-date controls.", "/resources/regulatory-briefings"],
      ["Tools and checklists", "Operational aids linked to their underlying requirements.", "/resources/tools"],
      ["Guides", "Implementation guidance with scope and limitations stated.", "/resources/guides"],
      ["Research", "Methods, evaluations and supporting analysis.", "/resources/research"],
      ["Case studies", "Application evidence and bounded outcomes.", "/resources/case-studies"],
      ["Technical documentation", "Schemas, interfaces and implementation references.", "/resources/documentation"],
      ["Glossary", "Controlled definitions across regulatory domains.", "/resources/glossary"],
    ],
  },
  company: {
    section: "Company and governance",
    intro: "These pages explain who AxiomOrdo is, how its work is controlled and how users can assess trust.",
    cards: [
      ["About AxiomOrdo", "Purpose, operating model and platform portfolio.", "/company/about"],
      ["Methodology", "How sources become requirements, evidence maps and decisions.", "/company/methodology"],
      ["Authority and evidence policy", "Rules for source hierarchy, qualification and interpretation.", "/company/authority-policy"],
      ["Governance", "Change control, review responsibilities and decision ownership.", "/company/governance"],
      ["Partners", "Technology, domain and implementation relationships.", "/company/partners"],
      ["Trust centre", "Security, data handling and responsible disclosure.", "/trust"],
    ],
  },
  trust: {
    section: "Trust documentation",
    intro: "Security and governance material is versioned and updated as capabilities mature.",
    cards: [
      ["Security", "Security controls, scope and reporting channels.", "/trust/security"],
      ["Privacy", "Personal-data handling and user rights.", "/legal/privacy"],
      ["Data handling", "Evidence storage, access, retention and deletion.", "/trust/data-handling"],
      ["AI governance", "Human oversight, bounded use and output limitations.", "/trust/ai-governance"],
      ["Availability", "Service objectives and incident communication.", "/trust/availability"],
      ["Subprocessors", "Third-party services used to deliver the platform.", "/trust/subprocessors"],
      ["Responsible disclosure", "How to report security and evidence-integrity concerns.", "/trust/responsible-disclosure"],
    ],
  },
  legal: {
    section: "Legal documents",
    intro: "Each document states its scope, effective date and applicable entity.",
    cards: [
      ["Privacy policy", "How personal data is handled.", "/legal/privacy"],
      ["Cookie policy", "Cookies and similar technologies used on AxiomOrdo sites.", "/legal/cookies"],
      ["Terms of use", "Terms governing use of the public website.", "/legal/terms"],
      ["Accessibility", "Accessibility position and contact route.", "/legal/accessibility"],
    ],
  },
};

function staticContent(route) {
  const parts = route.split("/").filter(Boolean);
  const group = groupContent[parts[0]];
  if (group && parts.length === 1) return group;
  if (legacyRoutes[route]) {
    return {
      section: "Related routes",
      intro: "Use the related routes below to continue through the AxiomOrdo evidence, platform and governance architecture.",
      cards: [["Platforms", "Explore the platform portfolio and its defined regulatory domains.", "/platforms"], ["Resources", "Read evidence-led material and operational guides.", "/resources"], ["Contact", "Discuss a regulatory, evidence or implementation requirement.", "/contact"]],
    };
  }
  return {
    section: "Route scope",
    intro: "This route is part of a governed information architecture with defined scope, evidence model, limitations and next action.",
    cards: [["Parent route", "Return to the relevant architecture hub.", `/${parts[0]}`], ["Evidence and provenance", "Review how source trails support defensible conclusions.", "/solutions/evidence-provenance"], ["Next action", "Discuss the requirement with AxiomOrdo.", "/contact"]],
  };
}

function staticCardsHtml(cards) {
  return cards.map(([title, description, href]) => `<article class="card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p><a href="${escapeHtml(href)}">Open route →</a></article>`).join("");
}

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
  const content = staticContent(route);
  const title = `${metadata.title} | AxiomOrdo`;
  const canonical = `${siteOrigin}${route}`;
  const outputPath = join(outputRoot, `${route.slice(1)}.html`);
  mkdirSync(join(outputRoot, route.slice(1, route.lastIndexOf("/"))), { recursive: true });
  const page = template
    .replace(/\n  <meta name="description"[^>]*\/>/, `\n  <meta name="description" content="${escapeHtml(metadata.description)}" />\n  <title>${escapeHtml(title)}</title>\n  <link rel="canonical" href="${escapeHtml(canonical)}" />`)
    .replace('<h1 id="title"></h1>', `<h1 id="title">${escapeHtml(metadata.title)}</h1>`)
    .replace('<p class="lede" id="lede"></p>', `<p class="lede" id="lede">${escapeHtml(metadata.description)}</p>`)
    .replace('<h2 id="section-title"></h2>', `<h2 id="section-title">${escapeHtml(content.section)}</h2>`)
    .replace('<p class="intro" id="section-intro"></p>', `<p class="intro" id="section-intro">${escapeHtml(content.intro)}</p>`)
    .replace('<div class="grid" id="grid"></div>', `<div class="grid" id="grid">${staticCardsHtml(content.cards)}</div>`);
  writeFileSync(outputPath, page);
}

console.log(`prerender-architecture: generated ${routes.length} deterministic route pages`);
