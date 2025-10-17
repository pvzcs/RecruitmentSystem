"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Recruitment {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  _count?: { applications: number };
}

export default function RecruitmentManagement() {
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    fetchRecruitments();
  }, []);

  const fetchRecruitments = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/recruitments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setRecruitments(data);
      }
    } catch (err) {
      console.error("获取招募列表失败:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("admin_token");
      const url = editingId
        ? `/api/admin/recruitments/${editingId}`
        : "/api/admin/recruitments";

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setDialogOpen(false);
        setFormData({ title: "", description: "", isActive: true });
        setEditingId(null);
        fetchRecruitments();
      } else {
        const data = await res.json();
        setError(data.error || "操作失败");
      }
    } catch (err) {
      setError("操作失败，请稍后重试");
    }
  };

  const handleEdit = (recruitment: Recruitment) => {
    setEditingId(recruitment.id);
    setFormData({
      title: recruitment.title,
      description: recruitment.description,
      isActive: recruitment.isActive,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这条招募信息吗？")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/recruitments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchRecruitments();
      }
    } catch (err) {
      console.error("删除失败:", err);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setFormData({ title: "", description: "", isActive: true });
      setError("");
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>招募管理</CardTitle>
              <CardDescription>创建和管理招募信息</CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  新建招募
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? "编辑招募" : "新建招募"}
                  </DialogTitle>
                  <DialogDescription>
                    填写招募信息，支持Markdown格式
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">标题 *</Label>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="请输入招募标题"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">简介 (Markdown) *</Label>
                    <Textarea
                      id="description"
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="请输入招募简介，支持Markdown格式"
                      rows={10}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isActive">启用此招募</Label>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDialogClose(false)}
                    >
                      取消
                    </Button>
                    <Button type="submit">{editingId ? "更新" : "创建"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">加载中...</p>
          ) : recruitments.length === 0 ? (
            <p className="text-center py-8 text-gray-500">暂无招募信息</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>投递数</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recruitments.map((recruitment) => (
                  <TableRow key={recruitment.id}>
                    <TableCell className="font-medium">
                      {recruitment.title}
                    </TableCell>
                    <TableCell>
                      {recruitment.isActive ? (
                        <Badge>进行中</Badge>
                      ) : (
                        <Badge variant="secondary">已关闭</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {recruitment._count?.applications || 0}
                    </TableCell>
                    <TableCell>
                      {new Date(recruitment.createdAt).toLocaleDateString(
                        "zh-CN"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(recruitment)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(recruitment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
