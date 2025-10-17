import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth";

// 更新投递状态
async function handlePatch(request: NextRequest, userId: number, id: string) {
  try {
    const { status } = await request.json();

    if (!status || !["pending", "processed"].includes(status)) {
      return NextResponse.json({ error: "无效的状态值" }, { status: 400 });
    }

    const application = await prisma.application.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("更新投递状态错误:", error);
    return NextResponse.json({ error: "更新投递状态失败" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withAuth(request, (req, userId) => handlePatch(req, userId, id));
}
