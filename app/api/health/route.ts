import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Simple DB ping
    const now = await prisma.$queryRaw`SELECT NOW()`;

    return Response.json(
      {
        ok: true,
        service: "Governance Tower",
        db: "connected",
        now,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return Response.json(
      {
        ok: false,
        service: "Governance Tower",
        db: "error",
        message: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
