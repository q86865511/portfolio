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
            "國立中央大學資訊工程碩士(2025/6 畢業;2025/11–2026/2 義務役,已退伍)。專長是把 AI 模型送上生產環境:碩士論文打造 YOLOv8 的端到端部署與監控平台,涵蓋 PT→ONNX→TensorRT 自動優化、多批次 × 多精度效能評測、Triton 模型上架與生命週期管理、Prometheus/Grafana 監控。退伍後獨立完成多個作品,其中三個自架上線至今(erp / soulshard / steam.terrychou.com)——從零打造的製造業 ERP(Java 21 / Spring Boot,600+ 測試,含 239 個對真實 PostgreSQL 的 Testcontainers 整合測試),以及用 Rust 與 Go 寫的維運工具(MCP 流量觀測代理、遊戲伺服器管控平台)。習慣為每個專案記錄技術取捨、用測試守住品質,擅長把研究原型做成能跑、可維運、可被驗證的系統。",
            "M.S. in Computer Science & Information Engineering, National Central University (graduated Jun 2025; mandatory military service Nov 2025 – Feb 2026, completed). I specialize in taking AI models to production: my thesis built an end-to-end deployment and monitoring platform for YOLOv8 — automated PT→ONNX→TensorRT optimization, multi-batch × multi-precision benchmarking, Triton model registration and lifecycle management, and Prometheus/Grafana monitoring. Since completing service I have shipped several independent projects, three of them self-hosted and live today (erp / soulshard / steam.terrychou.com): a from-scratch manufacturing ERP (Java 21 / Spring Boot, 600+ tests including 239 Testcontainers integration tests against a real PostgreSQL) and ops tooling in Rust and Go (an MCP traffic observability proxy and a game-server management platform). I record the trade-offs behind every project, guard quality with tests, and turn research prototypes into systems that run, can be operated, and can be verified.",
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
              </p>
              <p style={{ margin: "0 0 2px" }}>{t(p.oneLinerZh, p.oneLinerEn)}</p>
              <p style={{ margin: "0 0 2px" }}>
                <b>{t("技術", "Tech")}:</b> {p.techStack.join(", ")}
              </p>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {resumeHighlights(p).map((h, i) => (
                  <li key={i}>{t(h.zh, h.en)}</li>
                ))}
              </ul>
            </div>
          ))}
        </Block>
      ))}

      {/* 學歷 */}
      <Block title={t("學歷", "Education")}>
        {eduItems.map((e) => (
          <p key={e.period} style={{ margin: "0 0 2px" }}>
            <b>{t(e.schoolZh, e.schoolEn)}</b> — {t(e.degreeZh, e.degreeEn)} ({e.period})
          </p>
        ))}
        <p style={{ margin: "0 0 2px" }}>{t(serviceNote.zh, serviceNote.en)}</p>
      </Block>

      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
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
