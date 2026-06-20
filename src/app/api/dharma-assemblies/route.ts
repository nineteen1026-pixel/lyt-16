import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const assemblies = await prisma.dharmaAssembly.findMany({
    orderBy: { startTime: "asc" },
  });
  return NextResponse.json(assemblies);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, type, master, startTime, endTime, hall, remark } = body;

  if (!name || !type || !master || !startTime || !endTime || !hall) {
    return NextResponse.json({ error: "请填写所有必填项" }, { status: 400 });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    return NextResponse.json({ error: "结束时间必须晚于开始时间" }, { status: 400 });
  }

  const conflicts = await prisma.dharmaAssembly.findMany({
    where: {
      hall,
      AND: [
        { startTime: { lt: end } },
        { endTime: { gt: start } },
      ],
    },
  });

  if (conflicts.length > 0) {
    return NextResponse.json(
      {
        error: "时段冲突",
        conflicts: conflicts.map((c) => ({
          id: c.id,
          name: c.name,
          startTime: c.startTime,
          endTime: c.endTime,
          master: c.master,
          hall: c.hall,
        })),
      },
      { status: 409 }
    );
  }

  const created = await prisma.dharmaAssembly.create({
    data: {
      name,
      type,
      master,
      startTime: start,
      endTime: end,
      hall,
      remark: remark || "",
    },
  });
  return NextResponse.json(created, { status: 201 });
}
