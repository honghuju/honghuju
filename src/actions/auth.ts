"use server";

import { redirect } from "next/navigation";
import { getRequestRegion } from "@/lib/ip-region";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";

export type AuthState = {
  error?: string;
};

const NICKNAME_PATTERN = /^[\u4e00-\u9fa5A-Za-z0-9_]{2,20}$/;
const PHONE_PATTERN = /^1[3-9]\d{9}$/;

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
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!NICKNAME_PATTERN.test(nickname)) {
    return { error: "昵称需为 2-20 个中文、字母、数字或下划线" };
  }
  if (!PHONE_PATTERN.test(phone)) {
    return { error: "请输入正确的 11 位手机号" };
  }
  if (password.length < 6) {
    return { error: "密码至少 6 位" };
  }
  if (password !== confirm) {
    return { error: "两次输入的密码不一致" };
  }

  const exists = await prisma.user.findUnique({ where: { nickname } });
  if (exists) {
    return { error: "这个昵称已经被占用了" };
  }

  const phoneTaken = await prisma.user.findUnique({ where: { phone } });
  if (phoneTaken) {
    return { error: "这个手机号已经绑定过账号了" };
  }

  try {
    const ipRegion = await getRequestRegion();
    const user = await prisma.user.create({
      data: {
        nickname,
        phone,
        passwordHash: await hashPassword(password),
        ipRegion,
      },
    });

    await setSessionCookie(user.id);
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      const target = String((error as { meta?: { target?: string[] } }).meta?.target ?? "");
      return {
        error: target.includes("phone")
          ? "这个手机号已经绑定过账号了"
          : "这个昵称已经被占用了",
      };
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
    return { error: "请输入昵称和密码" };
  }

  const user = await prisma.user.findUnique({ where: { nickname } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "昵称或密码不正确" };
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
