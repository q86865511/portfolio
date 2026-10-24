import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // 頁尾年份在 build 時定死並內嵌到 client bundle,避免跨年後 SSR 與 client 的 new Date() 不一致造成 hydration 錯誤。
  env: {
    NEXT_PUBLIC_BUILD_YEAR: String(new Date().getFullYear()),
  },
  // 讓 Next 直接編譯 workspace 內的 TS/TSX 原始碼
  transpilePackages: ["@resume/ui"],
};

export default nextConfig;
