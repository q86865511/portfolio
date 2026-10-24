# 專案開發約定(履歷入口網站)

> 本檔是此 monorepo 的專案層慣例。全域規則見使用者全域 `CLAUDE.md`,本檔不重複、只補專案特定事項。

## 技術與工具
- 套件管理:**pnpm**(workspaces);任務編排:**Turborepo**(`turbo.json`)。
- 根目錄 `content/projects.json` 由 `apps/main` 跨套件匯入,已列入 `turbo.json` 的 `globalDependencies`;日後若新增其他「套件外輸入檔」也要同步宣告,否則 turbo build 快取不會因它變更而失效。
- 前端:Next.js 15(App Router、`output: 'export'` 靜態匯出)、React 19、TypeScript、Tailwind。
- 共用設計系統放 `packages/ui`,各 app 透過 workspace 相依引用,**不複製貼上元件**。
- e2e/smoke:**Playwright**(`apps/main/e2e/`),對 build 後的 `out/` 起本機 `serve` 驗證;已納入 `ci.yml`(build 後跑)。
- PDF 履歷(`apps/main/scripts/generate-pdf.mjs`)的中文字型必須是 **glyf 靜態 TTF**(Chrome 印 PDF 對可變字型與 CFF OTF 都只出 Type3):腳本自抓釘定版本的 Noto Sans TC 並用 fontTools 實例化為 family `Resume CJK`;Linux 裝成使用者系統字型、Windows/macOS 以 @font-face 注入(Linux 的網頁字型也會變 Type3);本機需 Python 3 + `pip install fonttools`;履歷收錄與順序只看 `projects.ts` 的 `RESUME_SECTIONS`,不由 tier 推導。
- pnpm 設定(`overrides`、`allowBuilds`、`verifyDepsBeforeRun` 等)放 **`pnpm-workspace.yaml`**——此版 pnpm 由 workspace yaml 讀取,寫在 `package.json` 的 `pnpm` 欄不會生效。

- 首頁與詳情頁共用的導覽一律使用 `/#區塊`(品牌為 `/#main`),避免詳情頁落到不存在的本頁錨點。首頁先呈現「線上作品」(`#projects`,有 `liveUrl` 者,含封面)再接「研究代表作」(`#featured`),其餘作品位於關於/技能之後且**不重複列出已上線專案**;詳情頁上一個/下一個依 `projects.ts` 的 `homeOrder()`。
- 網址 `?lang=zh|en` 優先於 localStorage,英文版對外分享一律用 `https://terrychou.com/?lang=en`(英文 PDF 已印此網址)。
- 詳情頁社群分享圖:`public/og/<slug>.jpg` 由 `apps/main/scripts/generate-project-og.py`(Pillow)自封面裁成 1200×630;換封面後要重跑並提交,沒有對應 JPG 時退回 `og.png`。
- 卡片主標取 `titleZh/titleEn`,repo 名僅為次要資訊;精簡摘要與代表技術使用 `projects.json` 的 `cardSummaryZh/cardSummaryEn`、`cardTechStack`,不得改短完整 `oneLiner` 或 `techStack` 而影響詳情頁與 ATS 履歷。
- 私有 repo 的專案:`projects.json` 的 `githubUrl` 填空字串,卡片與詳情頁就不顯示 GitHub 按鈕;開發中的專案把 slug 加進 `projects.ts` 的 `WIP_SLUGS`,顯示「進行中」徽章。

## 目錄約定
- `apps/main`:履歷主站(門面 + `/projects/[slug]` showcase + PDF 履歷 + 雙語)。
- `apps/<demo>`:各 live demo 子站(各自子網域、各自 CI/CD)。
- `infra/`:cloudflared、Caddy、部署腳本。
- `docs/`:Cloudflare / CI/CD 教學(繁體中文,需含「為什麼 / 角色 / 替代方案 / 取捨」)。
- `.github/workflows/`:每個 app 一條 `paths:` 過濾的 workflow,彼此解耦。

## 內容語氣
- 專案描述雙語(zh-TW / en),語氣「招募者看得懂、技術主管會認可」,精準不浮誇。

## Git / PR / Merge(本專案特例,經使用者指定)
1. 首次:`git init` → 建 repo → **第一次直接 push,不開 PR**(push 前先跑文件關卡並列出更新項目)。
2. 此後:每次變更 **自動 commit + 自動開 PR**,**停下等使用者說 merge 才合併**(merge 一律要使用者點頭)。
3. commit 訊息繁體中文 `類型: 簡述`(功能/修正/重構/文件/測試)。

## 文件維護
- 每完成功能 / 修要 bug / 做架構決策,立即更新 `PROGRESS.md`(只追加/修改相關段落)。
- push / PR / merge 前更新 `PROGRESS.md`、`README.md`、本 `CLAUDE.md`,並列出更新了哪些段落。
