import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const assemblyId = Number(id);

  const assembly = await prisma.dharmaAssembly.findUnique({
    where: { id: assemblyId },
  });

  if (!assembly) {
    return NextResponse.json({ error: "法会不存在" }, { status: 404 });
  }

  const registrations = await prisma.registration.findMany({
    where: { assemblyId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    assembly,
    registrations,
    total: registrations.length,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const assemblyId = Number(id);
  const body = await request.json();
  const { name, phone } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "请填写姓名和联系方式" }, { status: 400 });
  }

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return NextResponse.json({ error: "请输入正确的手机号码" }, { status: 400 });
  }

  const assembly = await prisma.dharmaAssembly.findUnique({
    where: { id: assemblyId },
    include: {
      _count: {
        select: { registrations: true },
      },
    },
  });

  if (!assembly) {
    return NextResponse.json({ error: "法会不存在" }, { status: 404 });
  }

  if (assembly.registrationDeadline && new Date() > assembly.registrationDeadline) {
    return NextResponse.json({ error: "报名已截止" }, { status: 400 });
  }

  if (assembly.capacity > 0 && assembly._count.registrations >= assembly.capacity) {
    return NextResponse.json({ error: "报名名额已满" }, { status: 400 });
  }

  try {
    const registration = await prisma.registration.create({
      data: {
        assemblyId,
        name: name.trim(),
        phone: phone.trim(),
      },
    });

    const updatedAssembly = await prisma.dharmaAssembly.findUnique({
      where: { id: assemblyId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    return NextResponse.json(
      {
        registration,
        currentCount: updatedAssembly?._count.registrations || 0,
        capacity: assembly.capacity,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "该手机号已报名此法会" }, { status: 409 });
  }
}
