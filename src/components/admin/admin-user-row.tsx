"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { deleteUserAction, setUserStatusAction } from "@/actions/admin";
import type { UserStatus } from "@/generated/prisma/client";

export type AdminUserRowData = {
  id: string;
  nickname: string;
  phone: string | null;
  role: "USER" | "ADMIN";
  status: UserStatus;
  ipRegion: string | null;
  postCount: number;
  createdAtLabel: string;
};

const badge: Record<UserStatus, { label: string; className: string }> = {
  ACTIVE: { label: "正常", className: "bg-green-50 text-green-600" },
  BANNED: { label: "已封禁", className: "bg-red-50 text-red-500" },
};

export function AdminUserRow({ user }: { user: AdminUserRowData }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<"BAN" | "DELETE" | null>(null);
  const [isPending, startTransition] = useTransition();
  const style = badge[user.status];
  const isAdmin = user.role === "ADMIN";

  function change(status: UserStatus) {
    setError(null);
    startTransition(async () => {
      const result = await setUserStatusAction(user.id, status);
      if (result.ok) {
        setConfirming(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteUserAction(user.id);
      if (result.ok) {
        setConfirming(null);
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
            {user.nickname.slice(0, 1)}
          </span>
          <span className="truncate text-[13px] font-medium text-slate-800">
            {user.nickname}
          </span>
          {isAdmin ? (
            <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600">
              管理员
            </span>
          ) : null}
        </div>
        {error ? <p className="mt-1 text-[11px] text-red-500">{error}</p> : null}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-[11px] tabular-nums">
        {user.phone ? (
          <span className="text-slate-600">{user.phone}</span>
        ) : (
          <span className="text-slate-300">未绑定</span>
        )}
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2.5 text-xs text-slate-500 md:table-cell">
        {user.ipRegion ?? "—"}
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2.5 text-[11px] text-slate-400 md:table-cell">
        {user.createdAtLabel}
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2.5 text-xs tabular-nums text-slate-500 sm:table-cell">
        {user.postCount}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] ${style.className}`}>
          {style.label}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right text-[11px]">
        {isAdmin ? (
          <span className="text-slate-300">—</span>
        ) : (
          <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
            {user.status === "ACTIVE" ? (
              <button
                type="button"
                onClick={() => setConfirming("BAN")}
                disabled={isPending}
                className="text-red-500 hover:underline disabled:opacity-50"
              >
                封禁
              </button>
            ) : (
              <button
                type="button"
                onClick={() => change("ACTIVE")}
                disabled={isPending}
                className="text-green-600 hover:underline disabled:opacity-50"
              >
                解封
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirming("DELETE")}
              disabled={isPending}
              className="text-slate-400 hover:text-red-500 hover:underline disabled:opacity-50"
            >
              删除账号
            </button>
          </div>
        )}
      </td>

      {confirming
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={confirming === "BAN" ? "确认封禁账号" : "确认删除账号"}
              className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-6"
            >
              <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
                <h2 className="text-sm font-semibold text-slate-900">
                  {confirming === "BAN"
                    ? `封禁「${user.nickname}」？`
                    : `彻底删除「${user.nickname}」？`}
                </h2>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  {confirming === "BAN"
                    ? "封禁后该账号无法登录，已有会话会立即失效。可随时解封。"
                    : `该用户及其 ${user.postCount} 篇帖子、评论、点赞、名片和结盟记录都会被永久删除，无法恢复。`}
                </p>
                {error ? (
                  <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500">
                    {error}
                  </p>
                ) : null}
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirming(null)}
                    disabled={isPending}
                    className="rounded-full border border-slate-200 px-4 py-1.5 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-60"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={
                      confirming === "BAN" ? () => change("BANNED") : remove
                    }
                    disabled={isPending}
                    className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {isPending
                      ? "处理中…"
                      : confirming === "BAN"
                        ? "确认封禁"
                        : "确认删除"}
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
