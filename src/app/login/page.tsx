import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "登录 · 鸿鹄局",
};

function safeNext(value?: string) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  const target = safeNext(next);

  if (user) redirect(target);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-10">
      <h1 className="text-2xl font-black tracking-tight">登录</h1>
      <p className="mt-2 text-sm text-muted">回到你的事业主场。</p>

      <div className="mt-8">
        <AuthForm mode="login" next={target} />
      </div>
    </main>
  );
}
