# 20 — CI/CD 與 GitHub Actions 基礎

> 本篇對應架構圖之外、但把整張圖「自動化」起來的那一層:**程式碼怎麼從 commit 變成線上網站**。讀完你應該能對面試官講清楚:CI 與 CD 的差別、GitHub Actions 的 workflow / job / step / trigger / runner / secrets 是什麼、hosted 與 self-hosted runner 怎麼選、以及本專案那兩條 workflow 各自在做什麼。
>
> 前置:[`00-architecture-overview.md`](./00-architecture-overview.md)(尤其 §3.5 self-hosted ARM vs hosted runner 的取捨)。
> 後續:[`21-path-filtered-pipelines.md`](./21-path-filtered-pipelines.md)(用 `paths:` 解耦各子站)、[`22-self-hosted-arm-runner.md`](./22-self-hosted-arm-runner.md)(在 Oracle A1 註冊 runner)。
> 實作設定:[`.github/workflows/ci.yml`](../.github/workflows/ci.yml)、[`.github/workflows/deploy-main.yml`](../.github/workflows/deploy-main.yml)。

---

## 1. 為什麼需要 CI/CD?

沒有 CI/CD 的世界:每次改完程式碼,你得手動 `pnpm build`、手動 `rsync` 到主機、手動確認沒壞掉。問題是——人會忘、會手滑、會「在我這邊可以跑」。專案一多,光部署就耗掉大量心力,而且每一步都可能引入人為錯誤。

CI/CD 把「驗證」與「部署」這兩件重複勞動**自動化、標準化**:

- **CI(Continuous Integration,持續整合)**:每次提交都自動「整合驗證」——把程式碼在一個乾淨環境裡 build 一遍、跑型別檢查與 lint,確保「合進主線前是綠的」。本專案的 CI 就是 [`ci.yml`](../.github/workflows/ci.yml)。
- **CD(Continuous Delivery / Deployment,持續交付 / 部署)**:驗證過的程式碼自動送到正式環境。本專案的 CD 就是 [`deploy-main.yml`](../.github/workflows/deploy-main.yml),它**兩段式**地把主站 build 出來、產 PDF(在 GitHub-hosted amd64),再把產物同步到主機 `/srv/main`(在 self-hosted ARM runner),最後 purge Cloudflare 邊緣快取。

**在本架構中的角色**:CI/CD 是把「架構圖」自動跑起來的引擎——你只管 push,剩下「build → 產 PDF → 上傳 artifact → self-hosted runner 下載 → 同步到 Caddy 服務目錄 → 健康檢查 → purge 快取」都自動完成。

---

## 2. 為什麼選 GitHub Actions?

| 選項 | 特點 |
|---|---|
| **GitHub Actions(本專案採用)** | 與 repo 同源、設定即 `.github/workflows/*.yml`、公開 repo 免費額度充足、原生支援 self-hosted runner、market 上 actions 生態大 |
| GitLab CI / CircleCI / Jenkins | 功能都夠,但要嘛換平台、要嘛自架 server(Jenkins),對「程式碼已在 GitHub」的個人專案多餘 |
| Cloudflare Pages / Vercel 內建 CI | 最省事,但綁定該平台的部署模型;本專案要部署到「自己的 Oracle 主機 + Tunnel」,需要自訂部署流程,內建 CI 反而不夠靈活 |

**選 GitHub Actions 的理由**:程式碼本來就在 GitHub,workflow 跟著 repo 版本控管、PR 上直接看到綠燈/紅燈;而且它原生支援 **self-hosted runner**——這正是本專案「零入站部署到自己主機」的關鍵(見 §5 與 docs/22)。

---

## 3. 核心名詞:workflow / job / step / trigger

GitHub Actions 的設定都放在 `.github/workflows/` 下的 YAML 檔。由大到小四個層級:

```
workflow（一個 .yml 檔，例如 ci.yml）
  ├─ trigger（on: 什麼事件觸發，例如 push / pull_request）
  └─ job（一個工作，跑在某個 runner 上；可有多個、可平行）
       └─ step（一個步驟，依序執行；可以是 shell 指令 run: 或現成 action uses:）
```

- **workflow**:一個自動化流程,對應一個 YAML 檔。本專案兩個檔 = 兩條 workflow。
- **trigger(`on:`)**:什麼事件會啟動這條 workflow。常見的:
  - `push`:有人推 commit(可再用 `branches:` / `paths:` 縮小範圍)。
  - `pull_request`:PR 開啟 / 更新時(最適合當「合併前關卡」)。
  - 其他:`schedule`(定時)、`workflow_dispatch`(手動按鈕)等。
- **job**:一個獨立工作,跑在指定的 runner(`runs-on:`)。同一 workflow 的多個 job 預設平行;要串接可用 `needs:`。
- **step**:job 裡依序跑的步驟。兩種:
  - `uses:` 用別人寫好的 action(例如 `actions/checkout@v4` 把程式碼 clone 下來)。
  - `run:` 直接跑 shell 指令(例如 `pnpm install`)。

對照本專案 [`ci.yml`](../.github/workflows/ci.yml):一個 `verify` job,裡面依序 checkout → 啟用 pnpm → 裝相依 → typecheck → lint → build,全部是 step。

---

## 4. runner:hosted vs self-hosted

**runner** 是「真正跑 workflow 的那台機器」。`runs-on:` 決定用哪種。

| 類型 | 是什麼 | 優點 | 缺點 |
|---|---|---|---|
| **GitHub-hosted**(如 `ubuntu-latest`) | GitHub 提供的拋棄式虛擬機,每次全新、x86 | 零維護、乾淨環境、跑外部不可信程式碼也安全 | 預設 x86;要部署到「無入站」的自有主機需另經 SSH;有免費分鐘數上限 |
| **self-hosted**(如 `[self-hosted, linux, ARM64]`) | 你自己的機器上裝 runner agent,**主動連出**向 GitHub 領工作 | 可在自有主機本機 build / 寫檔(零入站部署)、可用 ARM 等特殊架構、無分鐘數限制 | 要自己維護、在 prod 主機跑 CI 有資源 / 安全考量、**不該跑外部不可信程式碼** |

**本專案的選擇(兩條 workflow 各取所需)**:

- **CI 用 GitHub-hosted `ubuntu-latest`**:靜態匯出的產物 x86 / ARM 完全一樣,驗證階段沒必要用主機;而且 PR 可能來自外部分支,讓不可信程式碼跑在 prod 主機上有風險。用拋棄式 hosted runner 最安全、零維護。
- **部署是兩段式,兩種 runner 各司其職**:`deploy-main.yml` 拆成兩個 job——**job 1「build + PDF」跑在 GitHub-hosted `ubuntu-latest`(amd64)**,build 靜態站、產雙語 PDF,上傳成 artifact;**job 2「deploy」跑在 self-hosted `[self-hosted, linux, ARM64]`**,下載 artifact、rsync 寫 `/srv/main`、再 curl `127.0.0.1:8080` 健康檢查、最後 purge Cloudflare 快取。**runner 不再 build,只負責部署。** 為什麼把 build/PDF 移到 hosted:**Chrome for Testing 沒有官方 Linux ARM64 版**,puppeteer 在 ARM 上會抓到 x64 Chrome 而無法執行,所以產 PDF 必須在 amd64;同時正式機是小台 ARM,把 build/Chrome 移走讓它只做輕量部署(取捨詳見 [`00`](./00-architecture-overview.md) §3.5 與本檔 §6)。而 self-hosted runner「主動連出」領工作的方向,與 Cloudflare Tunnel「主動連出」建立通道完全一致:**主機永遠不開入站埠**(見 [`11-cloudflare-tunnel.md`](./11-cloudflare-tunnel.md))。

> `runs-on` 的 label:`[self-hosted, linux, ARM64]` 是「三個 label 同時符合」才排到那台。註冊 runner 時要把這三個 label 都掛上,詳見 [`22-self-hosted-arm-runner.md`](./22-self-hosted-arm-runner.md)。

### 替代方案:GitHub-hosted + cloudflared access SSH 部署

如果你「不想在 prod 主機跑 CI」,可以全用 GitHub-hosted runner,在 build 完後透過 [`cloudflared access ssh`](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/use-cases/ssh/) 連進主機去部署。代價是要管理一組 secrets:

- `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET`:Cloudflare Access service token,讓 runner 通過 Zero Trust 認證。
- `SSH_PRIVATE_KEY`:部署使用者的私鑰。
- `SSH_KNOWN_HOSTS` / `DEPLOY_HOST` / `DEPLOY_USER`:主機指紋與連線目標。

**取捨**:這條路 CI 跑在乾淨的 hosted runner(安全 / 免維護),但多了「一個對外 SSH 入口 + 一組金鑰要管理輪替」。本專案選 self-hosted 正是為了「零這些 secrets、零入站」,代價是要自己維護 runner。兩種都合理,看你更在意「不在 prod 跑 CI」還是「不開任何入站 / 不管金鑰」。完整取捨見 [`00-architecture-overview.md`](./00-architecture-overview.md) §3.5。

---

## 5. secrets 與環境變數

**secrets** 是「不該寫進程式碼」的敏感值(token、私鑰、密碼)。在 GitHub repo → Settings → Secrets and variables → Actions 設定,workflow 裡用 `${{ secrets.NAME }}` 取用,log 會自動遮蔽。

**variables(vars)** 則是「不敏感但會因環境而異」的值(例如網域),用 `${{ vars.NAME }}` 取用,不會被遮蔽。

本專案的情形:

- **CI(`ci.yml`)**:不需要任何 secrets——只是 build,不碰外部資源。
- **部署(`deploy-main.yml`)**:**部署本身**不需要 SSH 金鑰或跨機傳輸 token——self-hosted runner 就在主機本機、以檔案系統權限寫 `/srv/main`。它用到的設定值有:
  - **variable `DOMAIN`**——`deploy-static.sh` 健康檢查時要帶的 Host 標頭。若不設,腳本會用內建的 `YOUR_DOMAIN` 佔位符(部署不會壞,但健康檢查的 Host 會對不上你真正的 vhost)。
  - **variable `DEPLOY_ENABLED`**——部署閘門,設 `true` 才會跑 deploy job(runner 尚未就緒時安全跳過而非失敗)。
  - **secret `CF_API_TOKEN` + variable `CF_ZONE_ID`**——部署後 purge Cloudflare 邊緣快取用(權限只需 Zone → Cache Purge)。這是這條 workflow 唯一的 secret,而且是 **best-effort**:沒設時 purge 步驟會略過,不影響部署。
  
  設定方式都在:repo → Settings → Secrets and variables → Actions(token 放 Secrets、其餘放 Variables)。

> 上一節「SSH 替代方案」需要的那些 `CF_ACCESS_*` / `SSH_*` 才是「為了跨機部署而存在」的 secrets——本專案的 self-hosted 路線刻意避開它們;唯一保留的 `CF_API_TOKEN` 純粹是為了部署後自動 purge 快取,與「怎麼把產物送上主機」無關。

---

## 6. 本專案兩條 workflow 總覽

| | [`ci.yml`](../.github/workflows/ci.yml) | [`deploy-main.yml`](../.github/workflows/deploy-main.yml) |
|---|---|---|
| 目的 | 驗證(CI) | 部署主站(CD,**兩段式**) |
| 觸發 | `pull_request` + `push` to main | 只 `push` to main(+ `workflow_dispatch`) |
| `paths:` 過濾 | apps/** · packages/** · content/** · 根設定 · 本檔 | 只 apps/main/** · packages/ui/** · content/** · 本檔 |
| job / runner | 一個 `verify` job @ `ubuntu-latest`(hosted x86) | job 1 `build` @ `ubuntu-latest`(hosted amd64);job 2 `deploy` @ `[self-hosted, linux, ARM64]`(主機),`needs: build` |
| concurrency | 同 ref 取消舊跑(`cancel-in-progress: true`) | 同 ref 排隊不互相取消(`cancel-in-progress: false`) |
| 關鍵步驟 | checkout → corepack/pnpm → install → typecheck → lint → build | **job 1(hosted)**:checkout → install → build → 裝 CJK 字型 + Chrome → 起本機伺服器 → 產雙語 PDF → 併入 out/ → 上傳 artifact `main-out`;**job 2(self-hosted)**:checkout → 下載 artifact → `deploy-static.sh main`(rsync + health check)→ purge Cloudflare 快取 |
| secrets / vars | 無 | secret `CF_API_TOKEN`(purge,best-effort);vars `DOMAIN`、`DEPLOY_ENABLED`、`CF_ZONE_ID` |

兩條為什麼這樣分:

- **關注點分離**:CI 只管「能不能 build / 過不過檢查」,任何人 PR 都跑、跑在拋棄式 runner;CD 只管「把驗證過的主站送上線」,只在 push 進 main 後跑。
- **CD 內部還再分兩段**:重的 build / 產 PDF 放 GitHub-hosted amd64(避開 ARM 無 Chrome、不佔正式機),輕的 rsync 部署放 self-hosted ARM runner;兩段用 artifact 接力(`needs: build`)。理由與取捨見上面 §4 與 [`00`](./00-architecture-overview.md) §3.5。
- **concurrency 相反**:CI 連推多個 commit 時,舊的 CI 取消掉省資源、最新狀態更快得到;部署則「不可半途被取消」(rsync 到一半會讓 `/srv/main` 處於壞狀態),所以排隊跑完。
- **paths 不同**:CI 對「任何影響 build 的改動」都驗;部署只對「真的影響主站產物」的改動才上線——改 docs / infra / 別的子站「不會」誤觸發主站部署。這層解耦見 [`21-path-filtered-pipelines.md`](./21-path-filtered-pipelines.md)。

---

## 7. 小結

- **CI = 合併前驗證,CD = 驗證後部署**;CI 一條 workflow,CD(`deploy-main.yml`)**一條 workflow 內兩段式 job**。
- GitHub Actions 由 **workflow → trigger(`on:`) → job(`runs-on:`)→ step(`uses:` / `run:`)** 構成;多 job 用 `needs:` 串接、用 artifact 傳遞產物。
- **runner** 分 hosted(乾淨拋棄式、amd64、安全)與 self-hosted(自有主機、可零入站部署、可 ARM);本專案 CI 與 CD 的「build + PDF」都用 hosted amd64,只有 CD 的「部署」用 self-hosted ARM(runner 不 build,只 rsync + health check + purge)。
- **secrets** 放敏感值、**vars** 放環境差異值;本專案部署本身不需跨機金鑰,唯一的 secret `CF_API_TOKEN` 純為部署後 purge 快取,另搭 `DOMAIN` / `DEPLOY_ENABLED` / `CF_ZONE_ID` 三個 variable。
- 下一篇看 `paths:` 怎麼讓 monorepo 裡每個子站獨立 build / deploy。
