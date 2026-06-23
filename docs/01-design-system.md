# 01 — 設計系統(Design System)

> 本篇定義履歷入口網站的視覺語言與元件規格。最終落地在 `packages/ui`,供主站(`apps/main`)與所有子站(`apps/soulshard` 等)共用。每個重要選擇都附「為什麼」。
>
> 落地形式:CSS 變數 token → Tailwind `theme.extend` → React 元件。本文件的 token 命名即為 Tailwind / CSS 變數的最終名稱。
>
> 對應 mockup:`design/mockup-main.html`(可直接用瀏覽器開啟的視覺定案稿)。

---

## 1. 設計理念

**一句話定位**:給招募者與技術主管看的「工程師作品集」,要像一個會自己寫設計系統的全端工程師親手做的——專業、冷靜、現代、可信,精準不浮誇。

四個原則:

1. **內容優先,克制裝飾(Content-first)**。招募者停留時間短,版面要讓「定位、能力、作品」三秒內被抓到。不用漸層、不用光暈、不用花俏動畫。
   *為什麼*:過度設計會讓技術受眾覺得「在掩飾內容不足」;克制反而傳達自信。
2. **深色為主,工程師語彙(Dark-first)**。深色背景 + 等寬字點綴 + 細邊框卡片,呼應 IDE / 終端機的視覺記憶,讓技術主管有「同類」的親切感。
   *為什麼*:目標受眾日常就在深色編輯器裡;深色也讓彩色 accent 與程式碼片段更突出。但必須規劃淺色對應,因為部分招募者(尤其 HR / 用印表機)偏好淺色。
3. **層級即資訊(Hierarchy as information)**。專案分 featured / notable / mini / academic 四層,用「卡片尺寸 + 資訊密度 + 視覺重量」來編碼重要性,而非只靠標題文字。
   *為什麼*:讓人一眼看出「哪些是代表作」,等於替招募者做了篩選。
4. **可信賴的細節(Trustworthy details)**。對齊、間距尺度、對比達標、焦點可見、語意標籤——這些「看不見的品質」本身就是工程能力的展示。
   *為什麼*:作品集網站的程式碼與無障礙品質,招募者真的會打開 DevTools 檢查。

---

## 2. 色票(Color Tokens)

採 **HSL / RGB 並存的 CSS 變數**,深色為預設(`:root`),淺色掛在 `[data-theme="light"]`。命名遵循「語意層」而非「顏色名」,讓主題切換只換值不換名。

### 2.1 設計決策

- **品牌主色選 teal-cyan(青藍)**:介於藍(可信、企業)與綠(成長、運作中)之間,科技感強但不像純藍那樣被各大 SaaS 用爛;在深色底上辨識度高、對比好達標。*為什麼*:要一個「不撞臉」又「夠專業」的 accent;teal 同時暗示 DevOps / terminal 的綠色語彙。
- **輔色 violet(紫)**:用於 AI-ML 類專案標記與次要強調,和 teal 形成冷色雙主軸,避免單色單調。*為什麼*:Terry 有 AI-ML 主線,給它一個專屬色能在專案 grid 中做語意分群。
- **語意色(success/warning/danger/info)**:用於專案狀態徽章(Live / WIP / Archived)與 a11y 提示。
- **背景採三階表面(bg → surface → elevated)**:深色版用「不同明度的近黑」堆疊層級,而非靠陰影。*為什麼*:深色介面靠陰影區分層級效果差,用表面明度階更乾淨,也呼應「flat」理念。
- **卡片走「立體層次(B 方向)」**:卡片不直接用 `--color-surface`,而是用提亮一階的 `--color-card`,並在頂部疊一條 1px 高光邊(`--color-card-highlight`,用 `inset box-shadow` 實作,不佔版面)。Featured / Notable 卡再加 **左側 3px teal / violet 強調條**。淺色模式對應:卡片維持純白、高光邊改用對應暗色細邊(白色高光在白底無效)。*為什麼*:純 flat 卡片在資訊密集的 grid 中偏扁、層次不足;提亮表面 + 頂部高光 + 左強調條能在不犧牲「克制」的前提下,讓代表作/可點卡片更突出、更精緻,且深淺色皆成立。

### 2.2 深色(預設)+ 淺色對應

```css
:root {
  /* ── 表面 / 背景(明度階)─────────────────── */
  --color-bg:            #0B0F14;  /* 頁面底:近黑帶藍 */
  --color-surface:       #121821;  /* 卡片 / 區塊面 */
  --color-surface-2:     #1A222D;  /* 巢狀面 / hover */
  --color-elevated:      #212C39;  /* 浮起元素:nav 捲動後、下拉 */
  --color-overlay:       rgba(5,8,12,.72); /* modal / drawer 遮罩 */

  /* ── 文字 ──────────────────────────────── */
  --color-text:          #E8EDF2;  /* 主文(對 bg 對比 ≈ 14:1) */
  --color-text-muted:    #9FB0C0;  /* 次要文 / 說明(≈ 7:1) */
  --color-text-subtle:   #6B7C8C;  /* 提示 / 佔位(≈ 4.6:1,僅非關鍵) */
  --color-text-onbrand:  #04201F;  /* 放在 brand 實心上的深色文字 */

  /* ── 邊框 ──────────────────────────────── */
  --color-border:        rgba(159,176,192,.14); /* 預設細邊框 */
  --color-border-strong: rgba(159,176,192,.28); /* hover / 強調 */
  --color-focus:         #5EE6D0;  /* 焦點環(高亮 teal) */

  /* ── 立體層次(B 方向)卡片 token ──────────── */
  --color-card:           #161D27;            /* 卡片表面:較 surface 提亮一階 */
  --color-card-highlight: rgba(255,255,255,.14); /* 頂部 1px 高光邊(深色) */

  /* ── 品牌 / 強調 ────────────────────────── */
  --color-brand:         #2DD4BF;  /* teal 主色:連結、CTA、accent */
  --color-brand-hover:   #5EEAD4;
  --color-brand-dim:     rgba(45,212,191,.12); /* 淡底:badge、hover 區 */
  --color-accent:        #A78BFA;  /* violet:AI-ML 標記、次要強調 */
  --color-accent-dim:    rgba(167,139,250,.14);

  /* ── 語意色(狀態徽章 / 提示)──────────────── */
  --color-success:       #34D399;  /* Live / 運作中 */
  --color-success-dim:   rgba(52,211,153,.14);
  --color-warning:       #FBBF24;  /* WIP / 開發中 */
  --color-warning-dim:   rgba(251,191,36,.14);
  --color-danger:        #F87171;  /* 錯誤 / 已封存 */
  --color-danger-dim:    rgba(248,113,113,.14);
  --color-info:          #60A5FA;
  --color-info-dim:      rgba(96,165,250,.14);
}

[data-theme="light"] {
  --color-bg:            #F7F9FB;
  --color-surface:       #FFFFFF;
  --color-surface-2:     #EFF3F7;
  --color-elevated:      #FFFFFF;
  --color-overlay:       rgba(15,23,32,.45);

  --color-text:          #0E1620;  /* 對 bg ≈ 15:1 */
  --color-text-muted:    #475565;  /* ≈ 7.5:1 */
  --color-text-subtle:   #6B7888;  /* ≈ 4.7:1 */
  --color-text-onbrand:  #04201F;

  --color-border:        rgba(14,22,32,.12);
  --color-border-strong: rgba(14,22,32,.22);
  --color-focus:         #0D9488;

  --color-card:           #FFFFFF;            /* 淺色卡片維持純白(已是最亮),靠陰影 + 高光邊做層次 */
  --color-card-highlight: rgba(14,22,32,.06); /* 淺色:白色高光無效,改用對應暗色細高光邊 */

  --color-brand:         #0D9488;  /* 淺色底要壓深以保對比 */
  --color-brand-hover:   #0F766E;
  --color-brand-dim:     rgba(13,148,136,.10);
  --color-accent:        #7C3AED;
  --color-accent-dim:    rgba(124,58,237,.10);

  --color-success:       #059669;  --color-success-dim: rgba(5,150,105,.12);
  --color-warning:       #B45309;  --color-warning-dim: rgba(180,83,9,.12);
  --color-danger:        #DC2626;  --color-danger-dim:  rgba(220,38,38,.12);
  --color-info:          #2563EB;  --color-info-dim:    rgba(37,99,235,.12);
}
```

> **對比備註**:主文 / 次要文 / brand 在兩個主題上對 bg 與 surface 皆 ≥ 4.5:1(大字 ≥ 3:1);`--color-text-subtle` 僅用於非關鍵提示。淺色版的 brand 從 `#2DD4BF` 壓深到 `#0D9488`,*為什麼*:teal 在白底上太淺會掉對比,必須換深值才符合 WCAG AA。

---

## 3. 字體(Typography)

### 3.1 字體家族 token

```css
:root {
  /* 英文無襯線 + CJK 後備(繁中) */
  --font-sans: "Inter", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont,
               "Segoe UI", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei",
               sans-serif;
  /* 等寬:程式碼片段、版號、技術徽章、終端機感 */
  --font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code",
               ui-monospace, "Noto Sans Mono CJK TC", monospace;
}
```

- *為什麼 Inter*:現代、字距乾淨、數字等寬選項好,是工程師作品集的安全高品質選擇。
- *為什麼把 Noto Sans TC 放在英文字體之後*:讓英文走 Inter、中文 fallback 到 Noto,避免中文用到 Inter 缺字而觸發系統醜字。生產環境用 `font-display: swap` 並只 subset 需要的 CJK 字重,避免 CJK web font 過大拖慢載入。
- *為什麼保留 mono*:等寬字點綴(版號、tech badge、`/projects/slug` 路徑)強化「工程師」身分,且讓技術名詞對齊好讀。

### 3.2 字級階(Type scale,1.250 Major Third,rem)

| Token | px(根 16) | 行高 | 用途 |
|---|---|---|---|
| `--text-xs`   | 12 | 1.5  | 標籤、徽章、footer |
| `--text-sm`   | 14 | 1.6  | 次要文、說明、metadata |
| `--text-base` | 16 | 1.7  | 內文(行高鬆,長文好讀) |
| `--text-lg`   | 20 | 1.5  | 區塊導言、卡片標題 |
| `--text-xl`   | 25 | 1.35 | Section 標題 |
| `--text-2xl`  | 31 | 1.25 | 次級大標 |
| `--text-3xl`  | 39 | 1.15 | Hero 副標 |
| `--text-4xl`  | 49 | 1.1  | Hero 主標(桌機) |

字重只用三級:**400(內文)/ 500(強調、卡片標題)/ 700(大標)**。*為什麼*:克制字重數量讓排版一致;700 僅留給 Hero 與 section 大標製造節奏。

---

## 4. 間距 / 圓角 / 陰影尺度

### 4.1 間距(8px 基準柵格)

```css
--space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-5: 24px;  --space-6: 32px;  --space-7: 48px;  --space-8: 64px;
--space-9: 96px;  --space-10: 128px;
```
- 元件內部間距用 4 / 8 / 12 / 16;區塊之間(section padding)用 64 / 96 / 128。*為什麼 8px 柵格*:業界標準、好對 Tailwind(`p-4` = 16px)、視覺節奏穩定。
- 元件樣式**一律用柵格 token**(`gap-3`/`p-5`/`px-4` …),避免散落的 `px-[18px]`/`gap-[10px]` 繞過柵格;僅「裝飾性子像素元素」(品牌圓點、終端機紅綠燈、accent 條寬、bullet 光學對齊)可用 arbitrary 值。圖示尺寸對齊 16 / 20 / 24。
- 內容最大寬 `--container: 1120px`,長文段落 `--measure: 68ch`。*為什麼限制行寬*:超過 ~75 字元行寬可讀性下降。

> **⚠ 維護注意:spacing token 與 Tailwind 內建 scale 衝突**。`tailwind-preset.ts` 的 `theme.extend.spacing` 把鍵 `1`–`10` 覆寫成 4–128px,因此 `h-8`/`w-9`/`h-10`/`p-10` 等會取**自訂值**(如 `w-9` = 96px,而非預設 36px),而鍵 `11`/`12`/`14` 未覆寫、維持 Tailwind 預設(`h-11` = 44px、`h-12` = 48px、`h-14` = 56px)。因此:**觸控高度用 `h-11/h-12/h-14`(44/48/56px)是安全的**;**需要 32/36px 等非柵格尺寸時,改用 arbitrary 值**(`w-[36px]`),別用 `w-8`/`w-9`(會被放大)。同理 icon 用 `h-4`(=16px)、`h-5`(=24px,非 20px)需留意。

### 4.2 圓角

```css
--radius-sm: 6px;   /* 徽章、輸入框 */
--radius-md: 10px;  /* 按鈕、小卡 */
--radius-lg: 16px;  /* 主卡片、區塊容器 */
--radius-xl: 24px;  /* Hero 視覺塊、大型容器 */
--radius-full: 999px; /* pill、頭像 */
```
*為什麼中等圓角*:全直角太硬、太圓太「消費級」;10–16px 在「專業」與「親和」間取平衡。

### 4.3 陰影 / 高度

深色版**主要靠表面明度階 + 邊框**分層,陰影僅用於真正浮起的元素(下拉、捲動後的 nav)。

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,.30);
--shadow-md: 0 6px 20px rgba(0,0,0,.35);
--shadow-lg: 0 16px 48px rgba(0,0,0,.45);
/* 焦點環(不是陰影,但用 box-shadow 實作) */
--ring: 0 0 0 3px var(--color-brand-dim), 0 0 0 1.5px var(--color-focus);
```
*為什麼陰影克制*:深色底上大範圍柔陰影會變「髒」;用邊框 + 表面階更乾淨,也呼應 flat 理念。

### 4.4 動效

```css
--ease: cubic-bezier(.2,.7,.2,1);
--dur-fast: 120ms;  --dur: 200ms;  --dur-slow: 320ms;
```
僅用於 hover、focus、進場淡入位移。**必須包在 `@media (prefers-reduced-motion: reduce)` 內關閉位移**。*為什麼*:無障礙與「克制」雙重考量。

---

## 5. 元件清單與規格

所有元件最終為 `packages/ui` 的 React + Tailwind 元件。以下列出 props 取向與視覺規格。

### 5.1 Button

| 變體 | 視覺 | 用途 |
|---|---|---|
| `primary` | brand 實心、`--color-text-onbrand` 深字 | 主 CTA:看專案 |
| `secondary` | 透明底 + `--color-border-strong` 邊框 | 次 CTA:下載 PDF |
| `ghost` | 無邊框、hover 才上 `--color-surface-2` | nav、低調動作 |
| `icon` | 正方、僅圖示,需 `aria-label` | GitHub / LinkedIn |

- 尺寸(均符合觸控目標 ≥44px,見 §7.7):`sm` `min-h 44` / `md` 44 / `lg` 48 / `xl` 56 高(`xl` 供 Hero 用);icon button 一律 ≥44×44。水平 padding 用 8px 柵格 token(`px-4`/`px-5`/`px-6`/`px-7`),圓角 `--radius-md`。*為什麼最小也要 44*:最小的 `sm`(卡片 CTA 用)若維持 32px 會低於觸控命中區下限;統一抬到 44px,觸控與視覺一致。
- 狀態:hover 提亮 / 上表面;`:focus-visible` 套 `--ring`;active `transform: scale(.98)`;disabled 降透明度 + `cursor:not-allowed`。
- *為什麼用 `:focus-visible` 而非 `:focus`*:滑鼠點擊不顯示焦點環、鍵盤操作才顯示,兼顧美觀與無障礙。
- 帶外連的 button(GitHub)附 `↗` 圖示與 `rel="noopener noreferrer"`。

### 5.2 Card(三層 + academic 第四層)

統一基底(**立體層次 / B 方向**,見 §2.1):`--color-card` 提亮表面 + 頂部 1px 高光邊(`--color-card-highlight`,`.card-surface` 工具類)、`--color-border` 細邊框、`--radius-lg`、hover 時邊框轉 `--color-border-strong` 並輕微上浮(translateY -3px)+ `--shadow-md`。內距用 8px 柵格 token(Featured/Notable `p-5`、Mini `p-4`)。Featured / Notable 另加 **左側 3px 強調條**(`.card-accent-bar`;Featured 可切 violet)。四層差異在**尺寸、資訊密度、視覺重量**:

| 層 | 用途 | grid 佔幅 | 內容密度 | 特徵 |
|---|---|---|---|---|
| **FeaturedCard** | 代表作(AI-Deployment-Pipeline、Soulshard-Hunter) | 桌機跨 2 欄、可帶縮圖/截圖區 | 高:標題 + 一段描述 + 4–6 tech badge + 雙 CTA(Live / Showcase)+ 狀態徽章 | 最大、有頂部視覺帶、accent 左邊條 |
| **NotableCard** | 值得一提(lolhelper、DiscordGuildKeeper、Smart-Pedestrian-Navigation) | 1 欄、等高 | 中:標題 + 一兩行 + 3–4 badge + 單 CTA | 標準卡 |
| **MiniCard** | 小品 / 工具(Mini-Moba、Ros-Ball-Chaser、PayTheMoney) | 緊湊 grid、可多欄 | 低:標題 + 一行 + 語言點 + 外連圖示 | 矮、密、列表感 |
| **AcademicCard / 摺疊列** | 課程作業(Verilog/ASM/C++) | 摺疊區內的列表 | 極低:名稱 + 課程/語言 tag + 外連 | 預設摺疊,`<details>` 展開 |

- *為什麼用尺寸與密度編碼層級*:讓「代表作」在視覺上自然壓過「課程作業」,招募者不需讀完就能排序重要性。
- 每張卡整體可點(`<a>` 包裹)時,內部次要連結用 `position: relative; z-index` 處理避免巢狀互動;或主卡用「stretched-link」模式並確保鍵盤可達。
- **觸控與連結指示**:卡片標題連結用 `inline-flex + min-h 44px` 撐起命中區(不改可見字級);MiniCard 的外連 GitHub 圖示用外擴 padding(`h-11 w-11`)達 44px;標題連結 hover 顯示底線(`.link-underline`,見 §7.2),不只靠顏色變化。

### 5.3 TechBadge

- 小型 pill:`--text-xs`、`--font-mono`、`--color-surface-2` 底、`--color-text-muted` 字、`--radius-sm`。
- **可選類別著色**:AI-ML 類套 `--color-accent-dim` 底 + accent 字;DevOps/Infra 類套 `--color-brand-dim` + brand 字;其餘中性。*為什麼*:讓技能與專案的技術領域可被快速掃描分群。
- 純展示性,不可聚焦(非連結);若做成可篩選的 chip 則需 `role="button"` + 鍵盤支援。

### 5.4 Nav(頂部導覽)

- 結構:左 logo/名字(`周暐倫 · Terry`)、中錨點(About / Skills / Projects / Contact)、右 LangToggle + ThemeToggle + GitHub icon。
- 行為:預設透明貼齊 Hero;捲動後加 `--color-elevated` 底 + `backdrop-filter: blur(8px)` + 細下邊框 + `--shadow-md`。
- 行動版:錨點收進漢堡選單(`<button aria-expanded aria-controls>` + 抽屜),抽屜開啟時鎖背景捲動、Esc 關閉、焦點 trap。
- 含 **Skip to content** 隱藏連結(`:focus` 才顯示),指向 `#main`。*為什麼*:鍵盤使用者可跳過導覽直達內容,是 a11y 基本盤。

### 5.5 Hero

- 結構:小 eyebrow(`OPEN TO WORK · 桃園/遠端`)→ H1 姓名 → H2 定位(全端 / AI-ML 部署 / DevOps,關鍵詞可用 brand 高亮)→ 一句價值主張 → CTA 群(`看專案` primary、`下載 PDF` secondary、`GitHub`/`LinkedIn` icon)→ 次要列(現居地、學歷一行)。
- 視覺:左文右「終端機卡片」裝飾(顯示 `whoami` / tech stack 的 mono 區塊),桌機雙欄、行動版單欄堆疊。*為什麼放終端機卡片*:用工程師語彙立刻定調身分,比抽象插畫更貼受眾。
- H1 用 `--text-4xl`,行動版降到 `--text-3xl`。CTA 在行動版改為全寬堆疊。

### 5.6 Section(區塊容器)

- 統一規格:`scroll-margin-top`(讓錨點跳轉不被固定 nav 遮)、上下 padding 用 `--space-9/10`、最大寬 `--container`、置中。
- 標頭模式:小編號或 eyebrow(`02 / SKILLS`)+ H2 標題 + 可選一句導言。
- 每個 section 用 `<section aria-labelledby>` 綁定其 H2 的 id。*為什麼*:語意分區讓螢幕報讀器可用「地標 / 標題」快速跳轉。

### 5.7 LangToggle(雙語切換)

- 形式:`繁 / EN` 的分段切換(segmented control),當前語言高亮。
- 行為:切換時更新 `<html lang>`(`zh-Hant` / `en`)與內容;選擇存 `localStorage` 並反映在 URL(`?lang=` 或 i18n route)。
- 無障礙:`role="group"` + 每顆 `aria-pressed`;`aria-label="Language / 語言"`。
- *為什麼做成分段控制而非下拉*:只有兩個選項,分段切換一眼可見當前狀態、少一次點擊。

### 5.8 ThemeToggle(主題切換)

- 形式:icon button(`sun`/`moon`),切 `data-theme`,存 `localStorage`;首次依 `prefers-color-scheme`。
- 防閃白:在 `<head>` 放一段同步 inline script,於首次繪製前套用主題。*為什麼*:避免深色使用者載入時閃一下白底。

### 5.9 Footer

- 三欄(行動版堆疊):左 = 名字 + 一句 + © 年份;中 = 站內錨點;右 = 社群 / Email / PDF。
- 含「本站技術」小字(Next.js · Tailwind · Cloudflare · Oracle A1),既是 footer 也是隱性能力展示。底部細上邊框,`--color-text-muted`。
- *為什麼列本站技術*:作品集網站本身就是一件作品,點出 stack 讓招募者知道「這站是你做的」。

### 5.10 ProjectDetail(showcase 詳情頁模板)

路由 `/projects/[slug]`,主站內容頁。模板區塊由上而下:

1. **麵包屑 + 返回**:`Projects / AI-Deployment-Pipeline`。
2. **頁首**:H1 專案名 + 一句定位 + 狀態徽章(Live / WIP / Showcase)+ 主動作列(`GitHub`、若有則 `Live demo ↗`、`下載相關文件`)。
3. **關鍵資訊條(meta bar)**:角色、時間區間、團隊規模、領域 tag。
4. **TL;DR**:3–4 條 bullet 的「做了什麼 / 解決什麼 / 成果」。
5. **技術棧**:TechBadge 分組(語言 / 框架 / 基礎設施 / ML)。
6. **內文區塊**:問題背景 → 架構(可嵌架構圖)→ 技術深度與決策 → 成果/數據 → 反思。支援程式碼區塊(mono、可複製)與圖片(含 `alt`、可點放大)。
7. **底部導覽**:上一個 / 下一個專案。

- 排版用 `--measure` 限制行寬;圖片 `loading="lazy"`;標題自動生成錨點。
- *為什麼 showcase 走主站路徑而非子網域*:它只是內容頁,不需獨立執行環境(見架構文件 3.2),避免過度工程。

### 5.11 LiveDemoShell(live demo 外殼)

子站(如 `soulshard.YOUR_DOMAIN`)頂部的薄外殼,把獨立 app 包進統一品牌:

- **頂條(48px)**:左「← 返回作品集」連回主站、中專案名、右 `GitHub` + `看 showcase` + LangToggle。背景 `--color-elevated` + 細下邊框。
- **內容區**:全幅交給該 app(遊戲畫布 / 互動)。外殼不干涉內部,只提供逃生路徑與品牌一致性。
- **載入態**:app 載入前顯示置中 spinner + 專案名。
- *為什麼要薄外殼*:子站是獨立部署,但訪客可能直接從搜尋進到子站,需要一條清楚的路徑回主站,並維持品牌一致;外殼要薄到不搶 demo 本身。

---

## 6. RWD 斷點

對齊 Tailwind 預設,語意化命名:

| 名稱 | min-width | 對應場景 |
|---|---|---|
| `sm` | 640px  | 大手機橫向 / 小平板:CTA 由堆疊轉並列 |
| `md` | 768px  | 平板:專案 grid 2 欄、nav 開始顯示錨點 |
| `lg` | 1024px | 筆電:Hero 雙欄、featured 卡跨欄、grid 3 欄 |
| `xl` | 1280px | 桌機:容器達 `--container` 上限置中、留白加大 |

策略:**mobile-first**,基礎樣式為單欄堆疊,往上加。專案 grid 用 CSS Grid `repeat(auto-fit, minmax(280px, 1fr))` 為底,featured 卡在 `lg` 以上 `grid-column: span 2`。*為什麼 mobile-first*:招募者常在手機上初次點開連結;先確保小螢幕可讀再加桌機增強。

---

## 7. 無障礙原則(Accessibility)

目標 **WCAG 2.1 AA**。落地清單:

1. **對比與不只靠顏色**:正文 / 互動元件對其背景 ≥ 4.5:1,大字與圖示 ≥ 3:1;色票已按此挑值(§2)。不只靠顏色傳達狀態——徽章同時有文字(Live / WIP)。**文字連結**(nav 錨點、footer、麵包屑、卡片標題、前後頁導航、子站外殼連結)除顏色外,**hover 一律加底線**(`.link-underline` = `text-underline-offset: 3px` + hover `underline`),確保連結在「只看一張靜態截圖 / 色弱使用者」眼中仍可辨識為可點(WCAG 1.4.1)。
2. **焦點可見**:所有互動元素 `:focus-visible` 套 `--ring`(2 像素以上、對比足夠);不可 `outline:none` 而無替代。
3. **語意標籤**:用 `<header><nav><main><section><footer>`、單一 `<h1>`、標題層級不跳級;`<section aria-labelledby>`;圖片有意義者給 `alt`、純裝飾者 `alt=""` / `aria-hidden`。
4. **鍵盤可達**:所有功能可用鍵盤完成;漢堡選單 / 主題 / 語言切換有 `aria-expanded` / `aria-pressed`;抽屜支援 Esc 關閉與焦點管理;Skip-link 直達 `#main`。
5. **動效尊重**:`prefers-reduced-motion: reduce` 時關閉位移與自動播放。
6. **語言標註**:`<html lang>` 隨 LangToggle 切換;中英混排段落必要時用 `lang` 屬性輔助報讀器。
7. **觸控目標**:所有互動命中區 ≥ 44×44px(行動版尤甚)。落地手段:Button 最小尺寸抬到 `min-h 44`;icon button `44×44`;文字連結(nav 桌機錨點、footer、麵包屑、前後頁、卡片標題、LangToggle、子站外殼)用 `min-h-[44px]` + flex 置中或外擴 padding 撐起命中區,薄外殼用負 margin 抵銷視覺位移、不撐高容器。展示性元素(TechBadge)非觸控,不受此限。
8. **可縮放**:不鎖 `user-scalable`;版面在 200% 縮放與 320px 寬下不破版。

*為什麼把 a11y 寫進設計系統而非事後補*:對技術受眾,無障礙品質是工程素養的直接證據;在 token 與元件層就內建,落地時不會漏。

---

## 8. 替代視覺方向與取捨

採用方向(本文件主軸)稱 **A:Engineer Dark(深色工程師)**——深色為主、teal/violet 雙冷色、細邊框卡片、等寬字點綴。理由見 §1。以下為兩個被評估但未採用的方向:

### 方向 B:Editorial Light(編輯式淺色)
以淺色為主、大量留白、襯線標題(如 Newsreader)配無襯線內文,像高級個人誌 / 設計師 portfolio。
*取捨*:質感優雅、列印與 HR 友善、可讀性佳;但**對技術主管的「同類感」較弱**,襯線編輯風偏向設計 / 內容創作者氣質,且淺色為主與「工程師日常深色環境」的記憶連結較淡。**未採用**:受眾優先級上,技術可信度 > 編輯優雅。可作為淺色主題的靈感來源。

### 方向 C:Bold Brutalist / Terminal(粗野終端風)
高反差、單一螢光綠 on 純黑、大量 mono 字、明顯方框與 ASCII 裝飾,整站像一個終端機。
*取捨*:辨識度與「硬核工程師」個性極強、過目不忘;但**風險高**——容易顯得花俏、犧牲可讀性與專業穩重感,對保守的招募者(大企業 / 金融)可能扣分,且大面積螢光色長時間閱讀疲勞。**未採用**:與「精準不浮誇、好聘」的定位衝突。其「終端機」元素被收斂進方向 A 的 Hero 裝飾卡與 mono 點綴,取其神而不取其過。

**最終取捨總結**:方向 A 在「專業可信(B 的優點)」與「工程師個性(C 的優點)」之間取平衡——深色立身分、克制保穩重、a11y 與細節撐起可信度,最貼合「招募者與技術主管都買單、好聘」的核心目標。
