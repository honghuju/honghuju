import type { Metadata } from "next";
import { HallBoard } from "@/components/hall-board";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/tags";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "结盟大厅 · 鸿鹄局",
};

const PAGE_SIZE = 10;

export default async function HallPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  const { tag, page: pageParam } = await searchParams;
  const activeTag = tag?.trim() || null;

  const where = {
    status: "APPROVED" as const,
    ...(activeTag ? { tags: { contains: `"${activeTag}"` } } : {}),
  };

  const [total, allTags] = await Promise.all([
    prisma.card.count({ where }),
    prisma.card.findMany({
      where: { status: "APPROVED" },
      select: { tags: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);

  const cards = await prisma.card.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    // 注意：这里不查询 wechat，保证联系方式不会进入页面数据
    select: {
      id: true,
      userId: true,
      canProvide: true,
      needHelp: true,
      tags: true,
      user: { select: { nickname: true } },
    },
  });

  const tagCounts = new Map<string, number>();
  for (const card of allTags) {
    for (const name of parseTags(card.tags)) {
      tagCounts.set(name, (tagCounts.get(name) ?? 0) + 1);
    }
  }

  const tags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, count]) => ({ name, count }));

  const boardCards = cards.map((card) => ({
    id: card.id,
    nickname: card.user.nickname,
    tags: parseTags(card.tags),
    canProvide: card.canProvide,
    needHelp: card.needHelp,
    isMine: user?.id === card.userId,
  }));

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-6">
      <HallBoard
        cards={boardCards}
        tags={tags}
        activeTag={activeTag}
        total={total}
        page={page}
        totalPages={totalPages}
      />
    </main>
  );
}
