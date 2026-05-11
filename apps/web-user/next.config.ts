import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  transpilePackages: [
    "@ai-adolescent-mental-health/api-client",
    "@ai-adolescent-mental-health/config",
    "@ai-adolescent-mental-health/domain",
    "@ai-adolescent-mental-health/ui",
  ],
};

export default nextConfig;
