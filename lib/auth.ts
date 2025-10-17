import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, userId: number) => Promise<Response>
): Promise<Response> {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: "无效的token" }, { status: 401 });
    }

    return handler(request, payload.userId);
  } catch (error) {
    return NextResponse.json({ error: "认证失败" }, { status: 401 });
  }
}
