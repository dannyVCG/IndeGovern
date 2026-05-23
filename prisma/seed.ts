import { prisma } from "../lib/prisma";

async function main() {
  // Clean (dev only)
  await prisma.evidence.deleteMany();
  await prisma.signal.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.initiative.deleteMany();

  const a = await prisma.initiative.create({
    data: {
      name: "Medical Content AI Assistant",
      owner: "Owner A",
      capability: "EMS",
      box: "Box 2",
      status: "AT_RISK",
      confidence: 60,
      risks: {
        create: [
          { title: "Vendor dependency delay", severity: "HIGH", source: "TEAMS" },
          { title: "Evidence missing for approval milestone", severity: "MEDIUM", source: "SHAREPOINT" }
        ]
      },
      decisions: {
        create: [
          {
            question: "Do we delay the launch or reduce scope?",
            optionsJson: JSON.stringify([
              { option: "Delay launch by 2 weeks", impact: "Time +2w, Risk low" },
              { option: "Reduce scope to core features", impact: "Time stable, Risk medium" }
            ]),
            status: "PENDING",
            source: "MANUAL"
          }
        ]
      }
    }
  });

  const b = await prisma.initiative.create({
    data: {
      name: "Signal Nexus Expansion",
      owner: "Owner B",
      capability: "DAAI",
      box: "Box 3",
      status: "ON_TRACK",
      confidence: 78
    }
  });

  const c = await prisma.initiative.create({
    data: {
      name: "Sentiment Analysis Upgrade",
      owner: "Owner C",
      capability: "Omni AI",
      box: "Box 1",
      status: "AT_RISK",
      confidence: 66,
      risks: {
        create: [{ title: "No update received for 10 days", severity: "MEDIUM", source: "MANUAL" }]
      }
    }
  });

  // add some signals (drivers)
  await prisma.signal.createMany({
    data: [
      {
        initiativeId: a.id,
        source: "JIRA",
        type: "blocker_age_days",
        payloadJson: JSON.stringify({ blockerAgeDays: 9 })
      },
      {
        initiativeId: a.id,
        source: "AHA",
        type: "milestone_slip_days",
        payloadJson: JSON.stringify({ milestone: "Approval", slipDays: 10 })
      }
    ]
  });

  // add evidence links
  await prisma.evidence.createMany({
    data: [
      {
        initiativeId: a.id,
        url: "https://sharepoint.example.com/sites/ai/MedicalContent/ApprovalDoc",
        title: "Approval Evidence (Draft)",
        docType: "Approval",
        source: "SHAREPOINT"
      }
    ]
  });

  console.log("Seed complete:", { a: a.id, b: b.id, c: c.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });