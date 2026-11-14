import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

// 开发环境热更新会反复执行模块，挂到 globalThis 上避免重复创建连接。
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL 环境变量未设置");
  }
  // 使用 Neon 的 HTTP 驱动：每次查询走 HTTPS，不依赖 WebSocket / TCP，
  // 因此在 EdgeOne、Vercel 等 Serverless 运行时都能正常工作。
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL, {
    arrayMode: false,
    fullResults: true,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
