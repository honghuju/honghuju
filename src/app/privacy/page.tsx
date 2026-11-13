import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "隐私政策 · 鸿鹄局",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-8">
        <Link href="/" className="text-xs text-muted hover:text-blue-600">
          ← 返回广场
        </Link>

        <h1 className="mt-4 text-2xl font-black tracking-tight">隐私政策</h1>
        <p className="mt-1 text-[11px] text-muted">最后更新：2026 年 11 月</p>

        <div className="mt-6 space-y-5 text-xs leading-6 text-slate-600">
          <section>
            <h2 className="text-sm font-semibold text-slate-800">
              一、我们收集的信息
            </h2>
            <p className="mt-1.5">
              注册手机号、昵称、你主动填写的合伙人名片（技能标签、可提供的能力、正在寻找的资源、微信号），以及发帖时记录的 IP 属地（仅到省份）。
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-800">
              二、信息如何使用
            </h2>
            <p className="mt-1.5">
              手机号仅用于登录与账号安全；名片信息经审核后展示在结盟大厅；微信号不会公开展示，只有双方结盟成功后才互相可见。
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-800">
              三、信息存储
            </h2>
            <p className="mt-1.5">
              数据存储于加密的云数据库中，我们采取合理的技术措施保护你的信息安全。
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-800">
              四、你的权利
            </h2>
            <p className="mt-1.5">
              你可以随时修改自己的名片与帖子，也可以通过公众号联系我们申请注销账号，注销后相关数据将被删除。
            </p>
          </section>

          <p className="rounded-xl bg-slate-50 px-4 py-3 text-[11px] text-slate-400">
            本页面为上线前的隐私政策占位内容，正式运营前会由法务补充完整条款。
          </p>
        </div>
    </main>
  );
}
