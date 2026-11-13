import Link from "next/link";
import { PhoneVerifiedBadge } from "@/components/phone-verified-badge";
import { tagPillClass } from "@/lib/tag-style";

export type HallCard = {
  id: string;
  nickname: string;
  tags: string[];
  canProvide: string;
  needHelp: string;
  isMine: boolean;
  hasPhone: boolean;
};

type HallBoardProps = {
  cards: HallCard[];
  tags: { name: string; count: number }[];
  activeTag: string | null;
  total: number;
  page: number;
  totalPages: number;
};

function tagHref(tag: string | null) {
  return tag ? `/hall?tag=${encodeURIComponent(tag)}` : "/hall";
}

function pageHref(tag: string | null, page: number) {
  const sp = new URLSearchParams();
  if (tag) sp.set("tag", tag);
  if (page > 1) sp.set("page", String(page));
  const query = sp.toString();
  return query ? `/hall?${query}` : "/hall";
}

export function HallBoard({
  cards,
  tags,
  activeTag,
  total,
  page,
  totalPages,
}: HallBoardProps) {
  return (
    <>
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-black tracking-tight">结盟大厅</h1>
        <span className="pb-1 text-xs text-muted">{total} 位合伙人</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">
        只展示审核通过的名片。微信号不会公开，双方结盟成功后才会互相可见。
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={tagHref(null)}
            aria-current={activeTag === null ? "page" : undefined}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              activeTag === null
                ? "border-blue-600 bg-blue-600 font-semibold text-white"
                : "border-gray-200 bg-white text-gray-500 hover:text-blue-600"
            }`}
          >
            全部
          </Link>
          {tags.map((tag) => {
            const active = tag.name === activeTag;
            return (
              <Link
                key={tag.name}
                href={tagHref(active ? null : tag.name)}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  active
                    ? "border-blue-600 bg-blue-600 font-semibold text-white"
                    : "border-gray-200 bg-white text-gray-500 hover:text-blue-600"
                }`}
              >
                {tag.name}
                <span className="ml-1 opacity-60">{tag.count}</span>
              </Link>
            );
          })}
      </div>

      {cards.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-10 text-center">
          {total === 0 ? (
            <>
              <p className="text-sm text-muted">还没有通过审核的名片。</p>
              <Link
                href="/hall/card"
                className="mt-4 inline-block rounded-full bg-acid px-4 py-2 text-xs font-semibold text-ink"
              >
                去填写我的名片
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">
                没有带「{activeTag}」标签的名片。
              </p>
              <Link
                href="/hall"
                className="mt-4 inline-block text-xs text-acid underline underline-offset-4"
              >
                查看全部名片
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {cards.map((card) => (
            <article
              key={card.id}
              className="relative rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
            >
              <Link
                href={`/hall/${card.id}`}
                aria-label={`查看${card.nickname}的名片详情`}
                className="absolute inset-0 rounded-2xl"
              />
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-blue-100 bg-blue-50 text-xs font-bold text-blue-600">
                  {card.nickname.slice(0, 1)}
                </span>
                <span className="truncate text-sm font-semibold">
                  {card.nickname}
                </span>
                {card.hasPhone ? <PhoneVerifiedBadge /> : null}
                {card.isMine ? (
                  <span className="rounded-full border border-gray-200 px-2 py-0.5 text-[10px] text-gray-400">
                    我的名片
                  </span>
                ) : null}
              </div>

              {card.tags.length > 0 ? (
                <div className="relative z-10 mt-3 flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={tagHref(tag)}
                      className={tagPillClass(tag)}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              ) : null}

              <div className="mt-4 flex flex-col gap-3">
                <div>
                  <p className="text-[10px] tracking-[0.18em] text-muted">
                    我能提供
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-xs leading-6 text-paper/90">
                    {card.canProvide}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.18em] text-muted">
                    正在寻找
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-xs leading-6 text-paper/90">
                    {card.needHelp}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-right text-[10px] text-muted/70">
                查看详情 →
              </p>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-between">
          {page <= 1 ? (
            <span className="rounded-full border border-gray-200 px-4 py-1.5 text-xs text-gray-300">
              上一页
            </span>
          ) : (
            <Link
              href={pageHref(activeTag, page - 1)}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs text-gray-600 transition-colors hover:border-blue-200 hover:text-blue-600"
            >
              上一页
            </Link>
          )}
          <span className="text-[11px] tabular-nums text-muted">
            第 {Math.min(page, totalPages)} / {totalPages} 页
          </span>
          {page >= totalPages ? (
            <span className="rounded-full border border-gray-200 px-4 py-1.5 text-xs text-gray-300">
              下一页
            </span>
          ) : (
            <Link
              href={pageHref(activeTag, page + 1)}
              className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs text-gray-600 transition-colors hover:border-blue-200 hover:text-blue-600"
            >
              下一页
            </Link>
          )}
        </div>
      ) : null}

      <p className="mt-6 text-center text-[11px] text-muted">
        想出现在这里？
        <Link
          href="/hall/card"
          className="ml-1 text-acid underline underline-offset-4"
        >
          填写我的名片
        </Link>
      </p>
    </>
  );
}
