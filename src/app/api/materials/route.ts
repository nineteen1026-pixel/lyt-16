import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const materials = await prisma.material.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json(materials);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, category, unit } = body;
  const created = await prisma.material.create({
    data: { name, category, unit },
  });
  return NextResponse.json(created, { status: 201 });
}
