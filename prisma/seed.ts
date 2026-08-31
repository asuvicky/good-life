import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const chairHash = await bcrypt.hash("chair123", 10);
  const adminHash = await bcrypt.hash("admin123", 10);

  await prisma.staff.upsert({
    where: { username: "chair" },
    update: {},
    create: {
      name: "社區主委",
      username: "chair",
      passwordHash: chairHash,
      role: "CHAIR",
    },
  });

  await prisma.staff.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      name: "管委會管理員",
      username: "admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const samples = [
    { doorplate: "1號", householdNumber: "A1", residentName: "王小明" },
    { doorplate: "1號", householdNumber: "A2", residentName: "陳美玲" },
    { doorplate: "2號", householdNumber: "B1", residentName: "林志豪" },
    { doorplate: "3號", householdNumber: "C1", residentName: "張雅婷" },
  ];

  for (const h of samples) {
    await prisma.household.upsert({
      where: {
        doorplate_householdNumber: {
          doorplate: h.doorplate,
          householdNumber: h.householdNumber,
        },
      },
      update: {},
      create: h,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
