import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Capability = { title: string; desc: string };

type SeoConfig = {
  title: string;
  description: string;
  canonicalPath: string;
  schema?: Record<string, unknown>;
  image?: string;
  type?: "website" | "article";
};

type InsightHub = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
};

type PlaceholderArticle = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  status: string;
};

type Brand = {
  key: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  accent: string;
  href: string;
  label: string;
  hero: string;
  subline: string;
  problem: { heading: string; body: string[] };
  capabilities: Capability[];
  cta: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Brand Registry — 9 products
// ─────────────────────────────────────────────────────────────────────────────

const brands: Brand[] = [
  // ── 1. VeriLog ── Audit ──────────────────────────────────────────────────
  {
    key: "verilog",
    name: "VeriLog",
    tagline: "Audit confidence before the inspector arrives.",
    description:
      "Turn fragmented SMS documentation into a defensible, structured audit record — before the external auditor does it for you.",
    color: "#4338ca",
    accent: "#818cf8",
    href: "/verilog",
    label: "Audit",
    hero: "Know your gaps before the auditor does.",
    subline:
      "VeriLog structures your ISM/SMS documentation into a verifiable audit record, mapping evidence to obligations and flagging deficiencies before they become findings.",
    problem: {
      heading: "Audit findings are evidence problems, not operational ones.",
      body: [
        "Most ISM deficiencies are not failures of safety management — they are failures of documentation. The procedures exist. The records exist. But they are scattered, inconsistent, and unable to answer the auditor's question directly.",
        "VeriLog maps your SMS documentation to the audit standard, identifies gaps in the evidence record, and produces a structured pre-audit position before the external auditor arrives.",
      ],
    },
    capabilities: [
      { title: "Obligation mapping", desc: "ISM Code clauses mapped to your existing procedures and records." },
      { title: "Gap identification", desc: "Missing or insufficient evidence flagged against each requirement." },
      { title: "Pre-audit position", desc: "Structured summary of defensible clauses and outstanding actions." },
      { title: "Finding classification", desc: "Major NCs, minor NCs, and observations tracked to closure." },
      { title: "SMS cross-reference", desc: "Procedures, records, and policies linked by ISM Code section." },
      { title: "Audit trail", desc: "Every mapping decision retains its source record and reviewer." },
    ],
    cta: "Request Pre-Audit Assessment",
  },

  // ── 2. Emissary ── CBAM ───────────────────────────────────────────────────
  {
    key: "emissary",
    name: "Emissary",
    tagline: "Carbon compliance at the border. Calculated, not estimated.",
    description:
      "CBAM requires verified embedded carbon data for covered goods entering the EU. Emissary builds the evidence record before your declaration is due.",
    color: "#15803d",
    accent: "#4ade80",
    href: "/emissary",
    label: "CBAM",
    hero: "Know what embedded carbon you're importing before the EU asks.",
    subline:
      "The Carbon Border Adjustment Mechanism requires verified embedded emissions data for covered goods. Emissary calculates your CBAM position and builds the declaration record.",
    problem: {
      heading: "CBAM is a data problem disguised as a reporting requirement.",
      body: [
        "Importers of steel, aluminium, cement, fertilisers, hydrogen, and electricity into the EU must report the embedded carbon in those goods — and eventually purchase certificates. Default fallback values penalise you for not knowing your actual emissions.",
        "Emissary structures your supplier data collection, calculates embedded carbon against the CBAM methodology, and produces the verified declaration record — with a full source trail.",
      ],
    },
    capabilities: [
      { title: "Supplier emissions mapping", desc: "Collect and structure embedded carbon data across your supply chain." },
      { title: "CBAM calculation engine", desc: "Embedded emissions calculated against the EU CBAM methodology." },
      { title: "Default vs. actual", desc: "Quantify the financial cost of not knowing your verified figure." },
      { title: "Declaration preparation", desc: "Structured record for CBAM quarterly reporting obligations." },
      { title: "Sector coverage", desc: "Steel, aluminium, cement, fertilisers, hydrogen, and electricity." },
      { title: "Audit-ready evidence", desc: "Full source trail from supplier input to final declared value." },
    ],
    cta: "Calculate Your CBAM Position",
  },

  // ── 3. Sentinel ── Compliance ─────────────────────────────────────────────
  {
    key: "sentinel",
    name: "Sentinel",
    tagline: "Deforestation due diligence. Evidence mapped to origin.",
    description:
      "EUDR due diligence intelligence for tracing commodities and products to origin, organising evidence, and preparing defensible submissions.",
    color: "#0369a1",
    accent: "#38bdf8",
    href: "/sentinel",
    label: "EUDR",
    hero: "EUDR evidence, traced from product to plot.",
    subline:
      "Sentinel is being developed to structure EUDR due diligence evidence, connect products and suppliers to geolocation records, and expose gaps before submission.",
    problem: {
      heading: "Compliance failures are evidence failures.",
      body: [
        "Regulators do not care what your process says. They care what your evidence shows. The gap between your management system and your evidenced position is where enforcement actions originate.",
        "Sentinel maps your regulatory obligations to the evidence that satisfies them, identifies where that evidence is absent or insufficient, and maintains a current, defensible compliance position.",
      ],
    },
    capabilities: [
      { title: "Obligation extraction", desc: "Regulatory text parsed into discrete, trackable requirement units." },
      { title: "Evidence mapping", desc: "Requirements linked to procedures, records, and supporting documentation." },
      { title: "Gap analysis", desc: "Live view of obligations without sufficient evidence to defend." },
      { title: "Deadline monitoring", desc: "Regulatory submission and renewal dates tracked against your calendar." },
      { title: "Compliance position", desc: "Current defensibility status across all tracked obligations." },
      { title: "Multi-jurisdiction", desc: "Layer multiple regulatory frameworks across the same evidence base." },
    ],
    cta: "Map Your Compliance Position",
  },

  // ── 4. CarbonLedger ── EU ETS ─────────────────────────────────────────────
  {
    key: "carbonledger",
    name: "CarbonLedger",
    tagline: "Your EU ETS position. Real numbers before the deadline.",
    description:
      "Track verified emissions against your EU ETS allowance account, calculate your net position, and identify exposure before the April surrender deadline.",
    color: "#0f766e",
    accent: "#2dd4bf",
    href: "/carbonledger",
    label: "EU ETS",
    hero: "Know your carbon position before the compliance year closes.",
    subline:
      "CarbonLedger tracks your verified emissions against your EU ETS allowance account, calculates your net position, and identifies exposure before the April surrender deadline.",
    problem: {
      heading: "Most operators discover their ETS exposure too late to act.",
      body: [
        "EU ETS surrender deadlines are fixed. If your verified emissions exceed your allowance account balance, you face automatic penalties at €100 per tonne over cap. The problem is not the exposure — it is discovering it in April when allowance prices have moved.",
        "CarbonLedger maintains a running ETS position throughout the compliance year, giving you the data to act — purchase allowances, surrender early, or optimise fuel mix — before the deadline forces your hand.",
      ],
    },
    capabilities: [
      { title: "Emissions monitoring", desc: "Voyage-level fuel consumption converted to verified CO₂ equivalent." },
      { title: "Allowance tracking", desc: "Real-time balance against your Union Registry account holdings." },
      { title: "Net position", desc: "Running surplus or deficit calculated across the compliance year." },
      { title: "Exposure quantification", desc: "Financial exposure at current allowance prices if position unchanged." },
      { title: "Surrender preparation", desc: "Structured annual surrender record for competent authority." },
      { title: "Monitoring plan alignment", desc: "Methodology aligned to your approved MRV monitoring plan." },
    ],
    cta: "Calculate Your ETS Position",
  },

  // ── 5. FuelPath ── FuelEU Maritime ───────────────────────────────────────
  {
    key: "fuelpath",
    name: "FuelPath",
    tagline: "FuelEU Maritime compliance. Before the penalty lands.",
    description:
      "Know your GHG intensity position under FuelEU Maritime — and the cost of getting it wrong — before the reporting period closes.",
    color: "#c2410c",
    accent: "#fb923c",
    href: "/fuelpath",
    label: "FuelEU",
    hero: "Know your FuelEU position before the compliance year ends.",
    subline:
      "FuelEU Maritime requires vessels calling EU ports to reduce GHG intensity year on year. FuelPath calculates your current position, quantifies your penalty exposure, and shows options for closing the gap.",
    problem: {
      heading: "GHG intensity compliance is a voyage-by-voyage calculation problem.",
      body: [
        "FuelEU Maritime measures the GHG intensity of energy used on board — across all voyages to, from, and between EU ports. Non-compliance triggers pooling obligations or financial penalties. Most operators do not know their position until after the fact.",
        "FuelPath calculates your rolling GHG intensity from voyage fuel logs, compares it to the applicable reduction target, and shows you the gap in real numbers — with time left to act.",
      ],
    },
    capabilities: [
      { title: "GHG intensity calculation", desc: "Well-to-wake emissions factors applied to voyage fuel consumption." },
      { title: "Compliance target tracking", desc: "Annual FuelEU reduction target benchmarked against current position." },
      { title: "Penalty exposure", desc: "Financial exposure at FuelEU penalty rates if current trajectory holds." },
      { title: "Pooling analysis", desc: "Identify pooling options and surplus/deficit transfer calculations." },
      { title: "Fuel type comparison", desc: "GHG intensity impact of alternative fuels modelled against current mix." },
      { title: "Voyage-level record", desc: "Granular source trail from bunker data to final reported position." },
    ],
    cta: "Calculate Your FuelEU Position",
  },

  // ── 6. Golden Thread ── Fire Safety ───────────────────────────────────────
  {
    key: "goldenthread",
    name: "Golden Thread",
    tagline: "The complete fire safety record. Unbroken.",
    description:
      "The Building Safety Act requires a golden thread of fire safety information. Golden Thread builds, maintains, and defends it.",
    color: "#b45309",
    accent: "#fbbf24",
    href: "/goldenthread",
    label: "Fire Safety",
    hero: "The complete fire safety record. From design to occupation.",
    subline:
      "The UK Building Safety Act requires a complete, maintained record of fire safety information throughout a building's life. Golden Thread builds and maintains that record.",
    problem: {
      heading: "Post-Grenfell legislation makes fire safety evidence a legal obligation.",
      body: [
        "The Building Safety Act requires higher-risk buildings to maintain a golden thread of safety information — every design decision, every material specification, every change affecting fire safety performance. Most buildings cannot produce this record today.",
        "Golden Thread structures the evidence: passive fire protection documentation, compartmentation records, material specifications, and change records — mapped to the building and maintained through occupation.",
      ],
    },
    capabilities: [
      { title: "Passive fire protection", desc: "Installation evidence, inspection records, and specification documentation." },
      { title: "Compartmentation mapping", desc: "Fire-rated barriers and penetrations mapped to floor plans." },
      { title: "Material specification", desc: "Product data, UKCA marks, and installer evidence structured by location." },
      { title: "Change management", desc: "Building modifications tracked with supporting evidence and approvals." },
      { title: "Resident access", desc: "Relevant safety information made accessible to residents as required by law." },
      { title: "Regulatory gateway", desc: "Structured evidence pack for Building Safety Regulator submissions." },
    ],
    cta: "Build Your Golden Thread",
  },

  // ── 7. ClearMark ── PFAS ─────────────────────────────────────────────────
  {
    key: "clearmark",
    name: "ClearMark",
    tagline: "PFAS regulatory evidence. SKU-level, defensible.",
    description:
      "Know your PFAS exposure before a retailer or regulator forces the timetable. SKU-level evidence classification in 10 business days.",
    color: "#0891b2",
    accent: "#22d3ee",
    href: "/clearmark",
    label: "PFAS",
    hero: "Know your PFAS exposure before someone asks.",
    subline:
      "ClearMark turns SKU lists and supplier evidence into clear PFAS decisions — before retailers or regulators force the timetable.",
    problem: {
      heading: "1,000 SKUs does not mean 1,000 PFAS problems. You need to know which ones.",
      body: [
        "PFAS pressure arrives as a short deadline: a retailer questionnaire or a regulatory request. The risk is not knowing which SKUs are defensible and which require testing or reformulation.",
        "ClearMark groups your inventory by product family, maps available supplier evidence to each group, and classifies the exposure — giving you a defensible position or a targeted action list in 10 business days.",
      ],
    },
    capabilities: [
      { title: "SKU triage", desc: "Product inventory grouped by family and screened against known PFAS vectors." },
      { title: "Evidence mapping", desc: "Supplier data, test certificates, and SDS mapped to product groups." },
      { title: "Green / Amber / Red", desc: "Clear classification for each product family with full source trail." },
      { title: "Action map", desc: "Targeted list of what requires testing, reformulation, or supplier action." },
      { title: "10-day turnaround", desc: "Initial classification delivered within 10 business days of inventory receipt." },
      { title: "Retailer-ready pack", desc: "Formatted evidence summary for retail questionnaire response." },
    ],
    cta: "Start PFAS Readiness Audit",
  },

  // ── 8. SafeOps ── QHSE Copilot ───────────────────────────────────────────
  {
    key: "safeops",
    name: "SafeOps",
    tagline: "QHSE intelligence on every shift, at every level.",
    description:
      "AI-powered QHSE support that knows your SMS, your regulations, and your operational context — available to every crew member, not just the office.",
    color: "#4d7c0f",
    accent: "#84cc16",
    href: "/safeops",
    label: "QHSE",
    hero: "QHSE answers without waiting for the office.",
    subline:
      "SafeOps puts structured QHSE intelligence directly in front of operational crews — SMS procedures, regulatory requirements, incident guidance, and permit processes — grounded in the AxiomOrdo Regulatory Data Standard.",
    problem: {
      heading: "QHSE failures happen when the right answer isn't accessible at the right moment.",
      body: [
        "Your Safety Management System is a document stack. Your crew needs a decision. Between those two things is delay, misinterpretation, and risk. The shore-side QHSE team cannot be available for every operational question at every hour.",
        "SafeOps puts structured QHSE intelligence directly in front of the people making the decision — mapped to your SMS, your regulatory obligations, and the specific operational context they are in.",
      ],
    },
    capabilities: [
      { title: "SMS-aware responses", desc: "Answers grounded in your specific Safety Management System documentation." },
      { title: "Regulatory cross-reference", desc: "ISM Code, STCW, MLC 2006, and SOLAS surfaced in context." },
      { title: "Incident guidance", desc: "Step-by-step response protocols drawn from your emergency procedures." },
      { title: "PTW support", desc: "Permit-to-work process guidance and checklist navigation." },
      { title: "Near-miss capture", desc: "Structured near-miss and observation recording from any device." },
      { title: "Audit log", desc: "Every query and response recorded for management review and training." },
    ],
    cta: "Request SafeOps Pilot Access",
  },

  // ── 9. Meriden Compliance ── Maritime SME ────────────────────────────────
  {
    key: "meriden",
    name: "Meriden Compliance",
    tagline: "Maritime compliance without the compliance team.",
    description:
      "Structured ISM, MLC, and flag state compliance management for vessel operators who don't have a shore-based compliance department.",
    color: "#1d4ed8",
    accent: "#60a5fa",
    href: "/meriden-compliance",
    label: "Maritime SME",
    hero: "Maritime compliance your crew can actually use.",
    subline:
      "Meriden Compliance delivers structured ISM, MLC, and flag state compliance management for vessel operators who do not have a shore-based compliance department.",
    problem: {
      heading: "Smaller operators carry the same regulatory burden without the compliance infrastructure.",
      body: [
        "ISM Code, SOLAS, MLC 2006, flag state requirements, port state control — the compliance burden on a maritime operator does not scale down with the size of the fleet. A two-vessel SME carries the same documentary obligations as a large owner.",
        "Meriden Compliance provides the structure, the checklists, the deadline tracking, and the evidence management — at a cost that makes sense for an SME operation.",
      ],
    },
    capabilities: [
      { title: "ISM Code compliance", desc: "Safety Management System requirements tracked and evidenced." },
      { title: "MLC 2006 records", desc: "Seafarer records, certificates, and MLC obligations in one place." },
      { title: "PSC readiness", desc: "Port State Control preparation check against your vessel's current record." },
      { title: "Deadline calendar", desc: "Survey dates, certificate renewals, and inspection windows tracked." },
      { title: "Document control", desc: "Controlled SMS procedures with version history and crew acknowledgement." },
      { title: "Fleet overview", desc: "Multi-vessel compliance position visible in a single dashboard." },
    ],
    cta: "Start Free 30-Day Trial",
  },
];

const unreleasedBrandKeys = new Set([
  "verilog",
  "emissary",
  "sentinel",
  "carbonledger",
  "fuelpath",
  "goldenthread",
  "clearmark",
  "safeops",
]);

// ─────────────────────────────────────────────────────────────────────────────
// ARDS — The Standard (standalone site, separate from axiomordo.com)
// ─────────────────────────────────────────────────────────────────────────────

const ARDS_URL =
  (process.env.REACT_APP_ARDS_URL &&
    process.env.REACT_APP_ARDS_URL.trim()) ||
  "https://ards.axiomordo.com/";

const SITE_URL = "https://www.axiomordo.com";
const ICO_REGISTRATION_PATH = "/legal/ico-registration/";
const MERIDEN_PATH = "/meriden-compliance";
const MERIDEN_INSIGHTS_PATH = `${MERIDEN_PATH}/insights`;

const insightHubs: InsightHub[] = [
  {
    slug: "maritime-ai",
    title: "Maritime AI and Governance",
    shortTitle: "Maritime AI",
    description:
      "Practical analysis for controlled AI use in maritime QHSE, audit readiness, management systems, and assurance workflows.",
  },
  {
    slug: "maritime-qhse",
    title: "Maritime QHSE",
    shortTitle: "Maritime QHSE",
    description:
      "Operational articles for DPAs, QHSE managers, marine assurance teams, and vessel operators working with ISM, PSC, MLC, STCW, and audit evidence.",
  },
  {
    slug: "risk-safety",
    title: "Risk and Operational Safety",
    shortTitle: "Risk and Safety",
    description:
      "Articles on practical risk control, operational safeguards, field judgement, and the difference between documented controls and controls that work.",
  },
  {
    slug: "investigations",
    title: "Investigations",
    shortTitle: "Investigations",
    description:
      "Investigation-focused analysis on evidence, causation, corrective action, confidentiality, and defensible reporting.",
  },
  {
    slug: "safety-management-systems",
    title: "Safety Management Systems",
    shortTitle: "SMS",
    description:
      "ISM and management-system articles covering procedures, records, implementation, review, and audit-ready evidence.",
  },
  {
    slug: "auditing-assurance",
    title: "Auditing and Assurance",
    shortTitle: "Auditing",
    description:
      "Management-system and audit articles focused on evidence trails, controlled implementation, reviewability, and corrective action.",
  },
  {
    slug: "human-factors",
    title: "Human Factors",
    shortTitle: "Human Factors",
    description:
      "Articles on competence, workload, communication, decision pressure, and how real people interact with formal controls.",
  },
  {
    slug: "leadership-accountability",
    title: "Leadership and Accountability",
    shortTitle: "Leadership",
    description:
      "Analysis on ownership, review duties, operational accountability, and management decisions in maritime compliance.",
  },
  {
    slug: "training-competence",
    title: "Training and Competence",
    shortTitle: "Competence",
    description:
      "Articles on training quality, competence evidence, familiarisation, supervision, and the limits of paper compliance.",
  },
];

const placeholderArticles: PlaceholderArticle[] = [
  {
    slug: "why-ai-policies-fail",
    title: "AI Governance in Maritime: How to Control AI-Supported Work Through Your Safety Management System",
    subtitle:
      "Why approved tools are not enough—and how verification, document control, competence and accountability apply when AI enters operational work.",
    category: "maritime-ai",
    status: "Published",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ClearMark Decision System
// ─────────────────────────────────────────────────────────────────────────────

const pfasDecisions = [
  {
    label: "Green",
    outcome: "Clear",
    detail:
      "Evidence is sufficient to defend the product family without immediate testing.",
    tone: "border-emerald-400 text-emerald-700",
  },
  {
    label: "Amber",
    outcome: "Investigate",
    detail:
      "Evidence gaps exist at component, supplier, or material level and require targeted follow-up.",
    tone: "border-amber-400 text-amber-700",
  },
  {
    label: "Red",
    outcome: "Restrict",
    detail:
      "The product cannot be defended and should be held, remediated, or tested before exposure increases.",
    tone: "border-rose-400 text-rose-700",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Utility — scroll to top on route change
// ─────────────────────────────────────────────────────────────────────────────

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function PageSeo({ title, description, canonicalPath, schema, image, type = "website" }: SeoConfig) {
  const schemaJson = schema ? JSON.stringify(schema) : null;

  useEffect(() => {
    document.title = title;

    const upsertMeta = (selector: string, attrs: Record<string, string>) => {
      let tag = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        document.head.appendChild(tag);
      }
      Object.entries(attrs).forEach(([key, value]) => tag?.setAttribute(key, value));
    };

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: "index,follow,max-image-preview:large",
    });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: `${SITE_URL}${canonicalPath}`,
    });
    if (image) {
      upsertMeta('meta[property="og:image"]', {
        property: "og:image",
        content: `${SITE_URL}${image}`,
      });
    }

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}${canonicalPath}`;

    let script = document.getElementById("page-schema") as HTMLScriptElement | null;
    if (schemaJson) {
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "page-schema";
        document.head.appendChild(script);
      }
      script.textContent = schemaJson;
    } else if (script) {
      script.remove();
    }
  }, [title, description, canonicalPath, schemaJson, image, type]);

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA Button
// ─────────────────────────────────────────────────────────────────────────────

function CTA({
  to,
  children,
  secondary = false,
  isExternal = false,
  accentColor,
}: {
  to: string;
  children: string;
  secondary?: boolean;
  isExternal?: boolean;
  accentColor?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/30";
  const primaryStyle = accentColor
    ? { background: accentColor, color: "#000" }
    : { background: "#ffffff", color: "#0a0f1a" };
  const secondaryStyle = accentColor
    ? { borderColor: accentColor, color: accentColor }
    : { borderColor: "rgba(255,255,255,0.3)", color: "#fff" };

  const cls = secondary
    ? `${base} border bg-transparent hover:bg-white/5`
    : `${base} hover:opacity-90`;

  const style = secondary ? secondaryStyle : primaryStyle;

  if (isExternal || to.startsWith("#")) {
    return (
      <a href={to} className={cls} style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={cls} style={style}>
      {children}
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand Nav — used on all brand sub-pages
// ─────────────────────────────────────────────────────────────────────────────

function BrandNav({ brand, cta }: { brand: { name: string; accent: string; href: string }; cta?: string }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 text-white sm:px-8">
        <Link to={brand.href} className="flex items-center gap-2">
          <div className="leading-tight">
            <span
              className="block text-base font-semibold tracking-tight"
              style={{ color: brand.accent }}
            >
              {brand.name}
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
              an AxiomOrdo company
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link
            to="/"
            className="hidden text-white/55 transition hover:text-white/80 sm:inline"
          >
            ← AxiomOrdo
          </Link>
          {cta && (
            <a
              href="#contact"
              className="rounded-full border border-white/20 px-5 py-2 text-white transition hover:border-white/40 hover:bg-white/10"
            >
              {cta}
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Group Nav — for AxiomOrdo home
// ─────────────────────────────────────────────────────────────────────────────

function GroupNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/25 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 text-white sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/images/axiomordo-logo.png"
            alt="AxiomOrdo"
            className="h-8 w-auto"
            style={{ mixBlendMode: "screen" }}
          />
          <div className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight">AxiomOrdo</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
              Regulatory Intelligence Group
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          <a href="/ao-pdf" className="hidden text-white/65 transition hover:text-white sm:inline">
            AO-PDF
          </a>
          <Link to={MERIDEN_INSIGHTS_PATH} className="hidden text-white/65 transition hover:text-white sm:inline">
            Meriden Insights
          </Link>
          <a href={ARDS_URL} target="_blank" rel="noopener noreferrer" className="hidden text-white/65 transition hover:text-white sm:inline">
            ARDS Standard
          </a>
          <Link
            to={MERIDEN_PATH}
            className="rounded-full border border-white/20 px-5 py-2 text-white transition hover:border-white/40 hover:bg-white/10"
          >
            Meriden Compliance
          </Link>
        </div>
      </nav>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Group Footer
// ─────────────────────────────────────────────────────────────────────────────

function GroupFooter({ brand }: { brand?: { name: string; accent: string } }) {
  return (
    <footer className="border-t border-white/10 bg-[#050810] py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {brand ? (
              <>
                <p
                  className="text-base font-semibold"
                  style={{ color: brand.accent }}
                >
                  {brand.name}
                </p>
                <p className="mt-1 text-xs text-white/35">
                  an AxiomOrdo company
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-white">AxiomOrdo Ltd</p>
                <p className="mt-1 text-xs text-white/35">
                  Regulatory Intelligence Group
                </p>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/35">
            <Link to="/" className="transition hover:text-white/65">
              Group Home
            </Link>
            <Link to={MERIDEN_INSIGHTS_PATH} className="transition hover:text-white/65">
              Meriden Insights
            </Link>
            <Link to="/authors/phillip-inzaghi" className="transition hover:text-white/65">
              Author
            </Link>
            <a href="/ao-pdf" className="transition hover:text-white/65">
              AO-PDF
            </a>
            <a href={ARDS_URL} target="_blank" rel="noopener noreferrer" className="transition hover:text-white/65">
              ARDS Standard
            </a>
            <a href={ICO_REGISTRATION_PATH} className="transition hover:text-white/65">
              ICO registration ZC216112
            </a>
            {brands.map((b) => (
              <Link key={b.key} to={b.href} className="transition hover:text-white/65">
                {b.name}
              </Link>
            ))}
            <a
              href="mailto:hello@axiomordo.com"
              className="transition hover:text-white/65"
            >
              Contact
            </a>
          </div>
        </div>
        <p className="mt-12 text-xs text-white/18">
          © {new Date().getFullYear()} AxiomOrdo Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ARDS badge — used at bottom of every brand page
// ─────────────────────────────────────────────────────────────────────────────

function ARDSBadge({ accentColor }: { accentColor: string }) {
  return (
    <section className="border-t border-white/8 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.28em]"
              style={{ color: accentColor }}
            >
              Powered by
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              AxiomOrdo Regulatory Data Standard
            </h3>
            <p className="mt-3 max-w-xl text-base leading-7 text-white/55">
              Every classification, calculation, and compliance position produced by AxiomOrdo
              platforms is structured against ARDS — the open standard for machine-readable
              regulatory intelligence.
            </p>
          </div>
          <div className="shrink-0">
            <a
              href={ARDS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
            >
              Explore the ARDS Standard →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic Brand Page Template
// ─────────────────────────────────────────────────────────────────────────────

function BrandPlaceholderPage({ brand }: { brand: Brand }) {
  return (
    <main className="min-h-screen text-white" style={{ background: "#050810" }}>
      <BrandNav brand={brand} />

      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 65% at 60% 40%, ${brand.color}28 0%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050810] to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-20 pt-32 sm:px-8">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ background: `${brand.color}28`, color: brand.accent }}
              >
                {brand.label}
              </span>
              <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                In development
              </span>
            </div>
            <h1 className="motion-fade mt-6 text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">
              {brand.name}
            </h1>
            <p className="motion-fade mt-5 text-2xl font-medium leading-9 sm:text-3xl" style={{ color: brand.accent }}>
              {brand.tagline}
            </p>
            <p className="motion-fade mt-7 max-w-2xl text-lg leading-8 text-white/60 sm:text-xl">
              {brand.description}
            </p>
            <p className="motion-fade mt-5 max-w-2xl text-base leading-7 text-white/45">
              Product and release information will be published as development progresses.
            </p>
            <div className="motion-fade mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href={`mailto:hello@axiomordo.com?subject=${encodeURIComponent(`Register interest in ${brand.name}`)}`}
                className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold transition hover:opacity-90"
                style={{ background: brand.accent, color: "#000" }}
              >
                Register interest
              </a>
              <CTA to="/" secondary accentColor={brand.accent}>
                AxiomOrdo Group
              </CTA>
            </div>
          </div>
        </div>
      </section>

      <GroupFooter brand={brand} />
    </main>
  );
}

function BrandPage({ brand }: { brand: Brand }) {
  return (
    <main
      className="min-h-screen text-white"
      style={{ background: "#050810" }}
    >
      <BrandNav brand={brand} cta={brand.cta} />

      {/* ── Hero ── */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Brand colour atmospheric glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 60% 40%, ${brand.color}28 0%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050810] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-16 pt-32 sm:px-8">
          <div className="max-w-3xl">
            <p
              className="motion-fade text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: brand.accent }}
            >
              {brand.label}
            </p>
            <h1 className="motion-fade mt-5 text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">
              {brand.hero}
            </h1>
            <p className="motion-fade mt-7 max-w-2xl text-xl leading-8 text-white/65 sm:text-2xl sm:leading-9">
              {brand.subline}
            </p>
            <div className="motion-fade mt-10 flex flex-col gap-4 sm:flex-row">
              <CTA to="#contact" isExternal accentColor={brand.accent}>
                {brand.cta}
              </CTA>
              <CTA to="/" secondary accentColor={brand.accent}>
                AxiomOrdo Group
              </CTA>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:py-32">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.28em]"
            style={{ color: brand.accent }}
          >
            The Problem
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {brand.problem.heading}
          </h2>
        </div>
        <div className="space-y-7 text-lg leading-8 text-white/60">
          {brand.problem.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section
        className="py-24 sm:py-32"
        style={{ background: "rgba(255,255,255,0.025)" }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p
            className="text-xs font-semibold uppercase tracking-[0.28em]"
            style={{ color: brand.accent }}
          >
            Capabilities
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            What {brand.name} delivers.
          </h2>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brand.capabilities.map((cap) => (
              <div
                key={cap.title}
                className="rounded-2xl border border-white/8 p-7"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div
                  className="mb-4 h-1 w-8 rounded-full"
                  style={{ background: brand.accent }}
                />
                <h3 className="text-base font-semibold text-white">{cap.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARDS Badge ── */}
      <div style={{ background: "#050810" }}>
        <ARDSBadge accentColor={brand.accent} />
      </div>

      {/* ── CTA / Contact ── */}
      <section id="contact" className="py-24 sm:py-32" style={{ background: "#050810" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div
            className="rounded-[2.5rem] p-10 sm:p-16"
            style={{
              background: `linear-gradient(135deg, ${brand.color}22 0%, rgba(255,255,255,0.03) 100%)`,
              border: `1px solid ${brand.color}40`,
            }}
          >
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.28em]"
                  style={{ color: brand.accent }}
                >
                  Get Started
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  {brand.cta}
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-7 text-white/55">
                  {brand.description}
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <a
                  href={`mailto:hello@axiomordo.com?subject=${encodeURIComponent(brand.cta + " — " + brand.name)}`}
                  className="inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold transition hover:opacity-90"
                  style={{ background: brand.accent, color: "#000" }}
                >
                  {brand.cta}
                </a>
                <p className="text-center text-xs text-white/35">
                  hello@axiomordo.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <GroupFooter brand={brand} />
    </main>
  );
}
function MeridenPage() {
  const brand = brands.find((b) => b.key === "meriden")!;

  const tiers = [
    {
      name: "Vessel",
      price: "£149",
      period: "/month",
      desc: "Single vessel. Full ISM and MLC compliance management.",
      features: [
        "ISM Code obligation tracking",
        "MLC 2006 record management",
        "Certificate and survey deadline calendar",
        "PSC readiness checker",
        "Document control with version history",
        "Email support",
      ],
    },
    {
      name: "Fleet",
      price: "£349",
      period: "/month",
      desc: "Up to 5 vessels. Fleet-wide compliance overview.",
      features: [
        "Everything in Vessel",
        "Multi-vessel dashboard",
        "Fleet compliance position view",
        "Comparative PSC readiness",
        "Priority support",
        "Onboarding included",
      ],
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      desc: "Larger fleets, flag state integration, or group-level requirements.",
      features: [
        "Unlimited vessels",
        "Flag state and classification society integration",
        "Dedicated account management",
        "Custom obligation mapping",
        "API access",
        "SLA included",
      ],
    },
  ];

  return (
    <main className="text-white" style={{ background: "#050810" }}>
      <BrandNav brand={brand} cta="Start Free Trial" />

      {/* ── Hero ── */}
      <section className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(29,78,216,0.22) 0%, transparent 70%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050810] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-16 pt-32 sm:px-8">
          <div className="max-w-3xl">
            <p className="motion-fade text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
              Meriden Compliance · an AxiomOrdo company
            </p>
            <h1 className="motion-fade mt-5 text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">
              Maritime compliance your crew can actually use.
            </h1>
            <p className="motion-fade mt-7 max-w-2xl text-xl leading-8 text-white/60 sm:text-2xl sm:leading-9">
              Structured ISM, MLC, and flag state compliance management for
              vessel operators who do not have a shore-based compliance department.
            </p>
            <div className="motion-fade mt-10 flex flex-col gap-4 sm:flex-row">
              <CTA to="#pricing" isExternal accentColor="#60a5fa">
                View Products
              </CTA>
              <CTA to={MERIDEN_INSIGHTS_PATH} accentColor="#60a5fa" secondary>
                Read Insights
              </CTA>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.02] py-16">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {[
            ["Products", "Maritime AI readiness, governance packs, implementation plans, and supporting toolkits.", "#pricing"],
            ["Services", "Readiness assessment, supported implementation, governance review, and maritime compliance consultancy.", "#services"],
            ["Insights", "Evidence-led Meriden articles on maritime AI, QHSE, assurance, SMS, and operational accountability.", MERIDEN_INSIGHTS_PATH],
            ["Resources", "Guides, checklists, frameworks, and free downloads for maritime compliance teams.", "/meriden"],
          ].map(([title, desc, href]) => (
            <Link
              key={title}
              to={href}
              className="rounded-2xl border border-white/8 bg-[#050810] p-6 transition hover:border-blue-300/35"
            >
              <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-white/45">{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:py-32">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
            The Problem
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            {brand.problem.heading}
          </h2>
        </div>
        <div className="space-y-7 text-lg leading-8 text-white/55">
          {brand.problem.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      <section id="services" className="border-y border-white/8 bg-white/[0.02] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
            Services
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Maritime compliance support with evidence left visible.
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Readiness Assessment", "Placeholder for a structured assessment offer covering AI governance, PSC readiness, or SMS evidence gaps."],
              ["Supported Implementation", "Placeholder for guided implementation support after an assessment or product purchase."],
              ["Governance Review", "Placeholder for review of policy, tool use, data controls, verification duties, and accountability."],
              ["Maritime Compliance Consultancy", "Placeholder for targeted ISM, QHSE, audit, investigation, and management-system support."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-white/8 bg-[#050810] p-6">
                <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/45">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="py-24 sm:py-32" style={{ background: "rgba(255,255,255,0.025)" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
            Capabilities
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            What Meriden Compliance delivers.
          </h2>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brand.capabilities.map((cap) => (
              <div
                key={cap.title}
                className="rounded-2xl border border-white/8 p-7"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="mb-4 h-1 w-8 rounded-full bg-blue-400" />
                <h3 className="text-base font-semibold text-white">{cap.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 sm:py-32" style={{ background: "#050810" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">
            Pricing
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Simple, transparent pricing.
          </h2>
          <p className="mt-5 max-w-xl text-lg text-white/50">
            30-day free trial, no credit card required. Cancel at any time.
          </p>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="flex flex-col rounded-2xl p-8"
                style={{
                  background: tier.featured
                    ? "linear-gradient(135deg, rgba(29,78,216,0.25) 0%, rgba(255,255,255,0.04) 100%)"
                    : "rgba(255,255,255,0.03)",
                  border: tier.featured
                    ? "1px solid rgba(96,165,250,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {tier.featured && (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
                    Most Popular
                  </p>
                )}
                <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  {tier.period && (
                    <span className="text-white/40 text-sm">{tier.period}</span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-white/50">{tier.desc}</p>
                <ul className="mt-8 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-white/65">
                      <span className="mt-0.5 text-blue-400">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@axiomordo.com?subject=Meriden Compliance Trial"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition hover:opacity-90"
                  style={{
                    background: tier.featured ? "#60a5fa" : "rgba(255,255,255,0.08)",
                    color: tier.featured ? "#000" : "#fff",
                  }}
                >
                  {tier.price === "Custom" ? "Talk to us" : "Start Free Trial"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARDS Badge ── */}
      <div style={{ background: "#050810" }}>
        <ARDSBadge accentColor="#60a5fa" />
      </div>

      <GroupFooter brand={brand} />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ARDS Standard Page
// ─────────────────────────────────────────────────────────────────────────────

// ARDS has its own standalone site — /ards redirects there.
function ARDSPage() {
  useEffect(() => {
    window.location.replace(ARDS_URL);
  }, []);
  return (
    <main
      className="flex min-h-screen items-center justify-center text-white"
      style={{ background: "#050810" }}
    >
      <div className="text-center">
        <p
          className="text-xs font-semibold uppercase tracking-[0.28em]"
          style={{ color: "#a78bfa" }}
        >
          Redirecting
        </p>
        <p className="mt-4 text-lg text-white/50">
          Taking you to the ARDS specification…
        </p>
        <a
          href={ARDS_URL}
          className="mt-6 inline-block text-sm underline underline-offset-4"
          style={{ color: "#a78bfa" }}
        >
          Click here if you are not redirected
        </a>
      </div>
    </main>
  );
}

function InsightsIndexPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Meriden Compliance Insights",
    description:
      "Evidence-led maritime compliance articles from Meriden Compliance on maritime AI, QHSE, assurance, safety management systems, investigations, and competence.",
    url: `${SITE_URL}${MERIDEN_INSIGHTS_PATH}`,
    publisher: {
      "@type": "Organization",
      name: "Meriden Compliance",
      url: `${SITE_URL}${MERIDEN_PATH}`,
      parentOrganization: {
        "@type": "Organization",
        name: "AxiomOrdo Ltd",
        url: SITE_URL,
      },
    },
  };

  return (
    <main className="min-h-screen text-white" style={{ background: "#050810" }}>
      <PageSeo
        title="Meriden Compliance Insights | AxiomOrdo"
        description="Evidence-led maritime compliance articles from Meriden Compliance on maritime AI, QHSE, assurance, safety management systems, investigations, and competence."
        canonicalPath={MERIDEN_INSIGHTS_PATH}
        schema={schema}
      />
      <GroupNav />

      <section className="relative overflow-hidden border-b border-white/8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(34,211,238,0.16),transparent_56%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-36 sm:px-8 lg:pb-28 lg:pt-44">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Meriden Compliance Insights
          </p>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl">
            Maritime compliance analysis with the source trail left visible.
          </h1>
          <p className="mt-7 max-w-2xl text-xl leading-8 text-white/60">
            Meriden Compliance Insights sits under Meriden Compliance, an
            AxiomOrdo company. Articles are developed from operational judgement,
            structured author input, and source-aware evidence. Binding authority,
            official guidance, standards, commentary, and interpretation are
            separated clearly.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {insightHubs.map((hub) => (
            <Link
              key={hub.slug}
              to={`${MERIDEN_INSIGHTS_PATH}/${hub.slug}`}
              className="group flex min-h-64 flex-col justify-between rounded-2xl border border-white/8 bg-white/[0.025] p-7 transition hover:border-cyan-300/35"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
                  Topic Hub
                </p>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                  {hub.title}
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/50">
                  {hub.description}
                </p>
              </div>
              <span className="mt-8 text-sm font-semibold text-cyan-300 transition group-hover:translate-x-1">
                View hub →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.02] py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
              Author
            </p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Phillip Inzaghi
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-8 text-white/55">
            <p>
              Founder of AxiomOrdo, maritime QHSE specialist, ISM Lead Auditor,
              and former Officer of the Watch. Articles use Phillip's judgement
              and operational experience where relevant, with source claims
              checked against authoritative material.
            </p>
            <Link
              to="/authors/phillip-inzaghi"
              className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
            >
              View author profile
            </Link>
          </div>
        </div>
      </section>

      <GroupFooter />
    </main>
  );
}

function InsightHubPage({ hub }: { hub: InsightHub }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${hub.title} | Meriden Compliance Insights`,
    description: hub.description,
    url: `${SITE_URL}${MERIDEN_INSIGHTS_PATH}/${hub.slug}`,
    isPartOf: {
      "@type": "CollectionPage",
      name: "Meriden Compliance Insights",
      url: `${SITE_URL}${MERIDEN_INSIGHTS_PATH}`,
    },
  };

  return (
    <main className="min-h-screen text-white" style={{ background: "#050810" }}>
      <PageSeo
        title={`${hub.title} | Meriden Compliance Insights`}
        description={hub.description}
        canonicalPath={`${MERIDEN_INSIGHTS_PATH}/${hub.slug}`}
        schema={schema}
      />
      <GroupNav />

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-36 sm:px-8 lg:pb-28 lg:pt-44">
        <Link to={MERIDEN_INSIGHTS_PATH} className="text-sm font-medium text-cyan-300/80 transition hover:text-cyan-200">
          ← Meriden Compliance Insights
        </Link>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
          Topic Hub
        </p>
        <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl">
          {hub.title}
        </h1>
        <p className="mt-7 max-w-2xl text-xl leading-8 text-white/60">
          {hub.description}
        </p>
      </section>

      <section className="border-y border-white/8 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
            Articles
          </p>
          <div className="mt-8 rounded-2xl border border-white/8 bg-[#050810] p-8">
            {placeholderArticles
              .filter((article) => article.category === hub.slug)
              .map((article) => (
                <Link
                  key={article.slug}
                  to={`${MERIDEN_INSIGHTS_PATH}/${hub.slug}/${article.slug}`}
                  className="block rounded-xl border border-white/8 bg-white/[0.025] p-6 transition hover:border-cyan-300/35"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
                    {article.status}
                  </p>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                    {article.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-white/50">
                    {article.subtitle}
                  </p>
                </Link>
              ))}
            {!placeholderArticles.some((article) => article.category === hub.slug) && (
              <>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  Placeholder hub ready for reviewed articles.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/50">
                  Articles will appear here after editorial, author, evidence,
                  and publication review.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <GroupFooter />
    </main>
  );
}

function PlaceholderArticlePage({
  hub,
  article,
}: {
  hub: InsightHub;
  article: PlaceholderArticle;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.subtitle,
    datePublished: "2026-08-01",
    dateModified: "2026-08-01",
    articleSection: hub.title,
    author: {
      "@type": "Person",
      name: "Phillip Inzaghi",
      url: `${SITE_URL}/authors/phillip-inzaghi`,
    },
    publisher: {
      "@type": "Organization",
      name: "Meriden Compliance",
      url: `${SITE_URL}${MERIDEN_PATH}`,
    },
    isPartOf: {
      "@type": "CollectionPage",
      name: "Meriden Compliance Insights",
      url: `${SITE_URL}${MERIDEN_INSIGHTS_PATH}`,
    },
  };

  return (
    <main className="min-h-screen text-white" style={{ background: "#050810" }}>
      <PageSeo
        title="Maritime AI Governance: Controlling AI Through the SMS"
        description={article.subtitle}
        canonicalPath={`${MERIDEN_INSIGHTS_PATH}/${hub.slug}/${article.slug}`}
        image="/images/maritime-ai-governance-heading.jpg"
        type="article"
        schema={schema}
      />
      <GroupNav />

      <article className="mx-auto max-w-4xl px-5 pb-24 pt-36 sm:px-8 lg:pt-44">
        <Link
          to={`${MERIDEN_INSIGHTS_PATH}/${hub.slug}`}
          className="text-sm font-medium text-cyan-300/80 transition hover:text-cyan-200"
        >
          ← {hub.title}
        </Link>
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          {hub.title} · {article.status}
        </p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl">
          {article.title}
        </h1>
        <p className="mt-7 text-xl leading-8 text-white/60">
          {article.subtitle}
        </p>
        <p className="mt-5 text-sm font-medium text-white/45">
          By Phillip Inzaghi · Founder, AxiomOrdo; Maritime QHSE Specialist ·
          Published 1 August 2026
        </p>

        <img
          src="/images/maritime-ai-governance-heading.jpg"
          alt="Maritime officer reviewing AI-supported information onboard a vessel"
          className="mt-12 aspect-[16/9] w-full rounded-3xl object-cover"
        />

        <div className="mt-12 space-y-8 text-base leading-8 text-white/65">
          <p>AI is already influencing safety management systems, audit reports and operational decisions inside maritime companies—often without formal approval or governance.</p>
          <p>The question is no longer whether people are using AI. It is whether companies know where, how and under what controls it is being used.</p>
          <p>The risk is not simply that people use AI. The risk is uncontrolled data, unchecked output and misplaced accountability.</p>
          <p>It may be used to draft risk assessments, summarise procedures, prepare toolbox talks, rewrite audit findings, compare requirements, or make safety management documents sound more polished. Some of that use may be helpful. Some of it may be harmless. Some of it may create serious control problems.</p>
          <p>The mistake is treating AI governance as a choice between “ban it” and “allow it”.</p>
          <p>That is too crude.</p>
          <p>The real question is operational: what information is being entered, what output is being produced, who checks it, what evidence supports it, and who remains accountable when AI-supported material enters company use.</p>
          <p>At the time of writing, I have not identified an IMO instrument specifically governing routine employee use of generative AI for tasks such as drafting risk assessments, preparing toolbox talks, reviewing audit findings, summarising regulations, or supporting safety management documentation. IMO has adopted a non-mandatory code for AI-enabled and remotely operated autonomous ships, but that is a different regulatory problem.</p>
          <p>That does not mean companies should wait.</p>
          <p>It means AI use has to be controlled through existing governance duties: safety management, competence, verification, confidentiality, document control, and accountability.</p>

          <h2 className="pt-8 text-3xl font-semibold tracking-tight text-white">The First Misunderstanding: AI Is Treated as an IT Issue</h2>
          <p>Many companies will first see AI as an IT or cybersecurity issue.</p>
          <p>That is partly correct, but incomplete.</p>
          <p>Tool access, account type, data retention, permissions, and security settings matter. A company-approved enterprise AI tool is not the same risk as an employee pasting vessel, client, investigation, or personal data into an uncontrolled personal account under time pressure.</p>
          <p>But tool selection does not solve the maritime governance problem.</p>
          <p>A better-controlled tool may reduce some risks. It does not remove the need for review, competence, document control, or operational judgement.</p>
          <p>The company still has to decide:</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>what may be entered into AI tools</li><li>what must never be entered</li><li>which tools are approved</li><li>which tasks require verification</li><li>who is competent to review the output</li><li>how AI-supported work is recorded where evidence matters</li>
          </ul>
          <p>Without those controls, AI becomes an informal parallel system. It can influence safety documents, audit records, investigation material, and operational decisions without being visible inside the company’s actual management system.</p>

          <h2 className="pt-8 text-3xl font-semibold tracking-tight text-white">Existing Duties Already Cover the Control Problem</h2>
          <p>The ISM Code does not regulate AI.</p>
          <p>But AI-supported work can enter areas the safety management system already controls: procedures, risk controls, competence, records, investigations, audits, review, and company accountability.</p>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full border-collapse text-left text-sm leading-6">
              <thead className="bg-white/[0.06] text-white"><tr><th className="px-5 py-4 font-semibold">AI Governance Question</th><th className="px-5 py-4 font-semibold">Existing SMS Control Area</th></tr></thead>
              <tbody className="divide-y divide-white/10 text-white/65">
                {[["Who remains accountable if AI-supported material is used?", "Company responsibility and authority"], ["Can this output be used operationally?", "Approved procedures and shipboard operational controls"], ["Who is competent to check it?", "Resources, personnel, competence, and familiarisation"], ["Has the source been verified?", "Company verification, review, and audit"], ["Can the document be changed casually?", "SMS documentation and revision control"], ["Could this distort a finding, incident, or corrective action?", "Reporting and analysis of non-conformities, accidents, and hazardous occurrences"]].map(([question, area]) => <tr key={question}><td className="px-5 py-4 align-top">{question}</td><td className="px-5 py-4 align-top">{area}</td></tr>)}
              </tbody>
            </table>
          </div>
          <p>Existing maritime regulation was not written for AI.</p>
          <p>However, AI can affect work already controlled by the safety management system. Once AI-supported material enters that system, it still has to be checked, approved, controlled and owned by the company.</p>

          <h2 className="pt-8 text-3xl font-semibold tracking-tight text-white">The Second Misunderstanding: Polished Output Is Treated as Reliable Output</h2>
          <p>AI output often sounds confident.</p>
          <p>That is part of the problem.</p>
          <p>In maritime compliance and safety work, a well-written answer is not the same as a verified answer. A risk control can sound sensible and still be unsuitable. A regulatory reference can look plausible and still be wrong. A summary can appear balanced while omitting the controlling requirement.</p>
          <p>Early in my own use of AI, I asked it to help identify an ISM Code reference for a finding. It produced a reference that sounded plausible. When I checked it against the Code, the reference did not exist.</p>
          <p>That was the point where the issue became clear: custom instructions are not controls, and confident output is not evidence.</p>
          <p>The same issue applies to AI-assisted review. A tool can appear to review a document while filling gaps with plausible content that is not actually present in the source.</p>
          <p>In audit, compliance, and safety work, that is not a harmless drafting issue. It can create false findings, false assurance, wasted review time, and misplaced confidence.</p>
          <p>The control is simple in principle, but often missing in practice:</p>
          <p className="font-semibold text-white">AI output must be checked against the source before it is relied on.</p>
          <blockquote className="border-l-2 border-cyan-300/70 py-2 pl-6 text-2xl font-medium leading-9 text-cyan-100">Confident output is not evidence.</blockquote>
          <p>If the output cites a regulation, the regulation must be checked.</p>
          <p>If it summarises a procedure, the procedure must be checked.</p>
          <p>If it proposes a control, the control must be assessed by someone competent to judge whether it is suitable for the operation.</p>
          <p>If it drafts safety management content, the company must still decide whether that content is correct, controlled, and approved.</p>

          <h2 className="pt-8 text-3xl font-semibold tracking-tight text-white">The Third Misunderstanding: Accountability Moves to the Tool</h2>
          <p>AI does not take responsibility.</p>
          <p>The person using the output remains responsible for deciding whether it is suitable. The company remains responsible for the management system it operates. A vessel, department, auditor, DPA, superintendent, HSE manager, or master cannot avoid accountability by saying that a tool produced the wording.</p>
          <p>This is where maritime companies should be careful.</p>
          <p>AI can make weak work look complete. It can make uncertain work look confident. It can make generic controls look like a finished risk assessment. It can make an inexperienced user feel as though they have produced something more reliable than they actually have.</p>
          <p>That does not mean AI should never be used.</p>
          <p>It means AI should be treated as an assistant, not an authority.</p>

          <h2 className="pt-8 text-3xl font-semibold tracking-tight text-white">What Controlled Use Looks Like</h2>
          <p>A practical maritime AI governance model does not need to begin with a 40-page policy.</p>
          <p>It should begin with clear operating rules.</p>
          <p>At minimum, companies should define:</p>
          <ul className="list-disc space-y-2 pl-6"><li>approved AI tools and account types</li><li>prohibited information and upload rules</li><li>permitted and prohibited task types</li><li>review requirements for AI-supported outputs</li><li>source verification requirements</li><li>document control requirements</li><li>record retention where AI materially supports a decision or controlled document</li><li>competence expectations for users and reviewers</li></ul>
          <p>The strongest control is not the tool itself. It is the workflow around it.</p>
          <blockquote className="border-l-2 border-cyan-300/70 py-2 pl-6 text-2xl font-medium leading-9 text-cyan-100">The strongest control is not the tool itself. It is the workflow around it.</blockquote>
          <section className="rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.05] p-6 sm:p-8" aria-labelledby="governance-workflow-heading">
            <h3 id="governance-workflow-heading" className="text-2xl font-semibold tracking-tight text-white">A Practical Governance Workflow</h3>
            <p className="mt-3 text-white/65">The workflow can be expressed through four connected controls:</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[['CONTROL', 'Define the approved tool, permitted task and information boundaries.'], ['VERIFY', 'Check claims and proposed controls against the authoritative source and operational context.'], ['APPROVE', 'Require a competent person with the proper authority to accept or reject the output.'], ['RECORD', 'Retain the evidence, review and document history where the output affects a controlled decision or document.']].map(([label, explanation]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-bold tracking-[0.2em] text-cyan-200">{label}</p>
                  <p className="mt-3 text-sm leading-6 text-white/65">{explanation}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 font-medium text-white">Human and organisational accountability applies throughout every stage. It does not appear only at the end of the process.</p>
          </section>
          <p>For example, using AI to improve the readability of a toolbox talk is a different risk from using AI to generate the underlying task risk assessment. Summarising a public guidance note is different from uploading an incident report. Drafting general training prompts is different from asking AI to classify audit findings against a code or regulation.</p>
          <p>Those differences matter.</p>
          <p>A governance system should separate low-risk support tasks from tasks that could affect safety, compliance, legal exposure, client confidentiality, or operational decision-making.</p>
          <blockquote className="border-l-2 border-cyan-300/70 py-2 pl-6 text-2xl font-medium leading-9 text-cyan-100">AI should be treated as an assistant, not an authority.</blockquote>

          <h2 className="pt-8 text-3xl font-semibold tracking-tight text-white">A Simple Control Test</h2>
          <p>Before using AI in maritime QHSE, SMS, audit, or operational assurance work, the user should be able to answer four questions:</p>
          <ol className="list-decimal space-y-2 pl-6"><li>Am I allowed to enter this information into this tool?</li><li>Is this the right type of tool and account for this task?</li><li>What source will I check the output against?</li><li>Who remains responsible if this output is used?</li></ol>
          <p>If those questions cannot be answered, the task is not controlled.</p>

          <h2 className="pt-8 text-3xl font-semibold tracking-tight text-white">The Real Risk Is False Assurance</h2>
          <p>The danger is not that AI makes a spelling mistake.</p>
          <p>The danger is that AI-supported work enters the business looking complete, reviewed, and authoritative when it has not been properly verified.</p>
          <p>That matters in maritime because many documents are not just documents. They are part of a safety management system. They shape work planning, risk control, training, audits, investigations, corrective action, and management review.</p>
          <p>If AI helps draft or review that material, the company needs to know where the output came from, what source supports it, and who checked it.</p>
          <p>Otherwise, the company may create the appearance of control without the substance of control.</p>

          <h2 className="pt-12 text-3xl font-semibold tracking-tight text-white">The Operational Dilemma</h2>
          <img src="/images/maritime-ai-governance-dilemma.jpg" alt="Master reviewing an officer's hours-of-rest disclosure and compliance records" className="my-8 aspect-[16/9] w-full rounded-3xl object-cover" />
          <p>A deck officer hands the Master a written statement.</p>
          <p>For the past two weeks, the officer has been signing rest hour records showing full STCW compliance while actually working beyond legal limits. The vessel is short-handed, the watch schedule is stretched, and the officer has been covering gaps to keep operations moving.</p>
          <p>He is now dangerously fatigued and afraid he will make a navigation error. He comes clean because he would rather face discipline than cause a collision.</p>
          <p>The vessel docks tomorrow for port state control. The rest hour records will be audited. The SMS requires immediate reporting of falsified legal records, disciplinary action, and correction of the official record.</p>
          <p>The Master now has two bad options.</p>
          <div className="overflow-x-auto rounded-2xl border border-white/10"><table className="min-w-full border-collapse text-left text-sm leading-6"><thead className="bg-white/[0.06] text-white"><tr><th className="px-5 py-4 font-semibold">Option</th><th className="px-5 py-4 font-semibold">Immediate Outcome</th><th className="px-5 py-4 font-semibold">Governance Risk</th></tr></thead><tbody className="divide-y divide-white/10 text-white/65">{[["Correct the records, stand the officer down, and follow the SMS.", "The record becomes honest. The vessel may face a clear STCW violation, possible detention, and operational disruption. The officer may be disciplined for admitting the truth.", "The crew may learn that honesty destroys the person who reports the problem, making future fatigue reporting less likely."], ["Protect the officer, adjust the watch schedule quietly, and leave the records unchanged.", "The vessel may pass inspection. The officer keeps his job and the crew sees that coming forward is protected.", "The Master has knowingly retained falsified legal records. If discovered, the issue becomes concealment, not just fatigue management."]].map(([option, outcome, risk]) => <tr key={option}><td className="px-5 py-4 align-top font-medium text-white">{option}</td><td className="px-5 py-4 align-top">{outcome}</td><td className="px-5 py-4 align-top">{risk}</td></tr>)}</tbody></table></div>
          <p>That is the governance problem.</p>
          <p>A system that only punishes the falsified record may discourage the next exhausted officer from speaking up. But a system that protects honesty by preserving false records destroys the integrity of the SMS and exposes the Master to personal liability.</p>
          <p>Good governance has to deal with both truths at the same time: falsified legal records cannot be ignored, and fatigue reporting cannot be treated as betrayal. If the only available choices are concealment or career destruction, the system has already failed before the officer walks into the Master’s office.</p>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8" aria-labelledby="key-takeaways-heading">
            <h2 id="key-takeaways-heading" className="text-3xl font-semibold tracking-tight text-white">Key Takeaways</h2>
            <ul className="mt-5 list-disc space-y-3 pl-6 text-white/70">
              <li>Maritime AI governance is a management-system issue, not simply an IT issue.</li>
              <li>Existing safety management controls already provide much of the necessary governance framework.</li>
              <li>AI-supported outputs must be verified against authoritative sources and the actual operational context.</li>
              <li>Accountability remains with the people and organisation using the output.</li>
              <li>Practical operating controls matter more than lengthy AI policies.</li>
            </ul>
          </section>

          <h2 className="pt-8 text-3xl font-semibold tracking-tight text-white">Conclusion</h2>
          <p>Maritime companies do not need to wait for AI-specific IMO guidance before acting.</p>
          <p>The basic control problem is already visible.</p>
          <p>AI use should be governed through the same principles that already apply to safety management and assurance: controlled information, competent people, verified sources, approved documents, clear accountability, and evidence where evidence matters.</p>
          <p>The companies that handle this well will not be the ones with the longest AI policy.</p>
          <p>They will be the ones that make AI use visible, controlled, and reviewable before it affects operational work.</p>
          <p>AI will continue to evolve. The principles of good governance will not. Companies that embed AI within their existing management systems, rather than allowing it to operate alongside them as an informal parallel process, will be better placed to use the technology safely, consistently and with confidence.</p>
        </div>
      </article>

      <GroupFooter />
    </main>
  );
}

function PhillipAuthorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Phillip Inzaghi",
    jobTitle: "Founder and Director, AxiomOrdo Ltd; Founder, Meriden Compliance",
    url: `${SITE_URL}/authors/phillip-inzaghi`,
    worksFor: {
      "@type": "Organization",
      name: "AxiomOrdo Ltd",
      url: SITE_URL,
    },
    knowsAbout: [
      "Maritime QHSE",
      "ISM Code",
      "Audit and assurance",
      "Regulatory intelligence",
      "Evidence provenance",
      "AI governance",
    ],
  };

  return (
    <main className="min-h-screen text-white" style={{ background: "#050810" }}>
      <PageSeo
        title="Phillip Inzaghi | Meriden Compliance Author"
        description="Author profile for Phillip Inzaghi, Founder and Director of AxiomOrdo Ltd and Founder of Meriden Compliance."
        canonicalPath="/authors/phillip-inzaghi"
        schema={schema}
      />
      <GroupNav />

      <section className="mx-auto grid max-w-7xl gap-16 px-5 pb-20 pt-36 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:pb-28 lg:pt-44">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Author
          </p>
          <h1 className="mt-5 text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl">
            Phillip Inzaghi
          </h1>
          <p className="mt-5 text-xl leading-8 text-white/55">
            Founder and Director, AxiomOrdo Ltd
            <br />
            Founder, Meriden Compliance
            <br />
            Maritime QHSE Specialist
            <br />
            Compliance and Assurance Consultant
          </p>
        </div>
        <div className="space-y-7 text-lg leading-8 text-white/58">
          <p>
            Phillip Inzaghi writes on compliance intelligence, maritime QHSE,
            AI governance, regulatory source validation, auditability, provenance,
            and operational decision support.
          </p>
          <p>
            His articles are developed from real operational judgement and
            reviewed against authoritative sources. First-hand experience is used
            only where relevant and is not treated as a substitute for law,
            regulation, official guidance, or applicable standards.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {[
              "ISM Lead Auditor",
              "Officer of the Watch",
              "Maritime QHSE",
              "Operational Assurance",
              "Regulatory Intelligence",
              "Evidence Provenance",
            ].map((item) => (
              <span key={item} className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/55">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
            Article Areas
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {insightHubs.map((hub) => (
              <Link
                key={hub.slug}
                to={`${MERIDEN_INSIGHTS_PATH}/${hub.slug}`}
                className="rounded-2xl border border-white/8 bg-[#050810] p-6 transition hover:border-cyan-300/35"
              >
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  {hub.shortTitle}
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/45">
                  {hub.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <GroupFooter />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AxiomOrdo Group Home
// ─────────────────────────────────────────────────────────────────────────────

function AxiomOrdoHome() {
  return (
    <main className="text-white" style={{ background: "#050810" }}>
      <GroupNav />

      {/* ── Hero ── */}
      <section className="relative min-h-screen overflow-hidden">
        <img
          src="/images/axiomordo-evidence-engine.jpg"
          alt="Regulatory intelligence operations"
          className="motion-drift absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,16,0.97)_0%,rgba(5,8,16,0.78)_45%,rgba(5,8,16,0.25)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#050810] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-16 pt-32 sm:px-8">
          <div className="max-w-3xl">
            <img
              src="/images/axiomordo-logo.png"
              alt="AxiomOrdo"
              className="motion-fade h-16 w-auto brightness-0 invert"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <h1 className="motion-fade mt-8 text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">
              Regulatory intelligence
              <br />
              <span className="text-white/50">built for the domain.</span>
            </h1>
            <p className="motion-fade mt-7 max-w-2xl text-xl leading-8 text-white/60 sm:text-2xl sm:leading-9">
              Nine specialist platforms. One group. One open standard.
              AxiomOrdo converts fragmented evidence into defensible regulatory
              positions — across emissions, safety, product compliance, and fire
              safety.
            </p>
            <div className="motion-fade mt-10 flex flex-col gap-4 sm:flex-row">
              <CTA to="#platforms">Explore our platforms</CTA>
              <CTA to={ARDS_URL} isExternal secondary>
                Our Standard — ARDS
              </CTA>
            </div>
          </div>
        </div>
      </section>

      {/* ── Group Description ── */}
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-32">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/40">
            The Group
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Structured evidence.
            <br />
            Calculated exposure.
            <br />
            Defensible decisions.
          </h2>
        </div>
        <div className="space-y-7 text-lg leading-8 text-white/55">
          <p>
            AxiomOrdo builds regulatory intelligence platforms for high-consequence
            domains. Every platform maps obligations against evidence, produces a
            live regulatory position, and preserves the source trail that makes
            that position defensible.
          </p>
          <p>
            Each platform is purpose-built for its domain — but all are structured
            on a common foundation: the AxiomOrdo Regulatory Data Standard (ARDS),
            the open schema for machine-readable regulatory intelligence.
          </p>
          <p>
            From PFAS product compliance to EU emissions trading, from fire safety
            records to maritime QHSE — AxiomOrdo platforms are built by domain
            experts, for domain experts.
          </p>
        </div>
      </section>

      {/* ── Platform Grid ── */}
      <section id="platforms" className="py-24 sm:py-32" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
            Our Platforms
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Nine platforms. Each one built for a specific regulatory domain.
          </h2>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <Link
                key={brand.key}
                to={brand.href}
                className="group flex flex-col justify-between rounded-2xl border border-white/8 p-7 transition hover:border-white/20"
                style={{
                  background: `linear-gradient(145deg, ${brand.color}12 0%, rgba(255,255,255,0.02) 100%)`,
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
                      style={{
                        background: `${brand.color}28`,
                        color: brand.accent,
                      }}
                    >
                      {brand.label}
                    </span>
                    {unreleasedBrandKeys.has(brand.key) && (
                      <span className="ml-auto mr-4 text-[10px] font-medium uppercase tracking-[0.16em] text-white/35">
                        In development
                      </span>
                    )}
                    <span
                      className="text-lg font-light transition group-hover:translate-x-1"
                      style={{ color: brand.accent }}
                    >
                      →
                    </span>
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">
                    {brand.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/45">
                    {brand.tagline}
                  </p>
                </div>
                <div className="mt-7">
                  <div
                    className="h-0.5 w-full rounded-full opacity-40"
                    style={{ background: brand.accent }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARDS Standard Callout ── */}
      <section className="py-24 sm:py-32" style={{ background: "#050810" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div
            className="rounded-[2.5rem] p-10 sm:p-16"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(167,139,250,0.25)",
            }}
          >
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: "#a78bfa" }}>
                  The Standard
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  AxiomOrdo Regulatory Data Standard
                </h2>
                <p className="mt-5 max-w-2xl text-lg leading-7 text-white/55">
                  ARDS is the open schema that every AxiomOrdo platform is built
                  on. It defines how regulatory obligations, evidence, and
                  compliance positions are structured — making intelligence
                  portable, comparable, and machine-readable.
                </p>
              </div>
              <div className="shrink-0">
                <a
                  href={ARDS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full px-8 py-4 text-sm font-semibold transition hover:opacity-90"
                  style={{ background: "#a78bfa", color: "#000" }}
                >
                  Explore ARDS →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Founder Credentials ── */}
      <section
        className="border-t border-white/8 py-24 sm:py-32"
        style={{ background: "rgba(255,255,255,0.015)" }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
                Founded On
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Domain knowledge.
                <br />
                Not consulting it.
              </h2>
            </div>
            <div className="space-y-6 text-lg leading-8 text-white/55">
              <p>
                AxiomOrdo was founded by an ISM Lead Auditor and Officer of the
                Watch with 20+ years of maritime QHSE experience — not a
                technology background looking for a compliance market.
              </p>
              <p>
                Every platform, every obligation mapping, and every classification
                rule is built from operational reality: ISM Code audits, port
                state control inspections, STCW compliance, MLC 2006 management,
                and hands-on engagement with the regulatory frameworks our
                platforms serve.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "ISM Lead Auditor",
                  "OOW CoC",
                  "20+ years maritime QHSE",
                  "ISM Code",
                  "STCW",
                  "MLC 2006",
                  "PSC",
                ].map((cred) => (
                  <span
                    key={cred}
                    className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-white/55"
                  >
                    {cred}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <GroupFooter />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App Router
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SpeedInsights />
      <Routes>
        {/* Group home */}
        <Route path="/" element={<AxiomOrdoHome />} />

        {/* ARDS Standard */}
        <Route path="/ards" element={<ARDSPage />} />

        {/* Meriden Compliance Insights */}
        <Route path={MERIDEN_INSIGHTS_PATH} element={<InsightsIndexPage />} />
        {insightHubs.map((hub) => (
          <Route
            key={hub.slug}
            path={`${MERIDEN_INSIGHTS_PATH}/${hub.slug}`}
            element={<InsightHubPage hub={hub} />}
          />
        ))}
        {placeholderArticles.map((article) => {
          const hub = insightHubs.find((item) => item.slug === article.category);
          return hub ? (
            <Route
              key={article.slug}
              path={`${MERIDEN_INSIGHTS_PATH}/${hub.slug}/${article.slug}`}
              element={<PlaceholderArticlePage hub={hub} article={article} />}
            />
          ) : null;
        })}
        <Route path="/authors/phillip-inzaghi" element={<PhillipAuthorPage />} />

        {/* Brand sub-sites */}
        {brands.map((brand) =>
          brand.key === "meriden" ? (
            <Route key={brand.key} path={brand.href} element={<MeridenPage />} />
          ) : unreleasedBrandKeys.has(brand.key) ? (
            <Route key={brand.key} path={brand.href} element={<BrandPlaceholderPage brand={brand} />} />
          ) : (
            <Route key={brand.key} path={brand.href} element={<BrandPage brand={brand} />} />
          )
        )}

        {/* Legacy redirects */}
        <Route path="/meriden" element={<Navigate to={MERIDEN_PATH} replace />} />
        <Route path="/insights" element={<Navigate to={MERIDEN_INSIGHTS_PATH} replace />} />
        {insightHubs.map((hub) => (
          <Route
            key={`legacy-${hub.slug}`}
            path={`/insights/${hub.slug}`}
            element={<Navigate to={`${MERIDEN_INSIGHTS_PATH}/${hub.slug}`} replace />}
          />
        ))}
        <Route path="/eudr" element={<Navigate to="/sentinel" replace />} />
        <Route path="/clearline" element={<Navigate to="/clearmark" replace />} />
        <Route path="/pfas" element={<Navigate to="/clearmark" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
