// 產生社群分享 OG 圖(public/og.png,1200x630,淺色紙面+三軸色幾何風格)。
//
// 為什麼用 Puppeteer 而非 next/og 的 ImageResponse:
//   ImageResponse 透過 opengraph-image.tsx 會產生「需 runtime 渲染」的 route,
//   在 output:'export' 下 build 失敗(Next 要求 force-static,但 ImageResponse
//   仍無法靜態輸出)。改以自製 HTML + Puppeteer 截圖,產出純靜態 PNG,
//   保證與靜態匯出相容,且能正確渲染中文(用系統 CJK 字型)。
//
// 用法:`pnpm --filter main run generate-og`
// 結果為靜態檔,已提交進 repo;CI 無 Chromium 時不需重跑(腳本失敗不影響 build)。

import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public");
const OUT_FILE = resolve(OUT_DIR, "og.png");

const WIDTH = 1200;
const HEIGHT = 630;

// 自包含 HTML(新視覺:淺色紙面 + 三軸色 + 幾何色面,對齊 packages/ui globals.css token)。
const html = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; }
  body {
    display: flex;
    align-items: center;
    background: #f6f7f9;
    color: #0b1220;
    font-family: "Segoe UI", "Microsoft JhengHei", "Noto Sans TC", sans-serif;
    position: relative;
    overflow: hidden;
  }
  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 0 0 96px;
    gap: 20px;
    z-index: 1;
    width: 700px;
  }
  .logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 14px;
    background: #0b1220;
    color: #ffffff;
    font-size: 30px;
    font-weight: 700;
    letter-spacing: -1px;
  }
  .name {
    font-size: 88px;
    font-weight: 700;
    line-height: 1.06;
    letter-spacing: -2px;
  }
  .name .en { color: #5b6b82; }
  .tagline {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 38px;
    font-weight: 700;
    margin-top: 2px;
  }
  .tagline .fs { color: #2563eb; }
  .tagline .ml { color: #7c3aed; }
  .tagline .io { color: #047857; }
  .tagline .sep { color: #5b6b82; font-weight: 400; }
  .url {
    margin-top: 26px;
    font-size: 28px;
    color: #414d63;
    font-weight: 500;
  }
  /* 右側幾何色面(與站上 HeroGraphic 同語言) */
  .art { position: absolute; right: 0; top: 0; width: 500px; height: 100%; }
</style>
</head>
<body>
  <div class="content">
    <div class="logo">TC</div>
    <div class="name">周暐倫<br/><span class="en">Terry Chou</span></div>
    <div class="tagline">
      <span class="fs">全端</span><span class="sep">/</span>
      <span class="ml">AI-ML 部署</span><span class="sep">/</span>
      <span class="io">DevOps</span>
    </div>
    <div class="url">terrychou.com</div>
  </div>
  <svg class="art" viewBox="0 0 500 630" fill="none">
    <circle cx="330" cy="220" r="150" fill="#2563eb"/>
    <path d="M330 70 A150 150 0 0 1 330 370 Z" fill="#0b1220"/>
    <path d="M60 480 A90 90 0 0 1 240 480 Z" fill="#047857"/>
    <path d="M120 150 A80 80 0 0 1 200 70 L200 150 Z" fill="#7c3aed"/>
    <circle cx="90" cy="300" r="16" fill="#2563eb"/>
    <path d="M420 400 A70 70 0 0 1 420 540 Z" fill="#0b1220"/>
    <g fill="#5b6b82">
      ${Array.from({ length: 20 })
        .map((_, i) => {
          const cx = 350 + (i % 5) * 22;
          const cy = 470 + Math.floor(i / 5) * 22;
          return `<circle cx="${cx}" cy="${cy}" r="3"/>`;
        })
        .join("")}
    </g>
  </svg>
</body>
</html>`;

async function main() {
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer")).default;
  } catch (err) {
    console.error(
      "[generate-og] 無法載入 puppeteer,略過 OG 圖產生。\n" +
        "  安裝:pnpm --filter main add -D puppeteer\n" +
        `  原始錯誤:${err?.message ?? err}`,
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } catch (err) {
    console.error(
      "[generate-og] 無法啟動 Chromium(可能未下載瀏覽器)。\n" +
        "  下載:npx puppeteer browsers install chrome\n" +
        `  原始錯誤:${err?.message ?? err}`,
    );
    process.exit(1);
  }

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.screenshot({ path: OUT_FILE, type: "png" });
    console.log(`[generate-og] 已輸出 ${OUT_FILE} (${WIDTH}x${HEIGHT})`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("[generate-og] 失敗:", err);
  process.exit(1);
});
