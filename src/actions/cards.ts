"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getRequestRegion } from "@/lib/ip-region";
import { prisma } from "@/lib/prisma";
import { MAX_CARD_TAGS, parseTags, serializeTags } from "@/lib/tags";

export type CardFormState = {
  error?: string;
  submittedAt?: number;
};

export async function saveCardAction(
  _prevState: CardFormState,
  formData: FormData
): Promise<CardFormState> {
  const user = await requireUser("/hall/card");

  const canProvide = String(formData.get("canProvide") ?? "").trim();
  const needHelp = String(formData.get("needHelp") ?? "").trim();
  const wechat = String(formData.get("wechat") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? "[]"));

  if (tags.length === 0) {
    return { error: "至少选择 1 个技能标签" };
  }
  if (tags.length > MAX_CARD_TAGS) {
    return { error: `最多选择 ${MAX_CARD_TAGS} 个技能标签` };
  }
  if (canProvide.length < 5 || canProvide.length > 500) {
    return { error: "「我能提供什么」需要 5-500 个字" };
  }
  if (needHelp.length < 5 || needHelp.length > 500) {
    return { error: "「寻找什么合伙人」需要 5-500 个字" };
  }
  if (wechat.length < 2 || wechat.length > 50 || /\s/.test(wechat)) {
    return { error: "请填写 2-50 个字符的微信号，且不能包含空格" };
  }

  const tagsJson = serializeTags(tags);

  // 新建或修改后都进入待审核，修改已通过的名片也需要重新审核
  await prisma.card.upsert({
    where: { userId: user.id },
    update: {
      canProvide,
      needHelp,
      wechat,
      tags: tagsJson,
      status: "PENDING",
      reviewNote: null,
      reviewedById: null,
      reviewedAt: null,
    },
    create: {
      userId: user.id,
      canProvide,
      needHelp,
      wechat,
      tags: tagsJson,
      status: "PENDING",
    },
  });

  revalidatePath("/hall/card");
  revalidatePath("/hall");

  // 同步刷新用户的 IP 属地，名片详情页会展示这个值
  const ipRegion = await getRequestRegion();
  if (ipRegion !== "未知") {
    await prisma.user.update({
      where: { id: user.id },
      data: { ipRegion },
    });
  }

  return { submittedAt: Date.now() };
}
