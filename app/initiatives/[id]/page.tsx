"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// ============================================
// TYPES
// ============================================
interface Risk {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  source: string;
  createdAt: string;
}

interface Decision {
  id: string;
  question: string;
  optionsJson: string | null;
  status: string;
  source: string;
  createdAt: string;
}

interface Signal {
  id: string;
  source: string;
  type: string;
  payloadJson: string;
  occurredAt: string;
}

interface Evidence {
  id: string;
  url: string;
  title: string | null;
  docType: string | null;
  source: string;
  createdAt: string;
}

interface ConfidenceDriver {
  type: string;
  label: string;
  delta: number;
  source: string;
}

interface InitiativeDetail {
  id: string;
  name: string;
  owner: string | null;
  capability: string | null;
  box: string | null;
  status: string;
  confidence: number;
  ahaId: string | null;
  jiraKey: string | null;
  teamsChannelId: string | null;
  risks: Risk[];
  decisions: Decision[];
  signals: Signal[];
  evidence: Evidence[];
  confidenceDrivers: ConfidenceDriver[];
  stats: {
    totalRisks: number;
    openRisks: number;
    highRisks: number;
    pendingDecisions: number;
    evidenceCount: number;
    signalCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================
// HELPERS
// ============================================
function severityPill(severity: string) {
  const cls =
    severity === "CRITICAL"
      ? "pill-critical"
      : severity === "HIGH"
      ? "pill-high"
      : severity === "MEDIUM"
      ? "pill-medium"
      : "pill-low";
  return <span className={`pill ${cls}`}>{severity}</span>;
}

function statusPill(status: string) {
  const cls =
    status === "AT_RISK"
      ? "pill-at-risk"
      : status === "ON_TRACK"
      ? "pill-on-track"
      : status === "DELAYED"
      ? "pill-delayed"
      : status === "COMPLETED"
      ? "pill-on-track"
      : status === "OPEN"
      ? "pill-high"
      : status === "RESOLVED"
      ? "pill-on-track"
      : "pill-pending";
  const label = status.replace(/_/g, " ");
  return <span className={`pill ${cls}`}>{label}</span>;
}

function confidenceBadge(confidence: number) {
  const cls = confidence < 50 ? "low" : confidence < 70 ? "med" : "high";
  const arrow = confidence < 60 ? "↓" : confidence < 75 ? "→" : "↑";
  return (
    <span className={`confidence-badge ${cls}`} style={{ fontSize: "24px" }}>
      {confidence} {arrow}
    </span>
  );
}

function sourceBadge(source: string) {
  const s = source.toLowerCase();
  return <span className={`source-badge ${s}`}>{source}</span>;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================
// SIDEBAR
// ============================================
function Sidebar() {
  const navItems = [
    { icon: "📊", label: "Executive Dashboard", href: "/" },
    { icon: "📋", label: "Initiatives", href: "/initiatives", active: true },
    { icon: "⚠️", label: "Risks & Alerts", href: "#" },
    { icon: "🔴", label: "Decisions Needed", href: "#" },
    { icon: "📅", label: "Weekly Review", href: "#" },
    { icon: "📦", label: "Review Pack", href: "#" },
    { icon: "💡", label: "Insights", href: "#" },
    { icon: "🔗", label: "Data Sources", href: "#" },
    { icon: "⚙️", label: "Settings", href: "#" },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">🏛️ Governance Tower</div>
      {navItems.map((item, i) => (
        <a
          key={i}
          href={item.href || "#"}
          className={`sidebar-item ${item.active ? "active" : ""}`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}

// ============================================
// TAB COMPONENTS
// ============================================

// Overview Tab
function OverviewTab({ data }: { data: InitiativeDetail }) {
  return (
    <div>
      {/* Stats Row */}
      <div className="kpi-grid" style={{ marginBottom: "20px" }}>
        <div className="kpi-card">
          <div className="label">Confidence</div>
          <div>{confidenceBadge(data.confidence)}</div>
        </div>
        <div className="kpi-card">
          <div className="label">Open Risks</div>
          <div className={`value ${data.stats.openRisks > 0 ? "danger" : "success"}`}>
            {data.stats.openRisks}
          </div>
        </div>
        <div className="kpi-card">
          <div className="label">Pending Decisions</div>
          <div className={`value ${data.stats.pendingDecisions > 0 ? "warning" : "success"}`}>
            {data.stats.pendingDecisions}
          </div>
        </div>
        <div className="kpi-card">
          <div className="label">Evidence Links</div>
          <div className={`value ${data.stats.evidenceCount === 0 ? "warning" : ""}`}>
            {data.stats.evidenceCount}
          </div>
        </div>
      </div>

      {/* Confidence Explainability */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">Why This Confidence?</div>
        </div>
        {data.confidenceDrivers.length === 0 ? (
          <div className="empty-state">No confidence drivers computed yet</div>
        ) : (
          <table className="gov-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Impact</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {data.confidenceDrivers.map((d, i) => (
                <tr key={i}>
                  <td>
                    <span style={{ marginRight: "8px" }}>
                      {d.type === "negative" ? "🔴" : "🟢"}
                    </span>
                    {d.label}
                  </td>
                  <td
                    style={{
                      fontWeight: 800,
                      color:
                        d.type === "negative"
                          ? "var(--ind-pink)"
                          : "var(--ind-green)",
                    }}
                  >
                    {d.delta > 0 ? `+${d.delta}` : d.delta}
                  </td>
                  <td>{sourceBadge(d.source)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mappings */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">Data Source Mappings</div>
        </div>
        <table className="gov-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Status</th>
              <th>ID / Reference</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{sourceBadge("AHA")}</td>
              <td>{data.ahaId ? statusPill("ON_TRACK") : statusPill("NOT_STARTED")}</td>
              <td>{data.ahaId || "Not mapped"}</td>
            </tr>
            <tr>
              <td>{sourceBadge("JIRA")}</td>
              <td>{data.jiraKey ? statusPill("ON_TRACK") : statusPill("NOT_STARTED")}</td>
              <td>{data.jiraKey || "Not mapped"}</td>
            </tr>
            <tr>
              <td>{sourceBadge("TEAMS")}</td>
              <td>{data.teamsChannelId ? statusPill("ON_TRACK") : statusPill("NOT_STARTED")}</td>
              <td>{data.teamsChannelId || "Not mapped"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Signals Tab
function SignalsTab({ signals }: { signals: Signal[] }) {
  if (signals.length === 0) {
    return <div className="empty-state">No signals captured yet. Connect Jira/Teams/Aha to start receiving signals.</div>;
  }

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-title">Signal Timeline</div>
        <span className="section-badge">{signals.length}</span>
      </div>
      <table className="gov-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Source</th>
            <th>Type</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {signals.map((s) => {
            let payload: any = {};
            try {
              payload = JSON.parse(s.payloadJson);
            } catch {}

            return (
              <tr key={s.id}>
                <td style={{ whiteSpace: "nowrap", fontSize: "13px" }}>
                  {formatDate(s.occurredAt)}
                </td>
                <td>{sourceBadge(s.source)}</td>
                <td>
                  <span
                    style={{
                      fontWeight: 700,
                      color: "var(--ind-blue)",
                      fontSize: "13px",
                    }}
                  >
                    {s.type.replace(/_/g, " ")}
                  </span>
                </td>
                <td style={{ fontSize: "13px", color: "var(--grey-deep)" }}>
                  {Object.entries(payload)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" · ")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Risks Tab
function RisksTab({
  risks,
  onResolve,
}: {
  risks: Risk[];
  onResolve: (id: string) => void;
}) {
  const open = risks.filter((r) => r.status === "OPEN");
  const resolved = risks.filter((r) => r.status === "RESOLVED");

  return (
    <div>
      {/* Open Risks */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">Open Risks & Alerts</div>
          {open.length > 0 && (
            <span className="section-badge">{open.length}</span>
          )}
        </div>
        {open.length === 0 ? (
          <div className="empty-state">No open risks ✅</div>
        ) : (
          <table className="gov-table">
            <thead>
              <tr>
                <th>Risk</th>
                <th>Severity</th>
                <th>Source</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {open.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{r.title}</div>
                    {r.description && (
                      <div
                        style={{
                          fontSize: "13px",
                          color: "var(--grey-deep)",
                          marginTop: "4px",
                        }}
                      >
                        {r.description}
                      </div>
                    )}
                  </td>
                  <td>{severityPill(r.severity)}</td>
                  <td>{sourceBadge(r.source)}</td>
                  <td style={{ fontSize: "13px" }}>{formatDate(r.createdAt)}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onResolve(r.id)}
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Resolved Risks */}
      {resolved.length > 0 && (
        <div className="section" style={{ opacity: 0.7 }}>
          <div className="section-header">
            <div className="section-title">Resolved</div>
            <span
              className="section-badge"
              style={{ background: "var(--ind-green)" }}
            >
              {resolved.length}
            </span>
          </div>
          <table className="gov-table">
            <thead>
              <tr>
                <th>Risk</th>
                <th>Severity</th>
                <th>Source</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {resolved.map((r) => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>{severityPill(r.severity)}</td>
                  <td>{sourceBadge(r.source)}</td>
                  <td>{statusPill(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Decisions Tab
function DecisionsTab({ decisions }: { decisions: Decision[] }) {
  if (decisions.length === 0) {
    return (
      <div className="empty-state">
        No decisions needed for this initiative ✅
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-title">Decisions Needed</div>
        <span className="section-badge">{decisions.length}</span>
      </div>
      {decisions.map((d) => {
        let options: any[] = [];
        try {
          options = JSON.parse(d.optionsJson || "[]");
        } catch {}

        return (
          <div
            key={d.id}
            style={{
              border: "1px solid var(--grey-light)",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "12px",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    color: "var(--ind-blue)",
                    fontSize: "16px",
                    marginBottom: "6px",
                  }}
                >
                  {d.question}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {statusPill(d.status)}
                  {sourceBadge(d.source)}
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "var(--grey-deep)" }}>
                {formatDate(d.createdAt)}
              </div>
            </div>

            {options.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    color: "var(--grey-deep)",
                    marginBottom: "8px",
                  }}
                >
                  Options
                </div>
                {options.map((opt: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      border: "1px solid var(--grey-lighter)",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{opt.option}</span>
                    <span
                      style={{ fontSize: "12px", color: "var(--grey-deep)" }}
                    >
                      {opt.impact}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Evidence Tab
function EvidenceTab({ evidence }: { evidence: Evidence[] }) {
  if (evidence.length === 0) {
    return (
      <div className="empty-state">
        No evidence linked yet. Add SharePoint / Confluence links to strengthen
        governance.
      </div>
    );
  }

  return (
    <div className="section">
      <div className="section-header">
        <div className="section-title">Evidence Links</div>
        <span className="section-badge">{evidence.length}</span>
      </div>
      <table className="gov-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Source</th>
            <th>Added</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {evidence.map((e) => (
            <tr key={e.id}>
              <td style={{ fontWeight: 700 }}>{e.title || "Untitled"}</td>
              <td>{e.docType || "—"}</td>
              <td>{sourceBadge(e.source)}</td>
              <td style={{ fontSize: "13px" }}>{formatDate(e.createdAt)}</td>
              <td>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  Open ↗
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function InitiativeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<InitiativeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch(`/api/initiatives/${id}`);
      if (!res.ok) throw new Error("Failed to fetch initiative");
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function resolveRisk(riskId: string) {
    try {
      await fetch("/api/risks/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riskId }),
      });
      fetchData(); // refresh
    } catch {
      alert("Failed to resolve risk");
    }
  }

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // Tab definitions
  const tabs = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "signals", label: "Signals", icon: "📡" },
    { key: "risks", label: "Risks & Alerts", icon: "⚠️" },
    { key: "decisions", label: "Decisions", icon: "🔴" },
    { key: "evidence", label: "Evidence", icon: "📎" },
  ];

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <div className="topbar">
            <div className="topbar-title">Loading...</div>
          </div>
          <div className="dashboard">
            <div className="empty-state">Loading initiative details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <div className="topbar">
            <div className="topbar-title">Error</div>
          </div>
          <div className="dashboard">
            <div className="empty-state">⚠️ {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        {/* Top Bar */}
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => router.push("/initiatives")}
            >
              ← Back
            </button>
            <div className="topbar-title">{data.name}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {data.ahaId && sourceBadge("AHA")}
            {data.jiraKey && sourceBadge("JIRA")}
            {data.teamsChannelId && sourceBadge("TEAMS")}
          </div>
        </div>

        {/* Initiative Header */}
        <div
          style={{
            padding: "20px 32px",
            background: "var(--white)",
            borderBottom: "1px solid var(--grey-light)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "var(--grey-deep)",
                  marginBottom: "4px",
                }}
              >
                Status
              </div>
              {statusPill(data.status)}
            </div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "var(--grey-deep)",
                  marginBottom: "4px",
                }}
              >
                Confidence
              </div>
              {confidenceBadge(data.confidence)}
            </div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "var(--grey-deep)",
                  marginBottom: "4px",
                }}
              >
                Owner
              </div>
              <span style={{ fontWeight: 700 }}>{data.owner || "—"}</span>
            </div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "var(--grey-deep)",
                  marginBottom: "4px",
                }}
              >
                Capability
              </div>
              <span>{data.capability || "—"}</span>
            </div>
            <div>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "var(--grey-deep)",
                  marginBottom: "4px",
                }}
              >
                Box
              </div>
              <span>{data.box || "—"}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0",
            borderBottom: "2px solid var(--grey-light)",
            background: "var(--white)",
            paddingLeft: "32px",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "14px 20px",
                fontSize: "14px",
                fontWeight: activeTab === tab.key ? 800 : 600,
                color:
                  activeTab === tab.key
                    ? "var(--ind-blue)"
                    : "var(--grey-deep)",
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === tab.key
                    ? "3px solid var(--ind-blue)"
                    : "3px solid transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.key === "risks" && data.stats.openRisks > 0 && (
                <span className="pill pill-critical" style={{ marginLeft: "4px" }}>
                  {data.stats.openRisks}
                </span>
              )}
              {tab.key === "decisions" && data.stats.pendingDecisions > 0 && (
                <span className="pill pill-high" style={{ marginLeft: "4px" }}>
                  {data.stats.pendingDecisions}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="dashboard">
          {activeTab === "overview" && <OverviewTab data={data} />}
          {activeTab === "signals" && <SignalsTab signals={data.signals} />}
          {activeTab === "risks" && (
            <RisksTab risks={data.risks} onResolve={resolveRisk} />
          )}
          {activeTab === "decisions" && (
            <DecisionsTab decisions={data.decisions} />
          )}
          {activeTab === "evidence" && (
            <EvidenceTab evidence={data.evidence} />
          )}
        </div>
      </div>
    </div>
  );
}