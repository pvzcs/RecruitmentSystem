# Docker 部署文档

本文档介绍如何使用 Docker 部署招聘系统。

## 📋 目录

- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [生产环境部署](#生产环境部署)
- [开发环境部署](#开发环境部署)
- [常用命令](#常用命令)
- [配置说明](#配置说明)
- [数据备份与恢复](#数据备份与恢复)
- [故障排查](#故障排查)

## 前置要求

- Docker Engine 20.10+
- Docker Compose 2.0+
- 至少 512MB 可用内存
- 至少 2GB 可用磁盘空间

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd recruitment
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.production .env

# 编辑 .env 文件，修改 JWT_SECRET
# 生成强随机密钥的方法:
openssl rand -base64 32
```

### 3. 构建并启动

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 4. 初始化数据库

```bash
# 进入容器
docker-compose exec app sh

# 执行初始化
pnpm db:init

# 退出容器
exit
```

### 5. 访问应用

打开浏览器访问: http://localhost:3000

默认管理员账号:

- 用户名: `admin`
- 密码: `admin123`

**⚠️ 首次登录后请立即修改密码！**

## 生产环境部署

### 配置说明

1. **修改 JWT 密钥**

编辑 `.env` 文件:

```env
JWT_SECRET="你的超长随机密钥-至少32字符"
```

2. **配置反向代理 (推荐)**

使用 Nginx 作为反向代理:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. **启用 HTTPS**

使用 Let's Encrypt:

```bash
# 安装 certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

### 部署步骤

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 停止旧容器
docker-compose down

# 3. 重新构建镜像
docker-compose build --no-cache

# 4. 启动新容器
docker-compose up -d

# 5. 检查状态
docker-compose ps
docker-compose logs -f
```

## 开发环境部署

使用开发环境配置文件:

```bash
# 启动开发环境
docker-compose -f docker-compose.dev.yml up

# 后台运行
docker-compose -f docker-compose.dev.yml up -d

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f

# 停止
docker-compose -f docker-compose.dev.yml down
```

开发环境特性:

- 支持热重载
- 挂载源代码目录
- 使用独立的开发数据库

## 常用命令

### 容器管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f app

# 进入容器
docker-compose exec app sh
```

### 数据库管理

```bash
# 初始化数据库
docker-compose exec app pnpm db:init

# 重置数据库 (⚠️ 会删除所有数据)
docker-compose exec app pnpm db:push --force-reset

# 打开 Prisma Studio (数据库GUI)
docker-compose exec app pnpm db:studio
```

### 镜像管理

```bash
# 构建镜像
docker-compose build

# 无缓存构建
docker-compose build --no-cache

# 拉取镜像
docker-compose pull

# 删除未使用的镜像
docker image prune -a
```

## 配置说明

### 环境变量

| 变量名         | 说明           | 默认值                   | 必填 |
| -------------- | -------------- | ------------------------ | ---- |
| `DATABASE_URL` | 数据库连接地址 | `file:/app/data/prod.db` | 是   |
| `JWT_SECRET`   | JWT 签名密钥   | -                        | 是   |
| `NODE_ENV`     | 运行环境       | `production`             | 是   |
| `PORT`         | 应用端口       | `3000`                   | 否   |

### 端口映射

- `3000`: Next.js 应用端口

可以在 `docker-compose.yml` 中修改端口映射:

```yaml
ports:
  - "8080:3000" # 将容器的 3000 端口映射到主机的 8080 端口
```

### 数据持久化

数据库文件存储在 Docker Volume 中:

```yaml
volumes:
  recruitment-data:
    driver: local
```

数据位置: `/var/lib/docker/volumes/recruitment_recruitment-data/_data`

## 数据备份与恢复

### 备份数据库

```bash
# 创建备份目录
mkdir -p backups

# 备份数据库文件
docker-compose exec app sh -c "tar czf /tmp/backup.tar.gz /app/data"
docker cp recruitment-app:/tmp/backup.tar.gz ./backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz

# 或者直接复制数据库文件
docker cp recruitment-app:/app/data/prod.db ./backups/prod-$(date +%Y%m%d-%H%M%S).db
```

### 恢复数据库

```bash
# 停止服务
docker-compose down

# 恢复备份
docker volume rm recruitment_recruitment-data
docker volume create recruitment_recruitment-data
docker run --rm -v recruitment_recruitment-data:/data -v $(pwd)/backups:/backup alpine sh -c "cd /data && tar xzf /backup/backup-YYYYMMDD-HHMMSS.tar.gz --strip 3"

# 启动服务
docker-compose up -d
```

### 自动备份脚本

创建 `scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

docker-compose exec -T app sh -c "tar czf - /app/data" > "$BACKUP_DIR/backup-$DATE.tar.gz"

# 保留最近7天的备份
find $BACKUP_DIR -name "backup-*.tar.gz" -mtime +7 -delete

echo "备份完成: $BACKUP_DIR/backup-$DATE.tar.gz"
```

添加到 crontab:

```bash
# 每天凌晨3点自动备份
0 3 * * * cd /path/to/recruitment && ./scripts/backup.sh >> ./logs/backup.log 2>&1
```

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs -f

# 检查容器状态
docker-compose ps

# 检查端口占用
lsof -i :3000
```

### 数据库连接错误

```bash
# 进入容器检查数据库文件
docker-compose exec app sh
ls -la /app/data/

# 重新初始化数据库
docker-compose exec app pnpm db:push
docker-compose exec app pnpm tsx scripts/init-db.ts
```

### 应用启动慢

```bash
# 检查资源使用
docker stats

# 分配更多资源 (修改 docker-compose.yml)
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

### 清理并重新部署

```bash
# 停止所有容器
docker-compose down

# 删除数据卷 (⚠️ 会删除所有数据)
docker-compose down -v

# 清理构建缓存
docker builder prune -a

# 重新构建和启动
docker-compose build --no-cache
docker-compose up -d
```

### 健康检查失败

```bash
# 查看健康检查状态
docker inspect recruitment-app | grep -A 10 Health

# 手动测试健康检查
docker-compose exec app node -e "require('http').get('http://localhost:3000/api/recruitments', (r) => console.log(r.statusCode))"
```

## 监控和日志

### 日志管理

```bash
# 实时查看日志
docker-compose logs -f

# 查看最近100行
docker-compose logs --tail=100

# 保存日志到文件
docker-compose logs > logs/app-$(date +%Y%m%d).log
```

### 性能监控

```bash
# 查看资源使用
docker stats recruitment-app

# 持续监控
watch -n 1 docker stats --no-stream recruitment-app
```

## 安全建议

1. **修改默认密钥**: 务必修改 `JWT_SECRET` 为强随机密钥
2. **使用 HTTPS**: 生产环境必须启用 HTTPS
3. **定期备份**: 设置自动备份任务
4. **更新依赖**: 定期更新依赖包和基础镜像
5. **限制访问**: 使用防火墙限制容器访问
6. **监控日志**: 定期检查应用日志

## 生产环境检查清单

- [ ] 修改 JWT_SECRET 为强随机密钥
- [ ] 修改默认管理员密码
- [ ] 配置 HTTPS
- [ ] 设置反向代理
- [ ] 配置防火墙规则
- [ ] 设置自动备份
- [ ] 配置日志轮转
- [ ] 设置监控告警
- [ ] 测试数据恢复流程
- [ ] 文档化部署流程

## 更多帮助

如有问题，请:

1. 查看日志: `docker-compose logs -f`
2. 检查状态: `docker-compose ps`
3. 提交 Issue 到项目仓库

---

最后更新: 2025 年 10 月 18 日
