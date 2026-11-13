import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** 当前用户待处理的结盟申请数量，供顶栏角标轮询。 */
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { count: 0 },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const count = await prisma.allianceRequest.count({
    where: { toUserId: user.id, status: "PENDING" },
  });

  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "no-store" } }
  );
}
