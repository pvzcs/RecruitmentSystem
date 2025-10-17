import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

// 更新招募信息
async function handlePut(request: NextRequest, userId: number, id: string) {
  try {
    const { title, description, isActive } = await request.json();

    const recruitment = await prisma.recruitment.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(recruitment);
  } catch (error) {
    console.error("更新招募错误:", error);
    return NextResponse.json({ error: "更新招募失败" }, { status: 500 });
  }
}

// 删除招募信息
async function handleDelete(request: NextRequest, userId: number, id: string) {
  try {
    await prisma.recruitment.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除招募错误:", error);
    return NextResponse.json({ error: "删除招募失败" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(request, (req, userId) => handlePut(req, userId, id));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(request, (req, userId) => handleDelete(req, userId, id));
}
