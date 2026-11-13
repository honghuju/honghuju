"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const POLL_INTERVAL = 4000;
const TOAST_DURATION = 3000;

export function NotificationBell({ initialCount }: { initialCount: number }) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [toastVisible, setToastVisible] = useState(false);
  const countRef = useRef(initialCount);
  const firstCheckRef = useRef(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkUnread = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/unread", {
        cache: "no-store",
      });
      if (!response.ok) return;

      const data = (await response.json()) as { count?: number };
      if (typeof data.count !== "number") return;

      const nextCount = data.count;

      // 首次加载只同步角标，不弹提示，避免一进页面就打扰
      if (!firstCheckRef.current && nextCount > countRef.current) {
        setToastVisible(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          setToastVisible(false);
        }, TOAST_DURATION);
      }

      firstCheckRef.current = false;
      countRef.current = nextCount;
      setCount(nextCount);
    } catch {
      // 网络抖动时忽略，下一轮继续轮询
    }
  }, []);

  useEffect(() => {
    const initialTimer = setTimeout(checkUnread, 0);
    const pollTimer = setInterval(checkUnread, POLL_INTERVAL);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") checkUnread();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(pollTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [checkUnread]);

  function openMessages() {
    setToastVisible(false);
    router.push("/messages");
  }

  return (
    <>
      <Link
        href="/messages"
        aria-label={count > 0 ? `我的消息，${count} 条待处理` : "我的消息"}
        className="relative grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
          />
        </svg>
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </Link>

      {toastVisible && typeof document !== "undefined"
        ? createPortal(
            <button
              type="button"
              role="status"
              onClick={openMessages}
              className="fixed inset-x-4 top-24 z-50 mx-auto max-w-md animate-[toast-slide_180ms_ease-out] rounded-xl border border-blue-200 bg-white px-4 py-3 text-left text-xs text-slate-800 shadow-xl"
            >
              <span aria-hidden="true" className="mr-1.5">
                📩
              </span>
              收到一条新的结盟申请，去处理
            </button>,
            document.body
          )
        : null}
    </>
  );
}
