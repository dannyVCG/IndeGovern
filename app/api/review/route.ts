import { prisma } from "@/lib/prisma";

function computeReadiness(initiative: any) {
  const openRisks = initiative.risks.filter((r: any) => r.status === "OPEN");
  const highRisks = openRisks.filter(
    (r: any) => r.severity === "HIGH" || r.severity === "CRITICAL"
  );
  const evidenceCount = initiative.evidence?.length ?? 0;
  const pendingDecisions = initiative.decisions.filter(
    (d: any) => d.status === "PENDING" || d.status === "RECOMMENDED"
  ).length;

  const blockers: string[] = [];

  if (highRisks.length > 0) {
    blockers.push(highRisks.length + " high severity risk(s)");
  }

  if (initiative.confidence < 60) {
    blockers.push("Low confidence (" + initiative.confidence + ")");
  }

  if (pendingDecisions > 0) {
    blockers.push(pendingDecisions + " decision(s) pending");
  }

  if (initiative.status === "AT_RISK" && evidenceCount === 0) {
    blockers.push("Evidence missing");
  }

  if (openRisks.length > 0 && highRisks.length === 0) {
    blockers.push(openRisks.length + " medium/low risk(s) open");
  }

  let state = "READY";
  if (blockers.length > 0 && (highRisks.length > 0 || initiative.confidence < 60)) {
    state = "NOT_READY";
  } else if (blockers.length > 0) {
    state = "PARTIAL";
  }

  return {
    state,
    blockers,
    reason: blockers.length > 0 ? blockers.join(" · ") : "All checks passed",
    stats: {
      openRisks: openRisks.length,
      highRisks: highRisks.length,
      pendingDecisions,
      evidenceCount,
    },
  };
}

export async function GET() {
  try {
    const initiatives = await prisma.initiative.findMany({
      include: {
        risks: true,
        decisions: true,
        evidence: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const rows = initiatives.map((i) => {
      const readiness = computeReadiness(i);
      return {
        id: i.id,
        name: i.name,
        owner: i.owner,
        capability: i.capability,
        box: i.box,
        status: i.status,
        confidence: i.confidence,
        readiness: readiness.state,
        blockerReason: readiness.reason,
        blockers: readiness.blockers,
        stats: readiness.stats,
      };
    });

    const summary = {
      total: rows.length,
      ready: rows.filter((r) => r.readiness === "READY").length,
      partial: rows.filter((r) => r.readiness === "PARTIAL").length,
      notReady: rows.filter((r) => r.readiness === "NOT_READY").length,
      totalOpenRisks: rows.reduce((a, r) => a + r.stats.openRisks, 0),
      totalPendingDecisions: rows.reduce((a, r) => a + r.stats.pendingDecisions, 0),
    };

    return Response.json({ summary, rows });
  } catch (e: any) {
    return Response.json(
      { error: "Failed to build weekly review", message: e?.message },
      { status: 500 }
    );
  }
}