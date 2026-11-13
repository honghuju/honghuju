import type { Metadata } from "next";
import { PostForm } from "@/components/post-form";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "发帖 · 鸿鹄局",
};

export default async function NewPostPage() {
  const user = await requireUser("/posts/new");

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 py-6">
      <h1 className="text-2xl font-black tracking-tight">发帖</h1>
      <p className="mt-1 text-xs text-muted">
        以 {user.nickname} 的身份发布到广场
      </p>

      <div className="mt-6">
        <PostForm />
      </div>
    </main>
  );
}
