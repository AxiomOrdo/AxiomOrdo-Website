(() => {
  const STORAGE_KEY = "axiomordo.trace.v1";
  const path = window.location.pathname || "/";
  const classification = (() => {
    if (path.startsWith("/ards")) return { type: "Standard gateway", authority: "AxiomOrdo specification and governance material", boundary: "Technical claims must be checked against the published ARDS specification." };
    if (path.startsWith("/resources") || path.startsWith("/meriden/insights")) return { type: "Editorial and guidance", authority: "AxiomOrdo interpretation and commentary", boundary: "Not binding law or regulatory advice unless an authoritative source is expressly cited." };
    if (path.startsWith("/trust") || path.startsWith("/company")) return { type: "Corporate statement", authority: "AxiomOrdo-controlled policy and methodology", boundary: "Applies only within the scope stated on the relevant page." };
    if (path.startsWith("/platforms") || path.startsWith("/solutions") || path.startsWith("/industries")) return { type: "Product and capability description", authority: "AxiomOrdo interpretation", boundary: "Product descriptions do not establish legal compliance or regulatory acceptance." };
    return { type: "Corporate and product information", authority: "AxiomOrdo interpretation", boundary: "Marketing and explanatory content is not binding authority." };
  })();

  const read = () => {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
      return parsed && parsed.schema_version === "axiomordo.website-trace.v1" ? parsed : null;
    } catch { return null; }
  };
  const initial = read() || {
    schema_version: "axiomordo.website-trace.v1",
    privacy: "browser-session-only; not transmitted by this component",
    sequence: 0,
    events: []
  };
  const state = initial;
  const persist = () => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const record = (event_type, details) => {
    state.sequence += 1;
    state.events.push({ sequence: state.sequence, event_type, path: window.location.pathname, ...details });
    persist();
    render();
  };

  const canonical = (value) => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object") return Object.keys(value).sort().reduce((acc, key) => { acc[key] = canonical(value[key]); return acc; }, {});
    return value;
  };
  const digest = async (payload) => {
    const bytes = new TextEncoder().encode(JSON.stringify(canonical(payload)));
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const toggle = document.createElement("button");
  toggle.className = "ao-trace-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-pressed", "false");
  toggle.setAttribute("aria-controls", "ao-trace-panel");
  toggle.innerHTML = '<span class="ao-trace-dot" aria-hidden="true"></span><span>Trace</span>';

  const panel = document.createElement("aside");
  panel.className = "ao-trace-panel";
  panel.id = "ao-trace-panel";
  panel.hidden = true;
  panel.setAttribute("aria-label", "AxiomOrdo trace inspector");
  panel.innerHTML = '<div class="ao-trace-head"><div class="ao-trace-kicker">Provenance mode</div><h2 class="ao-trace-title">Page trace</h2></div><div class="ao-trace-body" id="ao-trace-body"></div>';

  const strip = document.createElement("div");
  strip.className = "ao-authority-strip";
  strip.hidden = true;
  strip.innerHTML = `<strong>${classification.type}</strong><br>${classification.authority}. ${classification.boundary}`;
  const hero = document.querySelector("main h1") || document.querySelector("h1");
  if (hero && hero.parentElement) hero.parentElement.insertBefore(strip, hero.nextSibling);

  document.body.append(panel, toggle);

  const render = () => {
    const body = document.getElementById("ao-trace-body");
    if (!body) return;
    const last = state.events[state.events.length - 1];
    body.innerHTML = `
      <div class="ao-trace-status">This trace is stored only in this browser session. It is not sent to AxiomOrdo by this component.</div>
      <div class="ao-trace-row"><span class="ao-trace-label">Current route</span><span class="ao-trace-value">${escapeHtml(window.location.pathname)}</span></div>
      <div class="ao-trace-row"><span class="ao-trace-label">Content class</span><span class="ao-trace-value">${escapeHtml(classification.type)}</span></div>
      <div class="ao-trace-row"><span class="ao-trace-label">Authority</span><span class="ao-trace-value">${escapeHtml(classification.authority)}</span></div>
      <div class="ao-trace-row"><span class="ao-trace-label">Boundary</span><span class="ao-trace-value">${escapeHtml(classification.boundary)}</span></div>
      <div class="ao-trace-row"><span class="ao-trace-label">Recorded events</span><span class="ao-trace-value">${state.events.length}</span></div>
      <div class="ao-trace-row"><span class="ao-trace-label">Latest event</span><span class="ao-trace-value">${last ? `${escapeHtml(last.event_type)} · sequence ${last.sequence}` : "None"}</span></div>
      <div class="ao-trace-actions"><button type="button" id="ao-export-trace">Export receipt</button><button type="button" id="ao-clear-trace">Clear trace</button></div>`;
    document.getElementById("ao-export-trace")?.addEventListener("click", exportReceipt);
    document.getElementById("ao-clear-trace")?.addEventListener("click", () => {
      state.sequence = 0; state.events = []; persist(); record("trace_reset", { source: "user" });
    });
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }

  function getRecordableHref(anchor) {
    const rawHref = anchor.getAttribute("href");
    if (!rawHref || !rawHref.trim()) return null;

    try {
      const parsed = new URL(rawHref, window.location.href);
      const allowedSchemes = new Set(["http:", "https:", "mailto:", "tel:"]);
      if (!allowedSchemes.has(parsed.protocol.toLowerCase())) return null;
      return rawHref;
    } catch {
      return null;
    }
  }

  async function exportReceipt() {
    const receipt = {
      schema_version: "axiomordo.website-replay-receipt.v1",
      scope: "local browser session",
      generated_from: "axiomordo.com Trace Inspector",
      authority_notice: classification,
      event_count: state.events.length,
      events: state.events.map((event) => canonical(event))
    };
    receipt.sha256 = await digest(receipt);
    const blob = new Blob([JSON.stringify(canonical(receipt), null, 2) + "\n"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `axiomordo-visit-receipt-${receipt.sha256.slice(0, 12)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    record("receipt_exported", { receipt_sha256: receipt.sha256 });
  }

  toggle.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute("aria-pressed", String(open));
    document.documentElement.classList.toggle("ao-trace-mode", open);
    strip.hidden = !open;
    record(open ? "trace_opened" : "trace_closed", { source: "user" });
  });

  document.addEventListener("click", (event) => {
    const anchor = event.target instanceof Element ? event.target.closest("a") : null;
    if (!anchor) return;
    const href = getRecordableHref(anchor);
    if (!href) return;
    record("link_activated", { href, label: (anchor.textContent || "").trim().slice(0, 120) });
  }, true);

  record("route_viewed", { title: document.title, classification: classification.type });
})();