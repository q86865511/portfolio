# infra — 基礎設施設定

本目錄存放部署到 Oracle Cloud A1 (ARM64) 所需的設定檔與腳本。實際在 Cloudflare / Oracle 帳號上的操作會由 Phase 4/5 逐步帶使用者進行(不自行登入使用者帳號)。

## 規劃內容(Phase 4/5 建立)

| 路徑 | 用途 |
|---|---|
| `cloudflared/config.yml` | Cloudflare Tunnel 設定:tunnel id + 各子網域 ingress 規則 → 本機 Caddy |
| `caddy/Caddyfile` | Caddy vhost:依 Host 分流,static `file_server` / `reverse_proxy`;edge/origin TLS 策略 |
| `scripts/deploy-*.sh` | 各 app 在 runner 上的部署腳本(同步靜態檔到 Caddy 服務目錄、health check) |
| `systemd/` | cloudflared、(視需要)runner 的 systemd unit 範例 |

> 真實機密(tunnel 憑證、SSH 私鑰等)**絕不入庫**;以 GitHub Secrets / 主機本地檔管理。
