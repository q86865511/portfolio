# 30 — 面試講稿(一頁版)

> 這頁是給我自己用的「面試逐字稿骨架」。目標:面試官問起這個網站時,我能在一兩分鐘內把「做了什麼、為什麼這樣選、踩過哪些坑」講清楚,精準不浮誇。

## 一句話定位

我把散落在 GitHub 的多個專案,重新包裝成一個對外的履歷門面 `terrychou.com`:**自架在 Oracle Cloud Always Free 的 A1 主機(ARM64,2 OCPU / 12GB),透過 Cloudflare 對外,並且有完整的 CI/CD——push 到 main 就自動部署上線。** 它同時是「我的作品集」和「一個我親手維運的 production 系統」。

## 架構重點(以及為什麼這樣選)

- **Monorepo(pnpm workspaces + Turborepo)+ path-filtered CI/CD。** 主站、子站、共用設計系統(`packages/ui`)都在同一個 repo,招募者一個連結看完全部。每個子站走各自的 `paths:` 過濾 workflow,改哪個子站就只跑那條 pipeline,彼此解耦。更進一步:**每個獨立 live demo 是各自的 repo + 各自的 self-hosted runner + 各自的 pipeline**——`portfolio` repo 出 `terrychou.com`,`Soulshard-Hunter` repo 出 `soulshard.terrychou.com`,兩條 runner 同機共存、互不影響。
- **對外用 Cloudflare Tunnel,不開任何入站埠。** 主機跑 `cloudflared` 主動「連出」建立加密通道,所以 Oracle 防火牆**完全不開 80/443、不暴露主機公網 IP**。流量是:使用者 → Cloudflare 邊緣(終結 HTTPS / CDN / WAF)→ Tunnel → 主機上的 Caddy(只聽 `127.0.0.1:8080`)→ 靜態檔或動態服務。這就是 zero-trust 的入站模型:零入站攻擊面、IP 不外露,憑證在邊緣自動簽發。
- **CI/CD 是刻意設計的兩段式。** 第一段在 GitHub-hosted runner(amd64)做 build 並產生 PDF 履歷,把產物上傳成 artifact;第二段由主機上的 self-hosted ARM runner 下載 artifact、用 rsync 部署到 `/srv`。**為什麼分兩段:** 正式機是小台 ARM,把 build / Chrome 這些重工作移到 hosted 端,正式機只做輕量的「下載 + 部署」;部署本身仍走 runner「連出」領工作,維持零入站。部署完成後再自動呼叫 Cloudflare API purge 邊緣快取,讓更新(尤其是 PDF)即時生效。
- **Soulshard 子站是有後端的全棧 live demo。** 前端是靜態檔(`/srv/soulshard`),後端是 Node + Fastify + Postgres,用 docker compose 起在 `:8787`。Caddy 用 `handle` 區塊把 `/api/*` 和 `/rt`(WebSocket)反向代理到後端,其餘走靜態——同一個子網域同時服務靜態前端與動態 API/即時連線。

## 實作中真正解過的問題

這些是我會主動拿出來講的,因為它們展示的是除錯能力和工程取捨,不是把教學照抄一遍。

- **「runner 還沒就緒時,push 就讓整條 workflow 失敗(startup_failure)」**
  → 我在 deploy job 加了 `if: vars.DEPLOY_ENABLED` 的部署閘門。runner 沒上線時 deploy 安全跳過而不是報紅,build 照跑;runner 就緒後把變數打開即自動接上。讓「基礎設施尚未到位」和「程式碼壞了」這兩種狀態解耦。

- **「pnpm 啟動就崩潰」**
  → 根因是 pnpm 11 需要 Node ≥ 22.13,而 Node 20 缺 `node:sqlite` 這個內建模組,pnpm 一啟動就崩。解法是把 CI 與主機的 Node 都升到 22。重點不是升版本本身,而是「先定位到 missing built-in module 才對症下藥」。

- **「PDF 在 ARM 主機上產不出來」**
  → puppeteer 依賴 Chrome for Testing,而它**沒有 Linux ARM64 版**;在 ARM 上它會抓到 x64 的 Chrome,根本執行不了。這正是我把 build + PDF 移到 amd64 hosted runner、改成兩段式部署的直接原因——與其在 ARM 上硬湊一個 Chrome,不如讓架構繞開這個限制。

- **「更新了卻還是看到舊的 404 退路」**
  → `.pdf` 是 Cloudflare 預設會快取的副檔名。PDF 還沒存在時,Caddy 的 `try_files` 會回退到 `index.html`(HTTP 200),這個錯誤退路被邊緣快取住;等 origin 有了真正的 PDF,使用者仍拿到舊快取。解法是部署後自動 purge 邊緣快取(已實測 API 回 `{"success":true}`)。

- **「Caddy 的 `try_files` 把該給後端的請求吃掉了」**
  → `try_files` 的指令執行順序早於 `reverse_proxy`,會在靜態檔比對階段就攔下 `/api` 請求。解法是用 `handle` 區塊把 `/api`、`/rt` 和靜態檔各自隔離,讓路由意圖明確、彼此不互搶。

## 可量化亮點

- 上線後用 Cloudflare Web Analytics 觀測:**Core Web Vitals(LCP / INP / CLS)全綠**,**LCP P90 約 856ms**。
- 用 Next.js 靜態匯出 + 邊緣 CDN 把首屏壓到這個水準,佐證「靜態優先 + 邊緣快取」的選型是對的,而不是只憑感覺說「很快」。
