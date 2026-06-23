# PROGRESS — 履歷入口網站

## 目前狀態
**已上線:https://terrychou.com**(Engineer Dark 門面、雙語、深淺色、8 個 showcase 詳情頁、可下載 PDF 履歷)。對外走 Cloudflare Tunnel → Caddy(零入站、邊緣 HTTPS);CI/CD 為兩段式(hosted build+PDF → artifact → self-hosted ARM runner 部署),**push 到 main 即自動上線**。核心目標(把 GitHub 專案重新包裝成對外履歷、部署於 Oracle A1、透過 Cloudflare、具完整 CI/CD)達成。

## 已完成
- **2026-06-23** Phase 4 上線:Oracle A1(Ubuntu 24.04/aarch64, 主機名 cfwebsite)裝 `cloudflared` 建 tunnel `resume`、Caddy 聽 `127.0.0.1:8080`(`http_port 8080`/`auto_https off`)、`/srv/main`;DNS proxied CNAME 由 `cloudflared tunnel route dns` 建立;`terrychou.com` 經邊緣回 HTTP/2 200(零入站埠)。
- **2026-06-23** Phase 5 上線:在主機註冊 self-hosted ARM runner(labels self-hosted/Linux/ARM64, systemd, 以 ubuntu 跑)、設 repo variables `DOMAIN`/`DEPLOY_ENABLED`;`deploy-main` 兩段式自動部署成功,真站上 `terrychou.com`。
- **2026-06-23** 修正鏈(PR #1–#4):部署閘門(`DEPLOY_ENABLED`,避免 runner 未就緒 startup_failure)→ CI Node 20→22(pnpm 11 需 ≥22.13)→ PDF best-effort → **deploy-main 重構為兩段式**(根因:Chrome for Testing 無 Linux ARM64 版)。PDF 雙語已產出(`%PDF`,各 1.3MB);CDN 曾快取 `.pdf` 的 404 退路,purge 後正常。
- **2026-06-23** Phase 3 前端:`packages/ui`(@resume/ui)+ `apps/main`(Next.js 15 `output:export`:單頁門面、`/projects/[slug]` 8 頁、`/print` 雙語、PDF)。typecheck/lint/build 綠。
- **2026-06-23** Phase 1 設計:Engineer Dark 設計系統(`docs/01` + `design/mockup-main.html`)。
- **2026-06-23** Phase 4 基礎設施草稿入庫:`infra/cloudflared`、`infra/caddy/Caddyfile`、`infra/scripts/deploy-static.sh`,教學 `docs/10–12`、`docs/20–22`。
- **2026-06-22** Phase 2 內容研究:Workflow 扇出 17 agent 實讀 repo → `content/projects.json`(雙語、精準)。
- **2026-06-22** 階段規劃與架構拍板、歸檔舊 scaffold、monorepo 骨架(pnpm + Turborepo)、首次 push(public repo `q86865511/portfolio`)。

## 進行中
- (無)當前無進行中工作;以下為可選強化。

## 待辦(可選強化)
- 確認/修正英文 PDF 語言(`/print?lang=en` 是否真為英文;兩檔位元組不同但大小相同,待目視確認)。
- 把 Soulshard 接上 `soulshard.terrychou.com`(cloudflared ingress + DNS + Caddy vhost),示範多子站。
- Cloudflare:部署後自動 purge(CI 內用 CF API token,免手動)、開 Web Analytics、視需要設快取規則。
- `docs/30` 面試講稿(把整套架構 + 解過的問題濃縮一頁)。
- 文件精修:`docs/20–22` 目前描述「runner 上 build」的原始單段設計;實際已改兩段式(見 `docs/00` §5 與 README),擇期同步。

## 已知問題
- `.pdf` 是 Cloudflare 預設快取副檔名;若 origin 內容更新需 purge(或日後在 CI 自動 purge)。
- 兩段式後,主機上先前裝的 Node 22 / Chrome 依賴對「部署」已非必需(deploy job 只做下載 artifact + rsync),保留無妨。
- Soulshard 仍在舊機器的 DuckDNS;尚未遷至 `soulshard.terrychou.com`。

## 重要決策紀錄
- **Monorepo + path-filtered CI/CD**:單站獨立 build/deploy 又好維護。
- **路由**:live demo 用子網域、showcase 用路徑(`/projects/[slug]`),皆可獨立訪問。
- **對外 Cloudflare Tunnel → Caddy**:零入站、IP 隱藏、邊緣 TLS。
- **CI/CD 兩段式**:hosted(amd64)build + 產 PDF → artifact → self-hosted ARM runner 部署。**根因**:Chrome for Testing 無官方 Linux ARM64 版,puppeteer 在 ARM 取得 x64 Chrome 無法執行;移到 amd64 產 PDF 最乾淨,正式機(小台 ARM)只做輕量 rsync,deploy 仍零入站。
- **既有 scaffold 全部重做**,保留舊雙語文案作素材。
