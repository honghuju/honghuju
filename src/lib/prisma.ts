import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

// 开发环境热更新会反复执行模块，挂到 globalThis 上避免重复创建连接。
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL 环境变量未设置");
  }
  // Prisma 7 的 PrismaNeon 直接接收 PoolConfig（含 connectionString），
  // 由适配器内部创建连接池，无需手动 new Pool。
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
