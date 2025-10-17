import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 获取所有激活的招募信息（前台使用）
export async function GET(request: NextRequest) {
  try {
    const recruitments = await prisma.recruitment.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(recruitments);
  } catch (error) {
    console.error("获取招募信息错误:", error);
    return NextResponse.json({ error: "获取招募信息失败" }, { status: 500 });
  }
}
