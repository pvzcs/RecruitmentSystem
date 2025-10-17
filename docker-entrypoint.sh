#!/bin/sh
set -e

echo "🚀 启动应用..."

# 数据库文件路径
DB_FILE="/app/data/prod.db"
INIT_FLAG="/app/data/.initialized"

# 检查数据库是否需要初始化
if [ ! -f "$INIT_FLAG" ]; then
    echo "📦 首次启动，正在初始化数据库..."
    
    # 确保数据目录存在
    mkdir -p /app/data
    
    # 推送 Prisma schema 到数据库
    echo "📝 创建数据库表结构..."
    node_modules/.bin/prisma db push --schema=./prisma/schema.prisma --accept-data-loss
    
    # 运行初始化脚本
    if [ -f "./scripts/init-db.ts" ]; then
        echo "🔧 执行数据初始化脚本..."
        node_modules/.bin/tsx scripts/init-db.ts
    fi
    
    # 创建初始化标记文件
    touch "$INIT_FLAG"
    echo "✅ 数据库初始化完成！"
else
    echo "✓ 数据库已初始化，跳过初始化步骤"
fi

echo "🌟 启动 Next.js 服务器..."

# 启动 Next.js 应用
exec node server.js
