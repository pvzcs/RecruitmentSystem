"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select } from "@/components/ui/select";

interface Application {
  id: number;
  email: string;
  qq: string;
  bilibili: string;
  portfolio: string;
  status: string;
  createdAt: string;
  recruitment: {
    title: string;
  };
}

export default function ApplicationsManagement() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await fetch(`/api/admin/applications${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("获取投递列表失败:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchApplications();
      }
    } catch (err) {
      console.error("更新状态失败:", err);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>投递管理</CardTitle>
              <CardDescription>查看和管理所有投递信息</CardDescription>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">全部</option>
              <option value="pending">待处理</option>
              <option value="processed">已处理</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">加载中...</p>
          ) : applications.length === 0 ? (
            <p className="text-center py-8 text-gray-500">暂无投递信息</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>招募职位</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>QQ</TableHead>
                    <TableHead>B站</TableHead>
                    <TableHead>代表作</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>投递时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        {app.recruitment.title}
                      </TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>{app.qq}</TableCell>
                      <TableCell>{app.bilibili}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {app.portfolio || "-"}
                      </TableCell>
                      <TableCell>
                        {app.status === "pending" ? (
                          <Badge variant="secondary">待处理</Badge>
                        ) : (
                          <Badge>已处理</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(app.createdAt).toLocaleDateString("zh-CN")}
                      </TableCell>
                      <TableCell className="text-right">
                        {app.status === "pending" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(app.id, "processed")
                            }
                          >
                            标记已处理
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(app.id, "pending")
                            }
                          >
                            标记待处理
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
