// 產生兩張代表作封面(public/covers/*.webp,1200x675,新視覺:三軸色幾何+紙面/墨底)。
// 與 generate-og.mjs 同一套 Puppeteer 靜態產圖流程;文案全部取自 content/projects.json 的真實欄位。
// 用法:`pnpm --filter main run generate-covers`(或 node scripts/generate-covers.mjs)

import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public/covers");

const WIDTH = 1200;
const HEIGHT = 675;

/** 共用樣式:紙面/墨底兩種地,三軸色平面,等寬字僅用於資料(管線階段/技術)。 */
const baseCss = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${WIDTH}px; height: ${HEIGHT}px; }
  body {
    font-family: "Segoe UI", "Microsoft JhengHei", "Noto Sans TC", sans-serif;
    position: relative; overflow: hidden; display: flex; align-items: center;
  }
  .content { position: relative; z-index: 1; padding: 0 0 0 84px; width: 760px; }
  .kind {
    display: inline-block; font-family: Consolas, monospace; font-size: 22px;
    padding: 8px 16px; border-radius: 10px; margin-bottom: 26px;
  }
  .title { font-size: 58px; font-weight: 700; line-height: 1.18; letter-spacing: -1px; margin-bottom: 18px; }
  .sub { font-size: 26px; line-height: 1.5; margin-bottom: 34px; }
  .chips { display: flex; flex-wrap: wrap; gap: 12px; }
  .chip {
    font-family: Consolas, monospace; font-size: 22px;
    padding: 8px 16px; border-radius: 10px; border: 1.5px solid transparent;
  }
  .art { position: absolute; right: 0; top: 0; width: 420px; height: 100%; }
`;

// 封面 1:AI 模型部署與監控平台(碩士論文)— 墨底,藍/紫主導(全端+AI-ML 軸)
const aiCover = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"/><style>
  ${baseCss}
  body { background: #0b1220; color: #e9eef7; }
  .kind { background: rgba(167,139,250,.15); color: #a78bfa; }
  .sub { color: #a6b4cc; }
  .chip { background: #172338; color: #a6b4cc; }
  .chip.hl { background: rgba(96,165,250,.14); color: #60a5fa; }
</style></head><body>
  <div class="content">
    <span class="kind">碩士論文 · Thesis</span>
    <div class="title">AI 模型部署與監控平台</div>
    <div class="sub">PT→ONNX→TensorRT 自動優化 · Triton 上架 · 即時監控</div>
    <div class="chips">
      <span class="chip hl">YOLOv8</span><span class="chip hl">TensorRT</span>
      <span class="chip hl">Triton</span><span class="chip">FastAPI</span>
      <span class="chip">React</span><span class="chip">Grafana</span>
    </div>
  </div>
  <svg class="art" viewBox="0 0 420 675" fill="none">
    <circle cx="290" cy="230" r="140" fill="#60a5fa"/>
    <path d="M290 90 A140 140 0 0 1 290 370 Z" fill="#a78bfa"/>
    <path d="M120 560 A100 100 0 0 1 320 560 Z" fill="#34d399"/>
    <circle cx="90" cy="140" r="16" fill="#a78bfa"/>
    <path d="M340 420 A60 60 0 0 1 340 540 Z" fill="#e9eef7"/>
    <g fill="#7c8ca6">
      ${Array.from({ length: 16 })
        .map((_, i) => `<circle cx="${60 + (i % 4) * 22}" cy="${380 + Math.floor(i / 4) * 22}" r="3"/>`)
        .join("")}
    </g>
  </svg>
</body></html>`;

// 封面 2:智慧行人導航系統(大學專題)— 紙面,綠/藍主導(視覺+導航語意)
const navCover = `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"/><style>
  ${baseCss}
  body { background: #f6f7f9; color: #0b1220; }
  .kind { background: rgba(4,120,87,.1); color: #047857; }
  .sub { color: #414d63; }
  .chip { background: #ffffff; color: #414d63; border-color: rgba(11,18,32,.12); }
  .chip.hl { background: rgba(124,58,237,.1); color: #7c3aed; border-color: transparent; }
</style></head><body>
  <div class="content">
    <span class="kind">大學專題 · Capstone</span>
    <div class="title">智慧行人導航系統</div>
    <div class="sub">街景語意分割 · 手勢辨識 · 燈號辨識 · 語音提示</div>
    <div class="chips">
      <span class="chip hl">FC-DenseNet103</span><span class="chip hl">OpenCV</span>
      <span class="chip hl">MediaPipe</span><span class="chip">TensorFlow 1.x</span>
      <span class="chip">Android</span>
    </div>
  </div>
  <svg class="art" viewBox="0 0 420 675" fill="none">
    <circle cx="270" cy="250" r="150" fill="#047857"/>
    <path d="M270 100 A150 150 0 0 1 270 400 Z" fill="#0b1220"/>
    <path d="M100 130 A80 80 0 0 1 180 50 L180 130 Z" fill="#2563eb"/>
    <path d="M140 580 A90 90 0 0 1 320 580 Z" fill="#7c3aed"/>
    <circle cx="80" cy="300" r="15" fill="#2563eb"/>
    <g fill="#5b6b82">
      ${Array.from({ length: 16 })
        .map((_, i) => `<circle cx="${320 + (i % 4) * 22}" cy="${480 + Math.floor(i / 4) * 22}" r="3"/>`)
        .join("")}
    </g>
  </svg>
</body></html>`;

const covers = [
  { file: "ai-deployment-pipeline.webp", html: aiCover },
  { file: "smart-pedestrian-navigation.webp", html: navCover },
];

async function main() {
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer")).default;
  } catch (err) {
    console.error(`[generate-covers] 無法載入 puppeteer:${err?.message ?? err}`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    for (const c of covers) {
      const page = await browser.newPage();
      await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
      await page.setContent(c.html, { waitUntil: "networkidle0" });
      await page.screenshot({ path: resolve(OUT_DIR, c.file), type: "webp", quality: 92 });
      await page.close();
      console.log(`[generate-covers] 已輸出 covers/${c.file}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("[generate-covers] 失敗:", err);
  process.exit(1);
});
