---
name: 周暐倫 Terry Chou — 履歷入口網站
description: 亮紙底、三軸色、幾何圓面簽名的招募者信任型作品集設計系統
colors:
  bg: "#f6f7f9"
  surface: "#ffffff"
  surface-2: "#edf0f4"
  card-highlight: "rgba(11, 18, 32, 0.04)"
  text: "#0b1220"
  text-muted: "#414d63"
  text-subtle: "#5b6b82"
  text-onbrand: "#ffffff"
  border: "rgba(11, 18, 32, 0.1)"
  border-strong: "rgba(11, 18, 32, 0.2)"
  focus: "#2563eb"
  brand: "#2563eb"
  brand-hover: "#1d4ed8"
  brand-dim: "rgba(37, 99, 235, 0.1)"
  accent: "#7c3aed"
  accent-dim: "rgba(124, 58, 237, 0.1)"
  infra: "#047857"
  infra-dim: "rgba(4, 120, 87, 0.1)"
  success: "#047857"
  success-dim: "rgba(5, 150, 105, 0.12)"
  warning: "#a16207"
  warning-dim: "rgba(161, 98, 7, 0.12)"
  danger: "#dc2626"
  danger-dim: "rgba(220, 38, 38, 0.12)"
  info: "#2563eb"
  info-dim: "rgba(37, 99, 235, 0.12)"
typography:
  display:
    fontFamily: "Schibsted Grotesk, Noto Sans TC, PingFang TC, Microsoft JhengHei, sans-serif"
    fontSize: "clamp(40px, 7.5vw, 60px)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Schibsted Grotesk, Noto Sans TC, PingFang TC, Microsoft JhengHei, sans-serif"
    fontSize: "clamp(26px, 3.5vw, 34px)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Schibsted Grotesk, Noto Sans TC, PingFang TC, Microsoft JhengHei, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Schibsted Grotesk, Noto Sans TC, PingFang TC, Microsoft JhengHei, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Chivo Mono, ui-monospace, Cascadia Code, Noto Sans Mono CJK TC, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  full: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
  "9": "96px"
  "10": "128px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.text-onbrand}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 24px"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 24px"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    size: "44px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  tech-badge:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  status-badge-live:
    backgroundColor: "{colors.success-dim}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: "4px 8px"
---

# Design System: 周暐倫 Terry Chou — 履歷入口網站

> 視覺權威:本檔記錄的是「已建成」的系統(token 來源 `packages/ui/src/styles/globals.css` 與 `packages/ui/src/tailwind-preset.ts`)。舊文件 `docs/01-design-system.md`(深色預設、teal/violet)已被本次重設計取代,不再是權威。

## Overview

**Creative North Star: 「亮紙上的幾何證據」(Geometric Evidence on Bright Paper)**

這個系統的論點是「30 秒內建立招募者信任」——它刻意**拒絕**工程師作品集的預設樣貌(深色終端機底＋霓虹強調色),改走亮紙色地面(#F6F7F9)上的現代專業感:白卡、細邊、柔陰影、負字距粗標題。可信度來自克制,不來自炫技。

個性由「三軸色系統」承載:藍(全端)、紫(AI-ML)、綠(DevOps)三色並列,對應候選人的三個能力軸,永遠以語意出現(技能圖示、技術徽章、統計色調),不做無意義裝飾。簽名圖形語言是幾何圓面構圖——實心圓、四分之一圓、半圓、墨色切片與工程點陣,出現在 Hero 面板與無封面卡片的色面帶,是整個世界唯一允許大面積使用軸色的地方。

深色主題不是第二套設計,而是同一套 token 的深藍墨衍生(`[data-theme="dark"]`,地面 #0B1220):三軸色換成提亮版(藍 #60A5FA/紫 #A78BFA/綠 #34D399),命名不變、只換值。密度上是從容的單欄敘事:1120px 容器、68ch 行寬、64px 區塊節奏。

**Key Characteristics:**
- 亮紙底預設,深藍墨深色主題為衍生(token 同名換值)
- 三軸色=語意色:藍全端/紫 AI-ML/綠 DevOps,各有 10% alpha 的 -dim 淡染
- 幾何圓面簽名圖形(circle-plane art),色彩全走 token,雙主題自動適應
- Schibsted Grotesk＋Noto Sans TC 內文、Chivo Mono 標籤的三槽字型
- 柔環境陰影＋卡片頂部 1px 內光邊,無硬偏移陰影
- 可及性是底線:44px 觸控、focus 環、reduced-motion、初始 HTML 恆可見

## Colors

亮紙灰藍地面上的墨色文字,三軸彩度只在語意處點染,整體低彩度高對比。

### Primary
- **軸一・全端藍 Brand Blue**(#2563EB):品牌主色兼全端軸色。主按鈕底色、焦點環、連結 hover、全端類技能圖示底染(brand-dim)。深色主題提亮為 #60A5FA。hover 深化為 #1D4ED8。
- **墨色 Ink**(#0B1220):文字主色,同時是幾何簽名圖形裡的「墨面」(圓的切片、半圓)與 TC 字標方塊底色。深色主題反轉為地面色。

### Secondary
- **軸二・AI-ML 紫 Violet**(#7C3AED):只用於 AI-ML 語意——ML 類技術徽章(accent-dim 底)、AI-ML 技能組圖示、簽名圖形的四分之一圓。深色 #A78BFA。
- **軸三・DevOps 綠 Infra Green**(#047857):只用於 DevOps/基礎設施語意——infra 類技術徽章、DevOps 技能組圖示、簽名圖形的半圓;同一色值兼任 success 語意(Live 徽章、開放工作機會綠點)。深色 #34D399。

### Tertiary(語意狀態色)
- **警示琥珀**(#A16207)/**危險紅**(#DC2626)/**資訊藍**(#2563EB):各配 12% alpha 的 -dim 底,用於 WIP/錯誤/Showcase 徽章。深色主題各自提亮(#FBBF24/#F87171/#60A5FA)。

### Neutral
- **亮紙地 Paper**(#F6F7F9):頁面地面。深色 #0B1220。
- **白面 Surface**(#FFFFFF):卡片、按鈕、導覽列表面。深色 #131F33(卡)/#101A2B(面)。
- **次表面 Surface-2**(#EDF0F4):ghost hover、封面帶底、圖形面板底。深色 #172338。
- **墨階文字**:主文 #0B1220、muted #414D63、subtle #5B6B82;onbrand 白。
- **邊框**:rgba(11,18,32,.1) 常規/.2 加強——低調到幾乎只剩形狀。

### Named Rules
**三軸不越位規則。** 藍=全端、紫=AI-ML、綠=DevOps,軸色永遠標記語意,不做裝飾;唯一例外是簽名幾何圖形(Hero 面板與卡片色面帶),那是三軸的儀式性同台。
**淡染規則。** 任何彩色都不直接當文字底色大面積使用——彩字必配同色系 10–12% alpha 的 -dim 淡染底(徽章、圖示座、統計色調),實色只給主按鈕與幾何圖形。

## Typography

**Display Font:** Schibsted Grotesk(拉丁,next/font 變數 `--font-latin`)
**Body Font:** 同上,CJK 落到 Noto Sans TC(`--font-tc`,unicode-range 分片自託管),再退 PingFang TC/Microsoft JhengHei
**Label/Mono Font:** Chivo Mono(`--font-mono-loaded`),退 ui-monospace

**Character:** 幾何無襯線的現代專業感——粗權重(700)配負字距的標題自信但不喧嘩,mono 只出現在小型「工程註記」(技術徽章、Kind 標籤、頁尾技術欄),像藍圖上的標註字。

### Hierarchy
- **Display**(700,clamp(40px,7.5vw,60px),1.15,-0.03em):只給 Hero 姓名一處。
- **Headline**(700,clamp(26px,3.5vw,34px),1.15,-0.02em):區塊 H2;頁尾宣言用縮小變體 clamp(24px,3.2vw,31px);Hero 角色行 clamp(21px,3.4vw,28px)。
- **Title**(700,20px/1.5 與 25px/1.35 兩級):卡片標題——Featured 卡 25px、Notable 卡 20px、Mini 卡 16px,依卡片層級遞減。
- **Body**(400,16px,1.7):內文;行寬上限 68ch(`--measure`),Hero lede 收窄至 54ch。
- **Label**(400,12px mono,1.4):技術徽章、Kind 標籤、頁尾技術註記;14px(500)用於按鈕與導覽連結。

字級表為 Major Third(1.250)階:12/14/16/20/25/31/39/49px;權重只有 400/500/700 三檔。

### Named Rules
**負字距標題規則。** 所有 h1–h3 一律 700 權重、1.15 行高、-0.02em 字距(Display 收到 -0.03em);中文標題同樣適用,靠行高而非字距讓 CJK 呼吸。

## Layout

單欄縱向敘事:1120px 容器(`--container`)置中,兩側 24px 固定 gutter;文字段落受 68ch 行寬約束。間距走 8px 柵格(4/8/12/16/24/32/48/64/96/128px),區塊節奏 `py-8`(上下 64px),錨點捲動預留 80px(`scroll-mt-20`)配 64px 高的 sticky 導覽。

Hero 在 lg 以上為 1.05fr/0.95fr 雙欄(左文字、右幾何面板,gap 48–64px),以下堆疊為單欄、CTA 按鈕全寬。斷點 640/768/1024/1280px:768px 是導覽的分水嶺(桌面橫列 vs 抽屜選單+icon 化履歷鈕)。卡片內距 24px(Mini 卡 16px),徽章群 gap 8px、按鈕群 gap 12px。

## Elevation & Depth

混合策略:柔環境陰影＋表面明度階,無硬偏移陰影。深度主要靠三層明度(bg → surface-2 → surface/card)表達,陰影只做輕量空氣感;卡片另有一條簽名細節——頂部 1px 內光邊(`inset 0 1px 0 0 rgba(11,18,32,.04)`,深色主題換白 8%),讓白卡在亮紙底上有「受光面」。

### Shadow Vocabulary
- **shadow-sm**(`0 1px 2px rgba(11,18,32,.06)`):卡片與按鈕靜置態、捲動後的導覽列。
- **shadow-md**(`0 8px 24px rgba(11,18,32,.10)`):卡片 hover 浮起態。
- **shadow-lg**(`0 20px 48px rgba(11,18,32,.14)`):保留給彈層級表面,目前少用。
- **focus ring**(`0 0 0 3px brand-dim, 0 0 0 1.5px #2563EB`):鍵盤焦點專用,只在 :focus-visible 出現。

深色主題陰影換純黑高透明版(.3/.35/.45),明度階反向(elevated 比 surface 亮)。

### Named Rules
**微浮規則。** hover 反饋的固定配方=上移 3px＋shadow-sm→md＋邊框轉 border-strong,200ms;按下則 scale(.98)。不做放大、不做發光。

## Shapes

圓角矩形的世界,四級圓角各司其職:6px(焦點環圓角)、10px(按鈕、徽章、TC 字標、選單項)、16px(卡片)、24px(Hero 幾何面板);999px 膠囊只給狀態徽章。邊框一律 1px 細線。

簽名形狀語言是**幾何圓面**:實心圓、四分之一圓(`A` 弧線 path)、半圓、圓的墨色切片,加上小半徑點陣(工程網格的密碼)。這套形狀只出現在 HeroGraphic 與卡片 PlanesBand,構圖可由 seed 輪換三軸色,但元素詞彙(圓面＋墨切片＋點陣)不變。封面圖固定 16:9。

## Components

### Buttons
- **Shape:** 圓角 10px(rounded-md),500 權重 14–16px 文字,間隙 8px 容納 lucide 圖示(16–20px)。
- **Primary:** brand 藍底白字＋shadow-sm,hover 轉 #1D4ED8;內距橫向 24px(md 級),高 44px(lg 48px/xl 56px)。
- **Secondary:** 白面＋border-strong 邊框,hover 轉 surface-2 底、邊框加深。
- **Ghost:** 透明底 muted 字,hover surface-2 底、字轉主色文字。
- **Icon:** 44×44px 方形命中區、透明底細邊,hover 同 ghost。
- **共通狀態:** active scale(.98);disabled 50% 透明;全部 min-height 44px(WCAG 觸控目標)。

### Chips(TechBadge/KindTag/StatusBadge)
- **TechBadge:** mono 12px,8px/4px 內距,10px 圓角;三軸自動著色——中性=白面灰字細邊、ML=accent-dim 底紫字、infra=infra-dim 底綠字(依技術名關鍵字推斷)。
- **KindTag**(碩士論文/大學專題等):中性 mono pill,白面不透明,可壓在封面圖上。
- **StatusBadge:** 999px 膠囊、12px/500 字重、前置 6px 圓點;live=綠、wip=琥珀、showcase=資訊藍,一律 -dim 底彩字。

### Cards / Containers
- **Corner Style:** 16px;三個層級 Featured(封面帶或幾何色面帶＋25px 標題)/Notable(20px)/Mini(16px＋右上 GitHub 圖示)。
- **Background:** `.card-surface` = card 白面＋頂部 1px 內光邊;封面帶下緣 1px 邊線隔開。
- **Shadow Strategy:** 靜置 shadow-sm,hover 微浮規則(見 Elevation)。
- **Border:** 1px border,hover 轉 border-strong。
- **Internal Padding:** 24px(Mini 16px);標題連結撐 44px 命中區、group-hover 轉主色。

### Inputs / Fields
本站無表單輸入元件(聯絡走 mailto),不虛構規格;若未來需要,遵循 secondary 按鈕的白面細邊語彙＋focus ring。

### Navigation
- sticky 頂欄 64px,初始透明無邊;捲動 >24px 後轉「玻璃紙」態:surface 88% color-mix＋10px backdrop-blur＋下邊線＋shadow-sm。
- 左側 TC 字標(32px 墨底方塊、白色粗體字)＋全名;連結 14px/500 muted 字,hover 轉主文字色＋底線(link-underline)。
- 行動版:履歷下載收成 icon 鈕留在首屏,選單為下拉抽屜(鎖捲動、Esc 關閉、44px 項高)。

### Signature: HeroGraphic 與 PlanesBand
三軸色幾何圓面構圖。HeroGraphic(560×420 viewBox,24px 圓角面板、surface-2 底):藍主圓＋墨色右半切片為核心,紫四分之一圓、綠半圓、墨小半圓、藍點、5×4 點陣依序進場(90ms stagger、700ms `hg-plane-in`:淡入＋上移 14px＋scale .96→1)。PlanesBand 是卡片版縮影(112px 高),以 seed 輪換三軸色分配。色彩全走 `var(--color-*)`,雙主題自動換裝。

### Motion(附於受影響元件)
- **時序 token:** ease `cubic-bezier(.2,.7,.2,1)`;120ms(fast)/200ms(預設)/320ms(slow)。
- **捲動 reveal:** 600ms 淡入＋上移 16px,stagger 由 `--reveal-delay` 控制;**初始 HTML 恆可見**——JS 掛上 observer 才隱藏未入視口元素,無 JS/爬蟲/列印直接看到最終態,首屏內元素不做進場。
- **reduced-motion:** 全域 kill-switch,一律停在最終態。

**一次編排規則。** 全站只有一個編排性動畫時刻(Hero 幾何進場);其餘動效皆為 200ms 級的狀態反饋。不加常駐動畫、不加視差。

## Do's and Don'ts

### Do:
- **Do** 用三軸色標記語意:全端/中性→brand 藍、AI-ML→accent 紫、DevOps→infra 綠,並一律配 -dim 淡染底(10–12% alpha)。
- **Do** 新表面走「白面＋1px 細邊＋shadow-sm＋16px 圓角」的卡片語彙,hover 用微浮規則(上移 3px、shadow-md、border-strong)。
- **Do** 讓每個可點目標 ≥44px 命中區(必要時外擴 padding＋負 margin),文字連結 hover 給底線而不只變色。
- **Do** 新增顏色時同步定義 `[data-theme="dark"]` 對應值——token 同名換值,元件端永遠只寫 `var(--color-*)`/Tailwind 語意類。
- **Do** 裝飾性圖形沿用幾何圓面詞彙(圓、四分之一圓、半圓、墨切片、點陣),色彩走 token 變數。

### Don't:
- **Don't** 回到深色終端機＋霓虹強調的工程師作品集預設——深色主題是衍生,亮紙淺色才是預設地面(方向契約明文拒絕)。
- **Don't** 把軸色當裝飾大面積鋪底或做漸層;實色軸色只屬於主按鈕與簽名幾何圖形。
- **Don't** 用硬偏移陰影、發光效果或 1px 以外的邊框粗細;深度只靠明度階＋柔環境陰影＋頂部內光邊。
- **Don't** 讓內容依賴 JS 才可見(reveal 必須維持「初始 HTML 恆可見」),也不得繞過 `prefers-reduced-motion` kill-switch 與列印強制淺色。
- **Don't** 虛構內容型元件(推薦語、假數據統計)——統計列數字一律由真實資料計算,這是產品原則在視覺層的延伸。
