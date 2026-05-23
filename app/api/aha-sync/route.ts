// app/api/aha-sync/route.ts
import { fetchAhaInitiatives, mapAhaToInitiative } from "@/lib/aha";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    // 1. Fetch from Aha
    const ahaInitiatives = await fetchAhaInitiatives();

    if (!ahaInitiatives || ahaInitiatives.length === 0) {
      return Response.json({
        ok: true,
        message: "No initiatives found in Aha",
        synced: 0,
      });
    }

    // 2. Map + upsert into DB
    let synced = 0;
    const results = [];

    for (const ahaInit of ahaInitiatives) {
      const mapped = mapAhaToInitiative(ahaInit);

      // Check if already exists (by ahaId)
      const existing = await prisma.initiative.findFirst({
        where: { ahaId: mapped.ahaId },
      });

      if (existing) {
        // Update existing
        await prisma.initiative.update({
          where: { id: existing.id },
          data: {
            name: mapped.name,
            owner: mapped.owner,
            capability: mapped.capability,
            status: mapped.status as any,
            lastUpdated: new Date(),
          },
        });
        results.push({ action: "updated", name: mapped.name });
      } else {
        // Create new
        await prisma.initiative.create({
          data: {
            name: mapped.name,
            owner: mapped.owner,
            capability: mapped.capability,
            box: mapped.box,
            status: mapped.status as any,
            confidence: mapped.confidence,
            ahaId: mapped.ahaId,
          },
        });
        results.push({ action: "created", name: mapped.name });
      }

      synced++;
    }

    return Response.json({
      ok: true,
      message: `Synced ${synced} initiatives from Aha`,
      synced,
      results,
    });
  } catch (e: any) {
    console.error("Aha sync error:", e);
    return Response.json(
      { ok: false, error: "Aha sync failed", message: e?.message },
      { status: 500 }
    );
  }
}

// Also allow GET to check Aha connection
export async function GET() {
  try {
    const ahaInitiatives = await fetchAhaInitiatives();

    return Response.json({
      ok: true,
      source: "Aha",
      count: ahaInitiatives.length,
      preview: ahaInitiatives.slice(0, 5).map((i: any) => ({
        id: i.id,
        name: i.name,
        status: i.workflow_status?.name,
        owner: i.assigned_to_user?.name,
        due_date: i.due_date,
      })),
    });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: "Aha connection failed", message: e?.message },
      { status: 500 }
    );
  }
}