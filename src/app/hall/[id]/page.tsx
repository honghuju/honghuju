import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { RequestCardButton } from "@/components/request-card-button";
import { PhoneVerifiedBadge } from "@/components/phone-verified-badge";
import { makePairKey } from "@/lib/alliance";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/tags";
import { tagPillClass } from "@/lib/tag-style";

export const dynamic = "force-dynamic";

const getCard = cache(async (id: string) => {
  return prisma.card.findFirst({
    where: { id, status: "APPROVED" },
    // 注意：这里不查询 wechat，联系方式只在结盟成功后单独读取
    select: {
      id: true,
      userId: true,
      canProvide: true,
      needHelp: true,
      tags: true,
      user: { select: { nickname: true, ipRegion: true, phone: true } },
    },
  });
});

type CardDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: CardDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const card = await getCard(id);

  return {
    title: card
      ? `${card.user.nickname}的名片 · 鸿鹄局`
      : "名片详情 · 鸿鹄局",
  };
}

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const { id } = await params;
  const card = await getCard(id);

  if (!card) {
    notFound();
  }

  const user = await getCurrentUser();
  const isOwner = user?.id === card.userId;

  const relation =
    user && !isOwner
      ? await prisma.allianceRequest.findUnique({
          where: { pairKey: makePairKey(user.id, card.userId) },
          select: { status: true, fromUserId: true },
        })
      : null;

  // 只有正式结盟后才单独读取微信号，未结盟时它不会进入页面数据
  const contact =
    relation?.status === "ACCEPTED"
      ? await prisma.card.findUnique({
          where: { id: card.id },
          select: { wechat: true },
        })
      : null;

  const tags = parseTags(card.tags);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-6">
      <Link
        href="/hall"
        className="text-xs text-muted transition-colors hover:text-paper"
      >
        ← 返回结盟大厅
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-blue-100 bg-blue-50 text-xl font-black text-blue-600">
          {card.user.nickname.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h1 className="truncate text-2xl font-black tracking-tight">
              {card.user.nickname}
            </h1>
            {card.user.phone ? <PhoneVerifiedBadge /> : null}
          </div>
          <p className="mt-1 text-xs text-muted">
            {isOwner ? "这是你的名片" : "寻找合伙人中"}
            {card.user.ipRegion ? ` · IP属地：${card.user.ipRegion}` : ""}
          </p>
        </div>
      </div>

      {tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className={tagPillClass(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="text-[10px] tracking-[0.18em] text-muted">我能提供</h2>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-paper/90">
            {card.canProvide}
          </p>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="text-[10px] tracking-[0.18em] text-muted">
            正在寻找
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-paper/90">
            {card.needHelp}
          </p>
        </section>

        <div
          className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
            contact
              ? "border-blue-200 bg-blue-50"
              : "border-dashed border-gray-200 bg-white"
          }`}
        >
          <span className="text-xs text-muted">微信号</span>
          <span
            className={`text-xs ${
              contact ? "font-semibold text-acid" : "text-muted/70"
            }`}
          >
            {contact ? contact.wechat : "结盟成功后可见"}
          </span>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-5 mt-8 border-t border-gray-100 bg-white/90 px-5 py-3 backdrop-blur">
        {!user ? (
          <Link
            href={`/login?next=${encodeURIComponent(`/hall/${card.id}`)}`}
            className="block w-full rounded-full bg-acid px-5 py-3 text-center text-sm font-bold text-ink"
          >
            登录后发送结盟申请
          </Link>
        ) : isOwner ? (
          <Link
            href="/hall/card"
            className="block w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-center text-sm text-muted transition-colors hover:text-paper"
          >
            编辑我的名片
          </Link>
        ) : relation?.status === "ACCEPTED" ? (
          <p className="rounded-full bg-acid/10 px-5 py-3 text-center text-sm text-acid">
            你们已经结盟
          </p>
        ) : relation?.status === "PENDING" &&
          relation.fromUserId === user.id ? (
          <p className="rounded-full bg-slate-100 px-5 py-3 text-center text-sm text-muted">
            申请已发送，等待对方同意
          </p>
        ) : relation?.status === "PENDING" ? (
          <Link
            href="/messages"
            className="block w-full rounded-full bg-acid px-5 py-3 text-center text-sm font-bold text-ink"
          >
            对方已发送申请，去消息中心处理
          </Link>
        ) : (
          <RequestCardButton cardId={card.id} />
        )}
      </div>
    </main>
  );
}
