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

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();

  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(trimmedPhone)) {
    return NextResponse.json({ error: "请输入正确的手机号码" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const assembly = await tx.dharmaAssembly.findUnique({
        where: { id: assemblyId },
      });

      if (!assembly) {
        throw { status: 404, message: "法会不存在" };
      }

      if (assembly.registrationDeadline && new Date() > assembly.registrationDeadline) {
        throw { status: 400, message: "报名已截止" };
      }

      const currentCount = await tx.registration.count({
        where: { assemblyId },
      });

      if (assembly.capacity > 0 && currentCount >= assembly.capacity) {
        throw { status: 400, message: "报名名额已满" };
      }

      const existing = await tx.registration.findUnique({
        where: {
          assemblyId_phone: {
            assemblyId,
            phone: trimmedPhone,
          },
        },
      });

      if (existing) {
        throw { status: 409, message: "该手机号已报名此法会" };
      }

      const registration = await tx.registration.create({
        data: {
          assemblyId,
          name: trimmedName,
          phone: trimmedPhone,
        },
      });

      return {
        registration,
        currentCount: currentCount + 1,
        capacity: assembly.capacity,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    const err = e as { status?: number; message?: string };
    if (err.status && err.message) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "报名失败，请重试" }, { status: 500 });
  }
}
