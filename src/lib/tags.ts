/**
 * SQLite 不支持标量数组，名片的 tags 以 JSON 字符串存储，
 * 统一通过这些工具函数读写，避免各处手写 JSON.parse。
 */

export const MAX_CARD_TAGS = 5;

/** 名片表单的常用标签，用户也可以自行添加 */
export const CARD_TAG_OPTIONS = [
  "前端",
  "后端",
  "设计",
  "产品",
  "运营",
  "AI",
  "写作",
  "视频",
  "财务",
  "法律",
  "市场",
  "其他",
];

export function parseTags(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((tag): tag is string => typeof tag === "string") : [];
  } catch {
    return [];
  }
}

export function serializeTags(tags: string[]): string {
  const normalized = [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
  return JSON.stringify(normalized);
}
