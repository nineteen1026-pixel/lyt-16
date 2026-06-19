import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const requests = await prisma.purchaseRequest.findMany({
    include: { items: { include: { material: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, applicant, remark, items } = body;
  const created = await prisma.purchaseRequest.create({
    data: {
      title,
      applicant,
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
  return NextResponse.json(created, { status: 201 });
}
