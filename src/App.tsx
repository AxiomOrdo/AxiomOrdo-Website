import { FormEvent, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Capability = { title: string; desc: string };

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
    tagline: "Regulatory obligation, mapped. Nothing missed.",
    description:
      "Enterprise compliance management that converts regulatory requirements into tracked obligations — with live evidence mapping and gap analysis.",
    color: "#0369a1",
    accent: "#38bdf8",
    href: "/sentinel",
    label: "Compliance",
    hero: "Every obligation tracked. Every gap visible.",
    subline:
      "Sentinel converts regulatory text into discrete, trackable obligations — mapping requirements to evidence, flagging gaps, and maintaining a live compliance position across your operations.",
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
    href: "/meriden",
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

// ─────────────────────────────────────────────────────────────────────────────
// ARDS — The Standard (standalone site, separate from axiomordo.com)
// ─────────────────────────────────────────────────────────────────────────────

const ARDS_URL = "https://axiomordo-ards-lulc0xzaw-inzaghiphil-creators-projects.vercel.app/";

const ards = {
  name: "ARDS",
  fullName: "AxiomOrdo Regulatory Data Standard",
  color: "#7c3aed",
  accent: "#a78bfa",
  tagline: "The open standard for machine-readable regulatory intelligence.",
  href: ARDS_URL,
};

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
              Part of the AxiomOrdo Group
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link
            to="/"
            className="hidden text-white/55 transition hover:text-white/80 sm:inline"
          >
            ← AxiomOrdo Group
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
            className="h-8 w-auto brightness-0 invert"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight">AxiomOrdo</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-white/45">
              Regulatory Intelligence Group
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          <a href={ARDS_URL} target="_blank" rel="noopener noreferrer" className="hidden text-white/65 transition hover:text-white sm:inline">
            ARDS Standard
          </a>
          <Link
            to="/meriden"
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
                  Part of the AxiomOrdo Group
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-white">AxiomOrdo Group</p>
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
            <a href={ARDS_URL} target="_blank" rel="noopener noreferrer" className="transition hover:text-white/65">
              ARDS Standard
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
          © {new Date().getFullYear()} AxiomOrdo Group. All rights reserved.
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

// ─────────────────────────────────────────────────────────────────────────────
// ClearMark — Extended page with Decision System + Form
// ─────────────────────────────────────────────────────────────────────────────

function ClearMarkPage() {
  const brand = brands.find((b) => b.key === "clearmark")!;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.currentTarget.reset();
    window.alert(
      "Thanks. We'll follow up with SKU list instructions and the audit scope within one business day."
    );
  }

  return (
    <main className="text-white" style={{ background: "#050810" }}>
      <BrandNav brand={brand} cta={brand.cta} />

      {/* ── Hero ── */}
      <section className="relative min-h-screen overflow-hidden">
        <img
          src="/images/clearline-pfas-inventory.jpg"
          alt="PFAS product inventory"
          className="motion-drift absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.96)_0%,rgba(2,6,23,0.75)_45%,rgba(2,6,23,0.15)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050810] to-transparent" />
        <div className="motion-scan absolute left-0 top-0 h-px w-full bg-cyan-400/50" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-16 pt-32 sm:px-8">
          <div className="max-w-3xl">
            <p className="motion-fade text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              PFAS · Part of the AxiomOrdo Group
            </p>
            <h1 className="motion-fade mt-5 text-5xl font-semibold tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl">
              Know your PFAS exposure before someone asks.
            </h1>
            <p className="motion-fade mt-7 max-w-2xl text-xl leading-8 text-white/65 sm:text-2xl sm:leading-9">
              ClearMark turns SKU lists and supplier evidence into clear PFAS
              decisions — before retailers or regulators force the timetable.
            </p>
            <div className="motion-fade mt-10 flex flex-col gap-4 sm:flex-row">
              <CTA to="#start" isExternal accentColor="#22d3ee">
                Start with your SKU list
              </CTA>
              <CTA to="#offer" isExternal secondary accentColor="#22d3ee">
                Book PFAS Readiness Audit
              </CTA>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:py-32">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
            The Problem
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            1,000 SKUs does not mean 1,000 PFAS problems.
          </h2>
        </div>
        <div className="space-y-7 text-lg leading-8 text-white/60">
          <p>
            PFAS pressure usually arrives as a short deadline: a retailer
            questionnaire or a regulatory request. The risk is not knowing which
            SKUs are defensible and which require testing or reformulation.
          </p>
          <p className="text-xl font-semibold text-white">
            You need a way to group, triage, and defend decisions fast.
          </p>
        </div>
      </section>

      {/* ── Decision System ── */}
      <section className="py-24 sm:py-32" style={{ background: "rgba(255,255,255,0.025)" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
            The Classification
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            The ClearMark Decision System
          </h2>
          <div className="mt-16 divide-y divide-white/10 border-y border-white/10">
            {pfasDecisions.map((d) => (
              <div
                key={d.label}
                className="grid items-center gap-6 py-10 lg:grid-cols-[10rem_12rem_1fr]"
              >
                <span className={`border-l-4 pl-5 text-2xl font-bold ${d.tone}`}>
                  {d.label}
                </span>
                <span className="text-xl font-semibold tracking-tight text-white">
                  {d.outcome}
                </span>
                <p className="max-w-2xl leading-7 text-white/55">{d.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="py-24 sm:py-32" style={{ background: "#050810" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
            Capabilities
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            What ClearMark delivers.
          </h2>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {brand.capabilities.map((cap) => (
              <div
                key={cap.title}
                className="rounded-2xl border border-white/8 p-7"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="mb-4 h-1 w-8 rounded-full bg-cyan-400" />
                <h3 className="text-base font-semibold text-white">{cap.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Offer / Pricing ── */}
      <section id="offer" className="py-24 sm:py-32" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div
            className="grid gap-10 rounded-[2.5rem] p-10 sm:p-16 lg:grid-cols-[1fr_auto] lg:items-center"
            style={{
              background: "linear-gradient(135deg, rgba(8,145,178,0.15) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(34,211,238,0.25)",
            }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
                Entry Offer
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                PFAS Readiness Audit
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-7 text-white/55">
                A focused first pass over your inventory to identify where PFAS
                exposure sits and produce a defensible action map.
              </p>
              <div className="mt-7 flex items-baseline gap-4">
                <span className="text-5xl font-bold tracking-tight text-white">
                  £6,500
                </span>
                <span className="text-white/40 font-medium">starting price</span>
              </div>
            </div>
            <div className="flex flex-col items-start gap-4">
              <a
                href="#start"
                className="inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold text-black transition hover:opacity-90"
                style={{ background: "#22d3ee" }}
              >
                Book Your Audit
              </a>
              <p className="text-xs text-white/35">
                Protected revenue. Reduced testing spend. Regulator readiness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ARDS Badge ── */}
      <div style={{ background: "#050810" }}>
        <ARDSBadge accentColor="#22d3ee" />
      </div>

      {/* ── Form ── */}
      <section id="start" className="py-24 sm:py-32" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-400">
              Get Started
            </p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Start with your SKU list.
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/55">
              Leave with a defensible PFAS action map. ClearMark is PFAS
              exposure readiness, powered by AxiomOrdo.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid gap-5 rounded-[2.5rem] bg-white p-8 sm:p-10 shadow-2xl"
          >
            <div className="grid gap-4">
              <input
                required
                placeholder="Name"
                className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                required
                type="email"
                placeholder="Work Email"
                className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                placeholder="Company"
                className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <select className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                <option>Under 250 SKUs</option>
                <option>250 – 1,000 SKUs</option>
                <option>1,000+ SKUs</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-full py-4 text-sm font-semibold text-black transition hover:opacity-90"
              style={{ background: "#22d3ee" }}
            >
              Start Readiness Audit
            </button>
            <p className="text-center text-xs text-slate-400">
              We'll respond within one business day.
            </p>
          </form>
        </div>
      </section>

      <GroupFooter brand={brand} />
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Meriden Compliance — Extended with pricing
// ─────────────────────────────────────────────────────────────────────────────

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
              Maritime SME · Part of the AxiomOrdo Group
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
                Start Free 30-Day Trial
              </CTA>
              <CTA to="/" secondary accentColor="#60a5fa">
                AxiomOrdo Group
              </CTA>
            </div>
          </div>
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
      <Routes>
        {/* Group home */}
        <Route path="/" element={<AxiomOrdoHome />} />

        {/* ARDS Standard */}
        <Route path="/ards" element={<ARDSPage />} />

        {/* Brand sub-sites */}
        {brands.map((brand) =>
          brand.key === "clearmark" ? (
            <Route key={brand.key} path={brand.href} element={<ClearMarkPage />} />
          ) : brand.key === "meriden" ? (
            <Route key={brand.key} path={brand.href} element={<MeridenPage />} />
          ) : (
            <Route key={brand.key} path={brand.href} element={<BrandPage brand={brand} />} />
          )
        )}

        {/* Legacy redirects */}
        <Route path="/clearline" element={<Navigate to="/clearmark" replace />} />
        <Route path="/pfas" element={<Navigate to="/clearmark" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
