# PROGRESS — 履歷入口網站

## 目前狀態
**全套上線並自動化**:主站 https://terrychou.com、子站 https://soulshard.terrychou.com 皆上線。兩個 repo(portfolio、Soulshard-Hunter)各有獨立 self-hosted runner 與 CI/CD,push 即自動部署;對外經 Cloudflare Tunnel(零入站),主站部署後自動 purge 邊緣快取;Cloudflare Web Analytics 運作中(CWV 全綠)。文件齊備、SEO/分享優化完成。

## 已完成
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
