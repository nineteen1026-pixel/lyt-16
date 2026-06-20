import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { action, applicant } = body;

  const assembly = await prisma.dharmaAssembly.findUnique({
    where: { id: Number(id) },
    include: {
      materials: {
        include: { material: true },
      },
    },
  });

  if (!assembly) {
    return NextResponse.json({ error: "法会不存在" }, { status: 404 });
  }

  if (action === "confirm") {
    if (assembly.status !== "draft") {
      return NextResponse.json({ error: "法会已确认，不可重复操作" }, { status: 400 });
    }

    if (assembly.materials.length === 0) {
      return NextResponse.json({ error: "法会没有关联物资需求" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.dharmaAssembly.update({
        where: { id: Number(id) },
        data: { status: "confirmed" },
        include: {
          _count: {
            select: { registrations: true, purchaseRequests: true },
          },
          materials: {
            include: { material: true },
          },
        },
      });

      const items = assembly.materials.map((m) => ({
        materialId: m.materialId,
        quantity: m.quantity,
        remark: m.remark || m.material.name,
      }));

      const purchaseRequest = await tx.purchaseRequest.create({
        data: {
          title: `【${assembly.name}】物资采购申请`,
          applicant: applicant || "系统自动",
          status: "draft",
          remark: `法会排期确认后自动生成的采购申请，法会时间：${assembly.startTime.toLocaleString('zh-CN')} ~ ${assembly.endTime.toLocaleString('zh-CN')}`,
          assemblyId: Number(id),
          items: {
            create: items,
          },
        },
        include: {
          items: {
            include: { material: true },
          },
        },
      });

      return { assembly: updated, purchaseRequest };
    });

    return NextResponse.json(result);
  }

  if (action === "update_materials") {
    const { materials } = body;
    if (!Array.isArray(materials)) {
      return NextResponse.json({ error: "物资数据格式错误" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.dharmaAssemblyMaterial.deleteMany({
        where: { assemblyId: Number(id) },
      });

      const updated = await tx.dharmaAssembly.update({
        where: { id: Number(id) },
        data: {
          materials: {
            create: materials.map((m) => ({
              materialId: m.materialId,
              quantity: m.quantity,
              remark: m.remark || "",
            })),
          },
        },
        include: {
          _count: {
            select: { registrations: true, purchaseRequests: true },
          },
          materials: {
            include: { material: true },
          },
        },
      });

      return updated;
    });

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "未知操作" }, { status: 400 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.dharmaAssembly.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
