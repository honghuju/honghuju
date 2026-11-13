import type { Metadata } from "next";
import Link from "next/link";
import { AdminUserRow } from "@/components/admin/admin-user-row";
import { Pagination } from "@/components/admin/pagination";
import { StatusTabs } from "@/components/admin/status-tabs";
import { formatRelativeTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import type { Prisma, UserStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "用户管理 · 管理工作台",
};

const PAGE_SIZE = 10;

type FilterKey = "ALL" | "ACTIVE" | "BANNED";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status, q = "", page: pageParam } = await searchParams;
  const filter: FilterKey =
    status === "ACTIVE" || status === "BANNED" ? status : "ALL";
  const keyword = q.trim().slice(0, 30);

  const where: Prisma.UserWhereInput = {
    ...(filter === "ALL" ? {} : { status: filter as UserStatus }),
    ...(keyword
      ? { nickname: { contains: keyword, mode: "insensitive" as const } }
      : {}),
  };

  const [total, active, banned, matched] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "BANNED" } }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(matched / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { _count: { select: { posts: true } } },
  });

  const baseQuery = keyword ? { q: keyword } : {};
  const tabs = [
    { key: "ALL", label: "全部", count: total, href: "/admin/users" },
    {
      key: "ACTIVE",
      label: "正常",
      count: active,
      href: "/admin/users?status=ACTIVE",
    },
    {
      key: "BANNED",
      label: "已封禁",
      count: banned,
      href: "/admin/users?status=BANNED",
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        用户管理
      </h1>
      <p className="mt-1 text-xs text-slate-500">
        封禁后无法登录；删除账号会连带清除该用户的全部内容，不可恢复
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StatusTabs items={tabs} active={filter} />
        <form action="/admin/users" method="get" className="flex items-center gap-2">
          {filter !== "ALL" ? (
            <input type="hidden" name="status" value={filter} />
          ) : null}
          <input
            type="search"
            name="q"
            defaultValue={keyword}
            placeholder="搜索用户名"
            className="w-40 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[12px] outline-none focus:border-blue-400 sm:w-48"
          />
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-3 py-1.5 text-[12px] font-semibold text-white"
          >
            搜索
          </button>
          {keyword ? (
            <Link
              href={filter === "ALL" ? "/admin/users" : `/admin/users?status=${filter}`}
              className="text-[11px] text-slate-400 hover:text-slate-600"
            >
              清除
            </Link>
          ) : null}
        </form>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full table-fixed border-collapse text-left sm:table-auto">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-500">
              <th className="px-4 py-2.5 font-medium">用户名</th>
              <th className="w-24 px-3 py-2.5 font-medium sm:w-28">
                绑定手机号
              </th>
              <th className="hidden px-3 py-2.5 font-medium md:table-cell">
                IP 属地
              </th>
              <th className="hidden px-3 py-2.5 font-medium md:table-cell">
                注册时间
              </th>
              <th className="hidden w-16 px-3 py-2.5 font-medium sm:table-cell">
                发帖
              </th>
              <th className="w-16 px-3 py-2.5 font-medium sm:w-20">状态</th>
              <th className="w-24 px-3 py-2.5 text-right font-medium sm:w-40">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-xs text-slate-400"
                >
                  没有符合条件的用户
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <AdminUserRow
                  key={user.id}
                  user={{
                    id: user.id,
                    nickname: user.nickname,
                    phone: user.phone,
                    role: user.role,
                    status: user.status,
                    ipRegion: user.ipRegion,
                    postCount: user._count.posts,
                    createdAtLabel: formatRelativeTime(user.createdAt),
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
        basePath="/admin/users"
        params={{
          ...(filter === "ALL" ? {} : { status: filter }),
          ...baseQuery,
        }}
      />
    </div>
  );
}
