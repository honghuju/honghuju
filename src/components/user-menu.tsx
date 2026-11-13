"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/actions/auth";

export function UserMenu({
  nickname,
  isAdmin = false,
}: {
  nickname: string;
  isAdmin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex max-w-28 items-center gap-1 text-xs text-muted transition-colors hover:text-paper"
      >
        <span className="truncate">{nickname}</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
        >
          {isAdmin ? (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-xs text-acid transition-colors hover:bg-slate-50"
            >
              进入管理工作台
            </Link>
          ) : null}
          <Link
            href="/hall/card"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-xs text-muted transition-colors hover:bg-slate-50 hover:text-paper"
          >
            我的名片
          </Link>
          <Link
            href="/my-posts"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-xs text-muted transition-colors hover:bg-slate-50 hover:text-paper"
          >
            我的帖子
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-4 py-2.5 text-left text-xs text-muted transition-colors hover:bg-slate-50 hover:text-paper"
            >
              退出登录
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
