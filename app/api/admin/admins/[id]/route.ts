import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import * as bcrypt from "bcryptjs";

// 更新管理员密码
async function handlePut(request: NextRequest, userId: number, id: string) {
  try {
    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "密码长度至少为6位" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(admin);
  } catch (error) {
    console.error("更新管理员密码错误:", error);
    return NextResponse.json({ error: "更新管理员密码失败" }, { status: 500 });
  }
}

// 删除管理员
async function handleDelete(request: NextRequest, userId: number, id: string) {
  try {
    const targetId = parseInt(id);

    // 不能删除自己
    if (targetId === userId) {
      return NextResponse.json(
        { error: "不能删除当前登录的管理员" },
        { status: 400 }
      );
    }

    // 检查是否是最后一个管理员
    const adminCount = await prisma.admin.count();
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "不能删除最后一个管理员" },
        { status: 400 }
      );
    }

    await prisma.admin.delete({
      where: { id: targetId },
    });

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("删除管理员错误:", error);
    return NextResponse.json({ error: "删除管理员失败" }, { status: 500 });
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
