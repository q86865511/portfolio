# 11 — Cloudflare Tunnel:讓不開埠的主機也能對外服務

> 本篇對應架構圖的第 (3) 格「Cloudflare Tunnel」。讀完你應該能對面試官講清楚:`cloudflared` 是什麼、它為什麼能在「主機完全不開入站埠」的情況下還能對外提供服務、以及它相對「傳統開埠 + DDNS」的取捨。
>
> 前置:[`10-cloudflare-basics.md`](./10-cloudflare-basics.md)(邊緣那層)。後續:[`12-caddy-origin.md`](./12-caddy-origin.md)(Tunnel 把流量送到的 origin)。
> 實作設定:[`infra/cloudflared/config.yml`](../infra/cloudflared/config.yml) 與 [`infra/cloudflared/README.md`](../infra/cloudflared/README.md)。

---

## 1. 問題:主機在 NAT/防火牆後,怎麼讓外面進得來?

傳統上,要讓公網訪客連到你家/雲上的服務,你得:

1. 在防火牆 / Security List 開放入站 80、443。
2. 讓 DNS 指向主機的公網 IP(IP 會變的話還要 DDNS 動態更新)。
3. 自己處理 TLS 憑證簽發。

這條路每一步都在「**把主機暴露給整個網際網路**」:開了埠就有人掃描、IP 外露就可能被直接 DDoS、ACME 驗證又得讓 443 對外可達。對一台珍貴的 Always Free 主機,這風險不划算。

---

## 2. Cloudflare Tunnel 的原理:由內向外建立通道

Cloudflare Tunnel 把方向反過來:

```
   傳統:外界 ──(主動連入,需開埠)──► 主機        ← 主機被動挨打
   Tunnel:主機 ──(cloudflared 主動連出)──► Cloudflare  ← 主機只連出
```

主機上跑一個輕量常駐程式 **`cloudflared`**,它**主動向外**連到 Cloudflare 邊緣,建立一條(或多條)**持久的、加密的出站連線**。之後:

- 外部請求先到 Cloudflare 邊緣(經 DNS 的 Proxied CNAME 解析到 tunnel)。
- 邊緣把請求**沿著這條既有的出站連線送回主機**。
- `cloudflared` 在主機端依 `config.yml` 的 ingress 規則,把請求轉給本機對應服務(本專案是 `http://127.0.0.1:8080` 的 Caddy)。

關鍵:因為連線是「主機主動連出」建立的,**防火牆完全不需要開任何入站埠**——出站連線是防火牆預設允許的。主機的真實 IP 也從不出現在 DNS 上。

> 這就是為什麼架構圖說「不需要在 Oracle 開放 80/443 入站」。

---

## 3. 零信任(Zero Trust)觀點:為什麼這是個賣點

傳統開埠的心智是「築一道城牆,牆內可信、牆外擋住」,但只要牆上開了門(埠),門就是攻擊面。

Tunnel 體現的是 **zero-trust**:不預設任何入站是可信的,主機**不提供任何可被主動連入的入口**。所有進來的流量都必須「先到 Cloudflare,再沿著主機自己拉出去的通道回來」。攻擊者就算知道你用哪家雲、甚至猜到 IP,也**沒有埠可以連**。

延伸:同一套 Cloudflare Zero Trust 還能保護 **SSH**——用 `cloudflared access` 走 tunnel 連進主機管理,而不必對外開 22 埠(本專案 CI 的 self-hosted runner 也是「連出」領工作,同樣不開入站,理念一致)。

---

## 4. ingress 規則:一條 tunnel 服務多個子網域

一條 tunnel 可以承載多個 hostname,靠 `config.yml` 的 **ingress** 由上而下比對:

```yaml
ingress:
  - hostname: YOUR_DOMAIN            # 主站
    service: http://127.0.0.1:8080
  - hostname: soulshard.YOUR_DOMAIN  # live demo
    service: http://127.0.0.1:8080
  - hostname: cyclepact.YOUR_DOMAIN  # 預留(未來)
    service: http://127.0.0.1:8080
  - service: http_status:404         # catch-all,必須在最後且不帶 hostname
```

幾個重點:

- **規則由上而下,第一條符合就生效**;所以具體的放上面、catch-all 放最後。
- **最後一定要有一條無 hostname 的 catch-all**(這裡回 404),否則 cloudflared 會拒絕設定。
- 我們**所有 hostname 都轉到同一個 `127.0.0.1:8080`**,把「依 Host 分流到哪個子站」這件事交給 Caddy 處理(關注點分離:Tunnel 管「進得來」,Caddy 管「分到哪」)。

> 新增一個子網域永遠是兩步:**(1) ingress 加一條 + (2) 加 DNS CNAME**。詳見 [`infra/cloudflared/README.md`](../infra/cloudflared/README.md) 第 6 節。這也是架構文件 §3.2 提到的「用版本控管的 tunnel 設定檔降低維護負擔」——ingress 規則進 git,改動有跡可循。

---

## 5. credentials 與設定:什麼進 git、什麼不進

- **`config.yml`**(ingress 規則):**進 git**,但只放佔位符(`YOUR_DOMAIN` / `TUNNEL_ID`)。
- **`<TUNNEL_ID>.json`**(tunnel 專屬 secret):**絕不進 git**,只放主機本地(慣例 `/etc/cloudflared/`,權限 600)。
- **`cert.pem`**(帳號層級,管理用):也只在主機本地。

`cloudflared` 以 systemd 服務常駐(開機自啟、崩潰重啟),安裝細節見 README。

---

## 6. vs 傳統 port-forward + DDNS(取捨總表)

| 面向 | 傳統開埠 + DDNS | Cloudflare Tunnel(本專案) |
|---|---|---|
| 入站埠 | 要開 80/443(攻擊面) | **完全不開**(只連出) |
| 主機 IP | DNS 直接暴露 | **隱藏**(對外只見 Cloudflare) |
| IP 會變 | 需 DDNS 動態更新 | 無所謂(tunnel 認的是身分不是 IP) |
| TLS | 自己簽 Let's Encrypt(需 443 可達) | 邊緣終結,origin 免簽 |
| 多子站 | 各自設 vhost + DNS A | 一條 tunnel + ingress + CNAME |
| DDoS | 直接打到主機 | 先過 Cloudflare 邊緣緩解 |
| 額外成本 | 防火牆/憑證自管 | 多一個 `cloudflared` 行程、流量都經 Cloudflare |

### 取捨怎麼講
- **代價**:多一個 `cloudflared` 常駐程式要維護;且所有流量都經過 Cloudflare(等於信任這家 CDN)。
- **換來**:零入站攻擊面、IP 不外露、設定乾淨、免在 origin 管憑證,還順帶拿到邊緣 CDN/WAF。

對「一台寶貴的 Always Free 主機 + 公開履歷站」這個情境,Tunnel 幾乎是教科書級的正解,而且「zero-trust、免開埠」本身就是很好的履歷談資。

> 我們在架構文件裡仍保留「傳統開埠」的說明(§3.3),因為它涵蓋面更廣(origin TLS、防火牆規則),對面試時展現「我知道兩條路、也知道為何選這條」很有用。

---

## 7. 小結

- `cloudflared` 由主機**主動連出**建立加密通道,讓不開埠的主機也能對外服務。
- ingress 規則決定「哪個 hostname → 本機哪個 service」,本專案統一轉到 `127.0.0.1:8080` 的 Caddy。
- 相對傳統開埠 + DDNS,Tunnel 以「多一個行程 + 信任 Cloudflare」換來「零入站攻擊面 + IP 隱藏 + 免管 origin 憑證」。

下一步:流量到了 `127.0.0.1:8080`,Caddy 怎麼依 Host 把它分到正確的子站?→ [`12-caddy-origin.md`](./12-caddy-origin.md)。
