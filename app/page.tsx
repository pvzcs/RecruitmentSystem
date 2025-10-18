import Link from "next/link";
import { Users, Briefcase } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Recruitment {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

async function getRecruitments(): Promise<Recruitment[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/recruitments`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("获取招募信息失败:", error);
    return [];
  }
}

export default async function Home() {
  const recruitments = await getRecruitments();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">
              植创社人员招募系统
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">加入我们</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            欢迎来到植创社人员招募系统，请在下面选择适合您的项目申请吧～
          </p>
        </div>

        {recruitments.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">暂无招募信息</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recruitments.map((recruitment) => (
              <Card
                key={recruitment.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-xl">{recruitment.title}</CardTitle>
                  <CardDescription>
                    {new Date(recruitment.createdAt).toLocaleDateString(
                      "zh-CN"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {recruitment.description.substring(0, 100)}...
                  </p>
                  <Link href={`/recruitment/${recruitment.id}`}>
                    <Button className="w-full">查看详情</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2025 植创社. All rights reserved.</p>
          <a
            href="http://beian.miit.gov.cn/"
            target="_blank"
            aria-label="浙ICP备2024119342号-2"
          >
            浙ICP备2024119342号-2
          </a>
        </div>
      </footer>
    </div>
  );
}
