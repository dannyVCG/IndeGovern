import { prisma } from "@/lib/prisma";

const AHA_BASE = process.env.AHA_BASE_URL;
const AHA_KEY = process.env.AHA_API_KEY;

// Fetch initiatives from Aha
async function fetchAhaInitiatives() {
  const res = await fetch(`${AHA_BASE}/api/v1/initiatives`, {
    headers: {
      Authorization: `Bearer ${AHA_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Aha API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.initiatives || [];
}

// Sync Aha initiatives into local DB
async function syncToDatabase(ahaInitiatives: any[]) {
  const results = [];

  for (const item of ahaInitiatives) {
    const existing = await prisma.initiative.findFirst({
      where: { ahaId: item.id?.toString() },
    });

    if (existing) {
      // Update existing
      const updated = await prisma.initiative.update({
        where: { id: existing.id },
        data: {
          name: item.name || existing.name,
          owner: item.assigned_to_user?.name || existing.owner,
          status: mapAhaStatus(item.status),
          lastUpdated: new Date(),
        },
      });
      results.push({ action: "updated", id: updated.id, name: updated.name });
    } else {
      // Create new
      const created = await prisma.initiative.create({
        data: {
          name: item.name || "Unnamed Initiative",
          owner: item.assigned_to_user?.name || null,
          ahaId: item.id?.toString(),
          status: mapAhaStatus(item.status),
          confidence: 75, // default
          capability: null,
          box: null,
        },
      });
      results.push({ action: "created", id: created.id, name: created.name });
    }
  }

  return results;
}

// Map Aha status to our status enum
function mapAhaStatus(ahaStatus: string | undefined): any {
  if (!ahaStatus) return "ON_TRACK";

  const s = ahaStatus.toLowerCase();
  if (s.includes("not started")) return "NOT_STARTED";
  if (s.includes("at risk") || s.includes("risk")) return "AT_RISK";
  if (s.includes("delayed") || s.includes("behind")) return "DELAYED";
  if (s.includes("done") || s.includes("complete") || s.includes("shipped"))
    return "COMPLETED";
  if (s.includes("in progress") || s.includes("active")) return "ON_TRACK";

  return "ON_TRACK";
}

// GET = fetch from Aha + sync to DB + return combined data
export async function GET() {
  try {
    // 1. Fetch from Aha
    const ahaData = await fetchAhaInitiatives();

    // 2. Sync to DB
    const syncResults = await syncToDatabase(ahaData);

    // 3. Return all initiatives from DB (now includes Aha data)
    const allInitiatives = await prisma.initiative.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        risks: true,
        decisions: true,
      },
    });

    return Response.json({
      synced: syncResults.length,
      syncDetails: syncResults,
      initiatives: allInitiatives,
    });
  } catch (e: any) {
    return Response.json(
      {
        error: "Failed to fetch from Aha",
        message: e?.message,
      },
      { status: 500 }
    );
  }
}