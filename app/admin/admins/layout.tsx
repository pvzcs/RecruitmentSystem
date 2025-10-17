"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Users, Briefcase, FileText, UserCog, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("admin_user");

    if (!token || !userStr) {
      router.push("/admin");
      return;
    }

    setUser(JSON.parse(userStr));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/admin");
  };

  const navItems = [
    { href: "/admin/dashboard", icon: Briefcase, label: "招募管理" },
    { href: "/admin/applications", icon: FileText, label: "投递管理" },
    { href: "/admin/admins", icon: UserCog, label: "管理员" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        加载中...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-primary">植创社管理后台</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">欢迎，{user.username}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              退出
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <nav className="w-48 flex-shrink-0">
            <div className="bg-white rounded-lg border p-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start"
                      size="sm"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </nav>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
