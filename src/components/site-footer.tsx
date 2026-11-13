import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white pb-24 pt-5 md:pb-5">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2 px-5 text-[11px] text-muted">
        <div className="flex items-center gap-4">
          <Link
            href="/terms"
            className="transition-colors hover:text-blue-600"
          >
            《用户协议》
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/privacy"
            className="transition-colors hover:text-blue-600"
          >
            《隐私政策》
          </Link>
        </div>
        <p className="text-[10px] text-gray-400">
          © 2026 鸿鹄局 · 连接靠谱的人，一起把事做成
        </p>
      </div>
    </footer>
  );
}
