"use client";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ExternalLink,
  Github,
  Tag,
} from "lucide-react";
import { type ReactNode } from "react";
import { useLang } from "../providers/LangProvider";
import { Button } from "./Button";
import { StatusBadge, type ProjectStatus } from "./StatusBadge";
import { TechBadge } from "./TechBadge";

export interface ProjectDetailNav {
  slug: string;
  titleZh: string;
  titleEn: string;
}

export interface ProjectDetailProps {
  title: string;
  oneLiner: string;
  description: string;
  highlights: string[];
  techStack: string[];
  challenges: string;
  /** 私有 repo 傳空字串或省略,不顯示 GitHub 按鈕。 */
  githubUrl?: string;
  liveUrl?: string;
  /** 封面圖路徑(16:9);提供時於頁首下方顯示。 */
  cover?: string;
  status?: { status: ProjectStatus; label: string; ariaLabel?: string };
  /** 學術/來源標籤(如 碩士論文)。 */
  kind?: string;
  /** 專案期間(如 2026/6 – 至今)。 */
  period?: string;
  /** 上一個 / 下一個專案(主站 /projects/[slug])。 */
  prev?: ProjectDetailNav;
  next?: ProjectDetailNav;
  children?: ReactNode;
}

/**
 * 長段落依句號切成數段(只改排版、不改字):約每 160 字(英文約 420 字元)換一段,
 * 避免詳情頁出現整片文字牆。
 */
function splitParagraphs(text: string): string[] {
  const sentences = text.match(/[^。！？!?]+[。！？!?]+|[^。！？!?]+$/g) ?? [text];
  // 英文稿可能夾雜少量中文專有名詞,以中文字比例判斷語言。
  const cjkCount = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const isCjk = cjkCount > text.length * 0.2;
  const limit = isCjk ? 160 : 420;
  // 英文以 ". " 斷句(上面的 regex 只抓中文標點與 !?)。
  const parts = isCjk
    ? sentences
    : text.split(/(?<=\.)\s+(?=[A-Z(])/);
  const out: string[] = [];
  let buf = "";
  for (const part of parts) {
    if (buf && buf.length + part.length > limit) {
      out.push(buf.trim());
      buf = "";
    }
    buf += isCjk ? part : `${part} `;
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

export function ProjectDetail(props: ProjectDetailProps) {
  const { t } = useLang();

  return (
    <article className="container py-9 max-w-[1120px]">
      {/* 麵包屑 + 返回 */}
      <nav
        aria-label={t("麵包屑", "Breadcrumb")}
        className="flex items-center gap-2 text-sm text-text-muted mb-5"
      >
        <a
          href="/#projects"
          className="link-underline inline-flex items-center gap-1 min-h-[44px] hover:text-brand transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("專案", "Projects")}
        </a>
        <span aria-hidden="true">/</span>
        <span className="text-text">{props.title}</span>
      </nav>

      {/* 頁首 */}
      <header className="mb-7">
        {/* 簽名幾何回聲:與首頁 HeroGraphic 同一套三軸色面語言 */}
        <svg
          aria-hidden="true"
          viewBox="0 0 96 24"
          className="h-[20px] w-auto mb-4"
        >
          <path d="M0 24 A24 24 0 0 1 24 0 L24 24 Z" fill="var(--color-accent)" />
          <circle cx="48" cy="12" r="12" fill="var(--color-brand)" />
          <path d="M48 0 A12 12 0 0 1 48 24 Z" fill="var(--color-text)" />
          <path d="M72 24 A12 12 0 0 1 96 24 Z" fill="var(--color-infra)" />
        </svg>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
          <h1 style={{ fontSize: "clamp(31px,5vw,39px)" }}>{props.title}</h1>
          {props.status && <StatusBadge {...props.status} />}
        </div>
        <p className="text-lg text-text-muted mb-4 max-w-measure">
          {props.oneLiner}
        </p>
        {(props.kind || props.period) && (
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-muted mb-5">
            {props.kind && (
              <li className="inline-flex items-center gap-2">
                <Tag className="h-4 w-4 text-text-subtle" aria-hidden="true" />
                {props.kind}
              </li>
            )}
            {props.period && (
              <li className="inline-flex items-center gap-2">
                <CalendarDays
                  className="h-4 w-4 text-text-subtle"
                  aria-hidden="true"
                />
                <span className="sr-only">{t("期間:", "Period: ")}</span>
                <span className="font-mono">{props.period}</span>
              </li>
            )}
          </ul>
        )}
        <div className="flex flex-wrap gap-3">
          {props.githubUrl && (
            <Button
              as="a"
              variant="secondary"
              href={props.githubUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github className="h-4 w-4" aria-hidden="true" />
              GitHub
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
          {props.liveUrl && (
            <Button
              as="a"
              variant="primary"
              href={props.liveUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("線上體驗 / Live demo", "Live demo")}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
        </div>
      </header>

      {props.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={props.cover}
          alt=""
          width={1408}
          height={792}
          className="block w-full rounded-lg border border-border shadow-sm mb-8"
        />
      )}

      {/* 桌機雙欄:左=亮點→概述→取捨(先給結論再給細節),右=黏性側欄技術棧 */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-8 lg:gap-9 items-start">
        <div className="min-w-0 max-w-measure">
          {/* TL;DR 亮點 */}
          {props.highlights.length > 0 && (
            <section className="mb-8" aria-labelledby="pd-highlights">
              <h2 id="pd-highlights" className="text-xl mb-4">
                {t("關鍵亮點", "Highlights")}
              </h2>
              <ol className="flex flex-col gap-3">
                {props.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="card-surface border border-border rounded-lg p-4 flex gap-4 text-text-muted leading-[1.7]"
                  >
                    <span
                      aria-hidden="true"
                      className="shrink-0 w-[28px] h-[28px] rounded-md bg-brand-dim text-brand font-mono text-sm font-bold flex items-center justify-center"
                    >
                      {i + 1}
                    </span>
                    <span>{h}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* 概述 */}
          <section className="mb-8" aria-labelledby="pd-overview">
            <h2 id="pd-overview" className="text-xl mb-3">
              {t("專案概述", "Overview")}
            </h2>
            <div className="flex flex-col gap-4 text-text-muted leading-[1.85]">
              {splitParagraphs(props.description).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>

          {/* 挑戰與取捨 */}
          {props.challenges && (
            <section className="mb-8" aria-labelledby="pd-challenges">
              <h2 id="pd-challenges" className="text-xl mb-3">
                {t("挑戰與取捨", "Challenges & trade-offs")}
              </h2>
              <div className="border-l-2 border-accent pl-5 flex flex-col gap-4 text-text-muted leading-[1.85]">
                {splitParagraphs(props.challenges).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* 側欄:技術棧(桌機黏在視窗內,讀長文時隨時可對照) */}
        {props.techStack.length > 0 && (
          <aside
            aria-labelledby="pd-stack"
            className="card-surface border border-border rounded-lg shadow-sm p-5 lg:sticky lg:top-24"
          >
            <h2 id="pd-stack" className="text-base mb-3">
              {t("技術棧", "Tech stack")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {props.techStack.map((tech) => (
                <TechBadge key={tech}>{tech}</TechBadge>
              ))}
            </div>
          </aside>
        )}
      </div>

      {props.children}

      {/* 底部導覽 */}
      {(props.prev || props.next) && (
        <nav
          aria-label={t("專案導覽", "Project navigation")}
          className="flex justify-between gap-4 mt-8 pt-6 border-t border-border"
        >
          {props.prev ? (
            <a
              href={`/projects/${props.prev.slug}/`}
              className="group inline-flex items-center gap-2 min-h-[44px] py-2 text-text-muted hover:text-brand transition-colors"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="text-left">
                <span className="block text-xs text-text-subtle">
                  {t("上一個", "Previous")}
                </span>
                <span className="text-sm group-hover:underline underline-offset-[3px]">
                  {t(props.prev.titleZh, props.prev.titleEn)}
                </span>
              </span>
            </a>
          ) : (
            <span />
          )}
          {props.next ? (
            <a
              href={`/projects/${props.next.slug}/`}
              className="group inline-flex items-center gap-2 min-h-[44px] py-2 text-text-muted hover:text-brand transition-colors text-right"
            >
              <span className="text-right">
                <span className="block text-xs text-text-subtle">
                  {t("下一個", "Next")}
                </span>
                <span className="text-sm group-hover:underline underline-offset-[3px]">
                  {t(props.next.titleZh, props.next.titleEn)}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
          ) : (
            <span />
          )}
        </nav>
      )}
    </article>
  );
}
