#!/bin/sh
# Docker 容器初始化脚本

set -e

echo "🚀 开始初始化数据库..."

# 推送 Prisma schema 到数据库
pnpm db:push

echo "📝 执行初始化数据脚本..."

# 运行初始化脚本
pnpm tsx scripts/init-db.ts

echo "✅ 数据库初始化完成！"
