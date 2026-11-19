"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { setPostStatusAction } from "@/actions/admin";
import { deletePostAction } from "@/actions/posts";
import type { PostStatus } from "@/generated/prisma/client";

export type AdminPostRowData = {
  id: string;
  title: string;
  authorNickname: string;
  createdAtLabel: string;
  status: PostStatus;
  reportCount: number;
};

const badge: Record<PostStatus, { label: string; className: string }> = {
  PUBLISHED: { label: "正常", className: "bg-green-50 text-green-600" },
  HIDDEN: { label: "已屏蔽", className: "bg-amber-50 text-amber-600" },
  DELETED: { label: "已删除", className: "bg-slate-100 text-slate-400" },
};

export function AdminPostRow({ post }: { post: AdminPostRowData }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const style = badge[post.status];

  function change(status: PostStatus) {
    setError(null);
    startTransition(async () => {
      const result = await setPostStatusAction(post.id, status);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deletePostAction(post.id);
      if (result.ok) {
        setConfirming(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
      <td className="px-4 py-2.5">
        <Link
          href={`/posts/${post.id}`}
          className="line-clamp-1 text-[13px] font-medium text-slate-800 hover:text-blue-600"
          title={post.title}
        >
          {post.title}
        </Link>
        {post.reportCount > 0 ? (
          <span className="ml-2 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] text-red-500">
            被举报 {post.reportCount}
          </span>
        ) : null}
        {error ? <p className="mt-1 text-[11px] text-red-500">{error}</p> : null}
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2.5 text-xs text-slate-500 sm:table-cell">
        {post.authorNickname}
      </td>
      <td className="hidden whitespace-nowrap px-3 py-2.5 text-[11px] text-slate-400 md:table-cell">
        {post.createdAtLabel}
      </td>
      <td className="whitespace-nowrap px-3 py-2.5">
        <span className={`rounded-full px-2 py-0.5 text-[10px] ${style.className}`}>
          {style.label}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5 text-right text-[11px]">
        <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
          {post.status === "PUBLISHED" ? (
            <button
              type="button"
              onClick={() => change("HIDDEN")}
              disabled={isPending}
              className="text-amber-600 hover:underline disabled:opacity-50"
            >
              屏蔽
            </button>
          ) : post.status === "HIDDEN" ? (
            <button
              type="button"
              onClick={() => change("PUBLISHED")}
              disabled={isPending}
              className="text-green-600 hover:underline disabled:opacity-50"
            >
              恢复
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={isPending}
            className="text-red-500 hover:underline disabled:opacity-50"
          >
            彻底删除
          </button>
        </div>
      </td>

      {confirming
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="确认删除帖子"
              className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-6"
            >
              <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
                <h2 className="text-sm font-semibold text-slate-900">
                  彻底删除这篇帖子？
                </h2>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  「{post.title}」删除后无法恢复，帖子的评论和点赞也会一并删除。
                </p>
                {error ? (
                  <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500">
                    {error}
                  </p>
                ) : null}
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    disabled={isPending}
                    className="rounded-full border border-slate-200 px-4 py-1.5 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-60"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={remove}
                    disabled={isPending}
                    className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {isPending ? "删除中…" : "确认删除"}
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
