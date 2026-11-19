import type { Metadata } from "next";
import { CardForm } from "@/components/card-form";
import { requireUser } from "@/lib/auth";
import { getRequestRegion } from "@/lib/ip-region";
import { prisma } from "@/lib/prisma";
import { parseTags } from "@/lib/tags";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "合伙人名片 · 鸿鹄局",
};

const STATUS_META = {
  PENDING: {
    label: "待审核",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    hint: "管理员审核通过后，名片会出现在结盟大厅。",
  },
  APPROVED: {
    label: "已通过",
    className: "border-acid/30 bg-acid/10 text-acid",
    hint: "你的名片已经在结盟大厅展示。修改内容后会重新进入审核。",
  },
  REJECTED: {
    label: "已驳回",
    className: "border-red-200 bg-red-50 text-red-600",
    hint: "请根据审核意见修改后重新提交。",
  },
  HIDDEN: {
    label: "已屏蔽",
    className: "border-red-200 bg-red-50 text-red-600",
    hint: "该名片被用户举报，管理员核实前暂不展示。修改内容后会重新进入审核。",
  },
} as const;

function StatusBanner({
  status,
  note,
}: {
  status: keyof typeof STATUS_META;
  note: string | null;
}) {
  const meta = STATUS_META[status];

  return (
    <div className={`mt-5 rounded-2xl border px-4 py-3 ${meta.className}`}>
      <p className="text-xs font-semibold">名片状态：{meta.label}</p>
      <p className="mt-1 text-[11px] leading-5 opacity-80">
        {status === "REJECTED" && note ? `驳回原因：${note}` : meta.hint}
      </p>
    </div>
  );
}

export default async function MyCardPage() {
  const user = await requireUser("/hall/card");
  const [card, region] = await Promise.all([
    prisma.card.findUnique({ where: { userId: user.id } }),
    getRequestRegion(),
  ]);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-6">
      <h1 className="text-2xl font-black tracking-tight">合伙人名片</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        填好名片，让对的人找到你。名片审核通过后会展示在结盟大厅。
      </p>
      <p className="mt-1 text-[11px] text-muted">当前 IP 属地：{region}</p>

      {card ? <StatusBanner status={card.status} note={card.reviewNote} /> : null}

      <div className="mt-6">
        <CardForm
          isUpdate={Boolean(card)}
          defaultValues={
            card
              ? {
                  tags: parseTags(card.tags),
                  canProvide: card.canProvide,
                  needHelp: card.needHelp,
                  wechat: card.wechat,
                  phone: user.phone ?? "",
                }
              : undefined
          }
        />
      </div>
    </main>
  );
}
