"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { makePairKey } from "@/lib/alliance";
import { getRequestRegion } from "@/lib/ip-region";
import { prisma } from "@/lib/prisma";

export type RequestFormState = {
  error?: string;
  success?: boolean;
};

export async function sendAllianceRequestAction(
  _prevState: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {
  const cardId = String(formData.get("cardId") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (!cardId) {
    return { error: "名片不存在" };
  }

  const user = await requireUser(`/hall/${cardId}`);

  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { id: true, userId: true, status: true },
  });

  if (!card || card.status !== "APPROVED") {
    return { error: "这张名片暂时无法申请" };
  }

  if (card.userId === user.id) {
    return { error: "不能向自己发送结盟申请" };
  }

  if (message.length < 2 || message.length > 200) {
    return { error: "留言请控制在 2-200 字之间" };
  }

  const pairKey = makePairKey(user.id, card.userId);
  const existing = await prisma.allianceRequest.findUnique({
    where: { pairKey },
    select: { status: true, fromUserId: true },
  });

  if (existing) {
    if (existing.status === "ACCEPTED") {
      return { error: "你们已经结盟了" };
    }
    if (existing.status === "PENDING") {
      return {
        error:
          existing.fromUserId === user.id
            ? "申请已发送，请等待对方同意"
            : "对方已经向你发送了申请",
      };
    }
    // REJECTED / CANCELLED：允许重新发起
  }

  if (existing) {
    await prisma.allianceRequest.update({
      where: { pairKey },
      data: {
        fromUserId: user.id,
        toUserId: card.userId,
        cardId: card.id,
        message,
        status: "PENDING",
        respondedAt: null,
      },
    });
  } else {
    await prisma.allianceRequest.create({
      data: {
        pairKey,
        fromUserId: user.id,
        toUserId: card.userId,
        cardId: card.id,
        message,
        status: "PENDING",
      },
    });
  }

  // 发送申请同样视为一次活跃，刷新用户属地
  const ipRegion = await getRequestRegion();
  if (ipRegion !== "未知") {
    await prisma.user.update({
      where: { id: user.id },
      data: { ipRegion },
    });
  }

  revalidatePath(`/hall/${card.id}`);

  return { success: true };
}

/** 处理收到的结盟申请：只有接收方可以同意或拒绝，且只处理待处理状态。 */
export async function respondAllianceRequestAction(formData: FormData) {
  const requestId = String(formData.get("requestId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  const user = await requireUser("/messages");

  if (!requestId || (decision !== "accept" && decision !== "reject")) {
    redirect("/messages?error=invalid");
  }

  const request = await prisma.allianceRequest.findFirst({
    where: { id: requestId, toUserId: user.id, status: "PENDING" },
    select: { id: true, cardId: true },
  });

  if (!request) {
    redirect("/messages?error=notfound");
  }

  await prisma.allianceRequest.update({
    where: { id: request.id },
    data: {
      status: decision === "accept" ? "ACCEPTED" : "REJECTED",
      respondedAt: new Date(),
    },
  });

  revalidatePath("/messages");
  revalidatePath("/hall");
  revalidatePath(`/hall/${request.cardId}`);
  revalidatePath("/", "layout");

  redirect(`/messages?done=${decision}`);
}
