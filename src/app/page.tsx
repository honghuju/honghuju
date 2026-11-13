import type { Metadata } from "next";
import Link from "next/link";
import { AdminQuickPostMenu } from "@/components/admin/quick-post-menu";
import { LikeButton } from "@/components/like-button";
import { getCurrentUser } from "@/lib/auth";
import { excerpt, formatRelativeTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "广场 · 鸿鹄局",
};

const PAGE_SIZE = 10;

function pageHref(page: number) {
  return page <= 1 ? "/" : `/?page=${page}`;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();
  const { page: pageParam } = await searchParams;
  const isAdmin = user?.role === "ADMIN";

  const total = await prisma.post.count({ where: { status: "PUBLISHED" } });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      author: { select: { nickname: true } },
      _count: {
        select: { comments: { where: { status: "VISIBLE" } }, likes: true },
      },
      // 只查当前用户自己的点赞，用来决定按钮初始颜色
      likes: {
        where: { userId: user?.id ?? "" },
        select: { id: true },
      },
    },
  });

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pb-28 pt-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">广场</h1>
          <p className="mt-1 text-xs text-muted">按最新发布排序</p>
        </div>
        <span className="text-xs text-muted">{total} 个帖子</span>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-muted">广场还很安静，来发第一帖吧。</p>
          <Link
            href="/posts/new"
            className="mt-4 inline-block rounded-full bg-acid px-5 py-2 text-xs font-bold text-ink"
          >
            去发帖
          </Link>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className={`rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                isAdmin ? "relative" : ""
              }`}
            >
              {isAdmin ? (
                <div className="absolute right-3 top-3">
                  <AdminQuickPostMenu
                    postId={post.id}
                    postTitle={post.title}
                    status={post.status}
                  />
                </div>
              ) : null}

              <Link href={`/posts/${post.id}`} className="block">
                <div className="flex items-center gap-2 pr-8 text-xs text-muted">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-100 bg-blue-50 text-[11px] font-semibold text-blue-600">
                    {post.author.nickname.slice(0, 1)}
                  </span>
                  <span className="max-w-32 truncate">{post.author.nickname}</span>
                  <span>·</span>
                  <span>{formatRelativeTime(post.createdAt)}</span>
                  {post.ipRegion ? (
                    <>
                      <span>·</span>
                      <span>{post.ipRegion}</span>
                    </>
                  ) : null}
                </div>

                <h2 className="mt-3 text-lg font-bold leading-snug text-slate-800">
                  {post.title}
                </h2>
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted">
                  {excerpt(post.content, 90)}
                </p>
              </Link>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-4 text-[11px] text-gray-400">
                  <Link
                    href={`/posts/${post.id}#comments`}
                    className="transition-colors hover:text-blue-600"
                  >
                    {post._count.comments} 评论
                  </Link>
                  <span>{post.viewCount} 浏览</span>
                </div>

                <LikeButton
                  postId={post.id}
                  initialLiked={post.likes.length > 0}
                  initialCount={post._count.likes}
                  isLoggedIn={Boolean(user)}
                  returnPath="/"
                />
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-between">
          {page <= 1 ? (
            <span className="rounded-full border border-gray-200 px-4 py-1.5 text-xs text-gray-300">
              上一页
            </span>
          ) : (
            <Link
              href={pageHref(page - 1)}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs text-gray-600 transition-colors hover:border-blue-200 hover:text-blue-600"
            >
              上一页
            </Link>
          )}
          <span className="text-[11px] tabular-nums text-muted">
            第 {Math.min(page, totalPages)} / {totalPages} 页
          </span>
          {page >= totalPages ? (
            <span className="rounded-full border border-gray-200 px-4 py-1.5 text-xs text-gray-300">
              下一页
            </span>
          ) : (
            <Link
              href={pageHref(page + 1)}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs text-gray-600 transition-colors hover:border-blue-200 hover:text-blue-600"
            >
              下一页
            </Link>
          )}
        </div>
      ) : null}

      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20">
        <div className="mx-auto flex w-full max-w-md justify-end px-5">
          <Link
            href="/posts/new"
            className="pointer-events-auto flex h-12 items-center gap-1.5 rounded-full bg-acid px-5 text-sm font-bold text-ink shadow-lg shadow-acid/20"
          >
            <span className="text-lg leading-none">+</span>
            发帖
          </Link>
        </div>
      </div>
    </main>
  );
}
