# cloudflared — Cloudflare Tunnel 操作手冊

本目錄存放 Cloudflare Tunnel 的設定檔(`config.yml`)與操作說明。Tunnel 的角色與設計取捨見 [`docs/11-cloudflare-tunnel.md`](../../docs/11-cloudflare-tunnel.md);整體資料流見 [`docs/00-architecture-overview.md`](../../docs/00-architecture-overview.md)。

> 一句話:`cloudflared` 跑在 Oracle A1 主機上,**主動連出**到 Cloudflare 建立加密通道,把外部請求送進本機 Caddy(`127.0.0.1:8080`)。**對外完全不開入站埠、不暴露主機 IP。**

---

## 0. 前置需求

- 網域已託管在 Cloudflare(Cloudflare 是這個網域的 DNS 權威),且 nameserver 已生效。
- 主機(Oracle A1, ARM64)已安裝 `cloudflared`。ARM64 安裝:

  ```bash
  # Debian/Ubuntu (arm64)
  curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb -o cloudflared.deb
  sudo dpkg -i cloudflared.deb
  cloudflared --version
  ```

> 以下指令一律把 `YOUR_DOMAIN` 換成你的實際網域、`TUNNEL_ID` 換成建立後拿到的 UUID。

---

## 1. 登入並建立 tunnel

```bash
# (1) 授權:會開瀏覽器,選擇要授權的 zone(網域)。
#     完成後在 ~/.cloudflared/cert.pem 產生一張「帳號層級」憑證,
#     用來「管理」tunnel(建立/刪除/設 DNS),與下方 tunnel 的 credentials 不同。
cloudflared tunnel login

# (2) 建立 tunnel,名稱自取(這裡用 resume)。
cloudflared tunnel create resume
#   → 輸出會給你 Tunnel ID(UUID),並在 ~/.cloudflared/<UUID>.json 產生
#     「這條 tunnel 專屬」的 credentials 檔(內含 secret)。
```

兩種憑證別搞混:

| 檔案 | 用途 | 何時用到 |
|---|---|---|
| `~/.cloudflared/cert.pem` | 帳號層級,管理 tunnel / 設 DNS | 建立、刪除、`tunnel route dns` |
| `~/.cloudflared/<UUID>.json` | 這條 tunnel 專屬 secret | `cloudflared` 跑起來連線時 |

---

## 2. 放置設定與憑證(credentials-file)

1. 把本目錄的 `config.yml` 放到主機,慣例位置:`/etc/cloudflared/config.yml`(systemd 預設會找這裡)。
   ```bash
   sudo mkdir -p /etc/cloudflared
   sudo cp config.yml /etc/cloudflared/config.yml
   ```
2. 把 tunnel 的 credentials 檔搬到同一處,並讓 `config.yml` 的 `credentials-file` 指向它:
   ```bash
   sudo cp ~/.cloudflared/<UUID>.json /etc/cloudflared/<UUID>.json
   sudo chmod 600 /etc/cloudflared/<UUID>.json   # 只給 root 讀,內含 secret
   ```
3. 編輯 `/etc/cloudflared/config.yml`,把 `TUNNEL_ID` / `YOUR_DOMAIN` 全部替換成實際值。

> ⚠️ `<UUID>.json` 是機密,**絕不入庫**(repo 內只放佔位符版的 `config.yml`)。

---

## 3. 加 DNS,讓網域指向這條 tunnel

每個對外的 hostname 都要有一筆 **CNAME 指向 `<UUID>.cfargotunnel.com`**。最省事的做法是用 `cloudflared` 幫你建:

```bash
cloudflared tunnel route dns resume YOUR_DOMAIN
cloudflared tunnel route dns resume soulshard.YOUR_DOMAIN
# cyclepact 等未來啟用時再加:
# cloudflared tunnel route dns resume cyclepact.YOUR_DOMAIN
```

這等同於在 Cloudflare DNS 後台手動加一筆 **Proxied(橘雲)** 的 CNAME。

---

## 4. 先在前景測試,確認通了再裝服務

```bash
# 用設定檔在前景跑,觀察 log。瀏覽器打 https://YOUR_DOMAIN 應能看到主站。
cloudflared tunnel --config /etc/cloudflared/config.yml run resume
```

確認沒問題後 Ctrl+C 停掉,再進下一步裝成系統服務。

---

## 5. 安裝成 systemd 服務(開機自啟、崩潰自動重啟)

`cloudflared` 內建幫你產生 systemd unit:

```bash
# 會讀 /etc/cloudflared/config.yml,並安裝 cloudflared.service
sudo cloudflared service install
sudo systemctl enable --now cloudflared

# 常用維運指令
systemctl status cloudflared          # 看狀態
journalctl -u cloudflared -f          # 跟看 log
sudo systemctl restart cloudflared    # 改完 config.yml 後重啟
```

> 改了 `config.yml` 的 ingress 規則後,務必 `systemctl restart cloudflared` 才會生效。

---

## 6. 如何新增一個子網域(兩步驟)

以新增 `blog.YOUR_DOMAIN` 為例,**永遠是這兩步,缺一不可**:

### 步驟 1 — 在 `config.yml` 加 ingress 規則

在 catch-all(`http_status:404`)**之前**插入:

```yaml
  - hostname: blog.YOUR_DOMAIN
    service: http://127.0.0.1:8080
```

(然後 Caddy 那邊也要為這個 Host 加對應的 vhost,見 [`../caddy/Caddyfile`](../caddy/Caddyfile)。)

### 步驟 2 — 加 DNS CNAME

```bash
cloudflared tunnel route dns resume blog.YOUR_DOMAIN
```

最後重啟服務讓 ingress 生效:

```bash
sudo systemctl restart cloudflared
```

> 記憶法:**「ingress + DNS」兩步,Caddy vhost 不算第三步但別忘。** 漏了 ingress 會吃到 404;漏了 DNS 則網域根本解析不到 tunnel。

---

## 疑難排解

| 症狀 | 可能原因 |
|---|---|
| 開網域出現 `error 1033 / 530` | tunnel 沒在跑或 config 的 tunnel/credentials 不符;`systemctl status cloudflared` |
| 出現 cloudflared 的 404 | hostname 沒對到任何 ingress 規則(落到 catch-all);檢查 `config.yml` 拼字 |
| 出現 Caddy 的 404 / 502 | 請求有進到 Caddy,但 Caddy 沒這個 Host 或 `/srv/<site>` 沒檔案;看 Caddy log |
| 改了 config 沒反應 | 忘了 `systemctl restart cloudflared` |
