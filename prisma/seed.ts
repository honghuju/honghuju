import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";
import { serializeTags } from "../src/lib/tags";

/** 无序用户对标识，保证一对用户只有一条结盟关系记录。 */
function makePairKey(userIdA: string, userIdB: string) {
  return [userIdA, userIdB].sort().join(":");
}

function minutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000);
}

async function main() {
  const [adminPassword, demoPassword] = await Promise.all([
    hashPassword("8iyDVB7fxWuM43P"),
    hashPassword("123456"),
  ]);

  const admin = await prisma.user.upsert({
    where: { nickname: "鸿鹄掌柜" },
    update: { role: "ADMIN", ipRegion: "北京" },
    create: {
      id: "usr_admin",
      nickname: "鸿鹄掌柜",
      passwordHash: adminPassword,
      role: "ADMIN",
      ipRegion: "北京",
    },
  });

  const chen = await prisma.user.upsert({
    where: { nickname: "陈码农" },
    update: { ipRegion: "浙江" },
    create: {
      id: "usr_chen",
      nickname: "陈码农",
      passwordHash: demoPassword,
      ipRegion: "浙江",
    },
  });

  const li = await prisma.user.upsert({
    where: { nickname: "李设计" },
    update: { ipRegion: "上海" },
    create: {
      id: "usr_li",
      nickname: "李设计",
      passwordHash: demoPassword,
      ipRegion: "上海",
    },
  });

  const wang = await prisma.user.upsert({
    where: { nickname: "王运营" },
    update: { ipRegion: "广东" },
    create: {
      id: "usr_wang",
      nickname: "王运营",
      passwordHash: demoPassword,
      ipRegion: "广东",
    },
  });

  const zhao = await prisma.user.upsert({
    where: { nickname: "赵产品" },
    update: { ipRegion: "北京" },
    create: {
      id: "usr_zhao",
      nickname: "赵产品",
      passwordHash: demoPassword,
      ipRegion: "北京",
    },
  });

  // ── 名片（结盟大厅） ────────────────────────────────
  const cardChen = await prisma.card.upsert({
    where: { userId: chen.id },
    update: {},
    create: {
      id: "card_chen",
      userId: chen.id,
      canProvide: "前端开发：React / Next.js / 微信小程序，能独立把产品做上线。",
      needHelp: "后端架构和 Node.js 服务端合伙人，长期一起接单。",
      wechat: "chen_code_2024",
      tags: serializeTags(["前端", "React", "小程序"]),
      status: "APPROVED",
      reviewedById: admin.id,
      reviewedAt: minutesAgo(60 * 24 * 3),
    },
  });

  const cardLi = await prisma.card.upsert({
    where: { userId: li.id },
    update: {},
    create: {
      id: "card_li",
      userId: li.id,
      canProvide: "UI/UX 设计、品牌视觉、落地页与小程序界面设计。",
      needHelp: "能一起接单的前端，或者想做独立产品的合伙人。",
      wechat: "lidesign88",
      tags: serializeTags(["设计", "UI", "品牌"]),
      status: "APPROVED",
      reviewedById: admin.id,
      reviewedAt: minutesAgo(60 * 24 * 2),
    },
  });

  await prisma.card.upsert({
    where: { userId: wang.id },
    update: {},
    create: {
      id: "card_wang",
      userId: wang.id,
      canProvide: "用户增长、私域运营、活动策划，做过 0 到 10 万用户的冷启动。",
      needHelp: "技术合伙人，一起做一款面向创业者的工具产品。",
      wechat: "wang_growth",
      tags: serializeTags(["运营", "增长", "私域"]),
      status: "APPROVED",
      reviewedById: admin.id,
      reviewedAt: minutesAgo(60 * 24),
    },
  });

  await prisma.card.upsert({
    where: { userId: zhao.id },
    update: {},
    create: {
      id: "card_zhao",
      userId: zhao.id,
      canProvide: "产品方案、需求梳理、AI 应用从 0 到 1 的落地经验。",
      needHelp: "愿意一起做 AI 副业的技术合伙人。",
      wechat: "zhaopm_ai",
      tags: serializeTags(["产品", "AI", "副业"]),
      status: "PENDING",
    },
  });

  // ── 广场帖子与评论 ────────────────────────────────
  const postChen = await prisma.post.upsert({
    where: { id: "post_chen_outsource" },
    update: { ipRegion: "浙江" },
    create: {
      id: "post_chen_outsource",
      authorId: chen.id,
      title: "接了个外包，缺一个靠谱的后端合伙人",
      content:
        "手上有个小程序项目，前端我一个人能搞定，但服务端和数据库想找个人一起分。\n预算不高，主要想找个能长期配合的人，做完这单后面还有。有兴趣的评论区聊。",
      viewCount: 128,
      ipRegion: "浙江",
      createdAt: minutesAgo(45),
    },
  });

  const postWang = await prisma.post.upsert({
    where: { id: "post_wang_freelance" },
    update: { ipRegion: "广东" },
    create: {
      id: "post_wang_freelance",
      authorId: wang.id,
      title: "裸辞三个月，聊聊我怎么靠接单活下来",
      content:
        "先给结论：能活，但比上班累。\n一、别一上来就降价，低价单最消耗人。\n二、把老客户维护好，复购比新客便宜太多。\n三、尽量找一个能互补的合伙人，一个人很难把交付做完整。",
      viewCount: 356,
      ipRegion: "广东",
      createdAt: minutesAgo(60 * 5),
    },
  });

  await prisma.post.upsert({
    where: { id: "post_li_cofounder" },
    update: { ipRegion: "上海" },
    create: {
      id: "post_li_cofounder",
      authorId: li.id,
      title: "有没有人一起做独立产品？设计这边我全包",
      content:
        "做了几年设计，一直想做个自己的产品。缺一个能写代码、愿意长期投入的合伙人。\n方向可以一起聊，先从一个小工具开始验证，不急着辞职。",
      viewCount: 89,
      ipRegion: "上海",
      createdAt: minutesAgo(60 * 26),
    },
  });

  await prisma.comment.upsert({
    where: { id: "cmt_chen_1" },
    update: {},
    create: {
      id: "cmt_chen_1",
      postId: postChen.id,
      authorId: li.id,
      content: "后端我认识一个，不过你得先说清楚预算和周期。",
      createdAt: minutesAgo(30),
    },
  });

  await prisma.comment.upsert({
    where: { id: "cmt_chen_2" },
    update: {},
    create: {
      id: "cmt_chen_2",
      postId: postChen.id,
      authorId: wang.id,
      content: "合伙人+1，运营侧的需求可能也能一起接。",
      createdAt: minutesAgo(12),
    },
  });

  await prisma.comment.upsert({
    where: { id: "cmt_wang_1" },
    update: {},
    create: {
      id: "cmt_wang_1",
      postId: postWang.id,
      authorId: chen.id,
      content: "第三条太真实了，一个人对接客户+交付真的顶不住。",
      createdAt: minutesAgo(60 * 4),
    },
  });

  // ── 结盟申请 ─────────────────────────────────────
  await prisma.allianceRequest.upsert({
    where: { pairKey: makePairKey(chen.id, li.id) },
    update: {},
    create: {
      id: "alliance_chen_li",
      pairKey: makePairKey(chen.id, li.id),
      fromUserId: chen.id,
      toUserId: li.id,
      cardId: cardLi.id,
      message: "想找你一起做个小程序，我负责前端，设计交给你。",
      status: "ACCEPTED",
      respondedAt: minutesAgo(60 * 20),
      createdAt: minutesAgo(60 * 22),
    },
  });

  await prisma.allianceRequest.upsert({
    where: { pairKey: makePairKey(wang.id, chen.id) },
    update: {},
    create: {
      id: "alliance_wang_chen",
      pairKey: makePairKey(wang.id, chen.id),
      fromUserId: wang.id,
      toUserId: chen.id,
      cardId: cardChen.id,
      message: "我在做创业者社群，想找技术搭档一起做个工具，聊聊？",
      status: "PENDING",
      createdAt: minutesAgo(18),
    },
  });
}

main()
  .then(async () => {
    const [users, posts, comments, cards, alliances] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.card.count(),
      prisma.allianceRequest.count(),
    ]);

    console.log("种子数据写入完成：");
    console.log(`  用户 ${users} · 帖子 ${posts} · 评论 ${comments} · 名片 ${cards} · 结盟申请 ${alliances}`);
    console.log("  管理员账号：鸿鹄掌柜 / 8iyDVB7fxWuM43P");
    console.log("  演示账号：陈码农、李设计、王运营、赵产品 / 123456");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
