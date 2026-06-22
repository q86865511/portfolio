# PROGRESS — 履歷入口網站

## 目前狀態
本地初版完成:設計系統(`packages/ui`)、主站(`apps/main`,雙語 / 深淺色 / showcase 詳情頁 / A4 列印 + PDF)、基礎設施設定草稿(Cloudflare Tunnel + Caddy)、CI/CD 設定檔(ci + deploy-main)皆到位,typecheck / lint / build 三項皆綠。準備首次 commit 並 push 到 public repo `q86865511/portfolio`。Cloudflare 接入與 runner 註冊等實際佈署待 Phase 4/7 與使用者一起逐步進行。

## 已完成
- **2026-06-23** Phase 5 CI/CD 設定檔:`.github/workflows/ci.yml`(PR/push 驗證,ubuntu-latest,typecheck/lint/build,path-filtered)、`deploy-main.yml`(self-hosted ARM,僅主站 path-filtered,build→PDF→`deploy-static.sh`→health check,零 secrets,用 repo var `DOMAIN`);教學 `docs/20–22`(Actions / path-filter / self-hosted runner)。已驗證 YAML 與 `pnpm install --frozen-lockfile`。
- **2026-06-23** Phase 3 前端實作:`packages/ui`(@resume/ui:Tailwind preset、`globals.css` 深淺色/a11y、Lang/Theme Provider、11 元件)+ `apps/main`(Next.js 15 `output:'export'`:單頁、`/projects/[slug]` 8 頁 showcase、`/print` 雙語、`generate-pdf`)。`src/lib/projects.ts` 讀 `content/projects.json` 分層。typecheck/lint/build 皆 exit 0,實機截圖驗證視覺貼合設計。
- **2026-06-23** Phase 1 設計:「Engineer Dark」設計系統(`docs/01`:色票 token、CJK 字體、11 元件規格、RWD、a11y、2 替代方向)+ mockup（`design/mockup-main.html`)。
- **2026-06-23** Phase 4 基礎設施草稿:`infra/cloudflared/`(config.yml+README)、`infra/caddy/Caddyfile`、`infra/scripts/deploy-static.sh`,教學 `docs/10–12`(Cloudflare/Tunnel/Caddy)。
- **2026-06-22** Phase 2 內容研究:以 Workflow 扇出 17 個 agent 實讀各 repo,產出精準雙語文案/亮點/取捨與 demo 可行性,入庫 `content/projects.json`(showcase 8 / live-demo 1 / external 2 / academic 6)。修正 Soulshard techStack(Fastify 非 FastAPI)。
- **2026-06-22** 完成階段規劃與架構拍板(monorepo + 子網域 demo / 路徑 showcase 混合、Cloudflare Tunnel → Caddy、self-hosted ARM runner)。
- **2026-06-22** 歸檔前一 session 的 Next.js scaffold 至專案外 `_Resume_archive_20260608/`(保留雙語文案作素材)。
- **2026-06-22** 建立 monorepo 骨架(pnpm workspaces + Turborepo)。

## 進行中
- Phase 6:首次 commit + push(等使用者確認後建 public repo `q86865511/portfolio` 並推第一次)。

## 待辦
- Phase 4 實作(與使用者一起):買網域接 Cloudflare、主機裝 `cloudflared` 建 tunnel、Caddy 改聽 `127.0.0.1:8080`、建 `/srv/main`。
- Phase 5 實作:在 Oracle A1 註冊 self-hosted ARM runner、設 repo variables `DOMAIN` 與 `DEPLOY_ENABLED=true`(部署閘門,預設 skip 以免 runner 未就緒前失敗)、啟用 workflow。
- Phase 7:上線驗證(DNS/Tunnel/HTTPS/各子站可訪問/health check)、面試講稿 `docs/30`;之後改自動 commit + PR(merge 等使用者)。

## 已知問題
- 網域未定(設定檔用 `YOUR_DOMAIN` 佔位);未取得 Cloudflare 帳號與 Oracle SSH 連線資訊。
- 已定:`kanto-quest` 不公開;`cyclepact` 可公開但開發中 → showcase、暫不 live demo。目前確定的 live demo 僅 Soulshard-Hunter(架構可擴充)。
- 本機無 Godot CLI;`cyclepact` 若日後要 Web demo 需於 Godot 編輯器匯出。

## 重要決策紀錄
- **Monorepo(非 polyrepo)**:單一開發者、共用設計系統、招募者一站看完;以 `paths:` 過濾達成各站獨立 build/deploy。
- **路由**:live demo 用子網域(各自 repo + pipeline)、showcase 用路徑(主站 `/projects/[slug]`);兩者皆可獨立訪問。
- **對外**:Cloudflare Tunnel → Caddy;免開入站埠、不暴露主機 IP;TLS 邊緣終結。
- **CI/CD**:主站 deploy 用 Oracle 上 self-hosted ARM runner(零入站);PR 驗證用 GitHub-hosted;替代方案 GitHub-hosted + cloudflared SSH(教學對照)。
- **既有 scaffold 全部重做**,但保留舊雙語文案作素材。
