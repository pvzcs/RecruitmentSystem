import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 创建投递申请
export async function POST(request: NextRequest) {
  try {
    const { recruitmentId, email, qq, bilibili, portfolio } =
      await request.json();

    if (!recruitmentId || !email || !qq || !bilibili) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    }

    // 验证QQ号格式
    const qqRegex = /^[1-9][0-9]{4,10}$/;
    if (!qqRegex.test(qq)) {
      return NextResponse.json({ error: "QQ号格式不正确" }, { status: 400 });
    }

    // 检查招募信息是否存在且激活
    const recruitment = await prisma.recruitment.findUnique({
      where: { id: parseInt(recruitmentId) },
    });

    if (!recruitment || !recruitment.isActive) {
      return NextResponse.json(
        { error: "该招募已关闭或不存在" },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        recruitmentId: parseInt(recruitmentId),
        email,
        qq,
        bilibili,
        portfolio: portfolio || "",
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("创建投递错误:", error);
    return NextResponse.json({ error: "投递失败" }, { status: 500 });
  }
}
