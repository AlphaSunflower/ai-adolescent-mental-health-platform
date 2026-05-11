import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
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
