import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

// 获取所有投递信息
async function handleGet(request: NextRequest, userId: number) {
  try {
    const { searchParams } = new URL(request.url);
    const recruitmentId = searchParams.get("recruitmentId");
    const status = searchParams.get("status");

    const applications = await prisma.application.findMany({
      where: {
        ...(recruitmentId && { recruitmentId: parseInt(recruitmentId) }),
        ...(status && { status }),
      },
      include: {
        recruitment: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("获取投递信息错误:", error);
    return NextResponse.json({ error: "获取投递信息失败" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return withAuth(request, handleGet);
}
