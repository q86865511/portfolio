# PROGRESS — 履歷入口網站

## 目前狀態
**全套上線並自動化**:主站 https://terrychou.com、子站 https://soulshard.terrychou.com 皆上線。**兩個 repo(portfolio、Soulshard-Hunter)各有獨立 self-hosted runner 與 CI/CD pipeline**,push 即自動部署;對外經 Cloudflare Tunnel(零入站),主站部署後自動 purge 邊緣快取。

## 已完成
- **2026-06-23** Item 3a 自動 purge:`deploy-main` 部署後呼叫 Cloudflare API purge(repo secret `CF_API_TOKEN` + var `CF_ZONE_ID`)——已實測回 `{"success":true}`,PDF 等更新即時生效。
- **2026-06-23** Item 2 Soulshard 子站:`soulshard.terrychou.com` 上線——靜態前端(`/srv/soulshard`)+ 後端 Node+Fastify+Postgres(docker compose,`/api/*`+`/rt` 經 Caddy `handle` 反代 `:8787`);**子站獨立 pipeline**(Soulshard-Hunter repo 自己的 runner `cfwebsite-soulshard`,取代舊 duckdns SSH 部署)。主站卡片連結改指新子網域。
- **2026-06-23** Phase 4/5 上線:cloudflared tunnel + Caddy(:8080)+ self-hosted ARM runner 兩段式部署(hosted amd64 build+PDF → artifact → ARM 部署 `/srv/main`);PDF 修正鏈(PR #1–#4)。
- **2026-06-23** Phase 1/3:Engineer Dark 設計系統 + `apps/main`(雙語/深淺色/showcase/PDF),build/lint/typecheck 綠。
- **2026-06-22~23** Phase 2 內容研究(17 專案雙語文案)、monorepo 骨架、首次 push(public `q86865511/portfolio`)、教學 `docs/00–22`。

## 進行中
- (無)

## 待辦
- **Web Analytics**:邊緣自動注入未生效(Tunnel 設定),改在 `apps/main` layout 直接加 Cloudflare beacon snippet(待 token)。
- 英文 PDF 內容(已目視確認為英文)。
- `cyclepact` 完成後接 `cyclepact.terrychou.com`(模式已備:Caddy 已預留註解 + 兩步驟新增子站)。
- `docs/30` 面試講稿;`docs/20–22` 補上「兩段式 + 雙 runner」細節。
- 視需要:Cloudflare 快取規則微調、舊 duckdns 機器退役、Postgres 預設密碼/5432 映射強化。

## 已知問題
- `.pdf` 等被 Cloudflare 快取的副檔名,更新後靠部署後 auto-purge 即時生效(已驗證)。
- 兩段式後主站部署不需主機端 Node/Chrome(只 rsync);Soulshard runner 需 Docker(已裝)。

## 重要決策紀錄
- **Monorepo + path-filtered + 每個子站各自 repo/runner/pipeline**(彼此解耦):portfolio→terrychou.com、Soulshard-Hunter→soulshard.terrychou.com,同機雙 runner、皆零入站。
- **對外 Cloudflare Tunnel → Caddy**:`handle` 區塊分流靜態 vs `/api`+`/rt` 反代;零入站、邊緣 TLS。
- **CI/CD 兩段式**(hosted build+PDF → artifact → ARM 部署):繞開 Chrome 無 ARM64;正式機輕量。
- **部署後 auto-purge**:解 CDN 對 `.pdf` 等的陳舊快取。
- **既有 scaffold 全部重做**,保留舊雙語文案作素材。
