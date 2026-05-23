import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const { riskId } = await req.json();

    if (!riskId) {
      return Response.json({ error: "riskId is required" }, { status: 400 });
    }

    await prisma.risk.update({
      where: { id: riskId },
      data: { status: "RESOLVED" },
    });

    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: "Failed to resolve risk", message: e?.message }, { status: 500 });
  }
}