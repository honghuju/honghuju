"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ReportResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

/** 举报广场帖子：写入举报记录，并把帖子自动转为已屏蔽，等待管理员处理 */
export async function reportPostAction(postId: string): Promise<ReportResult> {
  const user = await requireUser("/");

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, status: true },
  });
  if (!post || post.status === "DELETED") {
    return { ok: false, error: "帖子不存在或已被删除" };
  }
  if (post.authorId === user.id) {
    return { ok: false, error: "不能举报自己的帖子" };
  }

  try {
    await prisma.report.create({
      data: {
        targetType: "POST",
        targetId: post.id,
        reporterId: user.id,
      },
    });
  } catch (error) {
    // 同一用户重复举报：不报错，直接返回已受理
    if ((error as { code?: string }).code === "P2002") {
      return { ok: true, message: "你已经举报过这篇帖子，管理员会尽快处理" };
    }
    throw error;
  }

  if (post.status === "PUBLISHED") {
    await prisma.post.update({
      where: { id: post.id },
      data: { status: "HIDDEN" },
    });
  }

  revalidatePath("/");
  revalidatePath(`/posts/${post.id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/posts");

  return { ok: true, message: "举报成功，内容已屏蔽，管理员会尽快核实" };
}

/** 举报结盟名片：写入举报记录，并把名片自动转为已屏蔽，等待管理员处理 */
export async function reportCardAction(cardId: string): Promise<ReportResult> {
  const user = await requireUser("/hall");

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { id: true, userId: true, status: true },
  });
  if (!card || card.status === "HIDDEN") {
    return { ok: false, error: "名片不存在或已下架" };
  }
  if (card.userId === user.id) {
    return { ok: false, error: "不能举报自己的名片" };
  }

  try {
    await prisma.report.create({
      data: {
        targetType: "CARD",
        targetId: card.id,
        reporterId: user.id,
      },
    });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return { ok: true, message: "你已经举报过这张名片，管理员会尽快处理" };
    }
    throw error;
  }

  await prisma.card.update({
    where: { id: card.id },
    data: {
      status: "HIDDEN",
      reviewNote: "被用户举报，待管理员核实",
    },
  });

  revalidatePath("/hall");
  revalidatePath(`/hall/${card.id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/cards");

  return { ok: true, message: "举报成功，名片已下架，管理员会尽快核实" };
}
