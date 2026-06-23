"use client";

import { useEffect, useState } from "react";
import { eduItems, profile, skillGroups } from "@/lib/site";
import { resumeProjects, type Project } from "@/lib/projects";

type Lang = "zh" | "en";

function pick<T>(lang: Lang, zh: T, en: T): T {
  return lang === "zh" ? zh : en;
}

// ATS 安全字體堆疊:Latin 用標準無襯線(Arial/Helvetica),CJK 交給系統字體 fallback。
const FONT =
  'Arial, Helvetica, "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
// 極簡純黑:全黑文字、白底、無色塊/圖示/分欄,最大化 ATS 過件率。
const INK = "#000";

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
  const projects = resumeProjects();

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
        fontSize: 12.5,
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
          {profile.email} | {t(profile.locationZh, profile.locationEn)} | {profile.website}
        </p>
        <p style={{ fontSize: 12, margin: 0, color: INK }}>
          {profile.github} | {profile.linkedin}
        </p>
      </header>

      {/* 摘要 */}
      <Block title={t("摘要", "Summary")}>
        <p style={{ margin: 0 }}>
          {t(
            "資訊工程碩士。具備把 AI 系統從研究原型建構並部署到生產環境的實務經驗,涵蓋推論最佳化(ONNX / TensorRT / Triton)、容器化、CI/CD 與雲端自動化部署與監控;同時具全端開發與遊戲/圖形實作經驗。",
            "M.S. in Computer Science with hands-on experience taking AI systems from research prototype to production — inference optimization (ONNX / TensorRT / Triton), containerization, CI/CD, and automated cloud deployment and monitoring — alongside full-stack and game/graphics development.",
          )}
        </p>
      </Block>

      {/* 技能(線性列出,利於關鍵字比對) */}
      <Block title={t("技能", "Skills")}>
        {skillGroups.map((g) => (
          <p key={g.titleEn} style={{ margin: "0 0 2px" }}>
            <b>{t(g.titleZh, g.titleEn)}:</b> {g.items.join(", ")}
          </p>
        ))}
      </Block>

      {/* 精選專案(featured + notable);技術完整列出供 ATS 比對 */}
      <Block title={t("精選專案", "Selected Projects")}>
        {projects.map((p: Project) => (
          <div key={p.slug} style={{ marginBottom: 10, breakInside: "avoid" }}>
            <p style={{ margin: "0 0 1px", fontWeight: 700 }}>
              {t(p.titleZh, p.titleEn)}
              {p.kindZh ? ` (${t(p.kindZh, p.kindEn ?? p.kindZh)})` : ""}
            </p>
            <p style={{ margin: "0 0 2px" }}>{t(p.oneLinerZh, p.oneLinerEn)}</p>
            <p style={{ margin: "0 0 2px" }}>
              <b>{t("技術", "Tech")}:</b> {p.techStack.join(", ")}
            </p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {p.highlights.slice(0, 2).map((h, i) => (
                <li key={i}>{t(h.zh, h.en)}</li>
              ))}
            </ul>
          </div>
        ))}
      </Block>

      {/* 學歷 */}
      <Block title={t("學歷", "Education")}>
        {eduItems.map((e) => (
          <p key={e.period} style={{ margin: "0 0 2px" }}>
            <b>{t(e.schoolZh, e.schoolEn)}</b> — {t(e.degreeZh, e.degreeEn)} ({e.period})
          </p>
        ))}
      </Block>

      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          .print-root { padding: 0 !important; max-width: none !important; }
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
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
