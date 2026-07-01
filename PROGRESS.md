# PROGRESS — 履歷入口網站

## 目前狀態
**全套上線並自動化**:主站 https://terrychou.com、子站 https://soulshard.terrychou.com 皆上線。兩個 repo(portfolio、Soulshard-Hunter)各有獨立 self-hosted runner 與 CI/CD,push 即自動部署;對外經 Cloudflare Tunnel(零入站),主站部署後自動 purge 邊緣快取;Cloudflare Web Analytics 運作中(CWV 全綠)。文件齊備、SEO/分享優化完成。前端已套用 Engineer Dark「立體層次」美化與互動/無障礙修正、專案分層調整;履歷 PDF 改為 ATS 格式(並修掉產線誤渲染首頁的 bug、固定專案順序);子站加上「魂晶」favicon。已上線的 SteamSaleChecker 子站(steam.terrychou.com)以 Notable + showcase(卡片直接 Live)收入作品集(R3,PR #18 已 merge、自動部署中),並順手修掉 live-demo 卡片「看詳情」fallback 首頁的既有 bug。已完成上線的 ERPSystem(erp.terrychou.com)由早期 Phase-0/WIP 條目全面更新為**已完成全端 live app**(showcase + liveUrl、換新封面、移除 WIP 徽章、技能補 Spring Boot/Mantine)。

## 已完成
- [2026-07-01] 🏭 **ERPSystem:WIP → 已完成全端 live app(內容 / 封面 / 呈現全面更新)**。ERPSystem 已全數完成並上線(後端 Phase 0–7 全端化 + 「Warm Terracotta」UI 重設計,https://erp.terrychou.com),故把作品集中嚴重過時的條目全面更新:
  - **`content/projects.json` erp-system**:`descZh/En` 重寫為「Java 21 + Spring Boot 4 + PostgreSQL 16 後端 + React 19 + Mantine 9 + Vite + TypeScript 前端」的**已上線全端產品**(刪除「Phase 0 走骨架 / 15 測試 / React 為後續階段」);`techStack` 補齊前端與全端項(React 19 / Mantine 9 / Vite / TanStack Query / springdoc-openapi / Micrometer / nginx …,共 19 項);第 4 條 highlight 由「Phase 0 藍圖」改為「全端交付並上線」;`challenges` 移除「仍屬早期」結尾;`demoFeasibility.canRunInBrowser` false→true、notes 改寫為線上 demo + 一鍵 docker compose。
  - **呈現改為 steam 同款**(刻意不用 `live-demo`——那會給遊戲味的「線上遊玩 / Play」CTA):`presentation:"showcase"` + `liveUrl:"https://erp.terrychou.com"` → 卡片得 **Live 徽章 + 「線上體驗」**(語意正確)、卡片主連結進 `/projects/erp-system` 故事頁,詳情頁另有「線上體驗 / Live demo」外連。與 SteamSaleChecker(同為非遊戲 live app)一致。
  - **`projects.ts`**:從 `WIP_SLUGS` 移除 erp-system(不再顯示 WIP 徽章);`TIER_MAP`(notable)、`RESUME_ORDER`(進 PDF)不動。
  - **換新封面**:以 headless Chrome 對線上 demo 的暖陶土**深色**儀表板截圖(登入 admin、略過導覽、`data-onboarding="reconciliation-hero"` 為準),套 soulshard/steam 同款版式(LIVE 徽章 + 中英標題 + URL + 圓角框住的截圖 + 技術 chips)以 sharp 輸出 1200×675 webp,覆蓋舊「後端工程 · WIP」設計款。
  - **技能小補**:`site.ts` 後端加 `Spring Boot`、前端加 `Mantine`(ERP 現為旗艦 Spring Boot + Mantine 專案,原清單缺漏 Java/Spring 生態)。
  - **驗證**:typecheck + build(19 靜態頁)綠;肉眼確認中/英 ATS PDF 的 ERP 段(oneLiner + 完整 techStack + 前 2 亮點、技能 Spring Boot/Mantine)、首頁 ERP 卡片(新封面、Live 徽章、「線上體驗」)、`/projects/erp-system` 詳情頁皆正確。
  - **待確認 / 未動**:`cyclepact` 仍在 `WIP_SLUGS`(是否已完成未知,留待確認);`ProjectsSection`/`ProjectDetailView` 對有 `liveUrl` 者的 `aria-label`「可線上遊玩 / playable」偏遊戲味(亦影響 steam,屬既有、僅螢幕報讀,未動)。README 未動(本次僅更新單筆專案內容 + 封面 + 呈現,monorepo 架構 / 部署拓撲 / 筆數 18 均未變;erp.terrychou.com 由 ERP 專案自有 repo/infra 部署,不屬本 monorepo 拓撲)。
- **2026-06-29** 🔒 依賴稽核 + e2e smoke + LICENSE:`pnpm audit --prod` 修掉 next 內嵌的 `postcss <8.5.10`(GHSA-qx2v-qp2m-jg93)——於 `pnpm-workspace.yaml` 加 `overrides: postcss>=8.5.10`(此版 pnpm 由 workspace yaml 讀設定,非 package.json),audit 歸零;新增 **Playwright 最小 smoke**(`apps/main/e2e/smoke.spec.ts`:首頁載入有實質內容 / 至少一個 `/projects/` 連結 / 行動版無水平溢出),對 build 出的 `out/` 起本機 `serve` 驗證,並納入 `ci.yml`(build 後跑、含 `playwright install`);補根目錄 `LICENSE`(MIT)。typecheck / lint / build / smoke(3 passed)全綠。
- [2026-06-26] 🖼️ 作品集卡片/詳情頁嵌入封面圖:7 個有封面的專案(2 featured + 5 notable)於卡片頂部與 `/projects/[slug]` 詳情頁顯示 16:9 封面(WebP,`apps/main/public/covers/<slug>.webp`,1200×675、各 33–50KB)。`packages/ui` Card 新增 `CoverImage`——FeaturedCard 以封面取代 glyph 帶、NotableCard 加頂圖;ProjectDetail 加 cover hero。`content/projects.json` 7 筆加 `cover` 欄、`Project` 介面加 `cover?`;mini/academic 無封面者版面不變。圖以 sharp 由 1408×792 PNG 轉 WebP。typecheck/lint/build 綠(out/ 已含 7 張 webp 與引用,靜態頁仍 19)。
- [2026-06-26] 🎨 7 專案封面圖 + ERPSystem 納入作品集:為 A~F 六個專案 + ERPSystem 各製作 16:9 深色工程風封面(設計款以 SVG→PNG via Puppeteer 渲染、魂晶/Steam 用實站截圖以 sharp 框制),PR 進各 repo README 頂部並 merge(AI-Deployment #5、Smart-Pedestrian #4、Soulshard #75、SteamSaleChecker #21、discord-auto-bot #3、cyclepact #23、ERPSystem #2;檔放 `docs/cover.png`,已有 architecture.svg 的保留)。ERPSystem(Java 21 / Spring Boot 4 / PostgreSQL 16,手寫複式記帳總帳 + DB 強制借貸平衡 + ArchUnit 邊界 + Testcontainers,Phase 0 走骨架)以 **Notable + WIP** 收入:`content/projects.json` +1 筆雙語(count 17→18,排 steam 後)、`projects.ts` 設 notable + 加入 `RESUME_ORDER`(steam 後)與 `WIP_SLUGS`。typecheck/build 綠(靜態頁 18→19,新增 `/projects/erp-system`)。封面 704×396 版另供 104 履歷「專案成就」上傳。
- [2026-06-26] 🖥️ R3.1 修 Soulshard 看詳情頁:既有 bug——`generateStaticParams` 只為 showcase 產 `/projects/[slug]` 詳情頁,但 `ProjectsSection` 的 live-demo 卡片仍 push「看詳情」,線上被 Caddy `try_files` fallback 成首頁。改法:`projects.ts` 新增 `hasDetailPage`(showcase + live-demo)與 `detailProjects()`,`page.tsx`(generateStaticParams + 守門)、`ProjectDetailView`(上/下一個導覽)、`sitemap.ts` 統一改用之 → Soulshard 也有故事頁(Live 徽章 + GitHub/線上體驗)。build 17→18 頁、入 sitemap;typecheck/lint/build 綠、詳情頁截圖 0 console error。PR #18 merged。
- [2026-06-26] 🖥️ R3 新增 SteamSaleChecker 子站:已上線 https://steam.terrychou.com(獨立 repo,Docker + GitHub Actions 部署,與 soulshard 同模式),以 metadata 收入作品集——`content/projects.json` +1 筆雙語(count 16→17,排 soulshard 後)、`projects.ts` 設 **Notable** + 加入 `RESUME_ORDER`(進 PDF,位於 soulshard 後)。`presentation:"showcase"` + `liveUrl`:`ProjectsSection` 讓「有 `liveUrl` 的 showcase」卡片顯示 **Live 徽章 + 一鍵『線上體驗』**(外加 看詳情/GitHub),`ProjectDetail` live 文案中性化「線上體驗 / Live demo」。README 同步(線上清單 + 拓撲 + 子站列表 + 筆數 16→17)。typecheck/lint/build 綠、重產 zh/en PDF、卡片與詳情頁截圖驗證(0 console error)。PR #18 merged。
- **2026-06-24** 履歷 PDF 微調:① 專案順序固定為 碩士(AI 部署)→ 大學專題(智慧導航)→ 魂晶 → Discord 自動化機器人 → 輪迴盟約(`projects.ts` 加 `RESUME_ORDER` 排序;只影響 PDF,不動首頁分層);② `discord-auto-bot` 標題去掉「斜線指令 / Slash-Command」→「Discord 自動化機器人 / Discord Automation Bot」(連帶詳情頁標題;首頁卡用 repoName 不受影響)。pdftotext 驗證順序與去名皆正確。
- **2026-06-24** 子站 favicon:Soulshard-Hunter 新增遊戲專屬「魂晶」切割寶石 SVG favicon(`icon.svg`,深底圓角框 + 金色四面切割,配色取自遊戲 loading)+ `theme-color`,`index.html` 引用;`deploy.yml` rsync 根層檔故自動部署為 `/icon.svg`(已驗證 200 image/svg+xml)。Soulshard-Hunter PR #69。
- **2026-06-24** 修正(重要):履歷 PDF 產線渲染到「首頁」而非 /print——CI 的 `serve --single`(SPA fallback)把無副檔名的 `/print/` 改寫成 index.html,導致線上 `resume-zh/en.pdf` 其實是首頁截圖。移除 `--single`(靜態匯出有真實 `/print/index.html`)。另修 client-side 語言競態:`PrintView` 設 `data-print-lang`,`generate-pdf` 等該屬性套用後才截圖,確保 en 為英文。實測:zh 819KB(中文)/ en 82KB(英文),內容為 ATS /print。
- **2026-06-24** 履歷 PDF 改 **ATS 格式**:重寫 `PrintView` 為嚴格 ATS-safe——單欄、純黑、標準無襯線字體(Arial/Helvetica + CJK fallback)、線性排版、零圖示/色塊/分欄;專案改用**可讀標題** + 學術標籤(碩士論文/大學專題)+ **完整技術關鍵字**(利於 ATS 比對);聯絡資訊純文字置於內文(含 terrychou.com)。`site.ts` 加 `website` 欄位。zh/en 兩版皆產出且為可選取文字(實測 innerText 3008/5790 字、PDF 非圖片)。沿用既有 `/print` + `generate-pdf` 產線,站上 `resume-zh.pdf` 連結不變。
- **2026-06-24** 前端微調(併入 PR #13):① 小品卡(MiniCard)改用技術徽章(techStack 前 4 個),取代單行語言+色點,與 featured/notable 一致;② Discord 公會管家改標 **Showcase**(自 WIP 清單移除);③ 學歷改 **2 欄**(桌機左右各一);④ 技術棧新增第六類「**遊戲 / 圖形**」(Godot 4 / GDScript / C# / raylib / HTML5 Canvas,3×2 排列),`SkillGroup.icon` 加 `game`(Gamepad2)。build/lint/typecheck 綠、深色+手機截圖驗證。
- **2026-06-24** 微調:`lolhelper` 由 notable 再降為 **mini**(小品工具);notable 剩 3、mini 增為 5。注意:mini 不入 PDF 履歷(僅 featured+notable),故 lolhelper 隨之移出 PDF。
- **2026-06-24** 專案重分類(依使用者指定):代表作(featured)= AI 模型部署平台(碩士論文)+ 智慧導航系統(大學專題);lolhelper 由 featured 降為 notable;Discord 公會管家由 notable 降為 mini;移除 pay-the-money(僅為 fork);ros-ball 標註課程專案。卡片新增中性 `kind` 標籤(碩士論文/大學專題/課程專案),代表作水印字標改 slug 對應(AI / CV)。`projects.json` count 17→16、README 同步。build/lint/typecheck 綠,深/淺色+手機截圖驗證。
- **2026-06-24** 前端美化上線(PR #11):Engineer Dark「立體層次」——卡片提亮表面 + teal/violet 左強調條 + 頂部高光;互動元件觸控目標 ≥44px、文字連結加底線(WCAG)、間距改 8px 柵格 token、Hero CTA 收齊、Mini 卡 3 欄、Section clamp 衝突修正;新增 `card-surface`/`card-accent-bar`/`link-underline` 與 `Button xl`。已 merge 並自動部署生效。
- **2026-06-23** 收尾:移除 Soulshard Postgres 5432 主機映射(Soulshard PR #68);Postgres 每日備份 cron(04:30 / 保留 14 天);UptimeRobot uptime 監控(terrychou.com + soulshard)。5a/5c 決定不做。
- **2026-06-23** Polish:`docs/30` 面試講稿;`docs/20–22` 改成反映兩段式+雙 runner+auto-purge 現況;主站 SEO/分享優化(layout 與 /projects/[slug] 完整 metadata、OG 圖 `public/og.png`、`icon.svg`、`sitemap.ts`、`robots.ts`)。build/lint/typecheck 綠。Web Analytics 確認運作(邊緣自動注入;CWV 全綠、LCP P90 ~856ms)。
- **2026-06-23** Item 3a 自動 purge:`deploy-main` 部署後呼叫 Cloudflare API purge(secret `CF_API_TOKEN` + var `CF_ZONE_ID`),實測 `{"success":true}`。
- **2026-06-23** Item 2 Soulshard 子站:soulshard.terrychou.com(靜態 + 後端 Node+Fastify+Postgres via docker compose,`/api`+`/rt` 經 Caddy handle 反代);**子站獨立 pipeline**(Soulshard-Hunter repo 自己的 runner `cfwebsite-soulshard`,取代舊 duckdns SSH 部署)。
- **2026-06-23** Phase 4/5 上線:cloudflared tunnel + Caddy(:8080)+ self-hosted ARM runner 兩段式部署(hosted amd64 build+PDF → artifact → ARM 部署);PDF 修正鏈(PR #1–#4)。
- **2026-06-23** Phase 1/3:Engineer Dark 設計系統 + `apps/main`(雙語/深淺色/showcase/PDF)。
- **2026-06-22~23** Phase 2 內容研究、monorepo 骨架、首次 push、教學 `docs/00–22`。

## 進行中
- (無)

## 待辦
- `cyclepact` 完成後接 `cyclepact.terrychou.com`(Caddy/ingress 已預留)。
- (可選)PDF 瀏覽器快取改即時更新(`Cache-Control: must-revalidate` + ETag),免每次手動清快取才看到新版;待使用者決定(需動主機 Caddy 設定)。

> 已決定**不做**:DB 帳密移到 env / 改密碼、runner 改獨立低權限使用者(5432 已移除、DB 僅 docker 內網,風險低)。

## 已知問題
- `.pdf` 等被 Cloudflare 快取的副檔名,更新後靠部署後 auto-purge 即時生效(已驗證)。
- 兩段式後主站部署不需主機端 Node/Chrome(只 rsync);Soulshard runner 需 Docker(已裝)。
- 舊 duckdns 機器已關閉退役。

## 重要決策紀錄
- **Monorepo + path-filtered + 每個子站各自 repo/runner/pipeline**(彼此解耦)。
- **對外 Cloudflare Tunnel → Caddy**(`handle` 區塊分流靜態 vs `/api`+`/rt` 反代);零入站、邊緣 TLS。
- **CI/CD 兩段式**(hosted build+PDF → artifact → ARM 部署):繞開 Chrome 無 ARM64;正式機輕量。
- **部署後 auto-purge** 解 CDN 陳舊快取;**OG 圖用靜態 `og.png`**(`next/og` 的 `ImageResponse` 不相容 `output:export`)。
- **既有 scaffold 全部重做**,保留舊雙語文案作素材。
