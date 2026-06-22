"use client";

import { useEffect, useState } from "react";
import { eduItems, profile, skillGroups } from "@/lib/site";
import { resumeProjects, type Project } from "@/lib/projects";

type Lang = "zh" | "en";

function pick<T>(lang: Lang, zh: T, en: T): T {
  return lang === "zh" ? zh : en;
}

export function PrintView() {
  // 純文字 A4 履歷:預設淺色,支援 ?lang=zh|en
  const [lang, setLang] = useState<Lang>("zh");

  useEffect(() => {
    // 列印版強制淺色
    document.documentElement.setAttribute("data-theme", "light");
    const params = new URLSearchParams(window.location.search);
    const q = params.get("lang");
    if (q === "en" || q === "zh") {
      setLang(q);
      document.documentElement.lang = q === "zh" ? "zh-Hant" : "en";
    }
  }, []);

  const t = <T,>(zh: T, en: T): T => pick(lang, zh, en);
  const projects = resumeProjects();

  return (
    <div
      className="print-root"
      style={{
        background: "#fff",
        color: "#0E1620",
        maxWidth: "820px",
        margin: "0 auto",
        padding: "40px 48px",
        fontFamily: "var(--font-sans)",
        lineHeight: 1.55,
      }}
    >
      {/* 表頭 */}
      <header style={{ borderBottom: "2px solid #0D9488", paddingBottom: 14, marginBottom: 18 }}>
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>
          {t(`${profile.nameZh} Terry`, profile.nameEn)}
        </h1>
        <p style={{ fontSize: 15, color: "#0D9488", fontWeight: 600, marginBottom: 8 }}>
          {t("全端工程師 · AI-ML 部署 · DevOps", "Full-stack · AI-ML Deployment · DevOps")}
        </p>
        <p style={{ fontSize: 12.5, color: "#475565", display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
          <span>{profile.email}</span>
          <span>{profile.github}</span>
          <span>{profile.linkedin}</span>
          <span>{t(profile.locationZh, profile.locationEn)}</span>
        </p>
      </header>

      {/* 簡介 */}
      <Block title={t("簡介", "Summary")}>
        <p style={{ fontSize: 13 }}>
          {t(
            "資工碩士,擁有把 AI 系統實際建構並部署到生產環境的實務經驗;從推論最佳化、容器化到 CI/CD 與雲端部署一條龍。",
            profile.bioEn,
          )}
        </p>
      </Block>

      {/* 技能 */}
      <Block title={t("技能", "Skills")}>
        {skillGroups.map((g) => (
          <p key={g.titleEn} style={{ fontSize: 12.5, marginBottom: 3 }}>
            <b>{t(g.titleZh, g.titleEn)}:</b> {g.items.join(", ")}
          </p>
        ))}
      </Block>

      {/* 精選專案(featured + notable) */}
      <Block title={t("精選專案", "Selected Projects")}>
        {projects.map((p: Project) => (
          <div key={p.slug} style={{ marginBottom: 12, breakInside: "avoid" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <b style={{ fontSize: 13.5 }}>{p.repoName}</b>
              <span style={{ fontSize: 11, color: "#6B7888" }}>
                {p.techStack.slice(0, 5).join(" · ")}
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: "#333a45", margin: "2px 0 4px" }}>
              {t(p.oneLinerZh, p.oneLinerEn)}
            </p>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {p.highlights.slice(0, 2).map((h, i) => (
                <li key={i} style={{ fontSize: 12, color: "#475565" }}>
                  {t(h.zh, h.en)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Block>

      {/* 學歷 */}
      <Block title={t("學歷", "Education")}>
        {eduItems.map((e) => (
          <p key={e.period} style={{ fontSize: 12.5, marginBottom: 3 }}>
            <b>{t(e.schoolZh, e.schoolEn)}</b> — {t(e.degreeZh, e.degreeEn)}{" "}
            <span style={{ color: "#6B7888" }}>({e.period})</span>
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
    <section style={{ marginBottom: 16 }}>
      <h2
        style={{
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "#0D9488",
          marginBottom: 6,
          borderBottom: "1px solid #d6dde4",
          paddingBottom: 3,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
