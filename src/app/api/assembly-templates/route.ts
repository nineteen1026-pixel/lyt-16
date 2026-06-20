import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const templates = await prisma.assemblyMaterialTemplate.findMany({
    orderBy: { type: "asc" },
    include: {
      items: {
        include: { material: true },
      },
    },
  });
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type, name, remark, items } = body;

  if (!type || !name) {
    return NextResponse.json({ error: "请填写类型和名称" }, { status: 400 });
  }

  const existing = await prisma.assemblyMaterialTemplate.findUnique({
    where: { type },
  });

  if (existing) {
    return NextResponse.json({ error: "该法会类型已存在模板" }, { status: 400 });
  }

  const created = await prisma.assemblyMaterialTemplate.create({
    data: {
      type,
      name,
      remark: remark || "",
      items: {
        create: items?.map((item: { materialId: number; quantity: number; remark?: string }) => ({
          materialId: item.materialId,
          quantity: item.quantity,
          remark: item.remark || "",
        })) || [],
      },
    },
    include: {
      items: {
        include: { material: true },
      },
    },
  });

  return NextResponse.json(created, { status: 201 });
}
