"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  { href: "/admin", label: "数据概览" },
  { href: "/admin/cards", label: "名片管理" },
  { href: "/admin/posts", label: "帖子管理" },
  { href: "/admin/users", label: "用户管理" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminShell({
  nickname,
  children,
}: {
  nickname: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const current = NAV.find((item) => isActive(pathname, item.href)) ?? NAV[0];

  return (
    <div className="fixed inset-0 z-40 flex bg-slate-100 text-slate-800">
      {/* 左侧导航：桌面端 */}
      <aside className="hidden w-56 shrink-0 flex-col bg-slate-900 md:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-white/10 px-5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
            鸿
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">鸿鹄局</p>
            <p className="text-[10px] tracking-[0.18em] text-slate-500">
              管理工作台
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => {
            const active = item.href === current.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                  active
                    ? "bg-blue-600 font-semibold text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    active ? "bg-white" : "bg-slate-600"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            className="block rounded-lg px-3 py-2 text-[12px] text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            ← 返回前台
          </Link>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-800">{current.label}</span>
            <span className="hidden text-[11px] text-slate-400 sm:inline">
              鸿鹄局 · 管理工作台
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="hidden sm:inline">{nickname}</span>
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-3 py-1 transition-colors hover:border-blue-200 hover:text-blue-600 md:hidden"
            >
              返回前台
            </Link>
          </div>
        </header>

        {/* 移动端导航 */}
        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2 md:hidden">
          {NAV.map((item) => {
            const active = item.href === current.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                  active
                    ? "bg-blue-600 font-semibold text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
