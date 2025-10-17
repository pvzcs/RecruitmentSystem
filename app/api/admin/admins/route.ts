import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";
import * as bcrypt from "bcryptjs";

// 获取所有管理员
async function handleGet(request: NextRequest, userId: number) {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error("获取管理员列表错误:", error);
    return NextResponse.json({ error: "获取管理员列表失败" }, { status: 500 });
  }
}

// 创建新管理员
async function handlePost(request: NextRequest, userId: number) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "密码长度至少为6位" }, { status: 400 });
    }

    // 检查用户名是否已存在
    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    });

    if (existingAdmin) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch (error) {
    console.error("创建管理员错误:", error);
    return NextResponse.json({ error: "创建管理员失败" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return withAuth(request, handleGet);
}

export async function POST(request: NextRequest) {
  return withAuth(request, handlePost);
}
