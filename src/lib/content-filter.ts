// 最基础的敏感词拦截：命中任意一个词就拒绝提交。
// 词表只覆盖最常见的黑产 / 诈骗话术，后续可以按需补充。

const SENSITIVE_WORDS = [
  "代开发票",
  "发票代开",
  "博彩",
  "赌博",
  "网络赌场",
  "贷款秒批",
  "秒批贷款",
  "无抵押贷款",
  "高利贷",
  "套现",
  "刷单",
  "返利",
  "洗钱",
  "跑分",
  "裸聊",
  "约炮",
  "招嫖",
  "卖淫",
  "枪支",
  "毒品",
  "冰毒",
  "办证",
  "代考",
  "黑客接单",
  "私家侦探",
];

/** 去掉空格与常见分隔符，避免「代 开 发 票」这类简单绕过 */
function normalize(text: string) {
  return text.toLowerCase().replace(/[\s\-_*·.,，。、|/\\+]+/g, "");
}

export type SensitiveCheck =
  | { ok: true }
  | { ok: false; word: string; error: string };

/** 检查一段文本是否包含敏感词 */
export function checkSensitive(text: string): SensitiveCheck {
  const normalized = normalize(text);
  const word = SENSITIVE_WORDS.find((item) => normalized.includes(item));
  if (!word) {
    return { ok: true };
  }
  return {
    ok: false,
    word,
    error: `内容包含违规词「${word}」，请修改后再提交`,
  };
}

/** 依次检查多个字段，返回第一个命中的结果 */
export function checkFields(fields: string[]): SensitiveCheck {
  for (const field of fields) {
    const result = checkSensitive(field);
    if (!result.ok) {
      return result;
    }
  }
  return { ok: true };
}
