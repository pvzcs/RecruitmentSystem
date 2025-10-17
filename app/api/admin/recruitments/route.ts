import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

// 获取所有招募信息（后台管理）
async function handleGet(request: NextRequest, userId: number) {
  try {
    const recruitments = await prisma.recruitment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    return NextResponse.json(recruitments);
  } catch (error) {
    console.error("获取招募信息错误:", error);
    return NextResponse.json({ error: "获取招募信息失败" }, { status: 500 });
  }
}

// 创建新的招募信息
async function handlePost(request: NextRequest, userId: number) {
  try {
    const { title, description, isActive } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "标题和描述不能为空" },
        { status: 400 }
      );
    }

    const recruitment = await prisma.recruitment.create({
      data: {
        title,
        description,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(recruitment, { status: 201 });
  } catch (error) {
    console.error("创建招募错误:", error);
    return NextResponse.json({ error: "创建招募失败" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return withAuth(request, handleGet);
}

export async function POST(request: NextRequest) {
  return withAuth(request, handlePost);
}
