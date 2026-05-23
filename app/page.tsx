"use client";

import { useEffect, useState } from "react";

// ============================================
// TYPES
// ============================================
interface Initiative {
  id: string;
  name: string;
  owner: string | null;
  capability: string | null;
  box: string | null;
  status: string;
  confidence: number;
}

interface Risk {
  id: string;
  title: string;
  severity: string;
  status: string;
  source: string;
  initiative: Initiative;
}

interface Decision {
  id: string;
  question: string;
  status: string;
  source: string;
  initiative: Initiative;
}

interface DashboardData {
  decisionsNeeded: Decision[];
  confidenceDrops: Initiative[];
  topRisks: Risk[];
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
      : "pill-pending";
  const label = status.replace(/_/g, " ");
  return <span className={`pill ${cls}`}>{label}</span>;
}

function confidenceBadge(confidence: number) {
  const cls = confidence < 50 ? "low" : confidence < 70 ? "med" : "high";
  const arrow = confidence < 60 ? "↓" : confidence < 75 ? "→" : "↑";
  return (
    <span className={`confidence-badge ${cls}`}>
      {confidence} {arrow}
    </span>
  );
}

function sourceBadge(source: string) {
  const s = source.toLowerCase();
  return <span className={`source-badge ${s}`}>{source}</span>;
}

// ============================================
// SIDEBAR COMPONENT
// ============================================
function Sidebar() {
 const navItems = [
  { icon: "\ud83d\udcca", label: "Executive Dashboard", href: "/", active: true },
  { icon: "\ud83d\udccb", label: "Initiatives", href: "/initiatives" },
  { icon: "\u26a0\ufe0f", label: "Risks & Alerts", href: "#" },
  { icon: "\ud83d\udd34", label: "Decisions Needed", href: "#" },
  { icon: "\ud83d\udcc5", label: "Weekly Review", href: "/review" },
  { icon: "\ud83d\udce6", label: "Review Pack", href: "#" },
  { icon: "\ud83d\udca1", label: "Insights", href: "#" },
  { icon: "\ud83d\udd17", label: "Data Sources", href: "#" },
  { icon: "\u2699\ufe0f", label: "Settings", href: "#" },
];

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">🏛️ Governance Tower</div>
      {navItems.map((item, i) => (
  <a
    key={i}
    href={item.href || "#"}
    className={"sidebar-item" + (item.active ? " active" : "")}
  >
    <span>{item.icon}</span>
    <span>{item.label}</span>
  </a>
))}
    </nav>
  );
}

// ============================================
// TOP BAR COMPONENT
// ============================================
function TopBar() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="topbar">
      <div className="topbar-title">Executive Dashboard</div>
      <div className="topbar-meta">{today} · Weekly Review Cycle</div>
    </div>
  );
}

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDashboard() {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard");
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
      fetchDashboard();
    } catch {
      alert("Failed to resolve risk");
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <TopBar />
          <div className="dashboard">
            <div className="empty-state">Loading Governance Tower...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <TopBar />
          <div className="dashboard">
            <div className="empty-state">⚠️ Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Computed values
  const totalRisks = data.topRisks.length;
  const totalDecisions = data.decisionsNeeded.length;
  const totalDrops = data.confidenceDrops.length;
  const avgConfidence =
    totalDrops > 0
      ? Math.round(
          data.confidenceDrops.reduce((a, b) => a + b.confidence, 0) / totalDrops
        )
      : 0;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        {/* Sync Button */}
<div style={{ marginBottom: "16px", textAlign: "right" }}>
  <button
    className="btn btn-primary"
    onClick={async () => {
      const res = await fetch("/api/aha-sync", { method: "POST" });
      const result = await res.json();
      alert(`Synced ${result.synced} initiatives from Aha`);
      fetchDashboard(); // refresh dashboard
    }}
  >
    🔄 Sync from Aha
  </button>
</div>
        <div className="dashboard">
          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="label">Decisions Needed</div>
              <div className={`value ${totalDecisions > 0 ? "danger" : ""}`}>
                {totalDecisions}
              </div>
            </div>
            <div className="kpi-card">
              <div className="label">Confidence Drops</div>
              <div className={`value ${totalDrops > 0 ? "warning" : ""}`}>
                {totalDrops}
              </div>
            </div>
            <div className="kpi-card">
              <div className="label">Open Risks</div>
              <div className={`value ${totalRisks > 0 ? "danger" : ""}`}>
                {totalRisks}
              </div>
            </div>
            <div className="kpi-card">
              <div className="label">Avg Confidence (At Risk)</div>
              <div
                className={`value ${
                  avgConfidence < 60
                    ? "danger"
                    : avgConfidence < 70
                    ? "warning"
                    : "success"
                }`}
              >
                {avgConfidence || "—"}
              </div>
            </div>
          </div>

          {/* Decisions Needed */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">Decisions Needed</div>
              {totalDecisions > 0 && (
                <span className="section-badge">{totalDecisions}</span>
              )}
            </div>
            {data.decisionsNeeded.length === 0 ? (
              <div className="empty-state">No decisions pending ✅</div>
            ) : (
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Initiative</th>
                    <th>Decision Question</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.decisionsNeeded.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 700, color: "var(--ind-blue)" }}>
                        {d.initiative?.name}
                      </td>
                      <td>{d.question}</td>
                      <td>{statusPill(d.status)}</td>
                      <td>{sourceBadge(d.source)}</td>
                      <td>
                        <button className="btn btn-primary btn-sm">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Confidence Drops */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">Confidence Drops This Week</div>
              {totalDrops > 0 && (
                <span className="section-badge">{totalDrops}</span>
              )}
            </div>
            {data.confidenceDrops.length === 0 ? (
              <div className="empty-state">No confidence drops ✅</div>
            ) : (
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Initiative</th>
                    <th>Owner</th>
                    <th>Capability</th>
                    <th>Status</th>
                    <th>Confidence</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.confidenceDrops.map((i) => (
                    <tr key={i.id}>
                      <td style={{ fontWeight: 700, color: "var(--ind-blue)" }}>
                        {i.name}
                      </td>
                      <td>{i.owner || "—"}</td>
                      <td>{i.capability || "—"}</td>
                      <td>{statusPill(i.status)}</td>
                      <td>{confidenceBadge(i.confidence)}</td>
                      <td>
                        <button className="btn btn-outline btn-sm">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Top Risks */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">Top Risks & Alerts</div>
              {totalRisks > 0 && (
                <span className="section-badge">{totalRisks}</span>
              )}
            </div>
            {data.topRisks.length === 0 ? (
              <div className="empty-state">No open risks ✅</div>
            ) : (
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Initiative</th>
                    <th>Risk</th>
                    <th>Severity</th>
                    <th>Source</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topRisks.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700, color: "var(--ind-blue)" }}>
                        {r.initiative?.name}
                      </td>
                      <td>{r.title}</td>
                      <td>{severityPill(r.severity)}</td>
                      <td>{sourceBadge(r.source)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => resolveRisk(r.id)}
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
        </div>
      </div>
    </div>
  );
}
