import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "standalone",
  // 缩短客户端 Router 缓存：动态路由不缓存（0s，杜绝挂旧版 RSC），
  // 静态路由最短允许 30s。避免部署换版后浏览器短暂持有旧版路由负载。
  // 注：本 Next 版本的公共类型将 staleTimes 归在 experimental 命名空间下。
  experimental: {
    staleTimes: { dynamic: 0, static: 30 },
  },
  // Next 开发服务器默认只信任 localhost 来源；用 127.0.0.1 或局域网 IP 访问时会
  // 403 掉 dev 专属资源（字体）+ 拒绝 HMR WebSocket 升级（浏览器报 ERR_INVALID_HTTP_RESPONSE，
  // 页面看起来“字体不一样/不更新”）。这里显式放行本地回环、局域网与 mDNS 主机名，做根治。
  // 值为纯主机名（不含协议/端口），支持 `*.` 通配。只影响 dev 环境，生产构建不受影响。
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.100.61",
    "192.168.100.1",
    "172.21.240.1",
    "100.112.37.19",
    "169.254.114.66",
    "*.local",
  ],
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
