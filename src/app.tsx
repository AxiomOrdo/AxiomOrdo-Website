import { FormEvent, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";

// ─── Shared Types ────────────────────────────────────────────────────────────

type SiteKey =
  | "axiomordo"
  | "clearline"
  | "golden-thread"
  | "meriden"
  | "ards"
  | "cbam"
  | "fueleu";

// ─── Product Registry ────────────────────────────────────────────────────────

const products = [
  {
    key: "clearline",
    name: "ClearLine",
    tagline: "PFAS Product Evidence",
    description:
      "Know your PFAS exposure before a retailer or regulator forces the timetable. SKU-level evidence classification in 10 business days.",
    accent: "#22d3ee",
    accentDark: "#0891b2",
    href: "/clearline",
    label: "PFAS",
  },
  {
    key: "golden-thread",
    name: "Golden Thread",
    tagline: "Asset Evidence & Traceability",
    description:
      "A continuous, unbroken evidence chain from design intent to operational reality. Every asset, every decision, defensible.",
    accent: "#f59e0b",
    accentDark: "#d97706",
    href: "/golden-thread",
    label: "Assets",
  },
  {
    key: "meriden",
    name: "Meriden Compliance",
    tagline: "Maritime QHSE",
    description:
      "Structured quality, health, safety and environment compliance for maritime operations. Evidence-led, audit-ready.",
    accent: "#60a5fa",
    accentDark: "#2563eb",
    href: "/meriden",
    label: "Maritime",
  },
  {
    key: "ards",
    name: "ARDS",
    tagline: "AxiomOrdo Regulatory Data Standard",
    description:
      "The language of regulatory evidence. Own the standard, control the narrative, sell the trust.",
    accent: "#a78bfa",
    accentDark: "#7c3aed",
    href: "/ards",
    label: "Standard",
  },
  {
    key: "cbam",
    name: "CBAM",
    tagline: "Carbon Border Adjustment Mechanism",
    description:
      "Structured carbon evidence for cross-border trade. Classification, documentation and reporting powered by the AxiomOrdo engine.",
    accent: "#fb923c",
    accentDark: "#c2410c",
    href: "/cbam",
    label: "Carbon",
  },
  {
    key: "fueleu",
    name: "FuelEU",
    tagline: "Operational Fuel Evidence",
    description:
      "FuelEU Maritime compliance through structured operational evidence. Verified fuel data, vessel-level reporting, regulator-ready.",
    accent: "#4ade80",
    accentDark: "#16a34a",
    href: "/fueleu",
    label: "Fuel",
  },
];

// ─── Shared Components ───────────────────────────────────────────────────────

function Nav({
  site,
  accent = "#22d3ee",
}: {
  site: SiteKey;
  accent?: string;
}) {
  const isHome = site === "axiomordo";
  const product = products.find((p) => p.key === site);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/25 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 text-white sm:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <img
            src="/images/axiomordo-logo.png"
            alt="AxiomOrdo Logo"
            className="h-8 w-auto brightness-0 invert"
          />
          <div className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight">
              {isHome ? "AxiomOrdo" : product?.name ?? site}
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-white/60">
              {isHome ? "Evidence Engine" : "Powered by AxiomOrdo"}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          {!isHome && (
            <Link
              to="/"
              className="hidden text-white/70 transition hover:text-white sm:inline"
            >
              AxiomOrdo
            </Link>
          )}
          <Link
            to={isHome ? "/ards" : "/"}
            className="rounded-full border border-white/20 px-5 py-2 text-white transition hover:border-white/40 hover:bg-white/10"
          >
            {isHome ? "Our Standard" : "All Products"}
          </Link>
        </div>
      </nav>
    </header>
  );
}

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
  const baseClass =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const themeClass = secondary
    ? "border border-current bg-transparent hover:bg-white/10"
    : "bg-white text-slate-950 hover:bg-slate-100 focus:ring-white";

  const style =
    !secondary && accentColor
      ? { backgroundColor: accentColor, color: "#0a0a0a" }
      : undefined;

  if (isExternal || to.startsWith("#")) {
    return (
      <a href={to} className={`${baseClass} ${themeClass}`} style={style}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={`${baseClass} ${themeClass}`} style={style}>
      {children}
    </Link>
  );
}

function Footer({ accent = "#22d3ee" }: { accent?: string }) {
  return (
    <footer className="border-t border-white/10 bg-black/30 py-12 text-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/axiomordo-logo.png"
              alt="AxiomOrdo"
              className="h-7 w-auto brightness-0 invert opacity-70"
            />
            <div className="leading-tight">
              <span className="block text-sm font-semibold text-white/80">
                AxiomOrdo
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-white/40">
                Evidence Engine
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/50">
            {products.map((p) => (
              <Link
                key={p.key}
                to={p.href}
                className="transition hover:text-white"
              >
                {p.name}
              </Link>
            ))}
          </div>
        </div>
        <p className="mt-10 text-xs text-white/30">
          © {new Date().getFullYear()} AxiomOrdo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ─── Scroll Restoration ──────────────────────────────────────────────────────

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

// ─── 1. AxiomOrdo Home — Parent Hub ─────────────────────────────────────────

function AxiomOrdoSite() {
  return (
    <main className="bg-[#070b12] text-white">
      <Nav site="axiomordo" />

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden">
        <img
          src="/images/axiomordo-evidence-engine.jpg"
          alt="Evidence engineering"
          className="motion-drift absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,6,23,0.97)_0%,rgba(2,6,23,0.8)_50%,rgba(2,6,23,0.2)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#070b12] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-16 pt-28 sm:px-8">
          <div className="max-w-4xl">
            <img
              src="/images/axiomordo-logo.png"
              alt="AxiomOrdo"
              className="motion-fade h-16 w-auto brightness-0 invert"
            />
            <h1 className="motion-fade mt-10 text-5xl font-semibold tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl">
              The Authority in
              <br />
              <span className="text-cyan-400">Product Evidence</span>
            </h1>
            <p className="motion-fade mt-6 max-w-2xl text-xl leading-8 text-slate-300 sm:text-2xl">
              A deterministic evidence engine for product, asset, and
              operational classification. Built for high-consequence domains
              where every decision must be explainable.
            </p>
            <div className="motion-fade mt-10 flex flex-col gap-4 sm:flex-row">
              <CTA to="/ards">Our Standard — ARDS</CTA>
              <CTA to="/clearline" secondary>
                Explore ClearLine PFAS
              </CTA>
            </div>
          </div>
        </div>
      </section>

      {/* Engine description */}
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:py-32">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-400">
            The Engine
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Structured inputs.
            <br />
            Fixed reasoning.
            <br />
            Defensible outputs.
          </h2>
        </div>
        <div className="space-y-7 text-lg leading-8 text-slate-300">
          <p>
            AxiomOrdo converts fragmented product, supplier, component, and
            operational evidence into structured decision records. Every
            classification is produced from explicit rules applied to versioned
            evidence.
          </p>
          <p>
            The engine is deterministic by design. No probabilistic guessing.
            No AI black boxes. Every output carries its source trail — what
            evidence was used, what was missing, what rule applied, and why the
            conclusion was reached.
          </p>
          <p className="border-l-2 border-cyan-400 pl-6 text-xl font-semibold text-white">
            If you cannot explain a decision, you cannot defend it. AxiomOrdo
            makes every decision explainable.
          </p>
        </div>
      </section>

      {/* Product grid */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:pb-32">
        <div className="mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-400">
            Powered Verticals
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
            One engine.
            <br />
            Dedicated operations.
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.key}
              to={product.href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition hover:border-white/20 hover:bg-white/8"
            >
              <div
                className="mb-4 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{
                  backgroundColor: product.accent + "22",
                  color: product.accent,
                }}
              >
                {product.label}
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-white">
                {product.name}
              </h3>
              <p
                className="mt-1 text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: product.accent }}
              >
                {product.tagline}
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                {product.description}
              </p>
              <p
                className="mt-6 text-sm font-semibold transition group-hover:translate-x-1"
                style={{ color: product.accent }}
              >
                Explore →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ARDS banner */}
      <section className="border-t border-white/10 bg-gradient-to-b from-[#0d0d1a] to-[#070b12] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="rounded-3xl border border-violet-500/20 bg-violet-950/30 p-10 sm:p-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
              The Foundation
            </p>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              AxiomOrdo Regulatory
              <br />
              Data Standard
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">
              ARDS is the common language across every AxiomOrdo vertical. A
              structured data standard for regulatory evidence that removes
              ambiguity, enforces traceability, and makes compliance
              commercially defensible.
            </p>
            <div className="mt-10">
              <CTA to="/ards" accentColor="#a78bfa">
                Own the Language →
              </CTA>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// ─── 2. ClearLine PFAS ───────────────────────────────────────────────────────

const pfasDecisions = [
  {
    label: "Green",
    outcome: "Clear",
    detail:
      "Evidence is sufficient to support continued sale or supply without immediate PFAS testing.",
    tone: "border-emerald-400 text-emerald-400",
  },
  {
    label: "Amber",
    outcome: "Investigate",
    detail:
      "Evidence gaps remain at component, supplier, material, finish, or documentation level and require targeted follow-up.",
    tone: "border-amber-400 text-amber-400",
  },
  {
    label: "Red",
    outcome: "Restrict",
    detail:
      "The product cannot currently be defended and should be held, remediated, or tested before exposure increases.",
    tone: "border-rose-400 text-rose-400",
  },
];

function ClearLineSite() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.currentTarget.reset();
    window.alert(
      "Thanks. ClearLine will follow up with SKU list instructions and the audit scope."
    );
  }

  return (
    <main className="bg-[#070b12] text-white">
      <Nav site="clearline" accent="#22d3ee" />

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden">
        <img
          src="/images/clearline-pfas-inventory.jpg"
          alt="PFAS Inventory"
          className="motion-drift absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.97)_0%,rgba(2,6,23,0.78)_45%,rgba(2,6,23,0.15)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#070b12] to-transparent" />
        <div className="motion-scan absolute left-0 top-0 h-px w-full bg-cyan-400/40" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-16 pt-28 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
              Powered by AxiomOrdo
            </p>
            <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              Know your PFAS exposure
              <br />
              <span className="text-cyan-400">before someone asks.</span>
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-8 text-slate-300">
              ClearLine turns SKU lists and supplier evidence into clear PFAS
              decisions — before retailers or regulators force the timetable.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <CTA to="#start" isExternal accentColor="#22d3ee">
                Start with your SKU list
              </CTA>
              <CTA to="#offer" secondary isExternal>
                Book PFAS Readiness Audit
              </CTA>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1fr] lg:py-32">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-500">
            The Problem
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Documentation fails
            <br />
            before products do.
          </h2>
          <p className="mt-8 text-lg leading-8 text-slate-400">
            The issue is rarely that documents don't exist. The issue is that
            nobody knows whether those documents can defend the product when a
            retailer, customer, or regulator asks.
          </p>
        </div>
        <div className="flex flex-col justify-center space-y-7 text-lg leading-8 text-slate-300">
          <p>
            PFAS pressure usually arrives as a short deadline: a retailer
            questionnaire, a regulator request. The risk is not knowing which
            SKUs are defensible.
          </p>
          <p className="text-2xl font-bold text-white">
            1,000 SKUs does not mean 1,000 PFAS problems. You need a way to
            group, triage, and defend decisions fast.
          </p>
        </div>
      </section>

      {/* Decision system */}
      <section className="border-y border-white/10 bg-white/3 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="mb-16 text-4xl font-semibold tracking-tight sm:text-5xl">
            The ClearLine Decision System
          </h2>
          <div className="divide-y divide-white/10">
            {pfasDecisions.map((d) => (
              <div
                key={d.label}
                className="grid items-center gap-6 py-10 lg:grid-cols-[12rem_14rem_1fr]"
              >
                <span
                  className={`border-l-4 pl-5 text-2xl font-bold ${d.tone}`}
                >
                  {d.label}
                </span>
                <span className="text-2xl font-semibold tracking-tight">
                  {d.outcome}
                </span>
                <p className="leading-7 text-slate-400">{d.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offer */}
      <section id="offer" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-12 rounded-3xl bg-slate-900 p-8 sm:p-16 lg:grid-cols-[1fr_0.7fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-400">
              Entry Offer
            </p>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              PFAS Readiness Audit
            </h2>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              A focused first pass over your inventory to identify which product
              families need evidence review, supplier follow-up, or testing.
            </p>
            <div className="mt-10 flex flex-wrap items-baseline gap-4">
              <span className="text-5xl font-bold">£6,500</span>
              <span className="text-slate-500">fixed entry scope</span>
            </div>
            <ul className="mt-6 space-y-2 text-slate-300">
              <li>→ Up to 25 representative SKUs</li>
              <li>→ or 250 component-level evidence checks</li>
              <li>→ 10-business-day turnaround</li>
            </ul>
          </div>
          <div className="flex flex-col justify-center gap-6">
            <CTA to="#start" isExternal accentColor="#22d3ee">
              Start with your SKU list
            </CTA>
            <p className="text-center text-sm text-slate-500">
              Protected revenue. Reduced testing spend. Regulator readiness.
            </p>
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section id="start" className="border-t border-white/10 bg-[#0a1628] py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Start with your SKU list.
            </h2>
            <p className="mt-8 text-xl leading-8 text-slate-400">
              Leave with a defensible PFAS action map. ClearLine is PFAS
              exposure readiness, powered by AxiomOrdo.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid gap-5 rounded-3xl bg-white/5 p-8 sm:p-10 border border-white/10"
          >
            <input
              required
              placeholder="Name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
            />
            <input
              required
              placeholder="Work Email"
              type="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-slate-500 focus:border-cyan-400/50 focus:outline-none"
            />
            <select
              required
              defaultValue=""
              className="w-full rounded-xl border border-white/10 bg-[#0a1628] px-5 py-4 text-slate-300 focus:border-cyan-400/50 focus:outline-none"
            >
              <option value="" disabled>SKU volume</option>
              <option>Under 250 SKUs</option>
              <option>250–1,000 SKUs</option>
              <option>1,000–5,000 SKUs</option>
              <option>5,000+ SKUs</option>
              <option>Not sure yet</option>
            </select>
            <select
              required
              defaultValue=""
              className="w-full rounded-xl border border-white/10 bg-[#0a1628] px-5 py-4 text-slate-300 focus:border-cyan-400/50 focus:outline-none"
            >
              <option value="" disabled>Main pressure</option>
              <option>Retailer request</option>
              <option>Customer questionnaire</option>
              <option>Regulatory concern</option>
              <option>Supplier uncertainty</option>
              <option>Internal review</option>
              <option>Not sure yet</option>
            </select>
            <button
              type="submit"
              className="w-full rounded-full bg-cyan-400 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Start with your SKU list
            </button>
          </form>
        </div>
      </section>

      <Footer accent="#22d3ee" />
    </main>
  );
}

// ─── 3. ARDS — AxiomOrdo Regulatory Data Standard ────────────────────────────

const ardsPillars = [
  {
    n: "01",
    title: "Structured Evidence",
    body:
      "Every regulatory claim maps to a defined evidence type — document, test, certification, or declaration. No ambiguity about what counts.",
  },
  {
    n: "02",
    title: "Versioned Classification",
    body:
      "Classifications are attached to versions of evidence. When evidence changes, the classification audit trail is preserved.",
  },
  {
    n: "03",
    title: "Rule Transparency",
    body:
      "Every decision follows a published rule. The rule set is versioned, traceable, and available to regulators and clients on request.",
  },
  {
    n: "04",
    title: "Interoperability",
    body:
      "ARDS-structured data exports into any compliance framework — REACH, FuelEU, CBAM, QHSE — without re-mapping.",
  },
];

function ARDSSite() {
  return (
    <main className="bg-[#0d0a1a] text-white">
      <Nav site="ards" accent="#a78bfa" />

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.25),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0d0a1a] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-16 pt-28 sm:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-violet-400">
              AxiomOrdo Regulatory Data Standard
            </p>
            <h1 className="mt-8 text-5xl font-semibold tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              Own the Language.
              <br />
              <span className="text-violet-400">Sell the Trust.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-slate-300">
              ARDS is the common evidence language across every AxiomOrdo
              vertical. A structured data standard that removes ambiguity,
              enforces traceability, and makes compliance commercially
              defensible — across PFAS, carbon, maritime, asset and fuel
              domains.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <CTA to="/" accentColor="#a78bfa">
                Explore All Verticals
              </CTA>
              <CTA to="/clearline" secondary>
                See ARDS in ClearLine
              </CTA>
            </div>
          </div>
        </div>
      </section>

      {/* What is ARDS */}
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:py-32">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-400">
            The Standard
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Regulatory evidence
            <br />
            needs a language.
          </h2>
        </div>
        <div className="space-y-7 text-lg leading-8 text-slate-300">
          <p>
            Compliance today is fragmented. Every regulator, every retailer,
            every framework demands evidence in a different format, using
            different terminology, with different standards of sufficiency.
          </p>
          <p>
            ARDS fixes this at the root. It defines what evidence is, how it is
            structured, how it is classified, and how it is versioned. Once your
            data is in ARDS format, it speaks to any compliance audience.
          </p>
          <p className="border-l-2 border-violet-400 pl-6 text-xl font-semibold text-white">
            The organisation that defines the evidence standard controls the
            compliance conversation.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-y border-white/10 bg-white/3 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="mb-16 text-4xl font-semibold tracking-tight sm:text-5xl">
            Four Pillars of ARDS
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {ardsPillars.map((p) => (
              <div
                key={p.n}
                className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-8"
              >
                <span className="font-mono text-sm text-violet-500">{p.n}</span>
                <h3 className="mt-4 text-xl font-semibold">{p.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where ARDS runs */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="mb-16">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-400">
            Powered by ARDS
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Every vertical.
            <br />
            One standard.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products
            .filter((p) => p.key !== "ards")
            .map((p) => (
              <Link
                key={p.key}
                to={p.href}
                className="group flex items-center justify-between rounded-xl border border-white/10 px-6 py-5 transition hover:border-violet-500/40 hover:bg-violet-950/20"
              >
                <div>
                  <span
                    className="block text-sm font-semibold"
                    style={{ color: p.accent }}
                  >
                    {p.label}
                  </span>
                  <span className="block font-medium text-white">{p.name}</span>
                </div>
                <span className="text-slate-600 transition group-hover:text-violet-400">
                  →
                </span>
              </Link>
            ))}
        </div>
      </section>

      <Footer accent="#a78bfa" />
    </main>
  );
}

// ─── 4. Golden Thread ─────────────────────────────────────────────────────────

const goldenThreadFeatures = [
  {
    n: "01",
    title: "Design-to-Delivery Traceability",
    body:
      "Link every asset attribute back to its original design intent. When requirements change, the thread updates — the audit trail doesn't disappear.",
  },
  {
    n: "02",
    title: "Structured Evidence at Every Handover",
    body:
      "At each handover point — design, manufacture, install, commission, operation — the Golden Thread captures what was transferred and what was verified.",
  },
  {
    n: "03",
    title: "Live Regulatory Readiness",
    body:
      "Golden Thread data is structured for immediate export to Building Safety Act, ISO 19650, and client-specific evidence requirements.",
  },
  {
    n: "04",
    title: "Incident-Proof Documentation",
    body:
      "When something goes wrong, the Golden Thread shows exactly what was known, when it was known, and who confirmed it. No gaps.",
  },
];

function GoldenThreadSite() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.currentTarget.reset();
    window.alert(
      "Thanks. The Golden Thread team will be in touch to discuss your asset evidence needs."
    );
  }

  return (
    <main className="bg-[#0f0d00] text-white">
      <Nav site="golden-thread" accent="#f59e0b" />

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_30%_40%,rgba(245,158,11,0.15),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0f0d00] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-16 pt-28 sm:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-amber-400">
              Powered by AxiomOrdo
            </p>
            <h1 className="mt-8 text-5xl font-semibold tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              Every asset.
              <br />
              <span className="text-amber-400">Every decision.</span>
              <br />
              Defensible.
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-slate-300">
              Golden Thread is a continuous, unbroken evidence chain from
              design intent to operational reality. Built for asset owners,
              project teams, and regulators who need more than a document
              folder.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <CTA to="#contact" isExternal accentColor="#f59e0b">
                Start a Golden Thread
              </CTA>
              <CTA to="/" secondary>
                Back to AxiomOrdo
              </CTA>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:py-32">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-400">
            The Problem
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Asset information
            <br />
            that you can't trust
            <br />
            is a liability.
          </h2>
        </div>
        <div className="space-y-7 text-lg leading-8 text-slate-300">
          <p>
            Most asset documentation exists. The problem is that it exists in
            disconnected fragments — design intent over here, as-built records
            over there, commissioning data somewhere on a shared drive, and no
            reliable connection between any of them.
          </p>
          <p>
            When a regulator asks whether the asset meets its original
            specification, the honest answer is usually "we think so." That is
            not a defensible position.
          </p>
          <p className="border-l-2 border-amber-400 pl-6 text-xl font-semibold text-white">
            Golden Thread replaces "we think so" with "here is the evidence,
            versioned, verified, and traceable."
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-white/10 bg-white/3 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="mb-16 text-4xl font-semibold tracking-tight sm:text-5xl">
            How the Thread Works
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {goldenThreadFeatures.map((f) => (
              <div
                key={f.n}
                className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-8"
              >
                <span className="font-mono text-sm text-amber-500">{f.n}</span>
                <h3 className="mt-4 text-xl font-semibold">{f.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Start your Golden Thread.
            </h2>
            <p className="mt-8 text-xl leading-8 text-slate-400">
              Tell us about your asset estate and evidence requirements. We'll
              scope a Golden Thread engagement tailored to your project or
              portfolio.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid gap-5 rounded-3xl bg-white/5 p-8 border border-white/10"
          >
            <input
              required
              placeholder="Name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
            />
            <input
              required
              placeholder="Work Email"
              type="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
            />
            <input
              placeholder="Project / Asset description"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-slate-500 focus:border-amber-400/50 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-full py-4 font-semibold text-slate-950 transition hover:brightness-110"
              style={{ backgroundColor: "#f59e0b" }}
            >
              Start a Golden Thread
            </button>
          </form>
        </div>
      </section>

      <Footer accent="#f59e0b" />
    </main>
  );
}

// ─── 5. Meriden Compliance — Maritime QHSE ───────────────────────────────────

const meridenServices = [
  {
    n: "01",
    title: "ISM Code Compliance",
    body:
      "Safety Management System documentation, internal audits, and DPA support structured to ISM Code requirements and flag-state expectations.",
  },
  {
    n: "02",
    title: "QHSE Evidence Management",
    body:
      "Structured quality, health, safety and environment records that survive port state control inspections and vetting audits.",
  },
  {
    n: "03",
    title: "Incident & Near-Miss Evidence",
    body:
      "Incident records that meet MAIB reporting standards and support root-cause analysis with a complete, unbroken evidence trail.",
  },
  {
    n: "04",
    title: "Regulatory Compliance Mapping",
    body:
      "MARPOL, STCW, MLC 2006, and flag-state requirements mapped to your vessel operations and documented for vetting and audit.",
  },
];

function MeridenComplianceSite() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.currentTarget.reset();
    window.alert(
      "Thanks. The Meriden Compliance team will be in touch shortly."
    );
  }

  return (
    <main className="bg-[#050d1a] text-white">
      <Nav site="meriden" accent="#60a5fa" />

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_30%,rgba(37,99,235,0.2),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#050d1a] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-16 pt-28 sm:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-blue-400">
              Powered by AxiomOrdo
            </p>
            <h1 className="mt-8 text-5xl font-semibold tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              Maritime QHSE,
              <br />
              <span className="text-blue-400">evidence-led.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-slate-300">
              Meriden Compliance delivers structured quality, health, safety and
              environment compliance for maritime operators. Built for the
              scrutiny of port state control, vetting audits, and flag-state
              inspections.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <CTA to="#contact" isExternal accentColor="#60a5fa">
                Talk to Meriden
              </CTA>
              <CTA to="/" secondary>
                Back to AxiomOrdo
              </CTA>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:py-32">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-400">
            The Standard
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Compliance that
            <br />
            survives the
            <br />
            inspection.
          </h2>
        </div>
        <div className="space-y-7 text-lg leading-8 text-slate-300">
          <p>
            Maritime compliance is a high-stakes domain. Port state control
            detentions, vetting failures, and flag-state deficiencies are not
            documentation problems — they are evidence problems. The records
            existed; they just weren't structured to withstand scrutiny.
          </p>
          <p>
            Meriden Compliance applies the AxiomOrdo evidence engine to
            maritime QHSE. Every safety record, every procedure, every incident
            report is structured, versioned, and traceable.
          </p>
          <p className="border-l-2 border-blue-400 pl-6 text-xl font-semibold text-white">
            Audit-ready is not the same as compliance-ready. Meriden makes your
            evidence compliance-ready.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="border-y border-white/10 bg-white/3 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="mb-16 text-4xl font-semibold tracking-tight sm:text-5xl">
            What Meriden Delivers
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {meridenServices.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-8"
              >
                <span className="font-mono text-sm text-blue-500">{s.n}</span>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Talk to Meriden.
            </h2>
            <p className="mt-8 text-xl leading-8 text-slate-400">
              Tell us about your vessel, fleet, or management system. We'll
              scope a compliance engagement tailored to your operational context
              and regulatory exposure.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid gap-5 rounded-3xl bg-white/5 p-8 border border-white/10"
          >
            <input
              required
              placeholder="Name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-slate-500 focus:border-blue-400/50 focus:outline-none"
            />
            <input
              required
              placeholder="Work Email"
              type="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-slate-500 focus:border-blue-400/50 focus:outline-none"
            />
            <input
              placeholder="Vessel type / fleet size"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-slate-500 focus:border-blue-400/50 focus:outline-none"
            />
            <select
              defaultValue=""
              className="w-full rounded-xl border border-white/10 bg-[#050d1a] px-5 py-4 text-slate-300 focus:border-blue-400/50 focus:outline-none"
            >
              <option value="" disabled>Main compliance concern</option>
              <option>ISM / SMS documentation</option>
              <option>Port state control preparation</option>
              <option>Vetting audit readiness</option>
              <option>Incident investigation</option>
              <option>MARPOL / environmental</option>
              <option>Not sure yet</option>
            </select>
            <button
              type="submit"
              className="w-full rounded-full py-4 font-semibold text-white transition hover:brightness-110"
              style={{ backgroundColor: "#2563eb" }}
            >
              Talk to Meriden
            </button>
          </form>
        </div>
      </section>

      <Footer accent="#60a5fa" />
    </main>
  );
}

// ─── 6. CBAM — Carbon Border Adjustment Mechanism ────────────────────────────

const cbamSteps = [
  {
    n: "01",
    title: "Embedded Carbon Mapping",
    body:
      "Map embedded carbon content at product and component level using structured supplier declarations and verified data sources.",
  },
  {
    n: "02",
    title: "CBAM Registry Preparation",
    body:
      "Generate CBAM declarant reports and supporting evidence packages structured for EU CBAM registry submission.",
  },
  {
    n: "03",
    title: "Supplier Evidence Triage",
    body:
      "Identify which suppliers have defensible carbon data and which need follow-up — before the reporting deadline arrives.",
  },
  {
    n: "04",
    title: "Ongoing Compliance Monitoring",
    body:
      "Track regulatory changes, carbon pricing shifts, and declarant obligations as CBAM moves from transition to full implementation.",
  },
];

function CBAMSite() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.currentTarget.reset();
    window.alert(
      "Thanks. The CBAM team will be in touch to discuss your carbon evidence requirements."
    );
  }

  return (
    <main className="bg-[#0f0800] text-white">
      <Nav site="cbam" accent="#fb923c" />

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_60%_30%,rgba(194,65,12,0.2),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0f0800] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-16 pt-28 sm:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-orange-400">
              Carbon Border Adjustment Mechanism
            </p>
            <h1 className="mt-8 text-5xl font-semibold tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              Carbon evidence.
              <br />
              <span className="text-orange-400">Before the deadline.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-slate-300">
              CBAM compliance is an evidence problem. AxiomOrdo structures your
              embedded carbon data, supplier declarations, and reporting
              obligations into a defensible CBAM record — before the EU
              registry demands it.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <CTA to="#contact" isExternal accentColor="#fb923c">
                Start CBAM Readiness
              </CTA>
              <CTA to="/ards" secondary>
                Our Data Standard
              </CTA>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:py-32">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">
            The Problem
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            CBAM is a
            <br />
            documentation crisis
            <br />
            in waiting.
          </h2>
        </div>
        <div className="space-y-7 text-lg leading-8 text-slate-300">
          <p>
            Most importers know they have CBAM obligations. Few have structured
            carbon evidence at the supplier and component level that the EU
            registry actually requires. The gap between knowing and proving is
            where the financial exposure sits.
          </p>
          <p>
            When default values are replaced by verified embedded carbon data,
            the carbon price calculation changes materially. Organisations with
            structured evidence pay less. Organisations without it pay more —
            and face audit risk.
          </p>
          <p className="border-l-2 border-orange-400 pl-6 text-xl font-semibold text-white">
            CBAM financial exposure is proportional to evidence quality. Better
            evidence means lower carbon cost.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="border-y border-white/10 bg-white/3 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="mb-16 text-4xl font-semibold tracking-tight sm:text-5xl">
            The CBAM Evidence Process
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {cbamSteps.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-orange-500/20 bg-orange-950/20 p-8"
              >
                <span className="font-mono text-sm text-orange-500">{s.n}</span>
                <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Start CBAM Readiness.
            </h2>
            <p className="mt-8 text-xl leading-8 text-slate-400">
              Tell us about your imports and supplier network. We'll scope a
              CBAM evidence engagement based on your goods categories and
              reporting obligations.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid gap-5 rounded-3xl bg-white/5 p-8 border border-white/10"
          >
            <input
              required
              placeholder="Name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none"
            />
            <input
              required
              placeholder="Work Email"
              type="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-slate-500 focus:border-orange-400/50 focus:outline-none"
            />
            <select
              defaultValue=""
              className="w-full rounded-xl border border-white/10 bg-[#0f0800] px-5 py-4 text-slate-300 focus:border-orange-400/50 focus:outline-none"
            >
              <option value="" disabled>CBAM goods category</option>
              <option>Cement</option>
              <option>Iron & Steel</option>
              <option>Aluminium</option>
              <option>Fertilisers</option>
              <option>Electricity</option>
              <option>Hydrogen</option>
              <option>Multiple / not sure</option>
            </select>
            <select
              defaultValue=""
              className="w-full rounded-xl border border-white/10 bg-[#0f0800] px-5 py-4 text-slate-300 focus:border-orange-400/50 focus:outline-none"
            >
              <option value="" disabled>Reporting readiness</option>
              <option>Not started</option>
              <option>Collecting supplier data</option>
              <option>First report submitted</option>
              <option>Ongoing — need better data</option>
            </select>
            <button
              type="submit"
              className="w-full rounded-full py-4 font-semibold text-slate-950 transition hover:brightness-110"
              style={{ backgroundColor: "#fb923c" }}
            >
              Start CBAM Readiness
            </button>
          </form>
        </div>
      </section>

      <Footer accent="#fb923c" />
    </main>
  );
}

// ─── 7. FuelEU Maritime ──────────────────────────────────────────────────────

const fueleuPoints = [
  {
    n: "01",
    title: "GHG Intensity Calculation",
    body:
      "Calculate vessel GHG intensity from structured fuel consumption and voyage data. Well-to-wake emission factors applied at fuel-type level.",
  },
  {
    n: "02",
    title: "Fuel Data Verification",
    body:
      "Structure bunker delivery notes, fuel quality documentation, and supplier declarations into a verified fuel evidence record.",
  },
  {
    n: "03",
    title: "Compliance Balance Management",
    body:
      "Track FuelEU compliance balance across your fleet. Identify vessels where pooling, banking, or borrowing improves overall compliance position.",
  },
  {
    n: "04",
    title: "MRV Integration",
    body:
      "FuelEU evidence structured to align with EU MRV reporting obligations. One data set, two compliance frameworks.",
  },
];

function FuelEUSite() {
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.currentTarget.reset();
    window.alert(
      "Thanks. The FuelEU team will be in touch to discuss your vessel compliance requirements."
    );
  }

  return (
    <main className="bg-[#020f08] text-white">
      <Nav site="fueleu" accent="#4ade80" />

      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(22,163,74,0.2),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#020f08] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-16 pt-28 sm:px-8">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-green-400">
              FuelEU Maritime — Powered by AxiomOrdo
            </p>
            <h1 className="mt-8 text-5xl font-semibold tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              Fuel evidence.
              <br />
              <span className="text-green-400">Vessel-level. Verifiable.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-slate-300">
              FuelEU Maritime compliance requires structured fuel consumption
              and GHG intensity data at vessel level. AxiomOrdo structures,
              verifies, and reports it — so your fleet meets the regulation
              without scrambling for data at year-end.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <CTA to="#contact" isExternal accentColor="#4ade80">
                Start Fleet Assessment
              </CTA>
              <CTA to="/meriden" secondary>
                Maritime QHSE — Meriden
              </CTA>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:py-32">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-green-400">
            The Regulation
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            FuelEU is a
            <br />
            data problem,
            <br />
            not a fuel problem.
          </h2>
        </div>
        <div className="space-y-7 text-lg leading-8 text-slate-300">
          <p>
            Most vessel operators have the fuel. The problem is the evidence —
            structured GHG intensity calculations, well-to-wake emission
            factors, verified bunker delivery data, and a compliance balance
            that survives verifier scrutiny.
          </p>
          <p>
            FuelEU Maritime requires annual GHG intensity statements by vessel.
            Operators who fail to meet the target face a FuelEU penalty applied
            to their compliance deficit. The cost of bad data accumulates across
            a fleet.
          </p>
          <p className="border-l-2 border-green-400 pl-6 text-xl font-semibold text-white">
            The vessels with structured fuel evidence pay less. The vessels
            without it subsidise everyone else's compliance.
          </p>
        </div>
      </section>

      {/* Points */}
      <section className="border-y border-white/10 bg-white/3 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="mb-16 text-4xl font-semibold tracking-tight sm:text-5xl">
            What FuelEU Evidence Covers
          </h2>
          <div className="grid gap-8 sm:grid-cols-2">
            {fueleuPoints.map((p) => (
              <div
                key={p.n}
                className="rounded-2xl border border-green-500/20 bg-green-950/20 p-8"
              >
                <span className="font-mono text-sm text-green-500">{p.n}</span>
                <h3 className="mt-4 text-xl font-semibold">{p.title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Start your fleet assessment.
            </h2>
            <p className="mt-8 text-xl leading-8 text-slate-400">
              Tell us about your fleet and current fuel data quality. We'll
              scope a FuelEU compliance engagement that gets your vessels
              reporting-ready.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="grid gap-5 rounded-3xl bg-white/5 p-8 border border-white/10"
          >
            <input
              required
              placeholder="Name"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-slate-500 focus:border-green-400/50 focus:outline-none"
            />
            <input
              required
              placeholder="Work Email"
              type="email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder-slate-500 focus:border-green-400/50 focus:outline-none"
            />
            <select
              defaultValue=""
              className="w-full rounded-xl border border-white/10 bg-[#020f08] px-5 py-4 text-slate-300 focus:border-green-400/50 focus:outline-none"
            >
              <option value="" disabled>Fleet size</option>
              <option>1–5 vessels</option>
              <option>6–20 vessels</option>
              <option>21–50 vessels</option>
              <option>50+ vessels</option>
            </select>
            <select
              defaultValue=""
              className="w-full rounded-xl border border-white/10 bg-[#020f08] px-5 py-4 text-slate-300 focus:border-green-400/50 focus:outline-none"
            >
              <option value="" disabled>FuelEU readiness</option>
              <option>Not started</option>
              <option>MRV in place, need FuelEU extension</option>
              <option>GHG calculations in progress</option>
              <option>Ready to verify — need review</option>
            </select>
            <button
              type="submit"
              className="w-full rounded-full py-4 font-semibold text-slate-950 transition hover:brightness-110"
              style={{ backgroundColor: "#4ade80" }}
            >
              Start Fleet Assessment
            </button>
          </form>
        </div>
      </section>

      <Footer accent="#4ade80" />
    </main>
  );
}

// ─── Router ──────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AxiomOrdoSite />} />
        <Route path="/clearline" element={<ClearLineSite />} />
        <Route path="/ards" element={<ARDSSite />} />
        <Route path="/golden-thread" element={<GoldenThreadSite />} />
        <Route path="/meriden" element={<MeridenComplianceSite />} />
        <Route path="/cbam" element={<CBAMSite />} />
        <Route path="/fueleu" element={<FuelEUSite />} />
        {/* Legacy redirect */}
        <Route path="/pfas" element={<ClearLineSite />} />
      </Routes>
    </BrowserRouter>
  );
}
