# 12 — Caddy 作為 origin:vhost 分流、file_server、reverse_proxy

> 本篇對應架構圖的第 (4) 格「Oracle A1 主機上的 Caddy」。讀完你應該能對面試官講清楚:為什麼選 Caddy、它怎麼依 Host 把一個 `127.0.0.1:8080` 拆成多個子站、靜態檔與動態服務分別怎麼接、以及為什麼這台 origin「不自己管 TLS」。
>
> 前置:[`11-cloudflare-tunnel.md`](./11-cloudflare-tunnel.md)(流量怎麼進到 `127.0.0.1:8080`)。
> 實作設定:[`infra/caddy/Caddyfile`](../infra/caddy/Caddyfile)、部署腳本 [`infra/scripts/deploy-static.sh`](../infra/scripts/deploy-static.sh)。

---

## 1. 為什麼是 Caddy?

origin 端需要一個 web server / 反向代理,把進來的請求依網域分流、服務靜態檔或轉給後端。常見選項:

| 選項 | 特點 |
|---|---|
| **Caddy(本專案採用)** | 設定檔極簡(Caddyfile)、預設自動 HTTPS、原生支援 reverse_proxy 與 file_server、ARM64 二進位現成 |
| Nginx | 生態最大、效能標竿,但設定冗長、TLS 要自己配 |
| Traefik | 對容器/動態服務友善,但設定心智較重 |

**選 Caddy 的理由**:這台主機 §既有就在用 Caddy(原本服務 Soulshard-Hunter),我們延續它即可;而且 Caddyfile 短、可讀性高,對「一台機器、少量靜態站 + 偶爾一個動態服務」的規模剛好,不必動用 Nginx 的複雜度。

> 在本架構中的角色:Caddy 是 cloudflared 連入的**唯一 origin**,只聽 `127.0.0.1:8080`(不對外),負責「依 Host 分流」與「服務內容」。

---

## 2. vhost 分流:一個 port,多個子站

Tunnel 把所有 hostname 都轉到同一個 `127.0.0.1:8080`(見上一篇)。那 Caddy 怎麼知道 `YOUR_DOMAIN` 和 `soulshard.YOUR_DOMAIN` 要給不同內容?靠 **HTTP 的 Host 標頭**——cloudflared 轉發時會保留原始 Host,Caddy 依此匹配對應的「站台區塊(site block)」:

```caddyfile
http://YOUR_DOMAIN { ... }            # 命中時 → 主站
http://soulshard.YOUR_DOMAIN { ... }  # 命中時 → live demo
```

每個區塊就是一個 **virtual host(vhost)**。這實現了「關注點分離」:Tunnel 只管「把流量送進來」,Caddy 才管「這個 Host 該給哪個子站」。新增子站時,Caddy 這邊就是多一個 vhost 區塊。

---

## 3. file_server:服務靜態匯出的子站

主站與 soulshard 都是**靜態匯出**(HTML/JS/CSS),用 `file_server` 直接服務磁碟上的檔案:

```caddyfile
http://YOUR_DOMAIN {
	bind 127.0.0.1
	root * /srv/main
	encode zstd gzip
	file_server
	try_files {path} {path}/ /index.html
	respond /healthz 200
}
```

逐行理解:

- `bind 127.0.0.1`:**只聽本機**。對外的事交給 Tunnel,Caddy 自己絕不對公網開埠。
- `root * /srv/main`:這個 vhost 的檔案根目錄。CI 部署腳本會把 build 出來的 `out/` 用 `rsync --delete` 同步到這裡(見 deploy 腳本)。
- `encode zstd gzip`:回應壓縮,省頻寬。
- `file_server`:有檔就回檔。
- `try_files … /index.html`:找不到對應檔時回退 `index.html`,讓前端路由 / 深連結不會 404。
- `respond /healthz 200`:一個固定回 200 的健康檢查端點;部署腳本 `curl` 它確認服務正常。

> 為什麼 `/srv/<site>`?約定俗成的「對外服務內容」目錄,清楚、好做權限隔離(runner 只需要對 `/srv` 有寫入權)。各子站各一個目錄:`/srv/main`、`/srv/soulshard`、(未來)`/srv/cyclepact`。

---

## 4. reverse_proxy:給未來的動態服務

不是所有子站都是靜態檔。日後若某個 demo 是 SSR / API(例如把 lolhelper 的前端做成動態 demo,或一個 FastAPI 後端),它會以一個行程跑在本機某個 port,這時 Caddy 用 `reverse_proxy` 把該 vhost 轉給它:

```caddyfile
http://api.YOUR_DOMAIN {
	bind 127.0.0.1
	reverse_proxy 127.0.0.1:3001 {
		header_up Host {host}
		header_up X-Forwarded-Proto {scheme}
		health_uri /healthz
		health_interval 10s
	}
}
```

- `reverse_proxy 127.0.0.1:3001`:把請求轉給本機 3001 的後端。
- `header_up …`:把原始 Host / 協定資訊帶給後端(後端若要判斷網域或產生正確連結會用到)。
- `health_uri / health_interval`:被動健康檢查,後端掛了短暫剔除,避免一直打死掉的服務。

> 這就是架構文件說的「動態服務則 reverse_proxy 到本機某 port」。`file_server`(靜態)與 `reverse_proxy`(動態)是 Caddy 服務內容的兩種主要模式,本專案兩者皆備:前者現在就用,後者預留範例。

---

## 5. edge TLS vs origin TLS:為什麼這台 origin「不簽憑證」

這是本篇最重要的設計點,也是面試常問的。

- **edge TLS(本專案)**:HTTPS 在 Cloudflare 邊緣終結(使用者 ↔ Cloudflare 加密)。Cloudflare ↔ 主機這段走 Tunnel,**Tunnel 本身已加密**,所以 cloudflared 在主機端是用 **`http://127.0.0.1:8080`** 連 Caddy。因此 Caddy **只服務本機 HTTP、不簽 Let's Encrypt**。
- **origin TLS**:讓 origin 也持有「真正的」TLS 憑證(端到端加密)。在 Tunnel 架構下並非必要,需要時可裝 Cloudflare Origin Certificate 並把 CF 端設 Full (strict)。

我們在 Caddyfile 用兩個機制確保 origin 不去碰 TLS:

```caddyfile
{
	auto_https off       # 全域關閉自動 HTTPS(Caddy 預設會自動簽,這裡明確關掉)
}

http://YOUR_DOMAIN { ... }   # 站台位址用 http://,Caddy 對 http 站台不啟用自動 HTTPS
```

**為什麼不讓 Caddy 自簽 Let's Encrypt?**
1. 主機**不開入站埠、IP 不外露**,ACME 的 HTTP/TLS 驗證根本無法對外完成。
2. 邊緣已經有有效憑證,Tunnel 又已加密,再簽一層只是徒增管理成本與「簽發失敗」的 log 噪音。
3. 還會去搶 80/443,跟「只聽 127.0.0.1」的設計衝突。

> 取捨:edge 終結最省事、零憑證維護(本專案首選);origin TLS / Full strict 最嚴謹(端到端),但多一層憑證要管理輪替。對 Tunnel + 靜態履歷站,edge 終結已足夠且更乾淨。完整的 TLS 模式表見 [`10-cloudflare-basics.md`](./10-cloudflare-basics.md) 第 6 節。

---

## 6. 與既有服務共存 & 部署流程

- **共存**:主機原本就有 Caddy 在服務 Soulshard-Hunter。我們把它**統一聽 `127.0.0.1:8080`**,新舊 vhost 都掛在同一個 Caddy 設定裡,由 cloudflared 統一連入。不再各跑各的、各聽各的埠。
- **部署**:CI(self-hosted ARM runner)build 完某 app 後,呼叫 [`deploy-static.sh`](../infra/scripts/deploy-static.sh):
  1. `rsync --delete` 把 `apps/<app>/out/` 同步到 `/srv/<site>/`(刪掉上版殘留)。
  2. `curl` 本機帶上對應 Host 打 `/healthz`,非 200 就非零退出,讓 CI 標記失敗。

  這條流程把「Caddy 的服務目錄」與「CI 的產出」黏起來,且有健康檢查把關。

---

## 7. 小結

- Caddy 是 cloudflared 連入的唯一 origin,**只聽 `127.0.0.1:8080`**,依 **Host 標頭**做 vhost 分流。
- 靜態子站用 `file_server`(root 指向 `/srv/<site>`);未來動態服務用 `reverse_proxy` 轉本機 port。
- 因 TLS 在邊緣終結、Tunnel 已加密,origin **`auto_https off` + `http://`**,不自簽憑證。
- 與既有 Caddy 整合到同一個 `:8080`,部署由 `deploy-static.sh` 同步 + 健康檢查把關。

至此,架構圖四格全部走過一遍:**使用者 → Cloudflare 邊緣 → Tunnel → 主機 Caddy → 靜態檔/動態服務**。
