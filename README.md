# Resume Portal — 周暐倫 (Terry Chou) 履歷入口網站

> 🌐 線上:**https://terrychou.com**(主站)· **https://soulshard.terrychou.com**(Soulshard live demo)· **https://steam.terrychou.com**(SteamSaleChecker)
> ｜ 部署於 Oracle Cloud A1 (ARM64),經 Cloudflare Tunnel 對外(零入站);`portfolio` 與 `Soulshard-Hunter` 各有獨立 self-hosted runner 與 CI/CD pipeline,push 即自動部署。

把既有的 GitHub 專案重新包裝成一個**對外的履歷門面網站**:主站是履歷門面,底下掛多個可獨立訪問的專案子站(能跑的做 live demo、其餘做 showcase),部署在 Oracle Cloud Always Free A1 (ARM64),透過 Cloudflare Tunnel 對外,並以獨立 CI/CD 管線各自建置與部署。

> 這是一個 **monorepo**(單一倉庫裝下主站、所有子站與共用元件),用 **pnpm workspaces + Turborepo** 管理,並用 GitHub Actions 的 `paths:` 過濾器讓每個子站擁有彼此解耦的 pipeline。

## 架構總覽

```
使用者
  │  HTTPS
  ▼
Cloudflare 邊緣 (DNS / Proxy / CDN 快取 / WAF / TLS 終結)
  │  Cloudflare Tunnel(cloudflared,主機主動連出,免開 80/443 入站)
  ▼
Oracle Cloud A1 (ARM64) 上的 Caddy
  ├─ 你的網域            → /srv/main(apps/main:履歷門面 + /projects/[slug] showcase)
  ├─ soulshard.你的網域  → /srv/soulshard(Soulshard-Hunter,獨立 repo + 自有 pipeline 部署)
  └─ steam.你的網域      → /srv/steam(SteamSaleChecker,獨立 repo;api+worker 走 Docker、Caddy 同站代理 /api、/auth)
                           (未來 cyclepact 完成後比照新增子網域)
```

- **不暴露主機公網 IP、不開入站埠**:對外連線一律由 `cloudflared` 主動連出建立的 Tunnel 承載(zero-trust 思路)。
- **每個 live demo 一個子網域 + 一條獨立 CI/CD**;不便執行的專案(GPU/桌面/Discord bot)做成主站底下的 showcase 詳情頁,網址同樣可被外部直接訪問。

## Monorepo 結構

```
.
├─ apps/
│  └─ main/          # 主站:履歷門面、showcase 詳情頁、PDF 履歷、雙語
├─ packages/
│  └─ ui/            # 共用設計系統(主題、元件、雙語基礎)
├─ content/          # 專案資料(projects.json,18 筆雙語,內容單一真實來源)
├─ infra/            # cloudflared / Caddy / 部署腳本
├─ docs/             # 教學文件(Cloudflare / CI/CD,繁體中文)
├─ .github/workflows/# 主站 path-filtered CI/CD(各 demo 子站於自有 repo)
├─ turbo.json        # Turborepo 任務管線
└─ pnpm-workspace.yaml
```

> **Live demo 子站採「各自 repo + 各自 CI/CD」**(最徹底的解耦):主站只負責導覽到子網域。
> - `Soulshard-Hunter`(現有,已自帶 GitHub Actions 部署)→ `soulshard.你的網域`
> - `SteamSaleChecker`(現有,已自帶 GitHub Actions 部署)→ `steam.你的網域`
> - `cyclepact`(開發中)→ 未來完成後新增 `cyclepact.你的網域`

## 技術棧

- **前端**:Next.js 15(App Router、靜態匯出 `output: 'export'`)、React 19、TypeScript、Tailwind CSS
- **共用**:Turborepo、pnpm workspaces、`packages/ui` 設計系統
- **基礎設施**:Oracle Cloud A1 (ARM64)、Caddy、Cloudflare(DNS/CDN/WAF/Tunnel)
- **CI/CD**:GitHub Actions(path-filtered)、self-hosted ARM runner

## 開發指令

```bash
pnpm install          # 安裝相依
pnpm dev              # 本機開發(turbo 啟動各 app 的 dev)
pnpm build            # 建置所有 app(靜態匯出到各自 out/)
pnpm lint             # Lint
pnpm typecheck        # 型別檢查
```

## CI/CD 與部署

- **`ci.yml`**(GitHub-hosted ubuntu):PR / push 時跑 `typecheck → lint → build → e2e smoke`,path-filtered,當作合併前的關卡。e2e 用 Playwright 對 build 出的靜態產物起本機伺服器,驗證首頁載入、專案連結與行動版不破版。
- **`deploy-main.yml`**(**兩段式**,push 到 `main` 且主站相關路徑 `apps/main`/`packages/ui`/`content` 變動時觸發):
  - **build(GitHub-hosted amd64)**:`pnpm build` + 裝 CJK 字型 + 產雙語 PDF → 上傳 artifact。
  - **deploy(Oracle A1 上的 self-hosted ARM runner)**:下載 artifact → `infra/scripts/deploy-static.sh` rsync 到 `/srv/main` → health check。**零 secrets、零入站**(runner 主動連出);正式機不 build、不需 Chrome。
  - 為何兩段式:Chrome for Testing 無 Linux ARM64 版,PDF 在 amd64 產最穩;小台 ARM 正式機只做輕量部署。
- Live demo 子站(Soulshard 等)於**各自 repo** 擁有獨立 pipeline,主站只導覽到其子網域。
- 啟用步驟、runner 註冊與取捨:見 [`docs/20–22`](./docs/) 與 [`infra/`](./infra/)。

## 文件

- 進度:[`PROGRESS.md`](./PROGRESS.md)
- 開發約定:[`CLAUDE.md`](./CLAUDE.md)
- 教學(Cloudflare / CI/CD,可作面試講稿):[`docs/`](./docs/)

## 授權

本專案採用 MIT 授權,詳見 [`LICENSE`](./LICENSE)。

---

© 2026 周暐倫 (Terry Chou) · Built with Next.js, Turborepo, Caddy & Cloudflare
