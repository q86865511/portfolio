# 專案開發約定(履歷入口網站)

> 本檔是此 monorepo 的專案層慣例。全域規則見使用者全域 `CLAUDE.md`,本檔不重複、只補專案特定事項。

## 技術與工具
- 套件管理:**pnpm**(workspaces);任務編排:**Turborepo**(`turbo.json`)。
- 前端:Next.js 15(App Router、`output: 'export'` 靜態匯出)、React 19、TypeScript、Tailwind。
- 共用設計系統放 `packages/ui`,各 app 透過 workspace 相依引用,**不複製貼上元件**。
- e2e/smoke:**Playwright**(`apps/main/e2e/`),對 build 後的 `out/` 起本機 `serve` 驗證;已納入 `ci.yml`(build 後跑)。
- pnpm 設定(`overrides`、`allowBuilds`、`verifyDepsBeforeRun` 等)放 **`pnpm-workspace.yaml`**——此版 pnpm 由 workspace yaml 讀取,寫在 `package.json` 的 `pnpm` 欄不會生效。

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
