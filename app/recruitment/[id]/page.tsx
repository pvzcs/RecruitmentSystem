"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Recruitment {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export default function RecruitmentDetail() {
  const params = useParams();
  const router = useRouter();
  const [recruitment, setRecruitment] = useState<Recruitment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    qq: "",
    bilibili: "",
    portfolio: "",
  });

  useEffect(() => {
    fetchRecruitment();
  }, [params.id]);

  const fetchRecruitment = async () => {
    try {
      const res = await fetch(`/api/recruitments/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setRecruitment(data);
      } else {
        setError("招募信息不存在");
      }
    } catch (err) {
      setError("获取招募信息失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruitmentId: params.id,
          ...formData,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setFormData({ email: "", qq: "", bilibili: "", portfolio: "" });
      } else {
        setError(data.error || "投递失败");
      }
    } catch (err) {
      setError("投递失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (error && !recruitment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/">
            <Button>返回首页</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-green-600">
              投递成功！
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              我们已收到您的申请，会尽快通过QQ与您联系。
            </p>
            <p className="text-sm text-gray-500">
              我们也会通过B站私聊来验证您填写信息的真伪，如发现造假将会被植创社永久拉黑。
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button variant="outline">返回首页</Button>
              </Link>
              <Button onClick={() => setSuccess(false)}>继续投递</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl">{recruitment?.title}</CardTitle>
              <CardDescription>
                发布于{" "}
                {recruitment &&
                  new Date(recruitment.createdAt).toLocaleDateString("zh-CN")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-green max-w-none">
                <ReactMarkdown>{recruitment?.description || ""}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>立即投递</CardTitle>
              <CardDescription>
                请如实填写您的信息，我们会尽快与您联系
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱 *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qq">QQ号 *</Label>
                  <Input
                    id="qq"
                    type="text"
                    required
                    value={formData.qq}
                    onChange={(e) =>
                      setFormData({ ...formData, qq: e.target.value })
                    }
                    placeholder="请输入您的QQ号"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bilibili">B站号 *</Label>
                  <Input
                    id="bilibili"
                    type="text"
                    required
                    value={formData.bilibili}
                    onChange={(e) =>
                      setFormData({ ...formData, bilibili: e.target.value })
                    }
                    placeholder="请输入您的B站用户名或UID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio">代表作</Label>
                  <Textarea
                    id="portfolio"
                    value={formData.portfolio}
                    onChange={(e) =>
                      setFormData({ ...formData, portfolio: e.target.value })
                    }
                    placeholder="请简要介绍您的代表作品或相关经验"
                    rows={4}
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    我们会通过QQ联系您，也会通过B站私聊来验证您填写信息的真伪。
                    <strong className="text-red-600">
                      如发现造假将会被植创社永久拉黑。
                    </strong>
                  </AlertDescription>
                </Alert>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "提交中..." : "提交申请"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
