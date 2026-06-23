import { themeInitScript } from "@resume/ui";
import type { Metadata } from "next";
import { type ReactNode } from "react";
import { profile } from "@/lib/site";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const title = "周暐倫 Terry — 全端 / AI-ML 部署 / DevOps 工程師";
const description =
  "周暐倫 Terry 的工程師作品集:全端開發、把 ML 模型送上生產環境、以及 DevOps / 雲端自動化部署。CS 碩士,桃園 / 遠端。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s · 周暐倫 Terry Chou",
  },
  description,
  applicationName: SITE_NAME,
  authors: [{ name: profile.nameEn, url: profile.github }],
  creator: profile.nameEn,
  keywords: [
    "周暐倫",
    "Terry Chou",
    "Wei-Lun Chou",
    "全端工程師",
    "Full-Stack Engineer",
    "AI-ML 部署",
    "MLOps",
    "DevOps",
    "Next.js",
    "FastAPI",
    "TensorRT",
    "Triton",
    "YOLOv8",
    "Docker",
    "Cloudflare",
    "作品集",
    "Portfolio",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title,
    description,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "zh_TW",
    alternateLocale: ["en_US"],
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "周暐倫 Terry Chou — 全端 · AI-ML · DevOps",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* 防閃白:首次繪製前套用主題 */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
