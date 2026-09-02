// 用 Puppeteer 將 /print?lang=zh 與 ?lang=en 轉成 PDF。
//
// 用法:
//   1) 先啟動站台:`pnpm --filter main run dev`(或 serve 出 out/)
//   2) `pnpm --filter main run generate-pdf`
//
// 可用環境變數 BASE_URL 覆寫(預設 http://localhost:3000)。
// 若環境無法下載 Chromium,腳本會印出說明並以非 0 結束,但不影響 build。

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT_DIR = resolve(__dirname, "../public");
const FONT_CACHE_DIR = resolve(__dirname, "../.fonts-cache");

const targets = [
  { lang: "zh", file: "resume-zh.pdf" },
  { lang: "en", file: "resume-en.pdf" },
];

// PDF 用的 CJK 字型必須是「靜態、glyf 輪廓」的 TrueType:Chrome/Skia 印 PDF 時,可變字型(CI 的
// fonts-noto-cjk、Google Fonts 直接下載的 Noto Sans TC)與 CFF 輪廓的 OTF(notofonts 官方靜態版)都只會
// 輸出 Type3 點陣字——中文版曾因此脹到 1.4 MB 且沒有真字型可供 ATS 解析(2026-09-02 在 Windows 與
// Linux 容器各實測,結論相同)。只有 glyf 靜態 TTF 會以 CIDFontType2 嵌入。
// 做法:從 google/fonts 釘定 commit 抓 Noto Sans TC 可變 TTF(glyf,SHA-256 驗證),用 fontTools
// 實例化成 400/700 兩個靜態 TTF 並把 family 改名為 "Resume CJK"(避免與系統字型撞名),快取在
// .fonts-cache/(已 gitignore)。字型不進 repo、不進 out/。
// 交給 Chrome 的方式依平台不同(同樣 2026-09-02 實測):Linux 上以 @font-face 注入的網頁字型仍會被
// 印成 Type3,只有「系統字型」會正常嵌入 → Linux 把 TTF 裝進使用者字型目錄再 fc-cache;
// Windows/macOS 則以 data: URL 的 @font-face 注入即可。PrintView 的字體堆疊兩種情況都以 "Resume CJK" 命中。
// 需要 Python 3 + fontTools(CI 以 pip 安裝;本機缺少時會給出明確錯誤)。
const CJK_SOURCE = {
  file: "NotoSansTC[wght].ttf",
  url: "https://raw.githubusercontent.com/google/fonts/b950a7257470b900078f2bf3223823a8602de7e1/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf",
  sha256: "864727d210d54f2537bbe23b3a839436c3992af72de9322af5270897246bd44f",
};
const CJK_INSTANCES = [
  { file: "NotoSansTC-Regular.ttf", weight: 400 },
  { file: "NotoSansTC-Bold.ttf", weight: 700 },
];

const CJK_FAMILY = "Resume CJK";

// 實例化 + 改名一次做完(參數:來源 輸出 wght)。只改 family/full name(1、4、16),
// 保留 PostScript 名稱(6)讓 PDF 裡的 BaseFont 仍看得出是 NotoSansTC。
const INSTANCE_PY = `
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
src, out, wght, family = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
f = instancer.instantiateVariableFont(TTFont(src), {"wght": wght}, updateFontNames=True)
sub = "Bold" if wght >= 600 else "Regular"
for rec in f["name"].names:
    if rec.nameID in (1, 16):
        rec.string = family
    elif rec.nameID == 4:
        rec.string = f"{family} {sub}"
f.save(out)
`;

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/** 找一個裝了 fontTools 的 Python(Windows 常是 python、Linux 是 python3)。 */
function findPythonWithFontTools() {
  for (const cmd of ["python3", "python"]) {
    const r = spawnSync(cmd, ["-c", "import fontTools.varLib.instancer"], { stdio: "ignore" });
    if (r.status === 0) return cmd;
  }
  throw new Error(
    "找不到裝有 fontTools 的 Python(python3/python)。安裝:pip install fonttools —— 沒有它就無法把可變字型實例化成靜態 TTF。",
  );
}

async function fetchWithRetry(url, tries = 3) {
  let lastErr;
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err;
      console.warn(`[generate-pdf] 下載失敗(${i}/${tries}):${url}:${err?.message ?? err}`);
    }
  }
  throw lastErr;
}

/** 確保來源可變 TTF 在快取內且雜湊正確,回傳其路徑。 */
async function ensureCjkSource() {
  const path = resolve(FONT_CACHE_DIR, CJK_SOURCE.file);
  const cached = await readFile(path).catch(() => null);
  if (cached && sha256(cached) === CJK_SOURCE.sha256) return path;
  console.log(`[generate-pdf] 下載 ${CJK_SOURCE.file}`);
  const buf = await fetchWithRetry(CJK_SOURCE.url);
  const got = sha256(buf);
  if (got !== CJK_SOURCE.sha256) {
    throw new Error(`${CJK_SOURCE.file} SHA-256 不符:預期 ${CJK_SOURCE.sha256},實得 ${got}`);
  }
  await writeFile(path, buf);
  return path;
}

/** 確保 400/700 靜態 TTF 實例存在(缺了就用 fontTools 從來源實例化),回傳 [{path, buf, weight}]。 */
async function ensureCjkInstances() {
  await mkdir(FONT_CACHE_DIR, { recursive: true });
  const out = [];
  let python = null;
  for (const inst of CJK_INSTANCES) {
    const path = resolve(FONT_CACHE_DIR, inst.file);
    let buf = await readFile(path).catch(() => null);
    if (!buf) {
      python ??= findPythonWithFontTools();
      const src = await ensureCjkSource();
      console.log(`[generate-pdf] 實例化 ${inst.file}(wght=${inst.weight},family "${CJK_FAMILY}")`);
      // 先寫 .tmp 再 rename:實例化中途被中斷不會留下截斷檔讓下次靜默沿用。
      const tmp = `${path}.tmp`;
      const r = spawnSync(python, ["-c", INSTANCE_PY, src, tmp, String(inst.weight), CJK_FAMILY], {
        stdio: ["ignore", "ignore", "pipe"],
      });
      if (r.status !== 0) {
        throw new Error(`fontTools 實例化 ${inst.file} 失敗:${r.stderr?.toString() ?? r.error}`);
      }
      await rename(tmp, path);
      buf = await readFile(path);
    }
    out.push({ file: inst.file, path, buf, weight: inst.weight });
  }
  return out;
}

/**
 * 依平台把字型交給 Chrome:Linux 裝成使用者系統字型(回傳空字串,不注入);
 * 其他平台回傳要注入頁面的 @font-face CSS。
 */
async function prepareCjkFonts() {
  const instances = await ensureCjkInstances();
  if (process.platform === "linux") {
    // fontconfig 預設會掃 ~/.local/share/fonts(XDG)與 ~/.fonts(舊式),兩邊都放最保險。
    const dirs = [resolve(homedir(), ".local/share/fonts/resume-cjk"), resolve(homedir(), ".fonts/resume-cjk")];
    for (const dir of dirs) {
      await mkdir(dir, { recursive: true });
      for (const inst of instances) await copyFile(inst.path, resolve(dir, inst.file));
    }
    const fc = spawnSync("fc-cache", ["-f"], { stdio: "ignore" });
    console.log(`[generate-pdf] 已將 "${CJK_FAMILY}" 裝為使用者系統字型(fc-cache ${fc.status === 0 ? "完成" : "不可用,交由 fontconfig 自行掃描"})`);
    const check = spawnSync("fc-list", [`:family=${CJK_FAMILY}`], { encoding: "utf8" });
    if (check.status === 0 && !check.stdout.trim()) {
      throw new Error(`fc-list 找不到 "${CJK_FAMILY}",系統字型安裝失敗——拒絕產出 Type3 版 PDF`);
    }
    return "";
  }
  return instances
    .map(
      (inst) =>
        `@font-face{font-family:"${CJK_FAMILY}";font-style:normal;font-weight:${inst.weight};font-display:block;` +
        `src:url(data:font/ttf;base64,${inst.buf.toString("base64")}) format("truetype");}`,
    )
    .join("\n");
}

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
  // 字型抓不到就直接失敗:寧可擋下部署,也不要再產出一份 Type3 的中文履歷。
  const cjkFontCss = await prepareCjkFonts();

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
      // 非 Linux:注入靜態 CJK 字型("Resume CJK"),並等字型真的載入完再列印;
      // 沒等到就會用系統 fallback 字型印出。Linux 走系統字型,不注入。
      if (cjkFontCss) await page.addStyleTag({ content: cjkFontCss });
      // FontFaceSet 本身不可序列化,只等它 resolve、不把它傳回來。
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      await page.emulateMediaType("print");
      const outPath = resolve(OUT_DIR, file);
      await page.pdf({
        path: outPath,
        format: "A4",
        printBackground: true,
        margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
      });
      // 產線斷言:Skia 的字型字典不壓縮,PDF 裡出現 "/Type3" 就代表字型嵌入退化了
      // (可變字型 / CFF / Linux 網頁字型),寧可讓 CI 紅燈也不部署一份肥大又無真字型的履歷。
      const pdfBytes = await readFile(outPath);
      if (pdfBytes.includes("/Type3")) {
        throw new Error(`${file} 含 Type3 字型——CJK 字型沒有被 Chrome 正常嵌入,拒絕產出`);
      }
      console.log(`[generate-pdf] 已輸出 ${outPath}(${pdfBytes.length} bytes,無 Type3)`);
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
