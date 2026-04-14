import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Step 1: Upsert user (idempotent)
  const user = await prisma.user.upsert({
    where: { email: "admin@local" },
    update: {},
    create: {
      email: "admin@local",
      hashedApiKey: "local",
    },
  });
  console.log(`✅ User:      ${user.id}  (${user.email})`);

  // Step 2: Upsert workspace
  let workspace = await prisma.workspace.findFirst({
    where: { userId: user.id, name: "My Workspace" },
  });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { userId: user.id, name: "My Workspace" },
    });
  }
  console.log(`✅ Workspace: ${workspace.id}  (${workspace.name})`);

  // Step 3: Upsert project
  let project = await prisma.project.findFirst({
    where: { workspaceId: workspace.id, name: "My Project" },
  });
  if (!project) {
    project = await prisma.project.create({
      data: { workspaceId: workspace.id, name: "My Project" },
    });
  }
  console.log(`✅ Project:   ${project.id}  (${project.name})`);

  console.log("\n──────────────────────────────────────────");
  console.log(`📋 Copy this Project UUID for your MCP tools:`);
  console.log(`\n   ${project.id}\n`);
  console.log("──────────────────────────────────────────");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
