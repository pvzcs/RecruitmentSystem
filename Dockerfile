# 多阶段构建 - 基础镜像
FROM node:20-alpine AS base

# 安装pnpm和必要的依赖
RUN npm install -g pnpm@10.13.1

# 依赖阶段
FROM base AS deps
WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma

# 安装所有依赖（包括devDependencies，因为需要prisma cli）
RUN pnpm install --frozen-lockfile

# 生成 Prisma Client
RUN pnpm db:generate

# 构建阶段
FROM base AS builder
WORKDIR /app

# 复制依赖和生成的 Prisma Client
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 构建 Next.js 应用（standalone模式）
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# 生产运行阶段
FROM base AS runner
WORKDIR /app

# 设置为生产环境
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非root用户
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 复制 public 目录
COPY --from=builder /app/public ./public

# 复制 standalone 输出（包含所有必要的依赖）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制 Prisma schema 和 scripts
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# 复制启动脚本
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# 复制完整的 node_modules 用于初始化（包括 Prisma CLI 和 tsx）
# 这样可以确保所有依赖都在
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# 创建数据目录
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app

USER nextjs

# 暴露端口
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 使用启动脚本
ENTRYPOINT ["./docker-entrypoint.sh"]
