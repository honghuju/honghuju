import type { Metadata } from "next";
import { AdminPostRow } from "@/components/admin/admin-post-row";
import { Pagination } from "@/components/admin/pagination";
import { StatusTabs } from "@/components/admin/status-tabs";
import { formatRelativeTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import type { PostStatus, Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "帖子管理 · 管理工作台",
};

const PAGE_SIZE = 10;

type FilterKey = "ALL" | "PUBLISHED" | "HIDDEN";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page: pageParam } = await searchParams;
  const filter: FilterKey =
    status === "PUBLISHED" || status === "HIDDEN" ? status : "ALL";

  const where: Prisma.PostWhereInput =
    filter === "ALL" ? {} : { status: filter as PostStatus };

  const [total, published, hidden] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "HIDDEN" } }),
  ]);

  const matched = filter === "ALL" ? total : filter === "PUBLISHED" ? published : hidden;
  const totalPages = Math.max(1, Math.ceil(matched / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { author: { select: { nickname: true } } },
  });

  const tabs = [
    { key: "ALL", label: "全部", count: total, href: "/admin/posts" },
    {
      key: "PUBLISHED",
      label: "正常",
      count: published,
      href: "/admin/posts?status=PUBLISHED",
    },
    {
      key: "HIDDEN",
      label: "已屏蔽",
      count: hidden,
      href: "/admin/posts?status=HIDDEN",
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        帖子管理
      </h1>
      <p className="mt-1 text-xs text-slate-500">
        屏蔽后帖子对其他人隐藏，仅作者与管理员可见；删除不可恢复
      </p>

      <div className="mt-4">
        <StatusTabs items={tabs} active={filter} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full table-fixed border-collapse text-left sm:table-auto">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-500">
              <th className="px-4 py-2.5 font-medium">标题</th>
              <th className="hidden px-3 py-2.5 font-medium sm:table-cell">
                作者
              </th>
              <th className="hidden px-3 py-2.5 font-medium md:table-cell">
                发布时间
              </th>
              <th className="w-16 px-3 py-2.5 font-medium sm:w-20">状态</th>
              <th className="w-24 px-3 py-2.5 text-right font-medium sm:w-40">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-xs text-slate-400"
                >
                  没有符合条件的帖子
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <AdminPostRow
                  key={post.id}
                  post={{
                    id: post.id,
                    title: post.title,
                    authorNickname: post.author.nickname,
                    createdAtLabel: formatRelativeTime(post.createdAt),
                    status: post.status,
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/posts"
        params={filter === "ALL" ? {} : { status: filter }}
      />
    </div>
  );
}
