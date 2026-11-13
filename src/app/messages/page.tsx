import type { Metadata } from "next";
import { respondAllianceRequestAction } from "@/actions/alliance";
import { requireUser } from "@/lib/auth";
import { formatRelativeTime } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "我的消息 · 鸿鹄局",
};

type MessagesPageProps = {
  searchParams: Promise<{ done?: string; error?: string }>;
};

const STATUS_LABEL: Record<string, string> = {
  ACCEPTED: "已结盟",
  REJECTED: "已拒绝",
  CANCELLED: "已取消",
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const user = await requireUser("/messages");
  const { done, error } = await searchParams;

  const requests = await prisma.allianceRequest.findMany({
    where: { toUserId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      message: true,
      status: true,
      createdAt: true,
      respondedAt: true,
      fromUser: { select: { nickname: true } },
    },
  });

  const pending = requests.filter((item) => item.status === "PENDING");
  const processed = requests.filter((item) => item.status !== "PENDING");

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-black tracking-tight">我的消息</h1>
        <span className="pb-1 text-xs text-muted">
          {pending.length} 条待处理
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">
        收到的结盟申请都在这里。只有你点「同意」后，双方才会正式结盟并解锁微信号。
      </p>

      {done === "accept" ? (
        <p className="mt-4 rounded-xl bg-acid/10 px-4 py-3 text-xs leading-6 text-acid">
          已同意结盟，双方现在可以在对方的名片详情页看到微信号。
        </p>
      ) : null}
      {done === "reject" ? (
        <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-xs leading-6 text-muted">
          已拒绝该申请，联系方式不会解锁。
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-xs leading-6 text-red-400">
          这条申请不存在或已经处理过了。
        </p>
      ) : null}

      {pending.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center">
          <p className="text-sm text-muted">暂时没有新的结盟申请。</p>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-3">
          {pending.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-blue-100 bg-blue-50 text-xs font-bold text-blue-600">
                  {request.fromUser.nickname.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {request.fromUser.nickname}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {formatRelativeTime(request.createdAt)}发来结盟申请
                  </p>
                </div>
              </div>

              {request.message ? (
                <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-6 text-paper/90">
                  “{request.message}”
                </p>
              ) : null}

              <div className="mt-4 flex gap-2">
                <form action={respondAllianceRequestAction} className="flex-1">
                  <input
                    type="hidden"
                    name="requestId"
                    value={request.id}
                  />
                  <input type="hidden" name="decision" value="accept" />
                  <button
                    type="submit"
                    className="w-full rounded-full bg-acid py-2.5 text-xs font-bold text-ink"
                  >
                    同意结盟
                  </button>
                </form>
                <form action={respondAllianceRequestAction} className="flex-1">
                  <input
                    type="hidden"
                    name="requestId"
                    value={request.id}
                  />
                  <input type="hidden" name="decision" value="reject" />
                  <button
                    type="submit"
                    className="w-full rounded-full border border-gray-200 py-2.5 text-xs text-muted transition-colors hover:text-paper"
                  >
                    拒绝
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}

      {processed.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-[11px] tracking-[0.18em] text-muted">已处理</h2>
          <div className="mt-3 flex flex-col gap-2">
            {processed.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs text-paper/90">
                    {request.fromUser.nickname}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted">
                    {formatRelativeTime(
                      request.respondedAt ?? request.createdAt
                    )}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[10px] ${
                    request.status === "ACCEPTED" ? "text-acid" : "text-muted"
                  }`}
                >
                  {STATUS_LABEL[request.status] ?? "已处理"}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
