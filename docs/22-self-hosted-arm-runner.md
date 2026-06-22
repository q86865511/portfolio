# 22 — 在 Oracle A1 註冊 self-hosted ARM64 runner

> 本篇是「部署那端」的主角:讓你的 Oracle Cloud A1(ARM64)主機**主動連出**向 GitHub 領取部署工作,在本機 build 並寫入 Caddy 服務目錄——全程零入站。讀完你應該能在主機上把 runner 裝好、掛對 label、做基本安全強化,並理解它相對「GitHub-hosted + SSH」的取捨。
>
> 前置:[`20-cicd-github-actions.md`](./20-cicd-github-actions.md)(hosted vs self-hosted runner)、[`00-architecture-overview.md`](./00-architecture-overview.md) §3.5(取捨)。
> 相關:[`11-cloudflare-tunnel.md`](./11-cloudflare-tunnel.md)(同樣「主動連出、零入站」的哲學)、[`12-caddy-origin.md`](./12-caddy-origin.md)(部署的最終落點 `/srv`)。
> 實作設定:[`.github/workflows/deploy-main.yml`](../.github/workflows/deploy-main.yml)、[`infra/scripts/deploy-static.sh`](../infra/scripts/deploy-static.sh)。

---

## 1. 為什麼在主機上跑 self-hosted runner?

部署這件事必須「在主機本機」做:`deploy-static.sh` 用 `rsync` 寫 `/srv/main`、再 `curl 127.0.0.1:8080/healthz` 確認 Caddy 服務正常——這些都得在主機自己身上才做得到。有兩種讓「GitHub 上的 push」能觸發「主機上的部署」的辦法:

1. **GitHub-hosted runner + 連進主機(SSH)**:CI 跑在 GitHub 的機器,build 完再透過 SSH 把產物送進主機、遠端執行部署。需要一個對外的連線入口與一組金鑰。
2. **self-hosted runner(本專案採用)**:在主機上裝一個 runner agent,它**主動向 GitHub 連出**、領到工作後在本機跑。GitHub 永遠連不進主機。

選 self-hosted 的核心理由,是它和 [Cloudflare Tunnel](./11-cloudflare-tunnel.md) 是同一個哲學:**連線方向永遠是「由內向外」,主機不開任何入站埠**。runner 主動連出領工作、cloudflared 主動連出建通道——對外攻擊面都是零。而且部署不需要任何 SSH 金鑰 / 部署 token(它就在本機,用檔案系統權限寫 `/srv`),少一組要管理輪替的祕密。額外好處:主機是 ARM64,在原生架構 build,日後若有需要原生相依的動態 app 也不踩 x86/ARM 差異。

> 在本架構中的角色:self-hosted ARM runner 是「把 push 變成線上網站」的執行者,跑在與 Caddy 同一台 Oracle A1 上,對應架構圖第 (4) 格那台主機。

---

## 2. 註冊步驟(repo 層級 runner)

> 以下指令在**主機(Oracle A1, ARM64, Ubuntu)** 上、以**專用部署使用者**執行(見 §3,不要用 root 直接跑)。實際的下載連結與 token 請以 GitHub 頁面當下顯示為準:repo → **Settings → Actions → Runners → New self-hosted runner**,Architecture 選 **Linux / ARM64**,頁面會給出對應的最新版下載指令與一次性註冊 token。

### 2.1 下載並解壓 runner

```bash
# 建一個工作目錄(放在部署使用者的 home 下)
mkdir -p ~/actions-runner && cd ~/actions-runner

# 下載 ARM64 版的 runner(版本號以 GitHub 頁面顯示為準)
curl -o actions-runner-linux-arm64.tar.gz -L \
  https://github.com/actions/runner/releases/download/vX.Y.Z/actions-runner-linux-arm64-X.Y.Z.tar.gz

# 解壓
tar xzf ./actions-runner-linux-arm64.tar.gz
```

> 一定要抓 **arm64** 版二進位;抓成 x64 在 A1 上會無法執行。

### 2.2 設定 runner 與 labels

```bash
# REPO_URL 換成你的 repo;TOKEN 是 GitHub 頁面給的一次性註冊 token
./config.sh \
  --url https://github.com/<你的帳號>/<repo> \
  --token <REGISTRATION_TOKEN> \
  --labels self-hosted,linux,ARM64 \
  --name oracle-a1-arm \
  --work _work
```

關鍵是 `--labels`:**必須包含 `self-hosted,linux,ARM64`**,因為 [`deploy-main.yml`](../.github/workflows/deploy-main.yml) 寫的是 `runs-on: [self-hosted, linux, ARM64]`——這三個 label「同時符合」才會把工作排到這台。

> 補充:`self-hosted` 與作業系統 / 架構 label 其實 runner 會自動帶上一部分,但**明確列出**最不會出錯,也讓 workflow 的 `runs-on` 一眼可讀。

### 2.3 裝成 systemd service(開機自動、常駐)

```bash
# 安裝為 service(會以「執行此指令的使用者」身分常駐)
sudo ./svc.sh install

# 啟動
sudo ./svc.sh start

# 看狀態
sudo ./svc.sh status
```

裝成 service 後,主機重開機 runner 會自動回來、斷線會自動重連。到 repo 的 Runners 頁面應看到這台顯示 **Idle(綠點)**。

---

## 3. 安全強化(在 prod 主機跑 CI 的代價,要主動緩解)

self-hosted runner 跑在你「正式服務的主機」上,所以安全要當回事:

1. **用獨立、低權限的部署使用者**——不要用 root,也不要用你平常 SSH 登入的個人帳號。
   ```bash
   sudo useradd -m -s /bin/bash deploy
   # runner 的下載 / config / svc.sh install 都以這個 deploy 使用者執行
   ```

2. **只給它寫 `/srv` 的權限,別給整台 sudo**。讓 `/srv` 由部署使用者擁有,Caddy 仍可讀:
   ```bash
   sudo mkdir -p /srv/main
   sudo chown -R deploy:deploy /srv
   sudo chmod -R 755 /srv          # 其他使用者(含 Caddy)可讀可進入
   ```
   這樣 `deploy-static.sh` 的 `rsync` 寫得進 `/srv/main`,但 runner 使用者**不能**碰系統其他地方。健康檢查只是 `curl 127.0.0.1:8080`,不需要額外權限。

3. **絕不在這台 runner 跑「不可信的程式碼」**。這是 self-hosted 最大的雷:若讓「來自 fork 的 PR」在自有 runner 上跑,等於讓任何人提交的程式碼在你 prod 主機上執行。本專案的防線:
   - **部署 workflow 只在 `push` to main 觸發**(已合進主線、可信),**不**在 `pull_request` 觸發。
   - **CI(`pull_request`)跑在 GitHub-hosted 拋棄式 runner**,不碰主機(見 [`20`](./20-cicd-github-actions.md))。
   - 若 repo 是公開的,在 repo Settings → Actions 設定「Fork pull request workflows」需核准才跑,避免 fork PR 偷跑。

4. **資源考量**:A1 是 2 OCPU / 12GB,build 一個 Next.js 靜態站 + 跑一次 Puppeteer 產 PDF 綽綽有餘。但要注意:
   - **build 與線上服務搶資源**:部署當下會吃 CPU / 記憶體,對極輕量主機可考慮 `nice` 降優先序;以 A1 的規格通常不必。
   - **磁碟**:runner 的 `_work` 會累積 build 快取與下載的 Chrome,定期清理或設 retention,避免塞爆 Always Free 的磁碟額度。
   - **Chrome 下載**:workspace 刻意不在 install 期下載 Chromium;部署 workflow 用 `npx puppeteer browsers install chrome` 取得,會落在 runner 使用者的快取目錄,占一些空間但可重用。

---

## 4. 與 workflow / 部署腳本如何串起來

部署 workflow 在這台 runner 上,最後一步呼叫部署腳本:

```yaml
runs-on: [self-hosted, linux, ARM64]   # 排到這台主機
# ...build、產 PDF、把 PDF 併入 apps/main/out 之後...
- name: Deploy to /srv/main + health check
  env:
    DOMAIN: ${{ vars.DOMAIN }}         # 健康檢查要帶的 Host(repo variable)
  run: |
    chmod +x infra/scripts/deploy-static.sh
    ./infra/scripts/deploy-static.sh main
```

`deploy-static.sh` 介面是 `./deploy-static.sh <app_name> [src_dir] [dest_dir] [health_host]`;這裡只給 `main`,其餘走腳本預設(`src_dir=apps/main/out`、`dest_dir=/srv/main`、`health_host=$DOMAIN`)。它做兩件事:`rsync -a --delete apps/main/out/ → /srv/main/`,然後 `curl -H "Host: $DOMAIN" http://127.0.0.1:8080/healthz`,非 200 就非零退出讓部署失敗。落點與健康檢查的細節見 [`12-caddy-origin.md`](./12-caddy-origin.md)。

> `DOMAIN` 用 repo **variable**(非 secret,它不敏感):repo → Settings → Secrets and variables → Actions → Variables → `DOMAIN = 你的網域`。沒設的話腳本用內建 `YOUR_DOMAIN` 佔位符,部署仍會跑,但健康檢查的 Host 對不上你真正的 vhost。

---

## 5. 替代方案與取捨小結

| | self-hosted ARM(本專案) | GitHub-hosted + cloudflared access SSH |
|---|---|---|
| 入站埠 | 零(runner 主動連出) | 仍零(SSH 也走 Tunnel),但多一個 Access 入口要管 |
| secrets | 不需要 | 需要 `CF_ACCESS_CLIENT_ID/SECRET`、`SSH_PRIVATE_KEY`、`SSH_KNOWN_HOSTS`、`DEPLOY_HOST/USER` |
| CI 在哪跑 | 部署在 prod 主機跑(CI 仍在 hosted) | 完全不在 prod 主機跑 |
| 維護 | 要自己維護 runner(更新、磁碟、service) | runner 免維護,但要維護金鑰輪替與 Access 設定 |
| 架構一致性 | 與 Tunnel「主動連出」同哲學,最乾淨 | 多一條「由外連入(經 Tunnel)」的 SSH 路徑 |

**取捨**:若你最在意「不想在 prod 主機跑任何 CI、要用乾淨拋棄式環境」,選 hosted + SSH(代價是管理一組金鑰 + 一個 Access 入口)。若你最在意「零入站、零部署祕密、架構一致」,選 self-hosted(代價是自己維護 runner)。本專案選後者:履歷網站要展示的正是「Tunnel + 零入站」這套乾淨的 zero-trust 佈局,部署用同一哲學最一致;且單機個人專案,維護一個 runner service 的成本很低。

---

## 6. 啟用前的檢查清單

把 CI/CD 真正跑起來,主機端需要:

- [ ] 在 repo **Settings → Actions → Runners** 註冊一台 runner,labels 含 **`self-hosted,linux,ARM64`**,並裝成 systemd service(§2)。
- [ ] 用**獨立 `deploy` 使用者**跑 runner,**不要用 root**(§3.1)。
- [ ] 建好 `/srv/main` 並把 `/srv` owner 設給 `deploy`、`chmod 755`(讓 runner 可寫、Caddy 可讀)(§3.2)。
- [ ] Caddy 的主站 vhost `root` 指向 `/srv/main`(見 [`infra/caddy/Caddyfile`](../infra/caddy/Caddyfile) 與 [`12`](./12-caddy-origin.md));cloudflared 的 ingress 已把你的網域指向 `127.0.0.1:8080`(見 [`infra/cloudflared/config.yml`](../infra/cloudflared/config.yml))。
- [ ] 在 repo 設 **variable `DOMAIN`** = 你的真實網域(健康檢查用)(§4)。
- [ ] 主機有 Node 20+ / pnpm(corepack)、`rsync`、`curl`;Chrome 由 workflow 自動裝。
- [ ] (公開 repo 才需要)在 Settings → Actions 設定 fork PR 需核准,避免不可信程式碼進 runner(§3.3)。
- [ ] (僅選 SSH 替代方案時)才需要設定 §5 那組 `CF_ACCESS_*` / `SSH_*` secrets;self-hosted 路線不需要。
