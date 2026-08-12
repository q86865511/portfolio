# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

主要受眾（使用者確認 2026-08-11）：**台灣企業招募者（HR）優先**——他們從 104／人力銀行或履歷 PDF 上的連結點進來，在手機或桌面上快速掃描，需要在 30 秒內建立「這個候選人可信、專業」的印象，中文為主要語言。

次要受眾：技術主管／面試官——面試前後深入查驗專案深度、技術細節與程式碼能力，會點進專案詳情頁與 live demo。

## Product Purpose

周暐倫（Terry Chou）的履歷入口網站＋工程師作品集：單頁式履歷（About／Skills／Projects／Education）＋專案 showcase 詳情頁＋可下載的 ATS 格式 PDF 履歷（雙語）。成功的定義是把訪客轉化為面試邀約。

## Positioning

- 「作品可實際操作」：20 個專案中多個掛有可獨立訪問的 live demo 子站（soulshard.／steam.／erp.terrychou.com），能力主張可當場驗證，而非只有文字描述。
- 網站本身的部署架構（Oracle Cloud ARM 自架＋Cloudflare Tunnel 零入站＋path-filtered CI/CD）就是 DevOps 能力的實物證明。
- 定位標籤（使用者確認 2026-08-11）：**維持「全端／AI-ML 部署／DevOps」三標籤並列**，主打廣度，不偏科單一敘事。

## Operating Context

- 訪客多為招募流程中被動點開連結：從 PDF 履歷、104、LinkedIn、GitHub profile 進站。
- 雙語 zh-TW／en：前端切換（localStorage，預設 zh-TW），非路由分語系；`<html lang>` 同步。
- PDF 履歷由 `/print` 頁（noindex）經 puppeteer 產出 `/resume-zh.pdf`、`/resume-en.pdf`。
- 靜態匯出（Next.js `output:'export'`）部署，無伺服器端邏輯。

## Capabilities and Constraints

- 技術棧：Next.js 15 + React 19 + TypeScript、Tailwind 3.4、pnpm workspaces + Turborepo（`apps/main` + `packages/ui`）。
- 內容單一來源：個人資料在 `apps/main/src/lib/site.ts`，20 筆專案雙語資料在 `content/projects.json`——未來任何設計改動不得繞過這兩個來源另立內容。
- 靜態匯出約束：`images.unoptimized`、`trailingSlash`、專案詳情頁 `dynamicParams=false`。
- 多語已知限制（既存事實，非本次要解）：無 hreflang、無語系路由。
- 未決事實：真人照片的採用與呈現方式（見 Evidence on Hand）。

## Brand Commitments

- 姓名／品牌：周暐倫 · Terry (Wei-Lun) Chou，網域 terrychou.com，文字型 SVG logo「TC」。
- 既有視覺系統已成文於 `docs/01-design-system.md` 與 `packages/ui/src/tailwind-preset.ts`＋`packages/ui/src/styles/globals.css`（深色預設、teal／violet、Major Third 字級、8px 柵格）——此為現任視覺權威的所在，是否沿用或替換由後續設計工作決定，PRODUCT.md 不裁決。

## Evidence on Hand

- 20 個真實專案（`content/projects.json`）、9 張專案封面（`apps/main/public/covers/*.webp`）、OG 圖（`apps/main/public/og.png`）。
- Live demo 子站與 GitHub repo 連結為真實可驗證資產。
- 真人照片存在於 repo 外：`E:\OneDrive\桌面\履歷\照片.jpg`（白色背景，可能需去背；**是否使用與如何呈現交由設計判斷**——使用者交代 2026-08-11）。
- 沒有的東西（不得虛構）：推薦語／testimonials、客戶案例、任何未在 projects.json 記載的成果數字。

## Product Principles

1. HR 的 30 秒優先於工程師的 30 分鐘：首屏與第一頁以中文快速建立可信度，技術深度放在往下捲動與詳情頁。
2. 證據優先：每個能力主張都應連得到可驗證的實物（live demo、GitHub、PDF），說不出證據的主張不上站。
3. 三軸並列展廣度：全端／AI-ML 部署／DevOps 平衡呈現，不為單一敘事犧牲另外兩軸。
4. 內容單一來源、雙語同步：改內容必改 site.ts／projects.json 且 zh／en 成對維護。
5. 部署架構是作品的一部分：infra 的簡潔與零入站安全性本身就是展示品。

## Accessibility & Inclusion

既有實作水準為底線，未來設計不得倒退：skip-link、`:focus-visible` 焦點環、`prefers-reduced-motion`、觸控目標 ≥44px、連結不只靠顏色辨識、列印強制淺色。無使用者指定的額外標準。
