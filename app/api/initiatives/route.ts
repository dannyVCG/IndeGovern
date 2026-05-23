import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const initiatives = await prisma.initiative.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        risks: true,
        decisions: true,
      },
    });
    return Response.json(initiatives);
  } catch (e: any) {
    return Response.json({ error: "Failed to fetch initiatives", message: e?.message }, { status: 500 });
  }
}