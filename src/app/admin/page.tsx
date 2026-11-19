import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [totalUsers, totalPosts, pendingCards, hiddenPosts, pendingReports] =
    await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.card.count({ where: { status: "PENDING" } }),
      prisma.post.count({ where: { status: "HIDDEN" } }),
      prisma.report.count({ where: { handled: false } }),
    ]);

  const stats = [
    {
      label: "总注册用户",
      value: totalUsers,
      hint: "含管理员账号",
      accent: "text-slate-900",
    },
    {
      label: "总发帖数",
      value: totalPosts,
      hint: "含已屏蔽与已删除",
      accent: "text-blue-600",
    },
    {
      label: "待审核名片",
      value: pendingCards,
      hint: "需要尽快处理",
      accent: "text-amber-600",
    },
    {
      label: "已屏蔽帖子",
      value: hiddenPosts,
      hint: "当前处于下架状态",
      accent: "text-red-500",
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        数据概览
      </h1>
      <p className="mt-1 text-xs text-slate-500">
        社区整体数据一览，详细操作请前往对应管理页
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-[11px] text-slate-500">{stat.label}</p>
            <p className={`mt-2 text-2xl font-black tabular-nums ${stat.accent}`}>
              {stat.value}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">{stat.hint}</p>
          </div>
        ))}
      </div>

      {pendingReports > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-xs text-red-600">
            有 {pendingReports} 条举报待处理，相关内容已自动屏蔽
          </p>
          <div className="flex gap-3 text-xs font-medium">
            <Link href="/admin/posts?status=REPORTED" className="text-red-600 hover:underline">
              处理帖子举报
            </Link>
            <Link href="/admin/cards?status=HIDDEN" className="text-red-600 hover:underline">
              处理名片举报
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
