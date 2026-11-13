import { headers } from "next/headers";

/**
 * IP 属地解析（只到省份 / 国家，保护隐私）
 * - 本地 / 内网 IP 显示「本地」
 * - 公网 IP 通过免费接口解析省级名称，失败时返回「未知」
 * - 结果在进程内缓存 6 小时，避免重复请求
 */

const PRIVATE_IPV4 =
  /^(?:10\.|127\.|0\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|169\.254\.)/;

const PROVINCE_SUFFIX =
  /(壮族自治区|回族自治区|维吾尔自治区|特别行政区|自治区|省|市)$/;

const CACHE_TTL = 1000 * 60 * 60 * 6;
const regionCache = new Map<string, { region: string; at: number }>();

/** 去掉 IPv6 映射前缀并压缩空白 */
function normalizeIp(value: string) {
  const ip = value.trim();
  if (!ip) return "";
  return ip.toLowerCase().startsWith("::ffff:") ? ip.slice(7) : ip;
}

export function isPrivateIp(ip: string) {
  if (!ip) return true;
  if (ip === "::1" || ip === "localhost") return true;
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) {
    return true;
  }
  return PRIVATE_IPV4.test(ip);
}

/** 把「浙江省 / 北京市」这类名称简化成「浙江 / 北京」 */
export function simplifyRegion(name: string) {
  return name.trim().replace(PROVINCE_SUFFIX, "");
}

/** 从请求头里取客户端 IP（兼容常见反向代理） */
export async function getRequestIp() {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0];
  const raw =
    forwarded ??
    headerStore.get("x-real-ip") ??
    headerStore.get("cf-connecting-ip") ??
    "";

  return normalizeIp(raw);
}

/** 本地/内网请求拿不到公网 IP 时的展示值；开发环境可用 DEMO_IP_REGION 模拟省份 */
function localRegionLabel() {
  if (process.env.NODE_ENV !== "production" && process.env.DEMO_IP_REGION) {
    return process.env.DEMO_IP_REGION.trim();
  }
  return "本地";
}

/** 解析单个 IP 的属地 */
export async function resolveIpRegion(ip: string): Promise<string> {
  if (!ip) {
    // 本地开发拿不到真实 IP，直接标记为本地；线上缺少代理头时按未知处理
    return process.env.NODE_ENV === "production" ? "未知" : localRegionLabel();
  }
  if (isPrivateIp(ip)) return localRegionLabel();

  const cached = regionCache.get(ip);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return cached.region;
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,regionName,country&lang=zh-CN`,
      { signal: AbortSignal.timeout(1500) }
    );

    if (response.ok) {
      const data = (await response.json()) as {
        status?: string;
        regionName?: string;
        country?: string;
      };

      if (data.status === "success") {
        const region = simplifyRegion(data.regionName || data.country || "");
        if (region) {
          regionCache.set(ip, { region, at: Date.now() });
          return region;
        }
      }
    }
  } catch {
    // 网络异常或超时：降级为未知，不影响主流程
  }

  return "未知";
}

/** 当前请求的 IP 属地 */
export async function getRequestRegion() {
  return resolveIpRegion(await getRequestIp());
}
