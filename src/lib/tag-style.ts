const TECH_PATTERN =
  /前端|后端|全栈|开发|技术|程序|Node|React|Vue|Java|Python|AI|算法|数据|架构|运维|测试|代码|工程|小程序|iOS|Android/i;

/** 技能标签胶囊样式：技术类浅蓝，运营/其他类浅绿 */
export function tagPillClass(tag: string): string {
  return TECH_PATTERN.test(tag)
    ? "rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600"
    : "rounded-full bg-green-50 px-2.5 py-0.5 text-xs text-green-600";
}
