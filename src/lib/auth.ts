import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/session";

/** 当前登录用户；同一请求内多次调用只查一次数据库。 */
export const getCurrentUser = cache(async () => {
  const session = await readSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.status !== "ACTIVE") return null;

  return user;
});

/** 需要登录的操作：未登录时跳转登录页，并带上回跳地址。 */
export async function requireUser(nextPath = "/") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}
