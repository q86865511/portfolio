// 產生社群分享 OG 圖(public/og.png,1200x630,Engineer Dark 風格)。
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

// 自包含 HTML(Engineer Dark 配色,對齊 packages/ui globals.css token)。
const html = `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; }
  body {
    display: flex;
    background:
      radial-gradient(900px 500px at 82% 18%, rgba(45, 212, 191, 0.16), transparent 60%),
      radial-gradient(800px 600px at 12% 92%, rgba(167, 139, 250, 0.14), transparent 60%),
      #0b0f14;
    color: #e8edf2;
    font-family: "Inter", "Segoe UI", "Microsoft JhengHei", "Noto Sans TC", sans-serif;
    position: relative;
    overflow: hidden;
  }
  .frame {
    position: absolute;
    inset: 28px;
    border: 1.5px solid rgba(159, 176, 192, 0.22);
    border-radius: 24px;
  }
  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 88px 96px;
    gap: 22px;
    z-index: 1;
  }
  .prompt {
    font-family: "JetBrains Mono", "Cascadia Code", "Consolas", monospace;
    font-size: 30px;
    color: #2dd4bf;
    letter-spacing: 0.5px;
  }
  .prompt .caret { color: #5eead4; }
  .name {
    font-size: 92px;
    font-weight: 700;
    line-height: 1.04;
    letter-spacing: -1px;
  }
  .name .en { color: #9fb0c0; font-weight: 700; }
  .tagline {
    display: flex;
    align-items: center;
    gap: 18px;
    font-family: "JetBrains Mono", "Cascadia Code", "Consolas", monospace;
    font-size: 40px;
    font-weight: 700;
    color: #a78bfa;
    margin-top: 4px;
  }
  .tagline .dot { color: #2dd4bf; }
  .footer {
    margin-top: 40px;
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: "JetBrains Mono", "Cascadia Code", "Consolas", monospace;
    font-size: 28px;
    color: #9fb0c0;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    height: 40px;
    padding: 0 14px;
    border: 1.5px solid #2dd4bf;
    border-radius: 8px;
    color: #2dd4bf;
    font-size: 24px;
    font-weight: 700;
  }
  .url { color: #e8edf2; }
</style>
</head>
<body>
  <div class="frame"></div>
  <div class="content">
    <div class="prompt"><span class="caret">$</span> whoami</div>
    <div class="name">周暐倫 <span class="en">Terry Chou</span></div>
    <div class="tagline">
      <span>全端</span><span class="dot">·</span>
      <span>AI-ML</span><span class="dot">·</span>
      <span>DevOps</span>
    </div>
    <div class="footer">
      <span class="badge">TC</span>
      <span class="url">terrychou.com</span>
    </div>
  </div>
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
