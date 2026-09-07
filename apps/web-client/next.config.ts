import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "standalone",
  // 缩短客户端 Router 缓存：动态路由不缓存（0s，杜绝挂旧版 RSC），
  // 静态路由最短允许 30s。避免部署换版后浏览器短暂持有旧版路由负载。
  // 注：本 Next 版本的公共类型将 staleTimes 归在 experimental 命名空间下。
  experimental: { staleTimes: { dynamic: 0, static: 30 } },
  transpilePackages: [
    "@ai-adolescent-mental-health/domain",
    "@ai-adolescent-mental-health/api-client",
    "@ai-adolescent-mental-health/config",
    "@ai-adolescent-mental-health/ui",
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL ?? "http://127.0.0.1:8080"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
