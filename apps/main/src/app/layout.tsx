import { themeInitScript } from "@resume/ui";
import type { Metadata } from "next";
import { Chivo_Mono, Noto_Sans_TC, Schibsted_Grotesk } from "next/font/google";
import { type ReactNode } from "react";
import { profile } from "@/lib/site";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

// 拉丁大標/內文:載入即用,preload 降 CLS。
const fontLatin = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});
// 中文:CJK 無命名 subset,build 時自託管、瀏覽器依 unicode-range 按需抓分片。
const fontTC = Noto_Sans_TC({
  subsets: [],
  preload: false,
  variable: "--font-tc",
  display: "swap",
  adjustFontFallback: false,
});
const fontMono = Chivo_Mono({
  subsets: ["latin"],
  preload: false,
  variable: "--font-mono-loaded",
  display: "swap",
});

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
    <html
      lang="zh-Hant"
      data-theme="light"
      suppressHydrationWarning
      className={`${fontLatin.variable} ${fontTC.variable} ${fontMono.variable}`}
    >
      <head>
        {/* 防閃色:首次繪製前套用主題 */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {/* 方向契約:必須以真 HTML 註解存活於產出(JSX 註解會被 build 剝除) */}
        <div
          hidden
          aria-hidden="true"
          dangerouslySetInnerHTML={{
            __html: `<!--
THESIS: recruiter trust in 30s via verifiable evidence; refuses the dark-terminal + neon-accent developer-portfolio default.
OWN-WORLD: paper-light ground #F6F7F9 with derived navy-ink dark theme; three-axis color system: blue #2563EB fullstack / violet #7C3AED AI-ML / green #047857 DevOps; geometric circle-plane signature art; Schibsted Grotesk + Noto Sans TC + Chivo Mono.
STORY: HR reads a credible modern professional, downloads the PDF or emails; tech leads verify via live demos and project pages.
FIRST VIEWPORT: nav with resume button; left: name, tri-color role line, lede, open-to-work status; right: geometric art panel; true-number stat strip below.
FORM: user-pinned reference image (modern light recruiting portfolio), pin supersedes roll; seed key 45830d90.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
-->`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
