/**
 * 客户端认证工具函数
 */

export interface AdminUser {
  id: number;
  username: string;
}

/**
 * 获取存储的 token
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

/**
 * 获取存储的用户信息
 */
export function getUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("admin_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!(getToken() && getUser());
}

/**
 * 验证 token 是否有效（通过调用 API）
 */
export async function validateToken(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;

  try {
    // 尝试调用一个需要认证的 API 来验证 token
    const res = await fetch("/api/admin/admins", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 保存登录信息
 */
export function saveAuth(token: string, user: AdminUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("admin_token", token);
  localStorage.setItem("admin_user", JSON.stringify(user));
}

/**
 * 清除登录信息
 */
export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
}
