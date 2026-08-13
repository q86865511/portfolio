---
version: 1
slug: "apps-main"
primary_target: "apps/main"
related_targets: []
---

# Surface brief — apps/main 首頁(履歷入口)

## Scope 與訪客模式
主站首頁(單頁式履歷)+ /projects/[slug] 詳情頁。Mode: **Persuade**——成功=台灣 HR 在 30 秒內建立「可信、專業」印象並採取行動(下載 PDF / Email / 看專案)。

## 受眾、工作、行動、證據、約束
- 受眾:台灣企業 HR 優先(手機或桌面快速掃描,中文為主);次為技術主管(深查專案與 live demo)。
- 主行動:下載 PDF 履歷(nav 常駐,行動版 icon 鈕)、Email、看專案作品。
- 證據:統計列只放真數字(由 projects.json/skillGroups 計算);live demo 連結、真實學歷年份;不虛構工作經歷與 testimonials。
- 約束:靜態匯出、雙語 client 切換、a11y 底線(skip-link/focus-visible/reduced-motion/44px/列印淺色)不得倒退。

## 選定方向與記憶點
使用者釘選參考圖(2026-08-12):淺色現代招募版。紙面 #F6F7F9 預設、深藍墨衍生深色;三軸色系統(藍=全端/紫=AI-ML/綠=DevOps)貫穿 role line、技能圖示、TechBadge、統計列、封面與詳情頁回聲。記憶點=HeroGraphic 三軸色幾何色面(hero 面板+OG+favicon+無封面卡帶+詳情頁 header 迷你回聲)。動效紀律:hero 平面進場為唯一編排時刻,其餘僅專案卡 stagger(Reveal,初始 HTML 恆可見)。

## 未決事項
- 真人照片仍未使用(幾何圖形替代,PRODUCT.md 記載照片存在於 repo 外)。
- 其餘 7 張 notable 封面為真實截圖(誠實內容)未重製;僅兩張代表作封面以 generate-covers.mjs 產製。
- LiveDemoShell 只換 token 未改版式;子站接上時再驗。
