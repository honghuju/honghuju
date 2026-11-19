"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { reportCardAction, reportPostAction } from "@/actions/reports";

type ReportButtonProps = {
  kind: "post" | "card";
  id: string;
  className?: string;
};

/**
 * 举报按钮：点击后二次确认，提交成功会把内容自动屏蔽。
 * 未登录时服务端动作会跳转到登录页。
 */
export function ReportButton({ kind, id, className }: ReportButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    const label = kind === "post" ? "这篇帖子" : "这张名片";
    if (!window.confirm(`确定举报${label}吗？举报后内容会立即屏蔽，等待管理员核实。`)) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result =
        kind === "post" ? await reportPostAction(id) : await reportCardAction(id);
      if (result.ok) {
        setMessage(result.message);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (message) {
    return (
      <span className={`text-[11px] text-green-600 ${className ?? ""}`}>
        {message}
      </span>
    );
  }

  return (
    <span className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="text-[11px] text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50"
      >
        {pending ? "提交中…" : "举报"}
      </button>
      {error ? (
        <span className="ml-2 text-[11px] text-red-500">{error}</span>
      ) : null}
    </span>
  );
}
