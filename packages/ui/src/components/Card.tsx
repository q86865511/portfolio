"use client";

import { ArrowUpRight, Github, Play } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "../lib/cn";
import { useLang } from "../providers/LangProvider";
import { Button } from "./Button";
import { StatusBadge, type ProjectStatus } from "./StatusBadge";
import { TechBadge } from "./TechBadge";

export interface CardAction {
  labelZh: string;
  labelEn: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  external?: boolean;
  /** 在 label 前加播放圖示(live demo)。 */
  play?: boolean;
  /** 在 label 後加外連箭頭。 */
  arrow?: boolean;
}

interface BaseCardProps {
  title: string;
  /** 標題連結(可選);省略則純文字。 */
  titleHref?: string;
  titleExternal?: boolean;
  status?: { status: ProjectStatus; label: string; ariaLabel?: string };
  desc?: string;
  techStack?: string[];
  actions?: CardAction[];
  /** 學術/來源標籤(碩士論文 / 大學專題 / 課程專案),可選。 */
  kind?: string;
  className?: string;
}

function ActionButtons({ actions }: { actions: CardAction[] }) {
  const { t } = useLang();
  return (
    <div className="flex flex-wrap gap-3 mt-auto">
      {actions.map((a, i) => (
        <Button
          key={i}
          as="a"
          size="sm"
          variant={a.variant ?? "secondary"}
          href={a.href}
          {...(a.external
            ? { rel: "noopener noreferrer", target: "_blank" }
            : {})}
        >
          {a.play && <Play className="h-4 w-4 fill-current" aria-hidden="true" />}
          {t(a.labelZh, a.labelEn)}
          {a.arrow && <ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      ))}
    </div>
  );
}

/** 學術/來源小標籤(碩士論文 / 大學專題 / 課程專案);中性 mono pill,與 status 徽章區隔。 */
function KindTag({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-xs px-2 py-1 rounded-md bg-surface border border-border text-text-muted",
        className,
      )}
    >
      {label}
    </span>
  );
}

// B 立體層次:提亮表面(card-surface) + 頂部高光邊 + hover 上浮,
// 高光邊與表面色取自 globals.css 的 --color-card* 變數(深淺色各一)。
const cardBase =
  "card-surface border border-border rounded-lg relative overflow-hidden flex flex-col transition-all duration-DEFAULT ease-ease hover:border-border-strong hover:-translate-y-[3px] hover:shadow-md";

/* ─────────────── FeaturedCard ─────────────── */
export interface FeaturedCardProps extends BaseCardProps {
  /** 頂部視覺帶的 glyph(大字水印)。 */
  glyph?: string;
  /** 左側 accent 條顏色。 */
  accentBar?: "brand" | "accent";
  /** 頂部漂浮 badge。 */
  floatBadges?: { label: string; category?: "ml" | "infra" | "neutral" }[];
}

export function FeaturedCard({
  title,
  titleHref,
  titleExternal,
  status,
  kind,
  desc,
  techStack = [],
  actions = [],
  glyph,
  accentBar = "brand",
  floatBadges = [],
  className,
}: FeaturedCardProps) {
  return (
    <article
      className={cn(
        cardBase,
        "group card-accent-bar",
        accentBar === "accent" && "card-accent-bar-accent",
        className,
      )}
    >
      <div className="h-[120px] bg-gradient-to-br from-surface-2 to-elevated border-b border-border relative flex items-center justify-center overflow-hidden">
        {kind && <KindTag label={kind} className="absolute left-4 top-4 z-10" />}
        {glyph && (
          <span
            aria-hidden="true"
            className="font-mono font-bold text-[60px] opacity-10 tracking-[-2px]"
          >
            {glyph}
          </span>
        )}
        {floatBadges.length > 0 && (
          <div className="absolute right-4 bottom-4 flex gap-2">
            {floatBadges.map((b, i) => (
              <TechBadge key={i} category={b.category}>
                {b.label}
              </TechBadge>
            ))}
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-xl">
            <CardTitle
              title={title}
              href={titleHref}
              external={titleExternal}
            />
          </h3>
          {status && <StatusBadge {...status} />}
        </div>
        {desc && (
          <p className="text-text-muted text-sm mb-4 flex-1">{desc}</p>
        )}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {techStack.map((tech) => (
              <TechBadge key={tech}>{tech}</TechBadge>
            ))}
          </div>
        )}
        {actions.length > 0 && <ActionButtons actions={actions} />}
      </div>
    </article>
  );
}

/* ─────────────── NotableCard ─────────────── */
export function NotableCard({
  title,
  titleHref,
  titleExternal,
  status,
  kind,
  desc,
  techStack = [],
  actions = [],
  className,
}: BaseCardProps) {
  return (
    <article className={cn(cardBase, "group card-accent-bar", className)}>
      <div className="p-5 pl-6 flex flex-col flex-1">
        {kind && (
          <div className="mb-2">
            <KindTag label={kind} />
          </div>
        )}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg">
            <CardTitle
              title={title}
              href={titleHref}
              external={titleExternal}
            />
          </h3>
          {status && <StatusBadge {...status} />}
        </div>
        {desc && (
          <p className="text-text-muted text-sm mb-4 flex-1">{desc}</p>
        )}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {techStack.map((tech) => (
              <TechBadge key={tech}>{tech}</TechBadge>
            ))}
          </div>
        )}
        {actions.length > 0 && <ActionButtons actions={actions} />}
      </div>
    </article>
  );
}

/* ─────────────── MiniCard ─────────────── */
export interface MiniCardProps {
  title: string;
  titleHref?: string;
  titleExternal?: boolean;
  status?: { status: ProjectStatus; label: string; ariaLabel?: string };
  /** 學術/來源標籤,可選。 */
  kind?: string;
  /** 語言 / 一行說明。 */
  langLine?: string;
  /** 語言點顏色。 */
  langColor?: string;
  /** 外連 GitHub 圖示連結。 */
  githubUrl?: string;
  githubLabel?: string;
  className?: string;
}

export function MiniCard({
  title,
  titleHref,
  titleExternal,
  status,
  kind,
  langLine,
  langColor = "#6B7C8C",
  githubUrl,
  githubLabel,
  className,
}: MiniCardProps) {
  return (
    <article className={cn(cardBase, "group", className)}>
      {githubUrl && (
        // 觸控目標 ≥44px:圖示外擴 padding 撐起命中區,負 margin 抵銷視覺位移。
        <a
          href={githubUrl}
          aria-label={githubLabel ?? `${title} GitHub`}
          rel="noopener noreferrer"
          target="_blank"
          className="absolute top-2 right-2 -m-1 inline-flex h-11 w-11 items-center justify-center text-text-subtle transition-colors duration-DEFAULT ease-ease group-hover:text-brand z-10"
        >
          <Github className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base pr-7">
          <CardTitle title={title} href={titleHref} external={titleExternal} />
        </h3>
        {kind && (
          <div className="mt-2">
            <KindTag label={kind} />
          </div>
        )}
        {status && (
          <div className="mt-2">
            <StatusBadge {...status} />
          </div>
        )}
        {langLine && (
          <div className="flex items-center gap-2 text-sm text-text-subtle mt-1">
            <span
              aria-hidden="true"
              className="w-[9px] h-[9px] rounded-full"
              style={{ background: langColor }}
            />
            {langLine}
          </div>
        )}
      </div>
    </article>
  );
}

/* ─────────────── 共用標題 ─────────────── */
function CardTitle({
  title,
  href,
  external,
}: {
  title: string;
  href?: string;
  external?: boolean;
}) {
  if (!href) return <span>{title}</span>;
  return (
    // 觸控目標 ≥44px:標題連結用 inline-flex + min-h 撐起命中區,
    // 不改變可見字級,僅擴大可點高度。
    <a
      href={href}
      {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
      className="link-underline inline-flex items-center min-h-[44px] transition-colors duration-DEFAULT ease-ease group-hover:text-brand"
    >
      {title}
      {external && (
        <ArrowUpRight
          className="inline h-[0.8em] w-[0.8em] ml-0.5 align-baseline shrink-0"
          aria-hidden="true"
        />
      )}
    </a>
  );
}

export type { ReactNode };
