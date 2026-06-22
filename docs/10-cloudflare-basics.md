# 10 — Cloudflare 基礎:DNS、橘雲 proxy、CDN、WAF、TLS 模式

> 本篇對應架構圖的第 (2) 格「Cloudflare 邊緣節點」。讀完你應該能對面試官講清楚:為什麼這個履歷網站「在使用者與主機之間」夾了一層 Cloudflare,它幫我們做了哪些事、各自的取捨是什麼。
>
> 接續閱讀:[`11-cloudflare-tunnel.md`](./11-cloudflare-tunnel.md)(怎麼把流量安全地送進主機)、[`12-caddy-origin.md`](./12-caddy-origin.md)(主機這端怎麼接)。

---

## 1. 為什麼需要 Cloudflare?

主機是一台 **Oracle Cloud Always Free A1**(ARM64, 2 OCPU / 12GB)。它能跑得動服務,但直接把它丟上公網會有幾個現實問題:

- **單一節點、離使用者遠**:主機只有一個地點,海外訪客延遲高。
- **攻擊面大**:公開 IP + 開放埠 = 任何人都能掃描、打 DDoS、試漏洞。
- **沒有快取**:每個請求都打到主機,浪費那 2 OCPU。
- **憑證、IP 外露要自己扛**。

Cloudflare 夾在「使用者 ↔ 主機」中間當**反向代理**,把上面這些都接走:它在全球有大量邊緣節點,使用者連到的是離他最近的 Cloudflare,而不是直接連我們那台在某個機房的 A1。

**在本架構中的角色**:Cloudflare 負責 DNS 解析、邊緣反向代理、CDN 快取、WAF/DDoS 防護、以及在邊緣終結 TLS;真正的內容仍由主機 Caddy 提供,經 Tunnel 連入(見下一篇)。

---

## 2. DNS:把網域指到正確的地方

### 它是什麼
DNS 就是「網域名稱 → 位址」的電話簿。把網域託管在 Cloudflare,等於讓 Cloudflare 當這個網域的 **權威 DNS**(authoritative DNS),所有人查 `YOUR_DOMAIN` 都來問它。

### 在本專案怎麼用
我們不用傳統的「A 記錄指向主機公網 IP」。因為走 Cloudflare Tunnel,每個子網域都是一筆 **CNAME 指向 `<TUNNEL_ID>.cfargotunnel.com`**(由 `cloudflared tunnel route dns` 自動建立,見 [`infra/cloudflared/README.md`](../infra/cloudflared/README.md))。

對應關係:

| 記錄 | 類型 | 指向 | 對應子站 |
|---|---|---|---|
| `YOUR_DOMAIN` | CNAME(Proxied) | tunnel | 主站 |
| `soulshard.YOUR_DOMAIN` | CNAME(Proxied) | tunnel | live demo |
| `cyclepact.YOUR_DOMAIN` | CNAME(Proxied) | tunnel | 預留(未來) |

> 替代方案:用別家 DNS(如自架 / Route53)只做解析,但那樣就拿不到下面橘雲那一整套功能。既然要用 Cloudflare 的 proxy/CDN/WAF,DNS 託管在 Cloudflare 最順。

---

## 3. 橘雲 proxy(Proxied vs DNS only)

Cloudflare DNS 後台每筆記錄旁有一朵雲:

- **橘雲(Proxied)**:流量「經過」Cloudflare。對外只看得到 Cloudflare 的 IP,主機真實 IP 被藏起來;CDN、WAF、邊緣 TLS、快取**全都靠這個橘雲才生效**。
- **灰雲(DNS only)**:Cloudflare 只做解析,流量直連目標,**不經過** Cloudflare(那些防護全都沒有)。

### 在本專案怎麼用
所有對外子網域**都用橘雲**。這正是「不暴露主機 IP」的關鍵之一——加上 Tunnel(主機只連出、不開入站埠),外界根本拿不到、也連不上主機真實位址。

> 取捨:橘雲讓所有流量經 Cloudflare,等於信任它能看到明文(因為 TLS 在邊緣終結,見第 6 節)。對一個公開的履歷網站,這個信任成本可接受,換來的防護與快取價值遠大於此。需要端到端加密時可用 Origin Certificate 緩解(第 6 節)。

---

## 4. CDN 快取:省下主機那 2 OCPU

### 它是什麼
Cloudflare 邊緣會把**靜態資產**(JS / CSS / 圖片 / 字型)快取在離使用者最近的節點。第二個訪客拿到的是邊緣的快取副本,根本不會回源打到我們的 A1。

### 為什麼對本專案特別重要
這個履歷站 **主站與 live demo 都是靜態匯出**(HTML/JS/CSS,見架構文件)。靜態站 + CDN 是天作之合:幾乎所有請求都能被邊緣 cache hit 接走,主機只在「快取沒命中 / 快取過期」時才偶爾出力。一台 Always Free 小機器因此能扛遠超它本身規格的流量。

### 要注意的取捨
- **HTML 預設不長快取**:Cloudflare 預設只積極快取明確的靜態副檔名,HTML 通常每次回源(以免你發版後使用者看到舊頁)。可用 Cache Rules 調整,但要小心「部署後快取沒清,使用者看到舊版」。
- **發版要讓快取失效**:靜態資產若用了 hash 檔名(如 `app.abc123.js`)就天然免清快取;HTML 則靠「不長快取」或部署後 Purge。

> 替代方案:不用 CDN(灰雲)→ 每個請求都打主機,延遲高、主機累。對靜態履歷站沒有理由這樣做。

---

## 5. WAF 與 DDoS 防護:把垃圾流量擋在門外

### 它是什麼
- **WAF(Web Application Firewall)**:在邊緣依規則攔截惡意請求(SQL injection、掃描器、惡意 bot…)。
- **DDoS 防護**:Cloudflare 免費方案即含 L3/4/7 的 DDoS 緩解。

### 在本專案怎麼用
免費方案的「Managed Ruleset + 自動 DDoS 緩解」對一個靜態履歷站基本上**開著就夠**。我們不需要複雜自訂規則;真要加,典型如:對某些路徑限速、擋掉明顯的惡意 User-Agent。

> 角色定位:因為主機**完全不開入站埠**(Tunnel 架構),攻擊面本來就極小;WAF/DDoS 是「邊緣再加一層」的縱深防禦。兩者疊起來,是很好的 zero-trust 履歷亮點。

---

## 6. TLS 模式:加密在哪裡終結?

這是最容易設錯、面試也最愛問的一點。Cloudflare 後台的 **SSL/TLS → Overview** 有幾種模式:

| 模式 | 使用者↔CF | CF↔主機(origin) | 說明 |
|---|---|---|---|
| **Off** | 無 | — | 不要用 |
| **Flexible** | 加密 | **明文 HTTP** | origin 不需憑證,但 CF↔origin 沒加密(在一般公網上很危險) |
| **Full** | 加密 | 加密(**不驗證**憑證) | origin 要有憑證,但自簽也接受 |
| **Full (strict)** | 加密 | 加密(**驗證**憑證) | 最嚴謹,origin 憑證要被信任 |

### 本專案的選擇:邊緣終結 TLS + Tunnel
我們的情況有個關鍵差異:**CF↔主機這段不是走公網,而是走 Cloudflare Tunnel**,Tunnel 本身就是一條加密通道。所以:

- **使用者 ↔ Cloudflare**:正常 HTTPS,憑證由 Cloudflare 在邊緣自動簽發/管理(對外看到的就是有效的 `https://YOUR_DOMAIN`)。
- **Cloudflare ↔ 主機**:走 Tunnel(已加密),`cloudflared` 在主機端把請求轉成 **`http://127.0.0.1:8080`** 給 Caddy。

因此 **origin 的 Caddy 只服務本機 HTTP、不自簽 Let's Encrypt**(`auto_https off`,見 [`12-caddy-origin.md`](./12-caddy-origin.md))。這就是「TLS 於 Cloudflare 邊緣終結」的具體落地。

> 為什麼不讓 Caddy 自己簽 Let's Encrypt?因為主機不開入站埠、IP 不外露,Caddy 根本沒有對外 443 可被 ACME 驗證,也沒必要——邊緣已經有有效憑證,Tunnel 又已加密,再簽一層只是徒增管理成本與簽發失敗的噪音。

### 想要「端到端加密」怎麼辦(替代方案)
若日後要求 CF↔origin 也用「真正的 TLS 憑證」而非僅靠 Tunnel 加密,可改用 **Cloudflare Origin Certificate**:在 origin(Caddy)裝一張 Cloudflare 簽的 origin 憑證,並把 TLS 模式設 **Full (strict)**。

> 取捨:邊緣終結(本專案)最省事、零憑證維護;Origin Certificate / Full strict 最嚴謹,但多一層憑證要管理與輪替。對 Tunnel 架構的靜態履歷站,邊緣終結已足夠,且更乾淨。

---

## 7. 小結:Cloudflare 在本架構做了什麼

1. **DNS**:把各子網域以 Proxied CNAME 指向 tunnel。
2. **橘雲 proxy**:藏主機 IP、啟用下面所有功能。
3. **CDN**:邊緣快取靜態資產,讓 Always Free 小機器扛得住流量。
4. **WAF/DDoS**:邊緣縱深防禦,疊在「主機不開埠」之上。
5. **TLS**:在邊緣終結,origin 只服務本機 HTTP。

下一步:流量怎麼從 Cloudflare 邊緣**安全地**進到那台不開埠的主機?那就是 Cloudflare Tunnel 的工作 → [`11-cloudflare-tunnel.md`](./11-cloudflare-tunnel.md)。
