import type { Metadata } from "next";
import Link from "next/link";
import { MyPostItem } from "@/components/my-post-item";
import { requireUser } from "@/lib/auth";
import { excerpt, formatRelativeTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "我的帖子 · 鸿鹄局",
};

export default async function MyPostsPage() {
  const user = await requireUser("/my-posts");

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { comments: { where: { status: "VISIBLE" } }, likes: true },
      },
    },
  });

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">我的帖子</h1>
          <p className="mt-1 text-xs text-muted">
            共 {posts.length} 篇 · 删除后无法恢复
          </p>
        </div>
        <Link
          href="/posts/new"
          className="rounded-full bg-acid px-4 py-1.5 text-[11px] font-bold text-ink"
        >
          + 发新帖
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <p className="text-sm text-muted">你还没有发过帖子。</p>
          <Link
            href="/posts/new"
            className="mt-4 inline-block rounded-full bg-acid px-5 py-2 text-xs font-bold text-ink"
          >
            去发第一帖
          </Link>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {posts.map((post) => (
            <MyPostItem
              key={post.id}
              post={{
                id: post.id,
                title: post.title,
                excerpt: excerpt(post.content, 80),
                createdAtLabel: formatRelativeTime(post.createdAt),
                commentCount: post._count.comments,
                likeCount: post._count.likes,
                hidden: post.status === "HIDDEN",
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
