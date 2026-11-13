import Link from "next/link";
import { NavTabs } from "@/components/nav-tabs";
import { NotificationBell } from "@/components/notification-bell";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const unreadCount = user
    ? await prisma.allianceRequest.count({
        where: { toUserId: user.id, status: "PENDING" },
      })
    : 0;

  return (
    <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto w-full max-w-md px-5">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-acid text-xs font-black text-white">
              鸿
            </span>
            <span className="text-base font-black tracking-tight">鸿鹄局</span>
            <span className="text-[10px] tracking-[0.2em] text-acid">
              PARTNER
            </span>
          </Link>

          <div className="flex items-center gap-2.5 text-xs">
            {user ? (
              <>
                <NotificationBell
                  key={unreadCount}
                  initialCount={unreadCount}
                />
                <UserMenu
                  nickname={user.nickname}
                  isAdmin={user.role === "ADMIN"}
                />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full bg-blue-600 px-3 py-1 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-orange-500 px-3 py-1 font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>

        <NavTabs />
      </div>
    </header>
  );
}
