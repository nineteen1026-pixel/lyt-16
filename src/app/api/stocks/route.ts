import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const stocks = await prisma.stock.findMany({
    include: { material: true },
    orderBy: { materialId: "asc" },
  });
  return NextResponse.json(stocks);
}
