"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CardStatus, PostStatus, UserStatus } from "@/generated/prisma/client";

export type ReviewResult = { ok: true } | { ok: false; error: string };

function revalidateModeration() {
  revalidatePath("/");
  revalidatePath("/hall");
  revalidatePath("/admin");
  revalidatePath("/admin/cards");
  revalidatePath("/admin/posts");
  revalidatePath("/admin/users");
}

// ─────────────────────────── 名片管理 ───────────────────────────

/**
 * 管理员变更名片状态：
 * - APPROVED：通过 / 重新通过
 * - REJECTED：拒绝（可附原因）
 * - PENDING：撤销下架，回到待审核队列
 */
export async function setCardStatusAction(
  cardId: string,
  status: CardStatus,
  note = ""
): Promise<ReviewResult> {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") {
    return { ok: false, error: "没有权限执行此操作" };
  }

  if (
    status !== "APPROVED" &&
    status !== "REJECTED" &&
    status !== "PENDING" &&
    status !== "HIDDEN"
  ) {
    return { ok: false, error: "不支持的名片状态" };
  }

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { id: true },
  });
  if (!card) {
    return { ok: false, error: "名片不存在" };
  }

  const reviewNote = note.trim().slice(0, 200);

  await prisma.card.update({
    where: { id: cardId },
    data: {
      status,
      reviewNote:
        status === "REJECTED"
          ? reviewNote || "信息不完整"
          : status === "HIDDEN"
            ? reviewNote || "管理员已屏蔽"
            : null,
      reviewedById: user.id,
      reviewedAt: new Date(),
    },
  });

  // 恢复上架视为举报已处理
  if (status === "APPROVED") {
    await prisma.report.updateMany({
      where: { targetType: "CARD", targetId: cardId, handled: false },
      data: { handled: true, handledAt: new Date() },
    });
  }

  revalidateModeration();

  return { ok: true };
}

// ─────────────────────────── 帖子管理 ───────────────────────────

/** 管理员屏蔽/恢复帖子：HIDDEN 后在广场与详情页对其他人不可见，仅作者与管理员可见 */
export async function setPostStatusAction(
  postId: string,
  status: PostStatus
): Promise<ReviewResult> {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") {
    return { ok: false, error: "没有权限执行此操作" };
  }

  if (status !== "PUBLISHED" && status !== "HIDDEN") {
    return { ok: false, error: "不支持的帖子状态" };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) {
    return { ok: false, error: "帖子不存在" };
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status },
  });

  // 恢复帖子视为举报已处理
  if (status === "PUBLISHED") {
    await prisma.report.updateMany({
      where: { targetType: "POST", targetId: postId, handled: false },
      data: { handled: true, handledAt: new Date() },
    });
  }

  revalidateModeration();
  revalidatePath(`/posts/${postId}`);

  return { ok: true };
}

// ─────────────────────────── 用户管理 ───────────────────────────

/** 管理员封禁/解封用户：BANNED 后无法登录，已有会话也会失效 */
export async function setUserStatusAction(
  userId: string,
  status: UserStatus
): Promise<ReviewResult> {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") {
    return { ok: false, error: "没有权限执行此操作" };
  }

  if (status !== "ACTIVE" && status !== "BANNED") {
    return { ok: false, error: "不支持的用户状态" };
  }

  if (userId === user.id) {
    return { ok: false, error: "不能封禁自己的账号" };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!target) {
    return { ok: false, error: "用户不存在" };
  }
  if (target.role === "ADMIN") {
    return { ok: false, error: "不能封禁其他管理员账号" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  revalidateModeration();

  return { ok: true };
}

/** 管理员彻底删除账号：帖子、评论、点赞、名片、结盟记录会一并删除 */
export async function deleteUserAction(userId: string): Promise<ReviewResult> {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") {
    return { ok: false, error: "没有权限执行此操作" };
  }

  if (userId === user.id) {
    return { ok: false, error: "不能删除自己的账号" };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!target) {
    return { ok: false, error: "用户不存在" };
  }
  if (target.role === "ADMIN") {
    return { ok: false, error: "不能删除其他管理员账号" };
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidateModeration();

  return { ok: true };
}
