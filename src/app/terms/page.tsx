import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "用户协议 · 鸿鹄局",
};

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-8">
        <Link href="/" className="text-xs text-muted hover:text-blue-600">
          ← 返回广场
        </Link>

        <h1 className="mt-4 text-2xl font-black tracking-tight">用户协议</h1>
        <p className="mt-1 text-[11px] text-muted">最后更新：2026 年 11 月</p>

        <div className="mt-6 space-y-5 text-xs leading-6 text-slate-600">
          <section>
            <h2 className="text-sm font-semibold text-slate-800">
              一、服务说明
            </h2>
            <p className="mt-1.5">
              鸿鹄局是面向创业者与专业人士的技能互换、合伙结盟社区。你可以发布帖子、填写合伙人名片，并在双方同意后互换联系方式。
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-800">
              二、账号与内容
            </h2>
            <p className="mt-1.5">
              你需要使用用户名和密码注册，并对账号下的所有行为负责。绑定手机号为选填，绑定后会在名片上展示「已绑定手机」标识。禁止发布违法违规、虚假诈骗、侵犯他人权益的内容。
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-800">
              三、内容管理
            </h2>
            <p className="mt-1.5">
              管理员有权对违规帖子进行屏蔽或删除，对违规账号进行封禁。被屏蔽的内容仅作者与管理员可见。
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-800">
              四、免责声明
            </h2>
            <p className="mt-1.5">
              平台仅提供信息展示与连接服务，不参与用户之间的合作与交易。请在结盟前自行核实对方身份与资质。
            </p>
          </section>

          <p className="rounded-xl bg-slate-50 px-4 py-3 text-[11px] text-slate-400">
            本页面为上线前的协议占位内容，正式运营前会由法务补充完整条款。
          </p>
        </div>
    </main>
  );
}
