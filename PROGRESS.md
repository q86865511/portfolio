# PROGRESS — 履歷入口網站

## 目前狀態
**全套上線並自動化**:主站 https://terrychou.com、子站 https://soulshard.terrychou.com 皆上線。兩個 repo(portfolio、Soulshard-Hunter)各有獨立 self-hosted runner 與 CI/CD,push 即自動部署;對外經 Cloudflare Tunnel(零入站),主站部署後自動 purge 邊緣快取;Cloudflare Web Analytics 運作中(CWV 全綠)。文件齊備、SEO/分享優化完成。

## 已完成
- **2026-06-24** 履歷 PDF 微調:① 專案順序固定為 碩士(AI 部署)→ 大學專題(智慧導航)→ 魂晶 → Discord 自動化機器人 → 輪迴盟約(`projects.ts` 加 `RESUME_ORDER` 排序;只影響 PDF,不動首頁分層);② `discord-auto-bot` 標題去掉「斜線指令 / Slash-Command」→「Discord 自動化機器人 / Discord Automation Bot」(連帶詳情頁標題;首頁卡用 repoName 不受影響)。pdftotext 驗證順序與去名皆正確。
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
