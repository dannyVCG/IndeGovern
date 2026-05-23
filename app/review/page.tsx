"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ReviewRow {
  id: string;
  name: string;
  owner: string | null;
  capability: string | null;
  box: string | null;
  status: string;
  confidence: number;
  readiness: string;
  blockerReason: string;
  blockers: string[];
  stats: {
    openRisks: number;
    highRisks: number;
    pendingDecisions: number;
    evidenceCount: number;
  };
}

interface ReviewData {
  summary: {
    total: number;
    ready: number;
    partial: number;
    notReady: number;
    totalOpenRisks: number;
    totalPendingDecisions: number;
  };
  rows: ReviewRow[];
}

function readinessBadge(state: string) {
  if (state === "READY") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 800,
        background: "#EDF7E8", color: "#2D7A0F",
      }}>
        {"\u2705"} READY
      </span>
    );
  }
  if (state === "PARTIAL") {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 800,
        background: "#FFF0E5", color: "#994400",
      }}>
        {"\u26a0\ufe0f"} PARTIAL
      </span>
    );
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 800,
      background: "#FDE8EF", color: "#C4004F",
    }}>
      {"\u274c"} NOT READY
    </span>
  );
}

function statusPill(status: string) {
  const cls =
    status === "AT_RISK" ? "pill-at-risk"
    : status === "ON_TRACK" ? "pill-on-track"
    : status === "DELAYED" ? "pill-delayed"
    : "pill-pending";
  const label = status.replace(/_/g, " ");
  return <span className={"pill " + cls}>{label}</span>;
}

function confidenceBadge(confidence: number) {
  const cls = confidence < 50 ? "low" : confidence < 70 ? "med" : "high";
  const arrow = confidence < 60 ? "\u2193" : confidence < 75 ? "\u2192" : "\u2191";
  return (
    <span className={"confidence-badge " + cls}>
      {confidence} {arrow}
    </span>
  );
}

function Sidebar() {
  const navItems = [
    { icon: "\ud83d\udcca", label: "Executive Dashboard", href: "/" },
    { icon: "\ud83d\udccb", label: "Initiatives", href: "/initiatives" },
    { icon: "\u26a0\ufe0f", label: "Risks & Alerts", href: "#" },
    { icon: "\ud83d\udd34", label: "Decisions Needed", href: "#" },
    { icon: "\ud83d\udcc5", label: "Weekly Review", href: "/review", active: true },
    { icon: "\ud83d\udce6", label: "Review Pack", href: "#" },
    { icon: "\ud83d\udca1", label: "Insights", href: "#" },
    { icon: "\ud83d\udd17", label: "Data Sources", href: "#" },
    { icon: "\u2699\ufe0f", label: "Settings", href: "#" },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">{"\ud83c\udfdb\ufe0f"} Governance Tower</div>
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

export default function WeeklyReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ReviewRow | null>(null);

  async function fetchReview() {
    try {
      setLoading(true);
      const res = await fetch("/api/review");
      if (!res.ok) throw new Error("Failed to fetch review data");
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function openResolveDrawer(row: ReviewRow) {
    setSelectedRow(row);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelectedRow(null);
  }

  useEffect(() => {
    fetchReview();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <div className="topbar">
            <div className="topbar-title">Weekly Review</div>
          </div>
          <div className="dashboard">
            <div className="empty-state">Loading Weekly Review...</div>
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
            <div className="topbar-title">Weekly Review</div>
          </div>
          <div className="dashboard">
            <div className="empty-state">{"\u26a0\ufe0f"} {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content" style={{ position: "relative" }}>

        {/* Top Bar */}
        <div className="topbar">
          <div className="topbar-title">Weekly Review</div>
          <div className="topbar-meta">{today} {"\u00b7"} Weekly Review Cycle</div>
        </div>

        <div className="dashboard">

          {/* KPI Summary */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="label">Total Initiatives</div>
              <div className="value">{data.summary.total}</div>
            </div>
            <div className="kpi-card">
              <div className="label">Ready</div>
              <div className="value success">{data.summary.ready}</div>
            </div>
            <div className="kpi-card">
              <div className="label">Partial</div>
              <div className="value warning">{data.summary.partial}</div>
            </div>
            <div className="kpi-card">
              <div className="label">Not Ready</div>
              <div className="value danger">{data.summary.notReady}</div>
            </div>
          </div>

          {/* Actions Required */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div className="kpi-card">
              <div className="label">Open Risks</div>
              <div className={"value " + (data.summary.totalOpenRisks > 0 ? "danger" : "success")}>
                {data.summary.totalOpenRisks}
              </div>
            </div>
            <div className="kpi-card">
              <div className="label">Pending Decisions</div>
              <div className={"value " + (data.summary.totalPendingDecisions > 0 ? "warning" : "success")}>
                {data.summary.totalPendingDecisions}
              </div>
            </div>
            <div className="kpi-card">
              <div className="label">Review Readiness</div>
              <div className={"value " + (data.summary.notReady === 0 ? "success" : "danger")}>
                {data.summary.notReady === 0 ? "Ready for Review" : data.summary.notReady + " need attention"}
              </div>
            </div>
          </div>

          {/* Readiness Board */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">Review Readiness Board</div>
              <span className="section-badge">{data.rows.length}</span>
            </div>

            {data.rows.length === 0 ? (
              <div className="empty-state">No initiatives to review</div>
            ) : (
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Initiative</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Confidence</th>
                    <th>Readiness</th>
                    <th>Blockers</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.id}>
                      <td
                        style={{ fontWeight: 700, color: "var(--ind-blue)", cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => router.push("/initiatives/" + row.id)}
                      >
                        {row.name}
                      </td>
                      <td>{row.owner || "\u2014"}</td>
                      <td>{statusPill(row.status)}</td>
                      <td>{confidenceBadge(row.confidence)}</td>
                      <td>{readinessBadge(row.readiness)}</td>
                      <td>
                        {row.blockers.length > 0 ? (
                          <div style={{ fontSize: "12px", color: "var(--grey-deep)" }}>
                            {row.blockers.map((b, i) => (
                              <div key={i} style={{ marginBottom: "2px" }}>
                                {"\u2022"} {b}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--ind-green)" }}>
                            {"\u2705"} All clear
                          </span>
                        )}
                      </td>
                      <td>
                        {row.readiness !== "READY" ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openResolveDrawer(row)}
                          >
                            Resolve
                          </button>
                        ) : (
                          <span style={{ fontSize: "12px", color: "var(--ind-green)", fontWeight: 700 }}>
                            {"\u2705"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Generate Review Pack */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            padding: "20px 0",
          }}>
            <button className="btn btn-outline">Export PDF</button>
            <button className="btn btn-primary" onClick={() => alert("Review Pack generation coming soon!")}>
              Generate Review Pack
            </button>
          </div>

        </div>

        {/* ======= RESOLVE DRAWER ======= */}
        {drawerOpen && selectedRow && (
          <div style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "480px",
            height: "100vh",
            background: "var(--white)",
            borderLeft: "1px solid var(--grey-light)",
            boxShadow: "-4px 0 20px rgba(0,0,0,0.08)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--grey-light)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase" as const, color: "var(--ind-pink)", marginBottom: "4px" }}>
                  Resolve Initiative
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--ind-blue)" }}>
                  {selectedRow.name}
                </div>
              </div>
              <button
                onClick={closeDrawer}
                style={{
                  background: "none", border: "none", fontSize: "24px",
                  cursor: "pointer", color: "var(--grey-deep)",
                }}
              >
                {"\u2715"}
              </button>
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>

              {/* Current State */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--grey-deep)", textTransform: "uppercase" as const }}>Status</div>
                    {statusPill(selectedRow.status)}
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--grey-deep)", textTransform: "uppercase" as const }}>Confidence</div>
                    {confidenceBadge(selectedRow.confidence)}
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--grey-deep)", textTransform: "uppercase" as const }}>Readiness</div>
                    {readinessBadge(selectedRow.readiness)}
                  </div>
                </div>
              </div>

              {/* Blockers List */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase" as const, color: "var(--ind-pink)", marginBottom: "12px" }}>
                  Blockers to Resolve
                </div>
                {selectedRow.blockers.length === 0 ? (
                  <div style={{ fontSize: "14px", color: "var(--ind-green)" }}>
                    {"\u2705"} No blockers
                  </div>
                ) : (
                  selectedRow.blockers.map((b, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        border: "1px solid var(--grey-light)",
                        borderRadius: "8px",
                        marginBottom: "8px",
                        fontSize: "14px",
                      }}
                    >
                      <span>
                        {"\ud83d\udd34"} {b}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Stats */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "13px", fontWeight: 800, textTransform: "uppercase" as const, color: "var(--ind-blue)", marginBottom: "12px" }}>
                  Quick Stats
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={{ padding: "12px", border: "1px solid var(--grey-light)", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--grey-deep)", textTransform: "uppercase" as const }}>Open Risks</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: selectedRow.stats.openRisks > 0 ? "var(--ind-pink)" : "var(--ind-green)" }}>
                      {selectedRow.stats.openRisks}
                    </div>
                  </div>
                  <div style={{ padding: "12px", border: "1px solid var(--grey-light)", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--grey-deep)", textTransform: "uppercase" as const }}>Pending Decisions</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: selectedRow.stats.pendingDecisions > 0 ? "var(--ind-orange)" : "var(--ind-green)" }}>
                      {selectedRow.stats.pendingDecisions}
                    </div>
                  </div>
                  <div style={{ padding: "12px", border: "1px solid var(--grey-light)", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--grey-deep)", textTransform: "uppercase" as const }}>Evidence</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: selectedRow.stats.evidenceCount === 0 ? "var(--ind-orange)" : "var(--ind-blue)" }}>
                      {selectedRow.stats.evidenceCount}
                    </div>
                  </div>
                  <div style={{ padding: "12px", border: "1px solid var(--grey-light)", borderRadius: "8px", textAlign: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--grey-deep)", textTransform: "uppercase" as const }}>High Risks</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, color: selectedRow.stats.highRisks > 0 ? "var(--ind-pink)" : "var(--ind-green)" }}>
                      {selectedRow.stats.highRisks}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div style={{
              padding: "16px 24px",
              borderTop: "1px solid var(--grey-light)",
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
            }}>
              <button className="btn btn-outline" onClick={closeDrawer}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  router.push("/initiatives/" + selectedRow.id);
                }}
              >
                Open Full Detail {"\u2192"}
              </button>
            </div>
          </div>
        )}

        {/* Drawer overlay */}
        {drawerOpen && (
          <div
            onClick={closeDrawer}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.2)",
              zIndex: 99,
            }}
          />
        )}

      </div>
    </div>
  );
}