"use client";

import { ArrowLeft, ArrowRight, ExternalLink, Github } from "lucide-react";
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
  githubUrl: string;
  liveUrl?: string;
  status?: { status: ProjectStatus; label: string; ariaLabel?: string };
  /** 上一個 / 下一個專案(主站 /projects/[slug])。 */
  prev?: ProjectDetailNav;
  next?: ProjectDetailNav;
  children?: ReactNode;
}

export function ProjectDetail(props: ProjectDetailProps) {
  const { t } = useLang();

  return (
    <article className="container py-9 max-w-measure">
      {/* 麵包屑 + 返回 */}
      <nav
        aria-label={t("麵包屑", "Breadcrumb")}
        className="flex items-center gap-2 text-sm text-text-muted mb-6"
      >
        <a
          href="/#projects"
          className="inline-flex items-center gap-1 hover:text-brand transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("專案", "Projects")}
        </a>
        <span aria-hidden="true">/</span>
        <span className="text-text">{props.title}</span>
      </nav>

      {/* 頁首 */}
      <header className="mb-7">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
          <h1 style={{ fontSize: "clamp(31px,5vw,39px)" }}>{props.title}</h1>
          {props.status && <StatusBadge {...props.status} />}
        </div>
        <p className="text-[19px] text-text-muted mb-5">{props.oneLiner}</p>
        <div className="flex flex-wrap gap-3">
          <Button
            as="a"
            variant="secondary"
            href={props.githubUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            GitHub
            <ExternalLink className="h-[14px] w-[14px]" aria-hidden="true" />
          </Button>
          {props.liveUrl && (
            <Button
              as="a"
              variant="primary"
              href={props.liveUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("線上遊玩 / Live demo", "Live demo")}
              <ExternalLink className="h-[14px] w-[14px]" aria-hidden="true" />
            </Button>
          )}
        </div>
      </header>

      {/* 概述 */}
      <section className="mb-7" aria-labelledby="pd-overview">
        <h2 id="pd-overview" className="text-xl mb-3">
          {t("專案概述", "Overview")}
        </h2>
        <p className="text-text-muted leading-[1.8]">{props.description}</p>
      </section>

      {/* TL;DR 亮點 */}
      {props.highlights.length > 0 && (
        <section className="mb-7" aria-labelledby="pd-highlights">
          <h2 id="pd-highlights" className="text-xl mb-3">
            {t("關鍵亮點", "Highlights")}
          </h2>
          <ul className="flex flex-col gap-3">
            {props.highlights.map((h, i) => (
              <li
                key={i}
                className="flex gap-3 text-text-muted leading-[1.7]"
              >
                <span
                  aria-hidden="true"
                  className="mt-[10px] shrink-0 w-[6px] h-[6px] rounded-full bg-brand"
                />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 技術棧 */}
      {props.techStack.length > 0 && (
        <section className="mb-7" aria-labelledby="pd-stack">
          <h2 id="pd-stack" className="text-xl mb-3">
            {t("技術棧", "Tech stack")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {props.techStack.map((tech) => (
              <TechBadge key={tech}>{tech}</TechBadge>
            ))}
          </div>
        </section>
      )}

      {/* 挑戰與取捨 */}
      {props.challenges && (
        <section className="mb-7" aria-labelledby="pd-challenges">
          <h2 id="pd-challenges" className="text-xl mb-3">
            {t("挑戰與取捨", "Challenges & trade-offs")}
          </h2>
          <p className="text-text-muted leading-[1.8]">{props.challenges}</p>
        </section>
      )}

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
              className="group inline-flex items-center gap-2 text-text-muted hover:text-brand transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="text-left">
                <span className="block text-xs text-text-subtle">
                  {t("上一個", "Previous")}
                </span>
                <span className="text-sm">
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
              className="group inline-flex items-center gap-2 text-text-muted hover:text-brand transition-colors text-right"
            >
              <span className="text-right">
                <span className="block text-xs text-text-subtle">
                  {t("下一個", "Next")}
                </span>
                <span className="text-sm">
                  {t(props.next.titleZh, props.next.titleEn)}
                </span>
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : (
            <span />
          )}
        </nav>
      )}
    </article>
  );
}
