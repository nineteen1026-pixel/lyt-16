import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const entries = await prisma.stockEntry.findMany({
    include: { items: { include: { material: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { operator, remark, items } = body;

  const entry = await prisma.$transaction(async (tx) => {
    const created = await tx.stockEntry.create({
      data: {
        operator,
        remark: remark || "",
        items: {
          create: items.map(
            (it: { materialId: number; quantity: number; remark?: string }) => ({
              materialId: it.materialId,
              quantity: it.quantity,
              remark: it.remark || "",
            })
          ),
        },
      },
      include: { items: { include: { material: true } } },
    });

    for (const it of items as { materialId: number; quantity: number }[]) {
      await tx.stock.upsert({
        where: { materialId: it.materialId },
        update: { quantity: { increment: it.quantity } },
        create: { materialId: it.materialId, quantity: it.quantity },
      });
    }

    return created;
  });

  return NextResponse.json(entry, { status: 201 });
}
