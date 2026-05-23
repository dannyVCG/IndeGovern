import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const decisionsNeeded = await prisma.decision.findMany({
      where: { status: { in: ["PENDING", "RECOMMENDED"] } },
      include: { initiative: true },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    const confidenceDrops = await prisma.initiative.findMany({
      where: { confidence: { lt: 70 } },
      orderBy: { confidence: "asc" },
      take: 10,
    });

    const topRisks = await prisma.risk.findMany({
      where: { status: "OPEN" },
      include: { initiative: true },
      orderBy: [{ severity: "desc" }, { updatedAt: "desc" }],
      take: 10,
    });

    return Response.json({
      decisionsNeeded,
      confidenceDrops,
      topRisks,
    });
  } catch (e: any) {
    return Response.json({ error: "Failed to build dashboard", message: e?.message }, { status: 500 });
  }
}