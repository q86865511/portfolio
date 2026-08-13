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
  /** 卡片頂部封面圖(16:9);Featured 無封面時改用幾何色面帶。 */
  cover?: string;
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

/** 卡片頂部封面圖帶(16:9);decorative,標題等資訊另有文字呈現故 alt 留空。 */
function CoverImage({ src }: { src: string }) {
  return (
    <div className="border-b border-border overflow-hidden bg-surface-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        width={1200}
        height={675}
        className="block w-full aspect-video object-cover"
      />
    </div>
  );
}

/** 無封面時的幾何色面帶:簽名圖形語言(三軸色平面),每張卡由 seed 變化構圖。 */
function PlanesBand({ seed = 0 }: { seed?: number }) {
  const palettes: [string, string, string][] = [
    ["var(--color-brand)", "var(--color-accent)", "var(--color-infra)"],
    ["var(--color-accent)", "var(--color-infra)", "var(--color-brand)"],
    ["var(--color-infra)", "var(--color-brand)", "var(--color-accent)"],
  ];
  const [c1, c2, c3] = palettes[seed % palettes.length] ?? palettes[0]!;
  return (
    <div
      aria-hidden="true"
      className="h-[112px] border-b border-border bg-surface-2 relative overflow-hidden"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 112"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="330" cy="56" r="72" fill={c1} opacity="0.9" />
        <path d="M330 -16 A72 72 0 0 0 258 56 L330 56 Z" fill="var(--color-text)" />
        <circle cx="96" cy="88" r="44" fill={c2} opacity="0.85" />
        <rect x="150" y="64" width="48" height="48" rx="8" fill={c3} opacity="0.8" />
        <g fill="var(--color-text-subtle)">
          {Array.from({ length: 12 }).map((_, i) => (
            <circle
              key={i}
              cx={28 + (i % 4) * 14}
              cy={24 + Math.floor(i / 4) * 14}
              r="2"
            />
          ))}
        </g>
      </svg>
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

// 卡片基底:白面 + 細邊 + 軟陰影,hover 微浮加深(深色主題自動取對應變數)。
const cardBase =
  "card-surface border border-border rounded-lg relative overflow-hidden flex flex-col shadow-sm transition-all duration-DEFAULT ease-ease hover:border-border-strong hover:-translate-y-[3px] hover:shadow-md";

/* ─────────────── FeaturedCard ─────────────── */
export interface FeaturedCardProps extends BaseCardProps {
  /** 無封面時幾何色面帶的構圖變化 seed。 */
  patternSeed?: number;
}

export function FeaturedCard({
  title,
  titleHref,
  titleExternal,
  status,
  kind,
  cover,
  desc,
  techStack = [],
  actions = [],
  patternSeed = 0,
  className,
}: FeaturedCardProps) {
  return (
    <article className={cn(cardBase, "group", className)}>
      {cover ? (
        // 有封面時 kind 疊在封面左上角(KindTag 底色不透明,壓在圖上仍可讀)。
        <div className="relative">
          <CoverImage src={cover} />
          {kind && (
            <KindTag label={kind} className="absolute left-4 top-4 z-10" />
          )}
        </div>
      ) : (
        <div className="relative">
          <PlanesBand seed={patternSeed} />
          {kind && (
            <KindTag label={kind} className="absolute left-4 top-4 z-10" />
          )}
        </div>
      )}
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
  cover,
  desc,
  techStack = [],
  actions = [],
  className,
}: BaseCardProps) {
  return (
    <article className={cn(cardBase, "group", className)}>
      {cover && <CoverImage src={cover} />}
      <div className="p-5 flex flex-col flex-1">
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
  /** 技術徽章(精簡數量,與其他卡一致)。 */
  techStack?: string[];
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
  techStack = [],
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
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {techStack.map((tech) => (
              <TechBadge key={tech}>{tech}</TechBadge>
            ))}
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
