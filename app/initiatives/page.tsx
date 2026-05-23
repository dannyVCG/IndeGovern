"use client";

import { useEffect, useState } from "react";

interface Initiative {
  id: string;
  name: string;
  owner: string | null;
  capability: string | null;
  box: string | null;
  status: string;
  confidence: number;
  ahaId: string | null;
  risks: any[];
  decisions: any[];
  lastUpdated: string;
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

function sourceBadge(ahaId: string | null) {
  if (ahaId) {
    return <span className="source-badge aha">AHA</span>;
  }
  return <span className="source-badge manual">MANUAL</span>;
}

// Sidebar (same as dashboard)
function Sidebar() {
  const navItems = [
    { icon: "📊", label: "Executive Dashboard", href: "/" },
    { icon: "📋", label: "Initiatives", active: true },
    { icon: "⚠️", label: "Risks & Alerts" },
    { icon: "🔴", label: "Decisions Needed" },
    { icon: "📅", label: "Weekly Review" },
    { icon: "📦", label: "Review Pack" },
    { icon: "💡", label: "Insights" },
    { icon: "🔗", label: "Data Sources" },
    { icon: "⚙️", label: "Settings" },
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

export default function InitiativesPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncCount, setSyncCount] = useState<number | null>(null);

  // Fetch from local DB
  async function fetchInitiatives() {
    try {
      setLoading(true);
      const res = await fetch("/api/initiatives");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setInitiatives(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Sync from Aha → DB → refresh UI
  async function syncFromAha() {
    try {
      setSyncing(true);
      setSyncCount(null);
      const res = await fetch("/api/aha");
      if (!res.ok) throw new Error("Aha sync failed");
      const data = await res.json();
      setSyncCount(data.synced);
      setInitiatives(data.initiatives);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    fetchInitiatives();
  }, []);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-title">Initiatives</div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {syncCount !== null && (
              <span style={{ fontSize: "13px", color: "var(--ind-green)" }}>
                ✅ {syncCount} synced from Aha
              </span>
            )}
            <button
              className="btn btn-primary"
              onClick={syncFromAha}
              disabled={syncing}
            >
              {syncing ? "Syncing..." : "🔄 Sync from Aha"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard">
          {/* KPI Summary */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="label">Total Initiatives</div>
              <div className="value">{initiatives.length}</div>
            </div>
            <div className="kpi-card">
              <div className="label">On Track</div>
              <div className="value success">
                {initiatives.filter((i) => i.status === "ON_TRACK").length}
              </div>
            </div>
            <div className="kpi-card">
              <div className="label">At Risk</div>
              <div className="value danger">
                {initiatives.filter((i) => i.status === "AT_RISK").length}
              </div>
            </div>
            <div className="kpi-card">
              <div className="label">From Aha</div>
              <div className="value">
                {initiatives.filter((i) => i.ahaId).length}
              </div>
            </div>
          </div>

          {/* Initiatives Table */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">All Initiatives</div>
              <span className="section-badge">{initiatives.length}</span>
            </div>

            {loading ? (
              <div className="empty-state">Loading initiatives...</div>
            ) : error ? (
              <div className="empty-state">⚠️ {error}</div>
            ) : initiatives.length === 0 ? (
              <div className="empty-state">
                No initiatives yet. Click "Sync from Aha" to import.
              </div>
            ) : (
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Initiative</th>
                    <th>Owner</th>
                    <th>Capability</th>
                    <th>Box</th>
                    <th>Status</th>
                    <th>Confidence</th>
                    <th>Risks</th>
                    <th>Decisions</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {initiatives.map((i) => (
                    <tr key={i.id}>
                        
<td
  style={{
    fontWeight: 700,
    color: "var(--ind-blue)",
    cursor: "pointer",
    textDecoration: "underline",
  }}
  onClick={() => window.location.href = `/initiatives/${i.id}`}
>
  {i.name}
</td>

                      <td>{i.owner || "—"}</td>
                      <td>{i.capability || "—"}</td>
                      <td>{i.box || "—"}</td>
                      <td>{statusPill(i.status)}</td>
                      <td>{confidenceBadge(i.confidence)}</td>
                      <td>
                        {i.risks?.length > 0 ? (
                          <span className="pill pill-high">
                            {i.risks.length}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {i.decisions?.length > 0 ? (
                          <span className="pill pill-medium">
                            {i.decisions.length}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>{sourceBadge(i.ahaId)}</td>
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