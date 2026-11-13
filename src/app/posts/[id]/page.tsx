import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentForm } from "@/components/comment-form";
import { LikeButton } from "@/components/like-button";
import { getCurrentUser } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "帖子 · 鸿鹄局",
};

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  // 已发布的帖子所有人可见；被屏蔽（HIDDEN）的帖子仅作者和管理员可见；已删除的帖子不可见。
  const visibleWhere: Prisma.PostWhereInput =
    user?.role === "ADMIN"
      ? { id, status: { in: ["PUBLISHED", "HIDDEN"] as const } }
      : user
        ? {
            id,
            OR: [
              { status: "PUBLISHED" },
              { status: "HIDDEN", authorId: user.id },
            ],
          }
        : { id, status: "PUBLISHED" };

  const post = await prisma.post.findFirst({
    where: visibleWhere,
    include: {
      author: true,
      comments: {
        where: { status: "VISIBLE" },
        orderBy: { createdAt: "asc" },
        include: { author: true },
      },
      _count: { select: { likes: true } },
      likes: {
        where: { userId: user?.id ?? "" },
        select: { id: true },
      },
    },
  });

  if (!post) notFound();

  await prisma.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  });

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pb-16 pt-5">
      <Link href="/" className="text-xs text-muted transition-colors hover:text-paper">
        ← 返回广场
      </Link>

      <article className="mt-4">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-100 bg-blue-50 text-[11px] font-semibold text-blue-600">
            {post.author.nickname.slice(0, 1)}
          </span>
          <span className="max-w-40 truncate text-paper">{post.author.nickname}</span>
          {post.author.role === "ADMIN" ? (
            <span className="rounded-full bg-acid/15 px-2 py-0.5 text-[10px] text-acid">
              管理员
            </span>
          ) : null}
          <span>·</span>
          <span>{formatRelativeTime(post.createdAt)}</span>
          {post.ipRegion ? (
            <>
              <span>·</span>
              <span>{post.ipRegion}</span>
            </>
          ) : null}
        </div>

        <h1 className="mt-4 text-xl font-bold leading-snug text-slate-800">{post.title}</h1>

        {post.status === "HIDDEN" ? (
          <p className="mt-2 inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] text-amber-600">
            已被管理员屏蔽，仅你和管理员可见
          </p>
        ) : null}

        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
          <span>{post.viewCount} 次浏览</span>
          <LikeButton
            postId={post.id}
            initialLiked={post.likes.length > 0}
            initialCount={post._count.likes}
            isLoggedIn={Boolean(user)}
            returnPath={`/posts/${post.id}`}
          />
        </div>

        <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-paper/90">
          {post.content}
        </p>
      </article>

      <section
        id="comments"
        className="mt-9 scroll-mt-24 border-t border-gray-100 pt-6"
      >
        <h2 className="text-sm font-semibold">评论 · {post.comments.length}</h2>

        <div className="mt-4">
          {user ? (
            <CommentForm postId={post.id} />
          ) : (
            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-xs text-muted shadow-sm">
              <Link
                href={`/login?next=${encodeURIComponent(`/posts/${post.id}`)}`}
                className="text-acid"
              >
                登录
              </Link>{" "}
              后参与评论
            </div>
          )}
        </div>

        {post.comments.length === 0 ? (
          <p className="mt-8 text-center text-xs text-muted">
            还没有评论，来抢个沙发。
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {post.comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-blue-100 bg-blue-50 text-[11px] font-semibold text-blue-600">
                    {comment.author.nickname.slice(0, 1)}
                  </span>
                  <span className="max-w-32 truncate text-paper">
                    {comment.author.nickname}
                  </span>
                  {comment.author.role === "ADMIN" ? (
                    <span className="rounded-full bg-acid/15 px-2 py-0.5 text-[10px] text-acid">
                      管理员
                    </span>
                  ) : null}
                  <span>·</span>
                  <span>{formatRelativeTime(comment.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-paper/90">
                  {comment.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
