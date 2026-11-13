"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getRequestRegion } from "@/lib/ip-region";
import { prisma } from "@/lib/prisma";

export type PostFormState = {
  error?: string;
};

export type CommentFormState = {
  error?: string;
  submittedAt?: number;
};

export async function createPostAction(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const user = await requireUser("/posts/new");

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (title.length < 2 || title.length > 60) {
    return { error: "标题需要 2-60 个字" };
  }
  if (content.length < 5) {
    return { error: "正文至少 5 个字" };
  }
  if (content.length > 5000) {
    return { error: "正文不能超过 5000 个字" };
  }

  const ipRegion = await getRequestRegion();

  const post = await prisma.post.create({
    data: { authorId: user.id, title, content, ipRegion },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { ipRegion },
  });

  revalidatePath("/");
  redirect(`/posts/${post.id}`);
}

export async function createCommentAction(
  postId: string,
  _prevState: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  const user = await requireUser(`/posts/${postId}`);

  const content = String(formData.get("content") ?? "").trim();
  if (!content) {
    return { error: "评论不能为空" };
  }
  if (content.length > 500) {
    return { error: "评论不能超过 500 个字" };
  }

  const post = await prisma.post.findFirst({
    where: { id: postId, status: { in: ["PUBLISHED", "HIDDEN"] } },
    select: { id: true, authorId: true, status: true },
  });
  if (!post) {
    return { error: "帖子不存在或已被删除" };
  }
  // 被屏蔽的帖子仅作者本人可评论
  if (post.status === "HIDDEN" && post.authorId !== user.id) {
    return { error: "该帖子已被屏蔽，无法评论" };
  }

  await prisma.comment.create({
    data: { postId, authorId: user.id, content },
  });

  // 评论同样视为一次活跃，刷新用户属地
  const ipRegion = await getRequestRegion();
  if (ipRegion !== "未知") {
    await prisma.user.update({
      where: { id: user.id },
      data: { ipRegion },
    });
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");

  return { submittedAt: Date.now() };
}

export type LikeResult =
  | { ok: true; liked: boolean; count: number }
  | { ok: false; error: string };

/** 点赞 / 取消点赞，返回最新状态与总数 */
export async function toggleLikeAction(postId: string): Promise<LikeResult> {
  const user = await requireUser(`/posts/${postId}`);

  const post = await prisma.post.findFirst({
    where: { id: postId, status: { in: ["PUBLISHED", "HIDDEN"] } },
    select: { id: true, authorId: true, status: true },
  });
  if (!post) {
    return { ok: false, error: "帖子不存在或已被删除" };
  }
  // 被屏蔽的帖子仅作者本人可点赞
  if (post.status === "HIDDEN" && post.authorId !== user.id) {
    return { ok: false, error: "该帖子已被屏蔽，无法点赞" };
  }

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
    select: { id: true },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.postLike.create({ data: { postId, userId: user.id } });
  }

  const count = await prisma.postLike.count({ where: { postId } });

  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);

  return { ok: true, liked: !existing, count };
}

export type DeletePostResult = { ok: true } | { ok: false; error: string };

/** 删除自己的帖子：作者本人或管理员可删，数据库级联删除评论与点赞 */
export async function deletePostAction(postId: string): Promise<DeletePostResult> {
  const user = await requireUser("/my-posts");

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!post) {
    return { ok: false, error: "帖子不存在或已被删除" };
  }
  if (post.authorId !== user.id && user.role !== "ADMIN") {
    return { ok: false, error: "只能删除自己的帖子" };
  }

  await prisma.post.delete({ where: { id: postId } });

  revalidatePath("/");
  revalidatePath("/my-posts");
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath(`/posts/${postId}`);

  return { ok: true };
}
