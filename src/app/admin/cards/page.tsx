import type { Metadata } from "next";
import { AdminCardRow } from "@/components/admin/admin-card-row";
import { Pagination } from "@/components/admin/pagination";
import { StatusTabs } from "@/components/admin/status-tabs";
import { formatRelativeTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/tags";
import type { CardStatus, Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "名片管理 · 管理工作台",
};

const PAGE_SIZE = 10;

type FilterKey = "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";

export default async function AdminCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page: pageParam } = await searchParams;
  const filter: FilterKey =
    status === "APPROVED" || status === "REJECTED" || status === "HIDDEN"
      ? status
      : "PENDING";

  const where: Prisma.CardWhereInput = { status: filter as CardStatus };

  const [pending, approved, rejected, hidden] = await Promise.all([
    prisma.card.count({ where: { status: "PENDING" } }),
    prisma.card.count({ where: { status: "APPROVED" } }),
    prisma.card.count({ where: { status: "REJECTED" } }),
    prisma.card.count({ where: { status: "HIDDEN" } }),
  ]);

  const matched =
    filter === "PENDING"
      ? pending
      : filter === "APPROVED"
        ? approved
        : filter === "REJECTED"
          ? rejected
          : hidden;
  const totalPages = Math.max(1, Math.ceil(matched / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);

  const cards = await prisma.card.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      user: { select: { nickname: true, ipRegion: true } },
      reviewedBy: { select: { nickname: true } },
    },
  });

  // 当前页名片的未处理举报数
  const reportCounts = await prisma.report.groupBy({
    by: ["targetId"],
    where: {
      targetType: "CARD",
      handled: false,
      targetId: { in: cards.map((card) => card.id) },
    },
    _count: { _all: true },
  });
  const reportCountMap = new Map(
    reportCounts.map((item) => [item.targetId, item._count._all])
  );

  const tabs = [
    {
      key: "PENDING",
      label: "待审核",
      count: pending,
      href: "/admin/cards",
    },
    {
      key: "APPROVED",
      label: "已通过",
      count: approved,
      href: "/admin/cards?status=APPROVED",
    },
    {
      key: "REJECTED",
      label: "已拒绝",
      count: rejected,
      href: "/admin/cards?status=REJECTED",
    },
    {
      key: "HIDDEN",
      label: "已屏蔽",
      count: hidden,
      href: "/admin/cards?status=HIDDEN",
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight text-slate-900">
        名片管理
      </h1>
      <p className="mt-1 text-xs text-slate-500">
        只有「已通过」的名片会出现在结盟大厅
      </p>

      <div className="mt-4">
        <StatusTabs items={tabs} active={filter} />
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full table-fixed border-collapse text-left sm:table-auto">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-500">
              <th className="w-24 px-4 py-2.5 font-medium">用户名</th>
              <th className="px-3 py-2.5 font-medium">技能标签</th>
              <th className="hidden px-3 py-2.5 font-medium md:table-cell">
                提交时间
              </th>
              <th className="w-16 px-3 py-2.5 font-medium sm:w-20">状态</th>
              <th className="w-20 px-3 py-2.5 text-right font-medium sm:w-48">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {cards.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-xs text-slate-400"
                >
                  当前分类下暂无名片
                </td>
              </tr>
            ) : (
              cards.map((card) => (
                <AdminCardRow
                  key={card.id}
                  card={{
                    id: card.id,
                    nickname: card.user.nickname,
                    tags: parseTags(card.tags),
                    canProvide: card.canProvide,
                    needHelp: card.needHelp,
                    wechat: card.wechat,
                    submittedAtLabel: formatRelativeTime(card.updatedAt),
                    status: card.status,
                    reviewNote: card.reviewNote,
                    reviewedByLabel: card.reviewedBy?.nickname ?? null,
                    region: card.user.ipRegion,
                    reportCount: reportCountMap.get(card.id) ?? 0,
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
        basePath="/admin/cards"
        params={filter === "PENDING" ? {} : { status: filter }}
      />
    </div>
  );
}
