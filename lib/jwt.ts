import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

if (!JWT_SECRET || JWT_SECRET === "your-secret-key-change-in-production") {
  console.log(
    "JWT_SECRET 未设置或为默认值，拒绝认证。请在环境变量中设置强随机密钥。"
  );
}

export interface JWTPayload {
  userId: number;
  username: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}
