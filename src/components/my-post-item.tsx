"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePostAction } from "@/actions/posts";

export type MyPostSummary = {
  id: string;
  title: string;
  excerpt: string;
  createdAtLabel: string;
  commentCount: number;
  likeCount: number;
  hidden: boolean;
};

export function MyPostItem({ post }: { post: MyPostSummary }) {
  const router = useRouter();
  const [removed, setRemoved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (removed) return null;

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deletePostAction(post.id);
      if (result.ok) {
        setRemoved(true);
        setConfirming(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-2">
        <Link
          href={`/posts/${post.id}`}
          className="min-w-0 flex-1 truncate text-base font-bold text-slate-800 transition-colors hover:text-acid"
        >
          {post.title}
        </Link>
        {post.hidden ? (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">
            已隐藏
          </span>
        ) : null}
      </div>

      <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted">
        {post.excerpt}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-muted">
          {post.createdAtLabel} · {post.commentCount} 评论 · {post.likeCount} 赞
        </span>

        <div className="flex items-center gap-2">
          <Link
            href={`/posts/${post.id}`}
            className="rounded-full border border-gray-200 px-3 py-1 text-[11px] text-muted transition-colors hover:text-paper"
          >
            查看
          </Link>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-500 transition-colors hover:bg-red-100"
          >
            删除
          </button>
        </div>
      </div>

      {confirming ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="确认删除帖子"
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-6"
        >
          <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
            <h2 className="text-sm font-semibold">删除这篇帖子？</h2>
            <p className="mt-2 text-xs leading-6 text-muted">
              「{post.title}」删除后无法恢复，帖子的评论和点赞也会一并删除。
            </p>

            {error ? (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-500">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={isPending}
                className="rounded-full border border-gray-200 px-4 py-1.5 text-xs text-muted transition-colors hover:text-paper disabled:opacity-60"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white transition-opacity disabled:opacity-60"
              >
                {isPending ? "删除中…" : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
