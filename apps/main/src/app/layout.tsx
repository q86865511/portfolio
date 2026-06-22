import { themeInitScript } from "@resume/ui";
import type { Metadata } from "next";
import { type ReactNode } from "react";
import { profile } from "@/lib/site";
import "./globals.css";

const title = "周暐倫 Terry — 全端 / AI-ML 部署 / DevOps 工程師";
const description =
  "周暐倫 Terry 的工程師作品集:全端開發、把 ML 模型送上生產環境、以及 DevOps / 雲端自動化部署。CS 碩士,桃園 / 遠端。";

export const metadata: Metadata = {
  title,
  description,
  authors: [{ name: profile.nameEn, url: profile.github }],
  keywords: [
    "全端工程師",
    "AI-ML 部署",
    "DevOps",
    "Next.js",
    "TensorRT",
    "Triton",
    "Terry Chou",
    "周暐倫",
  ],
  openGraph: {
    title,
    description,
    type: "website",
    locale: "zh_TW",
    siteName: title,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
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
