import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 不再需要原生模块外置（已从 SQLite 迁移到 Neon Postgres 适配器）
  serverExternalPackages: [],
  // 远程预览环境通过代理域名访问 dev server，需要放行才能加载客户端脚本
  allowedDevOrigins: [
    "**.remote-agent.svc.cluster.local",
    "*.agent-sandbox-bj-d1-gw.trae.cn",
  ],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
