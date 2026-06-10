import { useState, useEffect, useRef } from "react";

// ─── DESIGN SYSTEM ───────────────────────────────────────────────────────────
// Aesthetic: Naval instrument panel — dark, precise, authoritative
// Fonts: Courier-adjacent for data, clean sans for UI
// Colors: Deep navy, brass/gold accents, signal amber, status greens/reds
// Feel: A ship's bridge — serious, functional, trusted

const COLORS = {
  navy:    "#0a1628",
  navyMid: "#0f2040",
  navyLight:"#1a3358",
  brass:   "#c9a84c",
  brassLight:"#e8c96a",
  amber:   "#f59e0b",
  green:   "#10b981",
  red:     "#ef4444",
  slate:   "#94a3b8",
  white:   "#f0f4ff",
  dim:     "#64748b",
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_INCIDENTS = [
  { id: 1, date: "2026-05-14", type: "Near Miss", vessel: "MV Meridian Star", description: "Line handling — mooring rope parted under load", status: "Open", severity: "High" },
  { id: 2, date: "2026-05-10", type: "Injury", vessel: "MV Atlantic Pride", description: "Slip on wet deck during cargo ops — minor laceration", status: "Closed", severity: "Low" },
  { id: 3, date: "2026-05-03", type: "Near Miss", vessel: "MV Meridian Star", description: "ECDIS chart update failure — officer did not notice", status: "In Progress", severity: "Medium" },
  { id: 4, date: "2026-04-28", type: "Environmental", vessel: "MV Pacific Dawn", description: "Bilge water sheen observed at anchorage", status: "Open", severity: "High" },
];

const MOCK_AUDITS = [
  { id: 1, date: "2026-06-15", type: "ISM Internal", vessel: "MV Meridian Star", status: "Scheduled", ncrs: 0 },
  { id: 2, date: "2026-05-20", type: "PSC Inspection", vessel: "MV Atlantic Pride", status: "Complete", ncrs: 2 },
  { id: 3, date: "2026-07-01", type: "Flag State", vessel: "MV Pacific Dawn", status: "Scheduled", ncrs: 0 },
  { id: 4, date: "2026-04-10", type: "ISPS Audit", vessel: "MV Meridian Star", status: "Complete", ncrs: 1 },
];

const MOCK_DRILLS = [
  { id: 1, date: "2026-05-15", type: "Fire Drill", vessel: "MV Meridian Star", outcome: "Satisfactory", duration: "22 min" },
  { id: 2, date: "2026-05-15", type: "Abandon Ship", vessel: "MV Atlantic Pride", outcome: "Satisfactory", duration: "18 min" },
  { id: 3, date: "2026-05-08", type: "Man Overboard", vessel: "MV Pacific Dawn", outcome: "Needs Improvement", duration: "31 min" },
  { id: 4, date: "2026-04-30", type: "Oil Spill", vessel: "MV Meridian Star", outcome: "Satisfactory", duration: "25 min" },
];

const MOCK_DOCS = [
  { id: 1, name: "SMC — MV Meridian Star", expiry: "2026-08-12", daysLeft: 86, status: "Warning" },
  { id: 2, name: "DOC — Company Certificate", expiry: "2027-01-05", daysLeft: 232, status: "OK" },
  { id: 3, name: "ISPS Ship Security Certificate", expiry: "2026-06-30", daysLeft: 43, status: "Critical" },
  { id: 4, name: "MLC MLC Certificate — Atlantic Pride", expiry: "2026-12-01", daysLeft: 197, status: "OK" },
  { id: 5, name: "Class Cert — Pacific Dawn", expiry: "2026-06-10", daysLeft: 23, status: "Critical" },
];

const PROMPTS = [
  { id: 1, category: "Risk Assessment", title: "Vessel-Specific Task Risk Assessment", prompt: `Act as a maritime QHSE adviser. Create a vessel-specific risk assessment for [operation] on [vessel name / type] operating in [location] under [conditions]. Present as a table: Task step | Hazard | Consequence | Existing controls | Additional controls | Responsible person | Residual risk. Highlight critical controls and hold points. Flag assumptions.` },
  { id: 2, category: "Incident Investigation", title: "Root Cause Analysis — 5 Whys", prompt: `Act as a maritime QHSE investigator. Perform a structured root cause analysis for: [event summary]. Immediate cause: [cause]. Use 5 Whys. Identify: 1) Immediate causes 2) Underlying causes 3) Root causes 4) System gaps 5) Corrective actions 6) Preventive actions.` },
  { id: 3, category: "Audit", title: "Internal Audit Checklist", prompt: `Act as a maritime QHSE auditor. Create an internal audit checklist for [area] on [vessel/department]. Include: Audit objective | Documents to review | Interview questions | Physical checks | Evidence to collect | Common NCRs | Good practice indicators. Present as a table.` },
  { id: 4, category: "Training", title: "Pre-Task Toolbox Talk", prompt: `Act as a vessel supervisor. Draft a concise toolbox talk for [task] for [team]. Include: Job objective | Main hazards | Critical controls | PPE | Comms points | Stop-work triggers | Weather considerations | SIMOPS concerns | 3 supervisor questions to confirm understanding.` },
  { id: 5, category: "Compliance", title: "NCR & Corrective Action Plan", prompt: `Act as a maritime QHSE manager. Draft a non-conformance report and CAPA for: [NCR description]. Requirement not met: [reference]. Provide: NCR wording | Requirement/reference | Objective evidence | Immediate correction | Root cause | Corrective action | Preventive action | Responsible role | Target date | Verification method.` },
  { id: 6, category: "Risk Assessment", title: "Hidden Hazards Review", prompt: `Act as an experienced maritime QHSE reviewer. Identify hidden, non-obvious hazards for [task] that standard checklists miss. Cover: Human factors | Environmental conditions | Equipment degradation | Communication failures | SIMOPS | Org pressures | Fatigue/overfamiliarity. For each: hazard | how it arises | why missed | consequence | control | who verifies.` },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function StatusBadge({ status, severity }) {
  const val = status || severity;
  const colors = {
    Open: { bg: "#ef444420", text: "#ef4444", border: "#ef444440" },
    Closed: { bg: "#10b98120", text: "#10b981", border: "#10b98140" },
    "In Progress": { bg: "#f59e0b20", text: "#f59e0b", border: "#f59e0b40" },
    Scheduled: { bg: "#3b82f620", text: "#3b82f6", border: "#3b82f640" },
    Complete: { bg: "#10b98120", text: "#10b981", border: "#10b98140" },
    High: { bg: "#ef444420", text: "#ef4444", border: "#ef444440" },
    Medium: { bg: "#f59e0b20", text: "#f59e0b", border: "#f59e0b40" },
    Low: { bg: "#10b98120", text: "#10b981", border: "#10b98140" },
    Critical: { bg: "#ef444420", text: "#ef4444", border: "#ef444440" },
    Warning: { bg: "#f59e0b20", text: "#f59e0b", border: "#f59e0b40" },
    OK: { bg: "#10b98120", text: "#10b981", border: "#10b98140" },
    "Needs Improvement": { bg: "#f59e0b20", text: "#f59e0b", border: "#f59e0b40" },
    Satisfactory: { bg: "#10b98120", text: "#10b981", border: "#10b98140" },
  };
  const c = colors[val] || { bg: "#ffffff10", text: "#94a3b8", border: "#ffffff20" };
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: "2px 10px", borderRadius: 4, fontSize: 11, fontFamily: "monospace",
      fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase"
    }}>{val}</span>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: COLORS.navyMid,
      border: `1px solid ${COLORS.navyLight}`,
      borderRadius: 8,
      padding: "20px 24px",
      ...style
    }}>{children}</div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      marginBottom: 18
    }}>
      <div style={{ width: 3, height: 18, background: COLORS.brass, borderRadius: 2 }} />
      <span style={{
        fontFamily: "'Courier New', monospace", fontSize: 11,
        letterSpacing: "0.15em", textTransform: "uppercase",
        color: COLORS.brass, fontWeight: 700
      }}>{children}</span>
    </div>
  );
}

// ─── VIEWS ───────────────────────────────────────────────────────────────────

function Dashboard() {
  const critical = MOCK_DOCS.filter(d => d.status === "Critical").length;
  const openIncidents = MOCK_INCIDENTS.filter(i => i.status === "Open").length;
  const upcomingAudits = MOCK_AUDITS.filter(a => a.status === "Scheduled").length;

  const stats = [
    { label: "Open Incidents", value: openIncidents, color: COLORS.red, sub: "requiring action" },
    { label: "Upcoming Audits", value: upcomingAudits, color: COLORS.amber, sub: "next 60 days" },
    { label: "Critical Docs", value: critical, color: COLORS.red, sub: "expiring <30 days" },
    { label: "Vessels Tracked", value: 3, color: COLORS.green, sub: "active fleet" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: COLORS.brass, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>
          MARITIME QHSE COMMAND CENTRE
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: COLORS.white, margin: 0, letterSpacing: "-0.02em" }}>
          Fleet Safety Overview
        </h1>
        <div style={{ color: COLORS.dim, fontSize: 13, marginTop: 6 }}>
          {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <Card key={s.label}>
            <div style={{ fontSize: 36, fontWeight: 800, color: s.color, fontFamily: "monospace", lineHeight: 1 }}>{s.value}</div>
            <div style={{ color: COLORS.white, fontSize: 14, fontWeight: 600, marginTop: 8 }}>{s.label}</div>
            <div style={{ color: COLORS.dim, fontSize: 12, marginTop: 2 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <SectionTitle>Recent Incidents</SectionTitle>
          {MOCK_INCIDENTS.slice(0, 3).map(i => (
            <div key={i.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: "10px 0", borderBottom: `1px solid ${COLORS.navyLight}`
            }}>
              <div style={{ flex: 1, marginRight: 12 }}>
                <div style={{ color: COLORS.white, fontSize: 13, fontWeight: 600 }}>{i.description}</div>
                <div style={{ color: COLORS.dim, fontSize: 11, marginTop: 3 }}>{i.vessel} · {i.date}</div>
              </div>
              <StatusBadge status={i.status} />
            </div>
          ))}
        </Card>

        <Card>
          <SectionTitle>Document Expiry Alerts</SectionTitle>
          {MOCK_DOCS.filter(d => d.status !== "OK").map(d => (
            <div key={d.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 0", borderBottom: `1px solid ${COLORS.navyLight}`
            }}>
              <div>
                <div style={{ color: COLORS.white, fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                <div style={{ color: COLORS.dim, fontSize: 11, marginTop: 3 }}>Expires: {d.expiry} · {d.daysLeft} days</div>
              </div>
              <StatusBadge status={d.status} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function IncidentRegister({ onAdd }) {
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", type: "Near Miss", vessel: "", description: "", severity: "Medium", status: "Open" });

  const handleAdd = () => {
    if (!form.date || !form.vessel || !form.description) return;
    setIncidents([{ id: Date.now(), ...form }, ...incidents]);
    setForm({ date: "", type: "Near Miss", vessel: "", description: "", severity: "Medium", status: "Open" });
    setShowForm(false);
  };

  const inputStyle = {
    background: COLORS.navy, border: `1px solid ${COLORS.navyLight}`,
    color: COLORS.white, borderRadius: 6, padding: "8px 12px",
    fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box"
  };
  const selectStyle = { ...inputStyle };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: COLORS.brass, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>MODULE 01</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.white, margin: 0 }}>Incident & Near-Miss Register</h2>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: COLORS.brass, color: COLORS.navy, border: "none",
          padding: "10px 20px", borderRadius: 6, fontWeight: 700, fontSize: 13,
          cursor: "pointer", fontFamily: "monospace", letterSpacing: "0.05em"
        }}>+ LOG INCIDENT</button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 20, border: `1px solid ${COLORS.brass}40` }}>
          <SectionTitle>New Entry</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ color: COLORS.dim, fontSize: 11, marginBottom: 4, fontFamily: "monospace" }}>DATE</div>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <div style={{ color: COLORS.dim, fontSize: 11, marginBottom: 4, fontFamily: "monospace" }}>TYPE</div>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={selectStyle}>
                {["Near Miss", "Injury", "Environmental", "Property Damage", "Dangerous Occurrence"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={{ color: COLORS.dim, fontSize: 11, marginBottom: 4, fontFamily: "monospace" }}>VESSEL / SITE</div>
              <input value={form.vessel} onChange={e => setForm({ ...form, vessel: e.target.value })} placeholder="MV ..." style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: COLORS.dim, fontSize: 11, marginBottom: 4, fontFamily: "monospace" }}>DESCRIPTION</div>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="Brief description of the event..." />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ color: COLORS.dim, fontSize: 11, marginBottom: 4, fontFamily: "monospace" }}>SEVERITY</div>
              <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} style={selectStyle}>
                {["Low", "Medium", "High", "Critical"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <div style={{ color: COLORS.dim, fontSize: 11, marginBottom: 4, fontFamily: "monospace" }}>STATUS</div>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={selectStyle}>
                {["Open", "In Progress", "Closed"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={handleAdd} style={{ background: COLORS.brass, color: COLORS.navy, border: "none", padding: "9px 20px", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Save Entry</button>
            <button onClick={() => setShowForm(false)} style={{ background: "transparent", color: COLORS.dim, border: `1px solid ${COLORS.navyLight}`, padding: "9px 20px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </Card>
      )}

      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Date", "Type", "Vessel", "Description", "Severity", "Status"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: COLORS.brass, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.navyLight}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidents.map((inc, i) => (
              <tr key={inc.id} style={{ borderBottom: `1px solid ${COLORS.navyLight}`, background: i % 2 === 0 ? "transparent" : "#ffffff04" }}>
                <td style={{ padding: "12px", color: COLORS.dim, fontSize: 12, fontFamily: "monospace" }}>{inc.date}</td>
                <td style={{ padding: "12px", color: COLORS.white, fontSize: 13 }}>{inc.type}</td>
                <td style={{ padding: "12px", color: COLORS.slate, fontSize: 12 }}>{inc.vessel}</td>
                <td style={{ padding: "12px", color: COLORS.white, fontSize: 13, maxWidth: 280 }}>{inc.description}</td>
                <td style={{ padding: "12px" }}><StatusBadge severity={inc.severity} /></td>
                <td style={{ padding: "12px" }}><StatusBadge status={inc.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AuditTracker() {
  const [audits] = useState(MOCK_AUDITS);
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: COLORS.brass, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>MODULE 02</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.white, margin: 0 }}>Audit & Inspection Tracker</h2>
      </div>
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Date", "Type", "Vessel", "NCRs", "Status"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: COLORS.brass, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.navyLight}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audits.map((a, i) => (
              <tr key={a.id} style={{ borderBottom: `1px solid ${COLORS.navyLight}`, background: i % 2 === 0 ? "transparent" : "#ffffff04" }}>
                <td style={{ padding: "12px", color: COLORS.dim, fontSize: 12, fontFamily: "monospace" }}>{a.date}</td>
                <td style={{ padding: "12px", color: COLORS.white, fontSize: 13 }}>{a.type}</td>
                <td style={{ padding: "12px", color: COLORS.slate, fontSize: 12 }}>{a.vessel}</td>
                <td style={{ padding: "12px", color: a.ncrs > 0 ? COLORS.amber : COLORS.green, fontSize: 14, fontWeight: 700, fontFamily: "monospace" }}>{a.ncrs}</td>
                <td style={{ padding: "12px" }}><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function DrillLog() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: COLORS.brass, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>MODULE 03</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.white, margin: 0 }}>Emergency Drill Log</h2>
      </div>
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Date", "Drill Type", "Vessel", "Duration", "Outcome"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: COLORS.brass, fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", borderBottom: `1px solid ${COLORS.navyLight}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_DRILLS.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: `1px solid ${COLORS.navyLight}`, background: i % 2 === 0 ? "transparent" : "#ffffff04" }}>
                <td style={{ padding: "12px", color: COLORS.dim, fontSize: 12, fontFamily: "monospace" }}>{d.date}</td>
                <td style={{ padding: "12px", color: COLORS.white, fontSize: 13 }}>{d.type}</td>
                <td style={{ padding: "12px", color: COLORS.slate, fontSize: 12 }}>{d.vessel}</td>
                <td style={{ padding: "12px", color: COLORS.white, fontSize: 13, fontFamily: "monospace" }}>{d.duration}</td>
                <td style={{ padding: "12px" }}><StatusBadge status={d.outcome} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function DocTracker() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: COLORS.brass, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>MODULE 04</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.white, margin: 0 }}>Certificate & Document Expiry</h2>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {MOCK_DOCS.map(doc => (
          <Card key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }}>
            <div>
              <div style={{ color: COLORS.white, fontSize: 14, fontWeight: 600 }}>{doc.name}</div>
              <div style={{ color: COLORS.dim, fontSize: 12, marginTop: 4, fontFamily: "monospace" }}>
                Expiry: {doc.expiry} · <span style={{ color: doc.daysLeft < 30 ? COLORS.red : doc.daysLeft < 90 ? COLORS.amber : COLORS.green }}>{doc.daysLeft} days remaining</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 120, height: 6, background: COLORS.navyLight, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, (doc.daysLeft / 365) * 100)}%`, height: "100%", background: doc.status === "Critical" ? COLORS.red : doc.status === "Warning" ? COLORS.amber : COLORS.green, borderRadius: 3 }} />
              </div>
              <StatusBadge status={doc.status} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AIPromptHub() {
  const [selected, setSelected] = useState(PROMPTS[0]);
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filterCat, setFilterCat] = useState("All");

  const categories = ["All", ...new Set(PROMPTS.map(p => p.category))];
  const filtered = filterCat === "All" ? PROMPTS : PROMPTS.filter(p => p.category === filterCat);

  const buildFinalPrompt = () => {
    const context = userInput.trim();
    if (!context) return selected.prompt;
    return `${selected.prompt}\n\nContext provided by user:\n${context}`;
  };

  const runPrompt = async () => {
    setLoading(true);
    setOutput("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a senior maritime QHSE adviser with 20+ years experience in ISM Code implementation, vessel operations, and maritime safety management. Produce structured, operationally specific outputs. Never fabricate regulatory references — if uncertain, say so. Use maritime terminology appropriate for the audience.",
          messages: [{ role: "user", content: buildFinalPrompt() }]
        })
      });
      const data = await response.json();
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "No output received.";
      setOutput(text);
    } catch (err) {
      setOutput(`Error: ${err.message}. Check API connection.`);
    }
    setLoading(false);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: COLORS.brass, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>MODULE 05 · POWERED BY CLAUDE</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.white, margin: 0 }}>AI Prompt Hub</h2>
        <p style={{ color: COLORS.dim, fontSize: 13, marginTop: 6 }}>Run maritime QHSE AI prompts directly. Add your vessel/task context, generate, review, and copy to your workflow.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        {/* Prompt Library */}
        <div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {categories.map(c => (
              <button key={c} onClick={() => setFilterCat(c)} style={{
                background: filterCat === c ? COLORS.brass : "transparent",
                color: filterCat === c ? COLORS.navy : COLORS.dim,
                border: `1px solid ${filterCat === c ? COLORS.brass : COLORS.navyLight}`,
                padding: "4px 10px", borderRadius: 4, fontSize: 10, cursor: "pointer",
                fontFamily: "monospace", letterSpacing: "0.05em", textTransform: "uppercase"
              }}>{c}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(p => (
              <div key={p.id} onClick={() => { setSelected(p); setOutput(""); setUserInput(""); }}
                style={{
                  background: selected.id === p.id ? COLORS.navyLight : COLORS.navyMid,
                  border: `1px solid ${selected.id === p.id ? COLORS.brass : COLORS.navyLight}`,
                  borderRadius: 6, padding: "12px 14px", cursor: "pointer",
                  transition: "all 0.15s"
                }}>
                <div style={{ fontSize: 10, color: COLORS.brass, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{p.category}</div>
                <div style={{ color: COLORS.white, fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{p.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Prompt Runner */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle>Selected Prompt</SectionTitle>
            <div style={{
              background: COLORS.navy, borderRadius: 6, padding: "14px 16px",
              fontSize: 12, color: COLORS.slate, fontFamily: "monospace",
              lineHeight: 1.7, whiteSpace: "pre-wrap"
            }}>{selected.prompt}</div>
          </Card>

          <Card>
            <SectionTitle>Your Context (Optional)</SectionTitle>
            <textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              rows={4}
              placeholder={`Add vessel name, type, operation details, conditions, flag state...\n\nExample: MV Atlantic Pride, bulk carrier, Panama flag. Operation: enclosed space entry for bilge inspection. Location: Port of Singapore. Conditions: daytime, calm.`}
              style={{
                width: "100%", boxSizing: "border-box",
                background: COLORS.navy, border: `1px solid ${COLORS.navyLight}`,
                color: COLORS.white, borderRadius: 6, padding: "12px 14px",
                fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit",
                lineHeight: 1.6
              }}
            />
            <button onClick={runPrompt} disabled={loading} style={{
              marginTop: 12, background: loading ? COLORS.navyLight : COLORS.brass,
              color: loading ? COLORS.dim : COLORS.navy,
              border: "none", padding: "11px 24px", borderRadius: 6,
              fontWeight: 700, fontSize: 13, cursor: loading ? "wait" : "pointer",
              fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase",
              transition: "all 0.2s"
            }}>
              {loading ? "GENERATING..." : "▶ RUN PROMPT"}
            </button>
          </Card>

          {output && (
            <Card style={{ border: `1px solid ${COLORS.green}30` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <SectionTitle>AI Output — Review Before Use</SectionTitle>
                <button onClick={copyOutput} style={{
                  background: "transparent", color: copied ? COLORS.green : COLORS.dim,
                  border: `1px solid ${copied ? COLORS.green : COLORS.navyLight}`,
                  padding: "5px 12px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                  fontFamily: "monospace"
                }}>{copied ? "✓ COPIED" : "COPY"}</button>
              </div>
              <div style={{
                background: COLORS.navy, borderRadius: 6, padding: "16px",
                fontSize: 13, color: COLORS.white, lineHeight: 1.8,
                whiteSpace: "pre-wrap", maxHeight: 400, overflowY: "auto"
              }}>{output}</div>
              <div style={{ marginTop: 12, padding: "10px 14px", background: "#f59e0b10", border: "1px solid #f59e0b30", borderRadius: 6 }}>
                <span style={{ color: COLORS.amber, fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>⚠ REVIEW REQUIRED · </span>
                <span style={{ color: COLORS.dim, fontSize: 11 }}>Verify all regulatory references against primary sources. Check against your SMS before use. A competent person must approve before operational use.</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── NAV + APP SHELL ──────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "dashboard", label: "Overview", icon: "⬡" },
  { id: "incidents", label: "Incidents", icon: "◈" },
  { id: "audits", label: "Audits", icon: "◻" },
  { id: "drills", label: "Drills", icon: "◆" },
  { id: "documents", label: "Documents", icon: "◇" },
  { id: "ai", label: "AI Hub", icon: "✦" },
];

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");

  const views = {
    dashboard: <Dashboard />,
    incidents: <IncidentRegister />,
    audits: <AuditTracker />,
    drills: <DrillLog />,
    documents: <DocTracker />,
    ai: <AIPromptHub />,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.navy,
      color: COLORS.white,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      display: "flex",
    }}>
      {/* Sidebar */}
      <div style={{
        width: 220, minHeight: "100vh",
        background: COLORS.navyMid,
        borderRight: `1px solid ${COLORS.navyLight}`,
        display: "flex", flexDirection: "column",
        position: "fixed", left: 0, top: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${COLORS.navyLight}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, background: COLORS.brass,
              borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 900, color: COLORS.navy, fontFamily: "monospace"
            }}>MC</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.white, letterSpacing: "0.02em" }}>MERIDEN</div>
              <div style={{ fontSize: 10, color: COLORS.dim, letterSpacing: "0.08em", textTransform: "uppercase" }}>Compliance</div>
            </div>
          </div>
        </div>

        {/* Company */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${COLORS.navyLight}` }}>
          <div style={{ fontSize: 10, color: COLORS.dim, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Company</div>
          <div style={{ fontSize: 13, color: COLORS.white, fontWeight: 600 }}>Demo Fleet Ltd</div>
          <div style={{ fontSize: 11, color: COLORS.dim, marginTop: 2 }}>3 vessels · DPA Access</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 12px" }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id)} style={{
              width: "100%", textAlign: "left",
              background: activeView === item.id ? `${COLORS.brass}18` : "transparent",
              border: activeView === item.id ? `1px solid ${COLORS.brass}30` : "1px solid transparent",
              color: activeView === item.id ? COLORS.brass : COLORS.slate,
              padding: "10px 12px", borderRadius: 6, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 13, fontWeight: activeView === item.id ? 600 : 400,
              marginBottom: 2, transition: "all 0.15s"
            }}>
              <span style={{ fontSize: 14, opacity: 0.8 }}>{item.icon}</span>
              {item.label}
              {item.id === "ai" && <span style={{ marginLeft: "auto", fontSize: 9, background: COLORS.brass, color: COLORS.navy, padding: "2px 6px", borderRadius: 10, fontWeight: 700, fontFamily: "monospace" }}>AI</span>}
            </button>
          ))}
        </nav>

        {/* Subscription tag */}
        <div style={{ padding: "16px 20px", borderTop: `1px solid ${COLORS.navyLight}` }}>
          <div style={{ background: `${COLORS.green}15`, border: `1px solid ${COLORS.green}30`, borderRadius: 6, padding: "8px 12px" }}>
            <div style={{ fontSize: 10, color: COLORS.green, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.08em" }}>● ACTIVE</div>
            <div style={{ fontSize: 11, color: COLORS.dim, marginTop: 2 }}>$97/mo · Renews Jun 18</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: 220, flex: 1, padding: "36px 40px", maxWidth: 1100 }}>
        {views[activeView]}
      </div>
    </div>
  );
}
