"use server";

import { redirect } from "next/navigation";
import { getRequestRegion } from "@/lib/ip-region";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";

export type AuthState = {
  error?: string;
};

const USERNAME_PATTERN = /^[\u4e00-\u9fa5A-Za-z0-9_]{2,20}$/;

/** 只允许站内回跳，避免开放重定向。 */
function safeNext(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "/";

  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function registerAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!USERNAME_PATTERN.test(nickname)) {
    return { error: "用户名需为 2-20 个中文、字母、数字或下划线" };
  }
  if (password.length < 6) {
    return { error: "密码不能少于 6 位" };
  }
  if (password !== confirm) {
    return { error: "两次输入的密码不一致" };
  }

  const exists = await prisma.user.findUnique({ where: { nickname } });
  if (exists) {
    return { error: "该用户名已存在" };
  }

  try {
    const ipRegion = await getRequestRegion();
    const user = await prisma.user.create({
      data: {
        nickname,
        passwordHash: await hashPassword(password),
        ipRegion,
      },
    });

    await setSessionCookie(user.id);
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return { error: "该用户名已存在" };
    }
    throw error;
  }

  redirect(safeNext(formData.get("next")));
}

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!nickname || !password) {
    return { error: "请输入用户名和密码" };
  }

  const user = await prisma.user.findUnique({ where: { nickname } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "用户名或密码不正确" };
  }
  if (user.status === "BANNED") {
    return { error: "该账号已被封禁，请联系管理员" };
  }

  // 记录最近一次登录的 IP 属地，用于名片展示；失败不影响登录
  try {
    const ipRegion = await getRequestRegion();
    if (ipRegion !== "未知") {
      await prisma.user.update({
        where: { id: user.id },
        data: { ipRegion },
      });
    }
  } catch {
    // 忽略属地更新失败
  }

  await setSessionCookie(user.id);
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
