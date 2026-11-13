/** 相对时间：刚刚 / x 分钟前 / x 小时前 / x 天前 / 具体日期 */
export function formatRelativeTime(date: Date) {
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60_000);

  if (diffMinutes < 1) return "刚刚";
  if (diffMinutes < 60) return `${diffMinutes} 分钟前`;

  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours} 小时前`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** 列表页摘要：压缩空白并截断。 */
export function excerpt(content: string, length = 80) {
  const plain = content.replace(/\s+/g, " ").trim();

  return plain.length > length ? `${plain.slice(0, length)}…` : plain;
}
