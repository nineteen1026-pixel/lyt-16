import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await _request.json();
  const { status } = body;
  const updated = await prisma.purchaseRequest.update({
    where: { id: Number(id) },
    data: { status },
    include: { items: { include: { material: true } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.purchaseRequest.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
