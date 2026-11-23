"use client";

import { useEffect, useState } from "react";
import { eduItems, profile, serviceNote, skillGroups } from "@/lib/site";
import { resumeHighlights, resumeSections, type Project } from "@/lib/projects";

type Lang = "zh" | "en";

function pick<T>(lang: Lang, zh: T, en: T): T {
  return lang === "zh" ? zh : en;
}

// ATS 安全字體堆疊:Latin 用標準無襯線(Arial/Helvetica);CJK 首選 "Resume CJK"——這個 family
// 只在 generate-pdf.mjs 產 PDF 時以 @font-face 注入(Noto Sans TC 的 glyf 靜態 TTF 實例),瀏覽器直接
// 開 /print 時找不到就落到後面的系統字型。不能靠可變字型或 CFF 的 OTF(CI 的 fonts-noto-cjk、next/font
// 抓到的 Noto Sans TC、notofonts 的靜態 OTF 皆是):Chrome 印 PDF 會退化成 Type3 點陣字,檔案暴肥且
// 無真字型可供 ATS 解析。
const FONT =
  'Arial, Helvetica, "Resume CJK", "Noto Sans CJK TC", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
// 極簡純黑:全黑文字、白底、無色塊/圖示/分欄,最大化 ATS 過件率。
const INK = "#000";

// 摘要的螢光筆詞句(必須逐字出現在下方 SUMMARY 對應語言的字串中)。
const SUMMARY_MARKS = {
  zh: ["把 AI 模型真正送上線", "四個自己架站上線、任何人都能打開來看", "把設計取捨寫成文件、用測試守住品質"],
  en: [
    "getting AI models into production",
    "four are self-hosted and live for anyone to visit",
    "write down design trade-offs and protect quality with tests",
  ],
};

const SUMMARY = {
  zh: "國立中央大學資訊工程碩士(2025/6 畢業,義務役已退伍)。專長是把 AI 模型真正送上線:碩士論文做了一套 YOLOv8 部署平台,能自動把模型轉成更快的 TensorRT 格式、量測速度與準確度,並用 Prometheus/Grafana 監控 GPU 資源。退伍後獨立完成多個作品,其中四個自己架站上線、任何人都能打開來看(製造業 ERP、Steam 特價追蹤、美食推薦地圖、瀏覽器遊戲),也用 Rust、Go 寫了維運工具(AI 工具流量監視器、遊戲伺服器管理平台)。習慣把設計取捨寫成文件、用測試守住品質。",
  en: "M.S. in Computer Science & Information Engineering, National Central University (Jun 2025; military service completed). I specialize in getting AI models into production: my thesis built a YOLOv8 deployment platform that automatically converts models to the faster TensorRT format, measures speed and accuracy, and monitors GPU resources with Prometheus/Grafana. Since then I have built several projects on my own; four are self-hosted and live for anyone to visit (a manufacturing ERP, a Steam deals tracker, a restaurant-picker map, a browser game), plus Rust and Go ops tools (an AI-tool traffic monitor and a game-server manager). I write down design trade-offs and protect quality with tests.",
};

/**
 * 把 text 中每個 phrase 的第一次出現包成 <mark>。phrases 由長到短處理,與已標範圍重疊者略過(長者優先)。
 * 找不到的 phrase 在此靜默略過——phrase 可能屬於同案另一段文字,是否整體找不到由 assertMarksFound 檢查。
 */
export function markPhrases(text: string, phrases: readonly string[]): React.ReactNode {
  const ranges: Array<[number, number]> = [];
  for (const ph of [...phrases].sort((a, b) => b.length - a.length)) {
    if (!ph) continue;
    const start = text.indexOf(ph);
    if (start === -1) continue;
    const end = start + ph.length;
    if (ranges.some(([s, e]) => start < e && end > s)) continue;
    ranges.push([start, end]);
  }
  if (ranges.length === 0) return text;
  ranges.sort((a, b) => a[0] - b[0]);
  const parts: React.ReactNode[] = [];
  let pos = 0;
  ranges.forEach(([s, e], i) => {
    if (s > pos) parts.push(text.slice(pos, s));
    parts.push(<mark key={i} className="hl">{text.slice(s, e)}</mark>);
    pos = e;
  });
  if (pos < text.length) parts.push(text.slice(pos));
  return <>{parts}</>;
}

/** 螢光筆詞句在 texts 中一個都沒出現就 throw(靜默失效會讓重點默默消失;風格同 resumeSections 的 slug 檢查)。 */
export function assertMarksFound(
  slug: string,
  lang: Lang,
  phrases: readonly string[],
  texts: readonly string[],
): void {
  for (const ph of phrases) {
    if (!texts.some((tx) => tx.includes(ph)))
      throw new Error(`螢光筆詞句在 ${slug} (${lang}) 的印出文字中找不到:"${ph}"`);
  }
}

function projectTexts(p: Project, lang: Lang): string[] {
  return [lang === "zh" ? p.oneLinerZh : p.oneLinerEn, ...resumeHighlights(p).map((h) => h[lang])];
}

export function PrintView() {
  // 純文字 A4 履歷(ATS 格式):預設淺色,支援 ?lang=zh|en
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    const params = new URLSearchParams(window.location.search);
    const q = params.get("lang");
    if (q === "en" || q === "zh") {
      setLang(q);
      document.documentElement.lang = q === "zh" ? "zh-Hant" : "en";
      // 供 generate-pdf 等待語言已套用後再截圖(避免抓到預設語言)。
      document.documentElement.setAttribute("data-print-lang", q);
    }
  }, []);

  const t = <T,>(zh: T, en: T): T => pick(lang, zh, en);
  const sections = resumeSections();

  // 兩種語言都檢查(不論目前顯示哪種),讓 build 階段就能抓到失效的詞句。
  for (const l of ["zh", "en"] as const) {
    assertMarksFound("summary", l, SUMMARY_MARKS[l], [SUMMARY[l]]);
    for (const s of sections)
      for (const p of s.projects)
        assertMarksFound(p.slug, l, p.resumeMarks?.[l] ?? [], projectTexts(p, l));
  }

  return (
    <div
      className="print-root"
      style={{
        background: "#fff",
        color: INK,
        maxWidth: "820px",
        margin: "0 auto",
        padding: "40px 48px",
        fontFamily: FONT,
        fontSize: 12,
        lineHeight: 1.45,
      }}
    >
      {/* 表頭:姓名 + 職稱 + 純文字聯絡資訊(單欄、無 flex、可被 ATS 解析) */}
      <header style={{ marginBottom: 14 }}>
        <h1 style={{ fontSize: 24, margin: "0 0 2px", color: INK }}>
          {t(`${profile.nameZh}(Terry Chou)`, profile.nameEn)}
        </h1>
        <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 6px", color: INK }}>
          {t(
            "全端工程師 / AI-ML 部署 / DevOps",
            "Full-stack Engineer / AI-ML Deployment / DevOps",
          )}
        </p>
        <p style={{ fontSize: 12, margin: "0 0 1px", color: INK }}>
          {profile.email} | {t(profile.locationZh, profile.locationEn)} |{" "}
          {t(profile.website, `${profile.website}/?lang=en`)}
        </p>
        <p style={{ fontSize: 12, margin: 0, color: INK }}>
          {profile.github} | {profile.linkedin}
        </p>
      </header>

      {/* 摘要 */}
      <Block title={t("摘要", "Summary")}>
        <p style={{ margin: 0 }}>
          {markPhrases(SUMMARY[lang], SUMMARY_MARKS[lang])}
        </p>
      </Block>

      {/* 學歷 */}
      <Block title={t("學歷", "Education")}>
        {eduItems.map((e) => (
          <p key={e.period} style={{ margin: "0 0 2px" }}>
            <b>{t(e.schoolZh, e.schoolEn)}</b> — {t(e.degreeZh, e.degreeEn)} ({e.period})
          </p>
        ))}
        <p style={{ margin: "0 0 2px" }}>{t(serviceNote.zh, serviceNote.en)}</p>
      </Block>

      {/* 技能(線性列出,利於關鍵字比對) */}
      <Block title={t("技能", "Skills")}>
        {skillGroups.map((g) => (
          <p key={g.titleEn} style={{ margin: "0 0 2px" }}>
            <b>{t(g.titleZh, g.titleEn)}:</b> {g.items.join(", ")}
          </p>
        ))}
      </Block>

      {/* 專案分兩區(學術 / side projects),分區與順序由 RESUME_SECTIONS 決定;技術完整列出供 ATS 比對 */}
      {sections.map((s) => (
        <Block key={s.titleEn} title={t(s.titleZh, s.titleEn)}>
          {s.projects.map((p: Project) => (
            <div key={p.slug} style={{ marginBottom: 10, breakInside: "avoid" }}>
              <p style={{ margin: "0 0 1px", fontWeight: 700 }}>
                {t(p.titleZh, p.titleEn)}
                {p.kindZh ? ` (${t(p.kindZh, p.kindEn ?? p.kindZh)})` : ""}
                {p.periodZh ? (
                  <span style={{ fontWeight: 400 }}> · {t(p.periodZh, p.periodEn ?? p.periodZh)}</span>
                ) : null}
                {p.liveUrl ? (
                  <span style={{ fontWeight: 400 }}>
                    {" "}· {t("線上", "Live")}: <a href={p.liveUrl} style={{ color: INK }}>{p.liveUrl}</a>
                  </span>
                ) : null}
              </p>
              <p style={{ margin: "0 0 2px" }}>
                {markPhrases(t(p.oneLinerZh, p.oneLinerEn), p.resumeMarks?.[lang] ?? [])}
              </p>
              <p style={{ margin: "0 0 2px" }}>
                <b>{t("技術", "Tech")}:</b> {p.techStack.join(", ")}
              </p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {resumeHighlights(p).map((h, i) => (
                  <li key={i}>{markPhrases(h[lang], p.resumeMarks?.[lang] ?? [])}</li>
                ))}
              </ul>
            </div>
          ))}
        </Block>
      ))}

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          .print-root { padding: 0 !important; max-width: none !important; }
        }
        /* 螢光筆:只是背景,文字層不變;需 printBackground 才會印出 */
        mark.hl {
          background: linear-gradient(transparent 52%, #FFE27A 52%);
          color: inherit;
          padding: 0 1px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 12 }}>
      <h2
        style={{
          fontSize: 12.5,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#000",
          fontWeight: 700,
          margin: "0 0 5px",
          borderBottom: "1px solid #000",
          paddingBottom: 2,
          breakAfter: "avoid",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
