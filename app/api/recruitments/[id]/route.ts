import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 获取单个招募信息详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recruitment = await prisma.recruitment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!recruitment) {
      return NextResponse.json({ error: "招募信息不存在" }, { status: 404 });
    }

    return NextResponse.json(recruitment);
  } catch (error) {
    console.error("获取招募详情错误:", error);
    return NextResponse.json({ error: "获取招募详情失败" }, { status: 500 });
  }
}
