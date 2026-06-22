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
  className?: string;
}

function ActionButtons({ actions }: { actions: CardAction[] }) {
  const { t } = useLang();
  return (
    <div className="flex flex-wrap gap-[10px] mt-auto">
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
          {a.play && <Play className="h-[13px] w-[13px] fill-current" aria-hidden="true" />}
          {t(a.labelZh, a.labelEn)}
          {a.arrow && <ArrowUpRight className="h-[14px] w-[14px]" aria-hidden="true" />}
        </Button>
      ))}
    </div>
  );
}

const cardBase =
  "bg-surface border border-border rounded-lg relative overflow-hidden flex flex-col transition-all duration-DEFAULT ease-ease hover:border-border-strong hover:-translate-y-[3px] hover:shadow-md";

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
  desc,
  techStack = [],
  actions = [],
  glyph,
  accentBar = "brand",
  floatBadges = [],
  className,
}: FeaturedCardProps) {
  return (
    <article className={cn(cardBase, "group", className)}>
      <div className="h-[118px] bg-gradient-to-br from-surface-2 to-elevated border-b border-border relative flex items-center justify-center overflow-hidden">
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 top-0 bottom-0 w-1",
            accentBar === "brand" ? "bg-brand" : "bg-accent",
          )}
        />
        {glyph && (
          <span
            aria-hidden="true"
            className="font-mono font-bold text-[60px] opacity-10 tracking-[-2px]"
          >
            {glyph}
          </span>
        )}
        {floatBadges.length > 0 && (
          <div className="absolute right-[18px] bottom-4 flex gap-[7px]">
            {floatBadges.map((b, i) => (
              <TechBadge key={i} category={b.category}>
                {b.label}
              </TechBadge>
            ))}
          </div>
        )}
      </div>
      <div className="p-[22px] flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-[10px]">
          <h3 className="text-[21px]">
            <CardTitle
              title={title}
              href={titleHref}
              external={titleExternal}
            />
          </h3>
          {status && <StatusBadge {...status} />}
        </div>
        {desc && (
          <p className="text-text-muted text-[14.5px] mb-4 flex-1">{desc}</p>
        )}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-[7px] mb-[18px]">
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
  desc,
  techStack = [],
  actions = [],
  className,
}: BaseCardProps) {
  return (
    <article className={cn(cardBase, "group", className)}>
      <div className="p-[22px] flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-[10px]">
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
          <p className="text-text-muted text-[14.5px] mb-4 flex-1">{desc}</p>
        )}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-[7px] mb-[18px]">
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
  langLine,
  langColor = "#6B7C8C",
  githubUrl,
  githubLabel,
  className,
}: MiniCardProps) {
  return (
    <article className={cn(cardBase, "group", className)}>
      {githubUrl && (
        <a
          href={githubUrl}
          aria-label={githubLabel ?? `${title} GitHub`}
          rel="noopener noreferrer"
          target="_blank"
          className="absolute top-[14px] right-[14px] text-text-subtle transition-colors duration-DEFAULT ease-ease group-hover:text-brand z-10"
        >
          <Github className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
      <div className="p-4 px-[18px] flex flex-col flex-1">
        <h3 className="text-base pr-6">
          <CardTitle title={title} href={titleHref} external={titleExternal} />
        </h3>
        {status && (
          <div className="mt-2">
            <StatusBadge {...status} />
          </div>
        )}
        {langLine && (
          <div className="flex items-center gap-2 text-sm text-text-subtle mt-[6px]">
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
    <a
      href={href}
      {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
      className="transition-colors duration-DEFAULT ease-ease group-hover:text-brand"
    >
      {title}
      {external && (
        <ArrowUpRight
          className="inline h-[0.8em] w-[0.8em] ml-[2px] align-baseline"
          aria-hidden="true"
        />
      )}
    </a>
  );
}

export type { ReactNode };
