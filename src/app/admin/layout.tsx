import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") notFound();

  return <AdminShell nickname={user.nickname}>{children}</AdminShell>;
}
