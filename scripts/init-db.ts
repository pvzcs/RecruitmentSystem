import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("开始初始化数据库...");

  // 检查是否已经存在管理员
  const existingAdmin = await prisma.admin.findUnique({
    where: { username: "admin" },
  });

  if (!existingAdmin) {
    // 创建默认管理员账号
    const hashedPassword = await bcrypt.hash("123456", 10);
    await prisma.admin.create({
      data: {
        username: "admin",
        password: hashedPassword,
      },
    });
    console.log("✓ 默认管理员账号已创建 (admin/123456)");
  } else {
    console.log("✓ 管理员账号已存在");
  }

  console.log("数据库初始化完成！");
}

main()
  .catch((e) => {
    console.error("数据库初始化失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
