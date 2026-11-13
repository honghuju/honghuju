"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCommentAction, type CommentFormState } from "@/actions/posts";
import { ImeSafeForm } from "@/components/ime-safe-form";

export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction, isPending] = useActionState<CommentFormState, FormData>(
    createCommentAction.bind(null, postId),
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.submittedAt) {
      formRef.current?.reset();
    }
  }, [state.submittedAt]);

  return (
    <ImeSafeForm ref={formRef} action={formAction} className="flex flex-col gap-2">
      <textarea
        name="content"
        required
        maxLength={500}
        rows={3}
        placeholder="说点什么…"
        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none placeholder:text-muted/70 focus:border-blue-500"
      />

      {state.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-500">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="self-end rounded-full bg-acid px-6 py-2 text-xs font-bold text-ink transition-opacity disabled:opacity-60"
      >
        {isPending ? "发送中…" : "发表评论"}
      </button>
    </ImeSafeForm>
  );
}
