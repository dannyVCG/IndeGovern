import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const initiative = await prisma.initiative.findUnique({
      where: { id },
      include: {
        risks: { orderBy: { createdAt: "desc" } },
        decisions: { orderBy: { createdAt: "desc" } },
        signals: { orderBy: { occurredAt: "desc" } },
        evidence: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!initiative) {
      return Response.json(
        { error: "Initiative not found" },
        { status: 404 }
      );
    }

    // Compute confidence drivers (V1 simple logic)
    const openRisks = initiative.risks.filter((r) => r.status === "OPEN");
    const highRisks = openRisks.filter(
      (r) => r.severity === "HIGH" || r.severity === "CRITICAL"
    );

    const drivers = [];

    // Negative drivers
    if (highRisks.length > 0) {
      drivers.push({
        type: "negative",
        label: `${highRisks.length} high severity risk(s) open`,
        delta: -(highRisks.length * 10),
        source: "RISKS",
      });
    }

    if (openRisks.length > highRisks.length) {
      const medLow = openRisks.length - highRisks.length;
      drivers.push({
        type: "negative",
        label: `${medLow} medium/low risk(s) open`,
        delta: -(medLow * 5),
        source: "RISKS",
      });
    }

    const pendingDecisions = initiative.decisions.filter(
      (d) => d.status === "PENDING" || d.status === "RECOMMENDED"
    );
    if (pendingDecisions.length > 0) {
      drivers.push({
        type: "negative",
        label: `${pendingDecisions.length} decision(s) pending`,
        delta: -(pendingDecisions.length * 5),
        source: "DECISIONS",
      });
    }

    if (initiative.evidence.length === 0) {
      drivers.push({
        type: "negative",
        label: "No evidence linked",
        delta: -10,
        source: "EVIDENCE",
      });
    }

    // Positive drivers
    if (initiative.evidence.length > 0) {
      drivers.push({
        type: "positive",
        label: `${initiative.evidence.length} evidence link(s) attached`,
        delta: 3,
        source: "EVIDENCE",
      });
    }

    if (openRisks.length === 0) {
      drivers.push({
        type: "positive",
        label: "No open risks",
        delta: 5,
        source: "RISKS",
      });
    }

    return Response.json({
      ...initiative,
      confidenceDrivers: drivers,
      stats: {
        totalRisks: initiative.risks.length,
        openRisks: openRisks.length,
        highRisks: highRisks.length,
        pendingDecisions: pendingDecisions.length,
        evidenceCount: initiative.evidence.length,
        signalCount: initiative.signals.length,
      },
    });
  } catch (e: any) {
    return Response.json(
      { error: "Failed to fetch initiative", message: e?.message },
      { status: 500 }
    );
  }
}