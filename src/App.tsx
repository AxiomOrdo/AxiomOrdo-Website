import { FormEvent, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";

type Decision = {
  label: string;
  outcome: string;
  detail: string;
  tone: string;
};

const decisions: Decision[] = [
  {
    label: "Green",
    outcome: "Clear",
    detail:
      "Evidence is sufficient to support continued sale or supply without immediate PFAS testing.",
    tone: "border-emerald-400 text-emerald-700",
  },
  {
    label: "Amber",
    outcome: "Investigate",
    detail:
      "Evidence gaps remain at component, supplier, material, finish, or documentation level and require targeted follow-up.",
    tone: "border-amber-400 text-amber-700",
  },
  {
    label: "Red",
    outcome: "Restrict",
    detail:
      "The product cannot currently be defended and should be held, remediated, or tested before exposure increases.",
    tone: "border-rose-400 text-rose-700",
  },
];

function Nav({ site }: { site: "axiomordo" | "clearline" }) {
  const isClearLine = site === "clearline";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/25 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 text-white sm:px-8">
        <Link to={isClearLine ? "/clearline" : "/"} className="group flex items-center gap-3">
          <img src="/images/axiomordo-logo.png" alt="AxiomOrdo Logo" className="h-8 w-auto brightness-0 invert" />
          <div className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight">
              {isClearLine ? "ClearLine" : "AxiomOrdo"}
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-white/60">
              {isClearLine ? "Powered by AxiomOrdo" : "Evidence Engine"}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            to={isClearLine ? "/" : "/clearline"}
            className="hidden text-white/70 transition hover:text-white sm:inline"
          >
            {isClearLine ? "AxiomOrdo" : "ClearLine PFAS"}
          </Link>
          <Link
            to={isClearLine ? "#start" : "/clearline"}
            className="rounded-full border border-white/20 px-5 py-2 text-white transition hover:border-white/40 hover:bg-white/10"
          >
            {isClearLine ? "Start with your SKU list" : "Explore ClearLine"}
          </Link>
        </div>
      </nav>
    </header>
  );
}

function CTA({ to, children, secondary = false, isExternal = false }: { to: string; children: string; secondary?: boolean; isExternal?: boolean }) {
  const baseClass = "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const themeClass = secondary
    ? "border border-current bg-transparent"
    : "bg-white text-slate-950 hover:bg-slate-100 focus:ring-white";

  if (isExternal || to.startsWith("#")) {
    return (
      <a href={to} className={`${baseClass} ${themeClass}`}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={`${baseClass} ${themeClass}`}>
      {children}
    </Link>
  );
}

function AxiomOrdoSite() {
  const verticals = [
    "PFAS product evidence",
    "Golden Thread asset evidence",
    "FuelEU operational evidence",
  ];

  return (
    <main className="bg-[#070b12] text-white">
      <Nav site="axiomordo" />

      <section className="relative min-h-screen overflow-hidden">
        <img
          src="/images/axiomordo-evidence-engine.jpg"
          alt="Engineers reviewing product evidence"
          className="motion-drift absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.95)_0%,rgba(2,6,23,0.75)_45%,rgba(2,6,23,0.2)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070b12] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-16 pt-28 sm:px-8">
          <div className="max-w-3xl">
            <img src="/images/axiomordo-logo.png" alt="AxiomOrdo" className="motion-fade h-20 w-auto brightness-0 invert" />
            <h1 className="motion-fade mt-10 text-5xl font-semibold tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl">
              The Authority in Product Evidence
            </h1>
            <p className="motion-fade mt-6 max-w-2xl text-xl leading-8 text-slate-200 sm:text-2xl sm:leading-9">
              A technical evidence engine for deterministic product and operational classification.
            </p>
            <div className="motion-fade mt-10 flex flex-col gap-4 sm:flex-row">
              <CTA to="/clearline">Explore ClearLine PFAS</CTA>
              <CTA to="/pfas" secondary>
                PFAS Evidence Methodology
              </CTA>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-32">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-400">
            AxiomOrdo Core
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Structured inputs. Fixed reasoning.
          </h2>
        </div>
        <div className="space-y-8 text-lg leading-8 text-slate-300">
          <p>
            The AxiomOrdo evidence engine converts fragmented product, supplier, component, and operational evidence into a structured decision record. It is built for high-consequence domains where a conclusion must be explainable.
          </p>
          <p>
            Evidence is mapped to inventories, grouped by product family, checked against explicit rule sets, and classified through repeatable decision logic.
          </p>
          <p>
            Every classification retains its source trail: what evidence was used, what was missing, what rule was applied, and why the output was reached.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-400">
            Powered verticals
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            One engine. Dedicated operations.
          </h2>
        </div>
        <div className="mt-16 divide-y divide-white/10 border-y border-white/10">
          {verticals.map((vertical, index) => (
            <div key={vertical} className="grid gap-6 py-10 sm:grid-cols-[10rem_1fr] items-center">
              <span className="font-mono text-sm text-slate-500">0{index + 1}</span>
              <p className="text-3xl font-semibold tracking-tight text-slate-100">{vertical}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function AxiomPfasPage() {
  return (
    <main className="bg-[#070b12] text-white">
      <Nav site="axiomordo" />

      <section className="relative min-h-screen overflow-hidden">
        <img
          src="/images/axiomordo-evidence-engine.jpg"
          alt="PFAS technical mapping"
          className="motion-drift absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.97)_0%,rgba(2,6,23,0.8)_46%,rgba(2,6,23,0.2)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#070b12] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-16 pt-28 sm:px-8">
          <div className="max-w-3xl">
            <h1 className="motion-fade text-5xl font-semibold tracking-[-0.06em] text-white sm:text-7xl lg:text-8xl">
              PFAS Product Evidence Engine
            </h1>
            <p className="motion-fade mt-8 max-w-2xl text-xl leading-8 text-slate-200 sm:text-2xl sm:leading-9">
              Deterministic PFAS evidence capability that powers ClearLine.
            </p>
            <div className="motion-fade mt-10 flex flex-col gap-4 sm:flex-row">
              <CTA to="/clearline">Visit ClearLine</CTA>
              <CTA to="/clearline#start" secondary isExternal>
                Start with your SKU list
              </CTA>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-32">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-400">
            Technical Methodology
          </p>
          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Triage, Mapping, Classification.
          </h2>
        </div>
        <div className="space-y-8 text-lg leading-8 text-slate-300">
          <p>
            AxiomOrdo powers PFAS product evidence assessment through structured inventory triage, component-level evidence mapping, and deterministic product classification.
          </p>
          <p>
            The process is deterministic because classifications are produced from explicit rules and versioned evidence. Every decision preserves the source trail, ensuring traceability.
          </p>
          <p className="border-l-2 border-cyan-400 pl-6 text-2xl font-semibold text-white">
            ClearLine is the PFAS product evidence operation powered by the AxiomOrdo engine.
          </p>
        </div>
      </section>
    </main>
  );
}

function ClearLineSite() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    form.reset();
    window.alert("Thanks. ClearLine would follow up with SKU list instructions and the audit scope.");
  }

  return (
    <main className="bg-[#f8f9fa] text-slate-900">
      <Nav site="clearline" />

      <section className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <img
          src="/images/clearline-pfas-inventory.jpg"
          alt="PFAS Inventory"
          className="motion-drift absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.96)_0%,rgba(2,6,23,0.75)_44%,rgba(2,6,23,0.1)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f8f9fa] to-transparent" />
        <div className="motion-scan absolute left-0 top-0 h-px w-full bg-cyan-400/50" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-16 pt-28 sm:px-8">
          <div className="max-w-3xl">
            <p className="motion-fade text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Powered by AxiomOrdo
            </p>
            <h1 className="motion-fade mt-6 text-5xl font-semibold tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl">
              Know your PFAS exposure before someone asks.
            </h1>
            <p className="motion-fade mt-8 max-w-2xl text-xl leading-8 text-slate-200 sm:text-2xl sm:leading-9">
              ClearLine turns SKU lists and supplier evidence into clear PFAS decisions before retailers or regulators force the timetable.
            </p>
            <div className="motion-fade mt-10 flex flex-col gap-4 sm:flex-row">
              <CTA to="#start" isExternal>Start with your SKU list</CTA>
              <CTA to="#offer" secondary isExternal>
                Book PFAS Readiness Audit
              </CTA>
            </div>
          </div>
        </div>
      </section>

       <section className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-32">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.26em] text-slate-500">
          The Problem
        </p>
    
        <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl">
          Documentation fails before products.
        </h2>
    
        <p className="mt-8 max-w-xl text-xl leading-8 text-slate-600">
          The issue is rarely that documents do not exist. The issue is that nobody knows
          whether those documents can defend the product when a retailer, customer, or
          regulator asks.
        </p>
      </div>
    
      <div className="space-y-8 text-lg leading-8 text-slate-700">
        <p>
          PFAS pressure usually arrives as a short deadline: a retailer questionnaire or a regulator request. The risk is not knowing which SKUs are defensible.
        </p>
    
        <p className="text-2xl font-bold text-slate-950">
          1,000 SKUs does not mean 1,000 PFAS problems. You need a way to group, triage, and defend decisions fast.
        </p>
      </div>
    </section>
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl mb-16">
            The ClearLine Decision System
          </h2>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {decisions.map((decision) => (
              <div key={decision.label} className="grid gap-6 py-10 lg:grid-cols-[12rem_14rem_1fr] items-center">
                <span className={`border-l-4 pl-4 text-2xl font-bold ${decision.tone}`}>
                  {decision.label}
                </span>
                <span className="text-2xl font-semibold tracking-tight text-slate-950">
                  {decision.outcome}
                </span>
                <p className="max-w-3xl leading-7 text-slate-600">{decision.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

     <section id="offer" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
  <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] bg-slate-900 rounded-[3rem] p-8 sm:p-16 text-white">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
        The Entry Offer
      </p>

      <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
        PFAS Readiness Audit
      </h2>

      <p className="mt-8 max-w-xl text-xl text-slate-300">
        A focused first pass over your inventory to identify which product families
        need evidence review, supplier follow-up, or testing.
      </p>

      <div className="mt-10 flex flex-wrap items-baseline gap-4">
        <span className="text-6xl font-bold tracking-tight text-white">£6,500</span>
        <span className="text-slate-400 font-medium">fixed entry scope</span>
      </div>

      <ul className="mt-6 space-y-2 text-base text-slate-200">
        <li>Up to 25 representative SKUs</li>
        <li>or 250 component-level evidence checks</li>
        <li>10-business-day turnaround</li>
      </ul>
    </div>

    <div className="flex flex-col justify-center gap-6">
      <CTA to="#start" isExternal>Start with your SKU list</CTA>
      <p className="text-sm text-slate-400 text-center">
        Protected revenue. Reduced testing spend. Regulator readiness.
      </p>
    </div>
  </div>
</section>

      <section id="start" className="bg-[#dfe7dc] py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 sm:px-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              Start with your SKU list.
            </h2>
            <p className="mt-8 text-xl leading-8 text-slate-700">
              Leave with a defensible PFAS action map. ClearLine is PFAS exposure readiness, powered by AxiomOrdo.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-6 rounded-[2.5rem] bg-white p-8 sm:p-10 shadow-2xl shadow-slate-900/10">
            <div className="grid gap-4">
              <input required placeholder="Name" className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-slate-950" />
              <input required placeholder="Work Email" type="email" className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-slate-950" />
              <select
                required
                defaultValue=""
                className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-slate-950 bg-white"
              >
                <option value="" disabled>
                  SKU volume
                  </option>
                <option>Under 250 SKUs</option>
                <option>250–1,000 SKUs</option>
                <option>1,000–5,000 SKUs</option>
                <option>5,000+ SKUs</option>
                <option>Not sure yet</option>
              </select>
              <select
                 required
                defaultValue=""
                className="w-full rounded-2xl border border-slate-200 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-slate-950 bg-white"
              >
                <option value="" disabled>
                  Main pressure
                </option>
                <option>Retailer request</option>
                <option>Customer questionnaire</option>
                <option>Regulatory concern</option>
                <option>Supplier uncertainty</option>
                <option>Internal review</option>
                <option>Not sure yet</option>
              </select>
            </div>
            <button type="submit" className="w-full rounded-full bg-slate-950 py-4 text-white font-semibold hover:bg-slate-800 transition">
              Start with your SKU list
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AxiomOrdoSite />} />
        <Route path="/pfas" element={<AxiomPfasPage />} />
        <Route path="/clearline" element={<ClearLineSite />} />
      </Routes>
    </BrowserRouter>
  );
}
