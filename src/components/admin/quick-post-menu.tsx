"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { setPostStatusAction } from "@/actions/admin";
import { deletePostAction } from "@/actions/posts";
import type { PostStatus } from "@/generated/prisma/client";

/**
 * 前台广场的管理员快捷操作入口。
 * 仅管理员渲染；普通用户页面上不会出现任何差异。
 */
export function AdminQuickPostMenu({
  postId,
  postTitle,
  status,
}: {
  postId: string;
  postTitle: string;
  status: PostStatus;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  function changeStatus(status: PostStatus) {
    setError(null);
    startTransition(async () => {
      const result = await setPostStatusAction(postId, status);
      if (result.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function remove() {
    if (!window.confirm(`彻底删除「${postTitle}」？评论和点赞会一并删除，且无法恢复。`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deletePostAction(postId);
      if (result.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div ref={rootRef} className="relative z-10">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        aria-label="管理员快捷操作"
        aria-expanded={open}
        className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-8 w-32 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
        >
          {status === "PUBLISHED" ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => changeStatus("HIDDEN")}
              disabled={isPending}
              className="block w-full px-3 py-2 text-left text-[12px] text-amber-600 hover:bg-amber-50 disabled:opacity-50"
            >
              屏蔽此帖
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={() => changeStatus("PUBLISHED")}
              disabled={isPending}
              className="block w-full px-3 py-2 text-left text-[12px] text-green-600 hover:bg-green-50 disabled:opacity-50"
            >
              恢复此帖
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={remove}
            disabled={isPending}
            className="block w-full px-3 py-2 text-left text-[12px] text-red-500 hover:bg-red-50 disabled:opacity-50"
          >
            彻底删除
          </button>
          {error ? (
            <p className="px-3 py-1.5 text-[10px] text-red-500">{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
