# 00 — 架構全貌與名詞解釋

> 本篇是整個專案的「地圖」。後面每篇 Cloudflare / CI/CD 文件都會回到這張圖。讀完你應該能對面試官講清楚:這網站長怎樣、流量怎麼走、為什麼這樣選。

## 1. 這個專案要解決什麼

把散落在 GitHub 的多個專案,收斂成**一個對外的履歷門面**:

- **主站**:履歷門面,精煉的自我介紹 + 專案總覽 + 可下載 PDF 履歷。
- **子站**:每個重點專案一個可獨立訪問的頁面。能在瀏覽器跑的(遊戲類)做成**真的可玩的 live demo**;不便執行的(需 GPU / 桌面 / Discord bot)做成**showcase 詳情頁**(圖文 + 架構圖 + 技術深度)。

關鍵限制:部署在 **Oracle Cloud Always Free A1**(ARM64, 2 OCPU / 12GB),透過 **Cloudflare** 對外,並要有**完整 CI/CD**。

## 2. 整體架構與資料流

```
          (1) 使用者瀏覽器
                │  HTTPS 請求 https://你的網域
                ▼
   ┌─────────────────────────────────────────────┐
   │ (2) Cloudflare 邊緣節點(離使用者最近)         │
   │     DNS 解析 · 反向代理 · CDN 快取 · WAF · TLS │
   └─────────────────────────────────────────────┘
                │  (3) Cloudflare Tunnel
                │      由主機端 cloudflared 主動「連出」建立的加密通道
                │      ⇒ 不需要在 Oracle 開放 80/443 入站
                ▼
   ┌─────────────────────────────────────────────┐
   │ (4) Oracle A1 主機上的 Caddy(只聽 localhost) │
   │     依「Host 名稱」把請求分流:                 │
   │       你的網域            → apps/main 靜態檔   │
   │       soulshard.你的網域  → apps/soulshard     │
   │       kanto.你的網域      → apps/kanto         │
   │       cyclepact.你的網域  → apps/cyclepact     │
   │     (動態服務則 reverse_proxy 到本機某 port)   │
   └─────────────────────────────────────────────┘
```

一句話總結:**使用者 → Cloudflare 邊緣 → Tunnel → 主機 Caddy → 靜態檔/動態服務**。

## 3. 名詞與設計決策(為什麼 / 角色 / 替代 / 取捨)

### 3.1 Monorepo vs Polyrepo

- **Monorepo(本專案採用)**:一個 git repo 裝下主站、所有子站、共用元件(`packages/ui`)。
- **Polyrepo**:每個子站一個獨立 repo。

| 面向 | Monorepo | Polyrepo |
|---|---|---|
| 共用設計系統 | 放 `packages/ui`,一套到底 | 要發 npm 套件或 submodule 才能共用 |
| CI/CD 解耦 | 用 `paths:` 過濾器 → 改哪個子站只跑那條 | 天生解耦,但 N 套設定要維護 |
| 對招募者 | 一個連結看完全部,展現 monorepo 技能 | 作品散落多 repo |
| 心智負擔 | 一個地方 clone/管理 | 多 repo、多 secrets |

**取捨**:Monorepo 的代價是「單一 repo 變大、需要 Turborepo 之類工具做選擇性建置」。對單一開發者的履歷專案,利遠大於弊,且 `paths:` 過濾照樣達成「各自 build / deploy」。

### 3.2 子網域 vs 路徑(本專案混用)

- **子網域**(`soulshard.你的網域`):路由乾淨、彼此完全獨立、可各自設定快取與 pipeline;代價是每個子站要一筆 DNS 記錄。
- **路徑**(`你的網域/projects/xxx`):不需多 DNS,但 Next.js 靜態匯出要設 `basePath`,且共用同一 origin、耦合較高。

**決策**:**live demo 用子網域**(它們真的需要獨立執行環境,值得解耦);**showcase 用路徑**(只是主站的內容頁,沒必要獨立部署)。兩者都能被外部直接以網址訪問。

> 目前確定的 live demo 只有 Soulshard-Hunter,因此「獨立 pipeline」初期是 `apps/main`(含所有 showcase)與 `apps/soulshard` 兩條。這已能完整示範「多子站、各自獨立 CI/CD」的架構,且可擴充:日後 cyclepact 完成、或把 lolhelper 前端做成靜態 demo,各加一個 `apps/<demo>` + 一條 `paths:` 過濾 workflow 即可。

> 「DNS 較多」會怎樣?在 Tunnel 架構下,每多一個子網域只是多一筆指向同一條 tunnel 的 CNAME——不花錢、憑證自動簽發、維護成本低;唯一成本是「每加一個子站要記得同時加 ingress 規則 + DNS」,我們用版本控管的 tunnel 設定檔來降低這個負擔。

### 3.3 Cloudflare Tunnel vs 傳統開埠

- **傳統**:在 Oracle 防火牆開 80/443,DNS A 記錄指向主機公網 IP,Caddy 自行用 Let's Encrypt 簽憑證。
- **Cloudflare Tunnel(本專案採用)**:主機跑 `cloudflared`,**主動連出**到 Cloudflare 建立通道;對外完全不開入站埠、不暴露主機 IP。

**取捨**:Tunnel 多一個 `cloudflared` 行程要維護、且流量都經 Cloudflare;但換來「零入站攻擊面、IP 不外露、設定乾淨」,而且 zero-trust 是很好的履歷亮點。傳統開埠教學涵蓋面更廣(origin TLS、防火牆規則),所以文件裡兩者都會講。

### 3.4 邊緣 TLS vs origin TLS

請求的 HTTPS 在 **Cloudflare 邊緣**就終結(使用者↔Cloudflare 這段加密)。Cloudflare↔主機這段在 Tunnel 內,本身就是加密通道,因此 origin 的 Caddy 可只服務 HTTP(localhost)。若要「端到端加密」,可改用 Cloudflare Origin Certificate。**取捨**:邊緣終結最省事;端到端最嚴謹但多一層憑證管理。

### 3.5 self-hosted ARM runner vs GitHub-hosted runner

- **GitHub-hosted**(x86):免維護,但要部署到「無入站」的主機需另經 SSH(可走 `cloudflared access`)。靜態站其實 x86 build 就夠。
- **self-hosted ARM runner(本專案採用)**:跑在 Oracle 主機上,**連出** GitHub 領工作,在本機 build 並直接寫入 Caddy 服務目錄——零入站、ARM 原生(對日後動態 app 友善)。

**取捨**:self-hosted 要自己維護 runner、且在 prod 主機跑 CI 有資源/安全考量(可用獨立使用者、限制權限緩解)。這部分 Phase 5 會詳談,若你不想在 prod 跑 CI,改用 GitHub-hosted + tunnel SSH。

## 4. 各專案呈現策略(初版,Phase 2 內容研究後定案)

| 專案 | 性質 | 規劃呈現 |
|---|---|---|
| Soulshard-Hunter | JS Roguelike(可跑) | **live demo**(子網域)— 目前唯一確定的 live demo |
| cyclepact | Godot 4(private,**開發中**) | **showcase**(可公開,但未完成 → 暫不做 live demo,標示 WIP) |
| kanto-quest | JS(private) | **不公開**(維持 private,不上履歷) |
| lolhelper | Next.js+FastAPI+PG+Redis | **showcase**(初期);前端靜態 demo 列延伸目標(可成第二個 demo 子網域) |
| AI-Deployment-Pipeline | YOLOv8/TensorRT/Triton(需 GPU) | **showcase** |
| Smart-Pedestrian-Navigation | 語義分割 + Android | **showcase** |
| DiscordGuildKeeper / discord-auto-bot | Discord bot | **showcase** |
| AnimeTracker | PyQt6 桌面 | **showcase** |
| Mini-Moba / Ros-Ball-Chaser / PayTheMoney | C++/ROS/JS | **showcase** 或外連 |
| 學術專案(Verilog/ASM/C++) | 課程作業 | 主站摺疊區 + 外連 |

## 5. 接下來
- Phase 1 設計系統、Phase 2 內容研究(會逐一讀真實 repo 後重寫文案並定案上表)、Phase 3 前端實作。
- Phase 4/5 進入 Cloudflare 與 CI/CD,屆時每個步驟都對照本篇的圖。
