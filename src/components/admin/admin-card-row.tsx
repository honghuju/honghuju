"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { setCardStatusAction } from "@/actions/admin";
import { tagPillClass } from "@/lib/tag-style";
import type { CardStatus } from "@/generated/prisma/client";

export type AdminCardRowData = {
  id: string;
  nickname: string;
  tags: string[];
  canProvide: string;
  needHelp: string;
  wechat: string;
  submittedAtLabel: string;
  status: CardStatus;
  reviewNote: string | null;
  reviewedByLabel: string | null;
  region: string | null;
  reportCount: number;
};

const badge: Record<CardStatus, { label: string; className: string }> = {
  PENDING: { label: "待审核", className: "bg-amber-50 text-amber-600" },
  APPROVED: { label: "已通过", className: "bg-green-50 text-green-600" },
  REJECTED: { label: "已拒绝", className: "bg-red-50 text-red-500" },
  HIDDEN: { label: "已屏蔽", className: "bg-amber-50 text-amber-600" },
};

export function AdminCardRow({ card }: { card: AdminCardRowData }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const style = badge[card.status];

  function change(status: CardStatus, reviewNote = "") {
    setError(null);
    startTransition(async () => {
      const result = await setCardStatusAction(card.id, status, reviewNote);
      if (result.ok) {
        setRejectOpen(false);
        setDetailOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-semibold text-blue-600">
            {card.nickname.slice(0, 1)}
          </span>
          <span className="truncate text-[13px] font-medium text-slate-800">
            {card.nickname}
          </span>
          {card.reportCount > 0 ? (
            <span className="shrink-0 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] text-red-500">
              被举报 {card.reportCount}
            </span>
          ) : null}
        </div>
        {error ? <p className="mt-1 text-[11px] text-red-500">{error}</p> : null}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex max-w-52 flex-wrap gap-1">
          {card.tags.length === 0 ? (
            <span className="text-[11px] text-slate-300">—</span>
          ) : (
            card.tags.map((tag) => (
              <span key={tag} className={tagPillClass(tag)}>
                {tag}
              </span>
            ))
          )}
        </div>
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2.5 text-[11px] text-slate-400 md:table-cell">
        {card.submittedAtLabel}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] ${style.className}`}>
          {style.label}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right text-[11px]">
        <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="text-slate-500 hover:text-blue-600 hover:underline"
          >
            查看详情
          </button>

          {card.status === "PENDING" ? (
            <>
              <button
                type="button"
                onClick={() => change("APPROVED")}
                disabled={isPending}
                className="text-green-600 hover:underline disabled:opacity-50"
              >
                通过
              </button>
              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                disabled={isPending}
                className="text-red-500 hover:underline disabled:opacity-50"
              >
                拒绝
              </button>
            </>
          ) : card.status === "APPROVED" ? (
            <button
              type="button"
              onClick={() => change("PENDING")}
              disabled={isPending}
              className="text-amber-600 hover:underline disabled:opacity-50"
            >
              撤销下架
            </button>
          ) : (
            <button
              type="button"
              onClick={() => change("APPROVED")}
              disabled={isPending}
              className="text-green-600 hover:underline disabled:opacity-50"
            >
              {card.status === "HIDDEN" ? "恢复上架" : "重新通过"}
            </button>
          )}
        </div>
      </td>

      {/* 名片详情弹窗 */}
      {detailOpen
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="名片详情"
              className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-5 py-8"
            >
              <div className="max-h-full w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {card.nickname}
                    </h2>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {card.region ?? "未知属地"} · 提交于 {card.submittedAtLabel}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${style.className}`}
                  >
                    {style.label}
                  </span>
                </div>

                {card.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {card.tags.map((tag) => (
                      <span key={tag} className={tagPillClass(tag)}>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <dl className="mt-4 space-y-3 text-xs leading-6">
                  <div>
                    <dt className="text-[10px] tracking-[0.18em] text-slate-400">
                      我能提供
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-slate-700">
                      {card.canProvide}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] tracking-[0.18em] text-slate-400">
                      正在寻找
                    </dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-slate-700">
                      {card.needHelp}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2">
                    <dt className="text-[10px] tracking-[0.18em] text-slate-400">
                      微信号
                    </dt>
                    <dd className="mt-0.5 font-mono text-sm text-slate-800">
                      {card.wechat}
                    </dd>
                  </div>
                  {card.reviewNote ? (
                    <div>
                      <dt className="text-[10px] tracking-[0.18em] text-slate-400">
                        {card.status === "HIDDEN" ? "屏蔽原因" : "驳回原因"}
                      </dt>
                      <dd className="mt-0.5 text-slate-600">{card.reviewNote}</dd>
                    </div>
                  ) : null}
                  {card.reviewedByLabel ? (
                    <div className="text-[11px] text-slate-400">
                      上次处理人：{card.reviewedByLabel}
                    </div>
                  ) : null}
                </dl>

                {error ? (
                  <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500">
                    {error}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailOpen(false)}
                    className="rounded-full border border-slate-200 px-4 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                  >
                    关闭
                  </button>
                  {card.status === "PENDING" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setDetailOpen(false);
                          setRejectOpen(true);
                        }}
                        disabled={isPending}
                        className="rounded-full border border-red-200 px-4 py-1.5 text-xs text-red-500 disabled:opacity-60"
                      >
                        拒绝
                      </button>
                      <button
                        type="button"
                        onClick={() => change("APPROVED")}
                        disabled={isPending}
                        className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                      >
                        {isPending ? "处理中…" : "通过审核"}
                      </button>
                    </>
                  ) : card.status === "APPROVED" ? (
                    <button
                      type="button"
                      onClick={() => change("PENDING")}
                      disabled={isPending}
                      className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                    >
                      {isPending ? "处理中…" : "撤销下架"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => change("APPROVED")}
                      disabled={isPending}
                      className="rounded-full bg-green-600 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                    >
                      {isPending
                        ? "处理中…"
                        : card.status === "HIDDEN"
                          ? "恢复上架"
                          : "重新通过"}
                    </button>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      {/* 拒绝原因弹窗 */}
      {rejectOpen
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="填写拒绝原因"
              className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-6"
            >
              <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
                <h2 className="text-sm font-semibold text-slate-900">
                  拒绝「{card.nickname}」的名片
                </h2>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  原因会展示给用户。留空则默认「信息不完整」。
                </p>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  maxLength={200}
                  placeholder="例如：微信号格式不正确"
                  className="mt-3 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-400"
                />
                {error ? (
                  <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500">
                    {error}
                  </p>
                ) : null}
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectOpen(false)}
                    disabled={isPending}
                    className="rounded-full border border-slate-200 px-4 py-1.5 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-60"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => change("REJECTED", note)}
                    disabled={isPending}
                    className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {isPending ? "处理中…" : "确认拒绝"}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </tr>
  );
}
