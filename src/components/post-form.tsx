"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createPostAction, type PostFormState } from "@/actions/posts";
import { ImeSafeForm } from "@/components/ime-safe-form";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-muted/70 focus:border-blue-500";

export function PostForm() {
  const [state, formAction, isPending] = useActionState<PostFormState, FormData>(
    createPostAction,
    {}
  );

  return (
    <ImeSafeForm action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-xs text-muted">标题</span>
        <input
          name="title"
          type="text"
          required
          minLength={2}
          maxLength={60}
          placeholder="一句话说清楚你想聊什么"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs text-muted">正文</span>
        <textarea
          name="content"
          required
          minLength={5}
          maxLength={5000}
          rows={10}
          placeholder="展开说说：你遇到了什么、需要什么帮助，或者想分享什么。"
          className={`${inputClass} resize-none leading-6`}
        />
      </label>

      {state.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-500">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl bg-acid py-3 text-sm font-bold text-ink transition-opacity disabled:opacity-60"
        >
          {isPending ? "发布中…" : "发布帖子"}
        </button>
        <Link
          href="/"
          className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm text-muted"
        >
          取消
        </Link>
      </div>
    </ImeSafeForm>
  );
}
