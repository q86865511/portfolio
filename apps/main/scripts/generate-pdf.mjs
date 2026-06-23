// 用 Puppeteer 將 /print?lang=zh 與 ?lang=en 轉成 PDF。
//
// 用法:
//   1) 先啟動站台:`pnpm --filter main run dev`(或 serve 出 out/)
//   2) `pnpm --filter main run generate-pdf`
//
// 可用環境變數 BASE_URL 覆寫(預設 http://localhost:3000)。
// 若環境無法下載 Chromium,腳本會印出說明並以非 0 結束,但不影響 build。

import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT_DIR = resolve(__dirname, "../public");

const targets = [
  { lang: "zh", file: "resume-zh.pdf" },
  { lang: "en", file: "resume-en.pdf" },
];

async function main() {
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer")).default;
  } catch (err) {
    console.error(
      "[generate-pdf] 無法載入 puppeteer,略過 PDF 產生。\n" +
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
      "[generate-pdf] 無法啟動 Chromium(可能未下載瀏覽器)。\n" +
        "  下載:npx puppeteer browsers install chrome\n" +
        `  原始錯誤:${err?.message ?? err}`,
    );
    process.exit(1);
  }

  try {
    for (const { lang, file } of targets) {
      const page = await browser.newPage();
      const url = `${BASE_URL}/print/?lang=${lang}`;
      console.log(`[generate-pdf] 載入 ${url}`);
      await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
      // 等前端 client-side 套用語言(PrintView 設 data-print-lang)後再截圖。
      await page
        .waitForFunction(
          (l) => document.documentElement.getAttribute("data-print-lang") === l,
          { timeout: 8000 },
          lang,
        )
        .catch(() => {});
      await page.emulateMediaType("print");
      const outPath = resolve(OUT_DIR, file);
      await page.pdf({
        path: outPath,
        format: "A4",
        printBackground: true,
        margin: { top: "14mm", bottom: "14mm", left: "14mm", right: "14mm" },
      });
      console.log(`[generate-pdf] 已輸出 ${outPath}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("[generate-pdf] 失敗:", err);
  process.exit(1);
});
