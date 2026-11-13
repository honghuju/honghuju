import Link from "next/link";

function buildHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number
) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  if (page > 1) sp.set("page", String(page));

  const query = sp.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  params = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      {prevDisabled ? (
        <span className="rounded-full border border-slate-200 px-4 py-1.5 text-[12px] text-slate-300">
          上一页
        </span>
      ) : (
        <Link
          href={buildHref(basePath, params, page - 1)}
          className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[12px] text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
        >
          上一页
        </Link>
      )}

      <span className="text-[11px] tabular-nums text-slate-400">
        第 {page} / {totalPages} 页
      </span>

      {nextDisabled ? (
        <span className="rounded-full border border-slate-200 px-4 py-1.5 text-[12px] text-slate-300">
          下一页
        </span>
      ) : (
        <Link
          href={buildHref(basePath, params, page + 1)}
          className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[12px] text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
        >
          下一页
        </Link>
      )}
    </div>
  );
}
