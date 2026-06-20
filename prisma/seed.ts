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
  const m7 = await prisma.material.upsert({
    where: { id: 7 },
    update: {},
    create: { name: "酥油灯", category: "供奉用品", unit: "盏" },
  });
  const m8 = await prisma.material.upsert({
    where: { id: 8 },
    update: {},
    create: { name: "水果", category: "供奉用品", unit: "盘" },
  });
  const m9 = await prisma.material.upsert({
    where: { id: 9 },
    update: {},
    create: { name: "鲜花", category: "供奉用品", unit: "束" },
  });
  const m10 = await prisma.material.upsert({
    where: { id: 10 },
    update: {},
    create: { name: "元宝纸", category: "供奉用品", unit: "捆" },
  });
  const m11 = await prisma.material.upsert({
    where: { id: 11 },
    update: {},
    create: { name: "纸钱", category: "供奉用品", unit: "叠" },
  });
  const m12 = await prisma.material.upsert({
    where: { id: 12 },
    update: {},
    create: { name: "素面", category: "斋饭食材", unit: "箱" },
  });
  const m13 = await prisma.material.upsert({
    where: { id: 13 },
    update: {},
    create: { name: "蔬菜", category: "斋饭食材", unit: "筐" },
  });
  const m14 = await prisma.material.upsert({
    where: { id: 14 },
    update: {},
    create: { name: "茶叶", category: "日常用品", unit: "斤" },
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

  await prisma.assemblyMaterialTemplate.upsert({
    where: { type: "祈福法会" },
    update: {},
    create: {
      type: "祈福法会",
      name: "祈福法会物资清单",
      remark: "适用于各类祈福法会",
      items: {
        create: [
          { materialId: m1.id, quantity: 5, remark: "红烛" },
          { materialId: m2.id, quantity: 20, remark: "檀香" },
          { materialId: m7.id, quantity: 50, remark: "供灯" },
          { materialId: m8.id, quantity: 10, remark: "新鲜水果" },
          { materialId: m9.id, quantity: 8, remark: "鲜花供佛" },
          { materialId: m3.id, quantity: 3, remark: "斋饭用" },
          { materialId: m4.id, quantity: 2, remark: "斋饭用" },
          { materialId: m12.id, quantity: 2, remark: "结斋面" },
        ],
      },
    },
  });

  await prisma.assemblyMaterialTemplate.upsert({
    where: { type: "超度法会" },
    update: {},
    create: {
      type: "超度法会",
      name: "超度法会物资清单",
      remark: "适用于各类超度法会",
      items: {
        create: [
          { materialId: m1.id, quantity: 8, remark: "白烛" },
          { materialId: m2.id, quantity: 30, remark: "烧香" },
          { materialId: m7.id, quantity: 100, remark: "长明" },
          { materialId: m10.id, quantity: 20, remark: "元宝" },
          { materialId: m11.id, quantity: 30, remark: "纸钱" },
          { materialId: m8.id, quantity: 5, remark: "水果" },
          { materialId: m3.id, quantity: 2, remark: "斋饭" },
          { materialId: m4.id, quantity: 1, remark: "斋饭" },
        ],
      },
    },
  });

  await prisma.assemblyMaterialTemplate.upsert({
    where: { type: "皈依仪式" },
    update: {},
    create: {
      type: "皈依仪式",
      name: "皈依仪式物资清单",
      remark: "适用于三皈依仪式",
      items: {
        create: [
          { materialId: m1.id, quantity: 3, remark: "香烛" },
          { materialId: m2.id, quantity: 15, remark: "佛香" },
          { materialId: m8.id, quantity: 5, remark: "水果供佛" },
          { materialId: m9.id, quantity: 6, remark: "鲜花" },
          { materialId: m14.id, quantity: 1, remark: "茶" },
        ],
      },
    },
  });

  await prisma.assemblyMaterialTemplate.upsert({
    where: { type: "水陆法会" },
    update: {},
    create: {
      type: "水陆法会",
      name: "水陆法会物资清单",
      remark: "大型水陆法会专用",
      items: {
        create: [
          { materialId: m1.id, quantity: 20, remark: "香烛" },
          { materialId: m2.id, quantity: 60, remark: "佛香" },
          { materialId: m7.id, quantity: 200, remark: "酥油灯" },
          { materialId: m8.id, quantity: 30, remark: "水果" },
          { materialId: m9.id, quantity: 20, remark: "鲜花" },
          { materialId: m10.id, quantity: 50, remark: "元宝" },
          { materialId: m11.id, quantity: 80, remark: "纸钱" },
          { materialId: m3.id, quantity: 10, remark: "斋饭" },
          { materialId: m4.id, quantity: 5, remark: "斋饭" },
          { materialId: m12.id, quantity: 5, remark: "结斋面" },
          { materialId: m13.id, quantity: 8, remark: "蔬菜" },
          { materialId: m14.id, quantity: 3, remark: "茶" },
        ],
      },
    },
  });

  await prisma.assemblyMaterialTemplate.upsert({
    where: { type: "焰口法会" },
    update: {},
    create: {
      type: "焰口法会",
      name: "焰口法会物资清单",
      remark: "适用于瑜伽焰口",
      items: {
        create: [
          { materialId: m1.id, quantity: 10, remark: "香烛" },
          { materialId: m2.id, quantity: 40, remark: "佛香" },
          { materialId: m7.id, quantity: 80, remark: "供灯" },
          { materialId: m8.id, quantity: 8, remark: "水果" },
          { materialId: m10.id, quantity: 30, remark: "元宝" },
          { materialId: m11.id, quantity: 50, remark: "纸钱" },
          { materialId: m3.id, quantity: 3, remark: "斋饭" },
          { materialId: m4.id, quantity: 2, remark: "斋饭" },
        ],
      },
    },
  });

  await prisma.assemblyMaterialTemplate.upsert({
    where: { type: "授戒仪式" },
    update: {},
    create: {
      type: "授戒仪式",
      name: "授戒仪式物资清单",
      remark: "适用于各类授戒仪式",
      items: {
        create: [
          { materialId: m1.id, quantity: 5, remark: "香烛" },
          { materialId: m2.id, quantity: 25, remark: "佛香" },
          { materialId: m8.id, quantity: 8, remark: "水果" },
          { materialId: m9.id, quantity: 10, remark: "鲜花" },
          { materialId: m14.id, quantity: 2, remark: "茶" },
        ],
      },
    },
  });

  await prisma.assemblyMaterialTemplate.upsert({
    where: { type: "讲经说法" },
    update: {},
    create: {
      type: "讲经说法",
      name: "讲经说法物资清单",
      remark: "适用于讲经活动",
      items: {
        create: [
          { materialId: m1.id, quantity: 2, remark: "香烛" },
          { materialId: m2.id, quantity: 10, remark: "佛香" },
          { materialId: m9.id, quantity: 5, remark: "鲜花" },
          { materialId: m14.id, quantity: 2, remark: "茶" },
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
