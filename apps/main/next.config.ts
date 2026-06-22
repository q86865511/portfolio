import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // 讓 Next 直接編譯 workspace 內的 TS/TSX 原始碼
  transpilePackages: ["@resume/ui"],
};

export default nextConfig;
