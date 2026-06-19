import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const m1 = await prisma.material.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "香烛", category: "供奉用品", unit: "箱" },
  });
  const m2 = await prisma.material.upsert({
    where: { id: 2 },
    update: {},
    create: { name: "佛香", category: "供奉用品", unit: "把" },
  });
  const m3 = await prisma.material.upsert({
    where: { id: 3 },
    update: {},
    create: { name: "大米", category: "斋饭食材", unit: "袋" },
  });
  const m4 = await prisma.material.upsert({
    where: { id: 4 },
    update: {},
    create: { name: "食用油", category: "斋饭食材", unit: "桶" },
  });
  const m5 = await prisma.material.upsert({
    where: { id: 5 },
    update: {},
    create: { name: "清洁剂", category: "日常清洁", unit: "瓶" },
  });
  const m6 = await prisma.material.upsert({
    where: { id: 6 },
    update: {},
    create: { name: "抹布", category: "日常清洁", unit: "包" },
  });

  await prisma.stock.upsert({
    where: { materialId: m1.id },
    update: {},
    create: { materialId: m1.id, quantity: 20 },
  });
  await prisma.stock.upsert({
    where: { materialId: m2.id },
    update: {},
    create: { materialId: m2.id, quantity: 50 },
  });
  await prisma.stock.upsert({
    where: { materialId: m3.id },
    update: {},
    create: { materialId: m3.id, quantity: 10 },
  });
  await prisma.stock.upsert({
    where: { materialId: m4.id },
    update: {},
    create: { materialId: m4.id, quantity: 5 },
  });
  await prisma.stock.upsert({
    where: { materialId: m5.id },
    update: {},
    create: { materialId: m5.id, quantity: 30 },
  });
  await prisma.stock.upsert({
    where: { materialId: m6.id },
    update: {},
    create: { materialId: m6.id, quantity: 15 },
  });

  const req1 = await prisma.purchaseRequest.create({
    data: {
      title: "中元节供奉用品采购",
      applicant: "释明心",
      status: "approved",
      remark: "中元节法会专用",
      items: {
        create: [
          { materialId: m1.id, quantity: 10, remark: "红烛" },
          { materialId: m2.id, quantity: 30, remark: "檀香" },
        ],
      },
    },
  });

  await prisma.purchaseRequest.create({
    data: {
      title: "斋堂食材补充",
      applicant: "释德慧",
      status: "pending",
      remark: "日常补充",
      items: {
        create: [
          { materialId: m3.id, quantity: 5 },
          { materialId: m4.id, quantity: 3 },
        ],
      },
    },
  });

  await prisma.purchaseRequest.create({
    data: {
      title: "清洁用品采购",
      applicant: "释常净",
      status: "completed",
      remark: "",
      items: {
        create: [
          { materialId: m5.id, quantity: 10 },
          { materialId: m6.id, quantity: 5 },
        ],
      },
    },
  });

  await prisma.stockEntry.create({
    data: {
      operator: "释常净",
      remark: "清洁用品到货入库",
      items: {
        create: [
          { materialId: m5.id, quantity: 10 },
          { materialId: m6.id, quantity: 5 },
        ],
      },
    },
  });

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
