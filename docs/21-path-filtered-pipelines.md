# 21 — Path-filtered pipelines:monorepo 裡讓每個站各自獨立 build / deploy

> 本篇是「monorepo + CI/CD」最關鍵的一招:用 `paths:` 過濾器,讓「改了哪個站、就只 build / deploy 哪個站」。讀完你應該能對面試官講清楚:`paths:` 怎麼運作、它如何在一個 repo 裡達成「彼此解耦的多條 pipeline」、和 polyrepo 的對照、以及為什麼子站(Soulshard 等)各自有自己的 pipeline。
>
> 前置:[`20-cicd-github-actions.md`](./20-cicd-github-actions.md)(workflow / trigger / runner 基本)、[`00-architecture-overview.md`](./00-architecture-overview.md) §3.1(Monorepo vs Polyrepo)。
> 實作設定:[`.github/workflows/ci.yml`](../.github/workflows/ci.yml)、[`.github/workflows/deploy-main.yml`](../.github/workflows/deploy-main.yml)。

---

## 1. 問題:一個 repo 裝了好幾個站,怎麼避免「改 A 卻重 build B」?

本專案是 **monorepo**:`apps/main`(主站)、`apps/soulshard`(live demo)、未來還有更多子站,加上共用的 `packages/ui`、內容 `content/`,全在同一個 git repo(為什麼選 monorepo,見 [`00`](./00-architecture-overview.md) §3.1)。

天真的做法是「一條 workflow,只要有人 push 就全部重 build、全部重部署」。問題很明顯:

- 改一行主站文案,卻把 soulshard 也重新部署一遍——浪費 runner 時間、平白增加「動到不該動的站」的風險。
- 改了 `docs/` 或 `infra/` 裡跟產物無關的東西,還是觸發整輪 build / deploy——毫無意義。

我們要的是:**改哪個站,就只跑那個站的 pipeline;不相關的改動,什麼都不觸發。**

---

## 2. 解法:`on.<event>.paths` 過濾器

GitHub Actions 的 trigger 可以加 `paths:`,只有「這次 commit 動到符合的檔案」時才觸發這條 workflow。

主站部署 [`deploy-main.yml`](../.github/workflows/deploy-main.yml) 的過濾:

```yaml
on:
  push:
    branches: [main]
    paths:
      - "apps/main/**"        # 主站本身
      - "packages/ui/**"      # 主站用到的共用設計系統(改它,主站外觀會變)
      - "content/**"          # 主站讀的內容(projects.json 等)
      - ".github/workflows/deploy-main.yml"  # 部署流程本身改動時
```

語意:**push 進 main、且這次改動「至少有一個檔案」落在上面任一 glob,才部署主站。** 反過來說:

- 只改 `apps/soulshard/**` → 不符合 → **主站不部署**(soulshard 由它自己的 workflow 處理)。
- 只改 `docs/**` 或 `infra/**` → 不符合 → **主站不部署**(光寫文件 / 調 Caddy 設定不該重新上線主站)。
- 改 `packages/ui/**` → 符合 → 主站部署(因為主站視覺依賴它)。

這就是 **path-filtered 解耦**:同一個 repo,卻像有好幾條互不干擾的獨立 pipeline。

> 注意 `paths:` 比對的是「**這次 push / PR 改動的檔案路徑**」,不是「目錄存不存在」。沒動到的站,它的 workflow 連排程都不會出現。

---

## 3. 一個站一條 workflow:解耦的具體形狀

本專案的約定(見專案 `CLAUDE.md`):**`.github/workflows/` 下,每個 app 一條 `paths:` 過濾的 workflow,彼此解耦。**

```
.github/workflows/
  ci.yml            # 驗證:任何影響 build 的改動都驗(較寬的 paths)
  deploy-main.yml   # 只部署 apps/main(paths 限 apps/main + packages/ui + content)
  deploy-soulshard.yml  # (未來)只部署 apps/soulshard(paths 限 apps/soulshard + packages/ui)
  ...
```

每多一個 live demo 子站,就「複製一份部署 workflow、把 `paths:` 和 `deploy-static.sh` 的 app 參數換成那個子站」。例如未來的 soulshard 部署 workflow,`paths:` 會是 `apps/soulshard/**`(加上它若也用 `packages/ui` 就再列上),最後呼叫 `./infra/scripts/deploy-static.sh soulshard`——同一支腳本、不同參數,落到 `/srv/soulshard`(見 [`12-caddy-origin.md`](./12-caddy-origin.md))。

**為什麼 CI 的 `paths:` 比部署寬?** 因為 CI 是「合併前的整體驗證」,只要任何影響 build 的東西變了(任一 app、任一 package、內容、根設定)都該驗一遍;而部署是「把特定站送上線」,範圍越精準越好,避免誤上線。

> 共用的 `packages/ui` 被多個站的 `paths:` 同時列入是「刻意的」:改了共用設計系統,所有依賴它的站都該重新 build / 部署。這正是 monorepo 共用元件的代價與好處——一處改、處處更新,但要記得它會觸發多條 pipeline。

---

## 4. monorepo(paths 過濾)vs polyrepo:對照與取捨

達成「各站獨立 pipeline」有兩條路:

| 面向 | monorepo + `paths:` 過濾(本專案) | polyrepo(每站一個 repo) |
|---|---|---|
| pipeline 解耦 | 用 `paths:` 達成,一個 repo 裡多條 workflow | 天生解耦,各 repo 各自的 CI |
| 共用設計系統 | `packages/ui` 直接 workspace 引用,一處改處處更新 | 要發 npm 套件 / git submodule 才能共用,版本要對齊 |
| 設定維護 | workflow 集中一處,複製貼上 + 改 `paths:`/app 參數 | N 個 repo、N 套 CI 設定、N 組 secrets 分散維護 |
| 「改共用元件」的影響 | `paths:` 列入 `packages/ui` → 自動觸發相關站 | 要手動 bump 各 repo 的相依版本、各自重跑 |
| 對招募者 | 一個連結看完全部架構,展現 monorepo 工程能力 | 作品散落多 repo |

**取捨**:monorepo 的代價是「單一 repo 變大、需要 Turborepo 之類工具做選擇性建置、`paths:` 要維護對」;但對單一開發者的履歷專案,共用設計系統的便利 + 一處管理的低心智負擔,利遠大於弊。而 `paths:` 過濾讓我們「不必犧牲 polyrepo 的 pipeline 解耦」——兩邊的好處基本都拿到了。

> 為什麼有些子站(例如某些獨立性很強的專案)仍可能在「各自的 repo」有各自 pipeline?當一個子站的技術棧、發布節奏、或協作者和主站完全不同(例如一個會頻繁獨立發布、或本來就是 private 的遊戲專案)時,把它留在自己的 repo、用自己的 CI 反而更乾淨——這時它就是 polyrepo 模式,透過子網域接進同一個 Tunnel / Caddy 即可(見 [`00`](./00-architecture-overview.md) §3.2)。本專案的原則是:**呈現面(子網域 / 路徑)與部署面(monorepo / polyrepo)可以分開決定**——對外都是一個履歷門面下的子站,對內則按「耦合度」選最省事的 repo 佈局。

---

## 5. 常見陷阱

- **`paths:` 只作用於 `push` / `pull_request` 這類「有檔案差異」的事件**;`workflow_dispatch`(手動)、`schedule`(定時)沒有「改動的檔案」概念,`paths:` 對它們無效。需要手動重跑時用 `workflow_dispatch`。
- **別忘了把 workflow 檔自己列進 `paths:`**:否則你改了部署流程本身(`deploy-main.yml`),卻因為沒動到 `apps/main/**` 而不會觸發,無法驗證新流程。本專案兩條 workflow 都把自己列入了。
- **`paths-ignore` 是相反邏輯**(「除了這些路徑以外都觸發」),和 `paths:` 不能在同一事件併用。本專案用正面表列 `paths:`,意圖更明確。
- **共用相依的連鎖**:`packages/ui` 改動會觸發「所有列入它的站」。這是對的行為,但部署多站時要意識到「一次 push 可能觸發多條部署 workflow」。

---

## 6. 小結

- `on.<event>.paths` 讓 workflow「只在改動命中指定路徑時」觸發,是 monorepo 解耦的核心。
- 本專案**一個 app 一條 `paths:` 過濾的部署 workflow**;主站只認 `apps/main/** + packages/ui/** + content/**`,改 docs/infra/別的子站都不會誤觸發主站部署。
- CI 的 `paths:` 較寬(整體驗證),部署的 `paths:` 較窄(精準上線)。
- 相對 polyrepo,monorepo + `paths:` 同時拿到「pipeline 解耦」與「共用元件 / 集中維護」;呈現面與部署面可分開決定。
- 下一篇看部署那端的主角:在 Oracle A1 上的 self-hosted ARM runner。
