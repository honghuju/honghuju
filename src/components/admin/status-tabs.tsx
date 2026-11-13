import Link from "next/link";

export type StatusTabItem = {
  key: string;
  label: string;
  count: number;
  href: string;
};

export function StatusTabs({
  items,
  active,
}: {
  items: StatusTabItem[];
  active: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`rounded-full px-3 py-1.5 text-[12px] transition-colors ${
              isActive
                ? "bg-slate-900 font-semibold text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {item.label}
            <span
              className={`ml-1 tabular-nums ${
                isActive ? "text-white/60" : "text-slate-400"
              }`}
            >
              {item.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
