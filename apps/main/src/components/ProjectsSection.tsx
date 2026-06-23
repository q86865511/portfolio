"use client";

import {
  FeaturedCard,
  MiniCard,
  NotableCard,
  useLang,
  type CardAction,
} from "@resume/ui";
import { ChevronDown, ExternalLink } from "lucide-react";
import {
  isWip,
  primaryLink,
  projectsByTier,
  type Project,
} from "@/lib/projects";

/** 依語言取得 GitHub 短名供 mini card 顯示。 */
function langLineFor(p: Project): string {
  return p.techStack.slice(0, 2).join(" · ");
}

/** 語言點顏色(常見語言概略對照)。 */
function langColor(p: Project): string {
  const first = p.techStack[0]?.toLowerCase() ?? "";
  if (first.includes("godot")) return "#478CBF";
  if (first.includes("c++")) return "#F34B7D";
  if (first.includes("ros")) return "#22314E";
  if (first.includes("node") || first.includes("javascript")) return "#F1E05A";
  if (first.includes("python")) return "#3572A5";
  return "#6B7C8C";
}

/** 專案狀態徽章。 */
function statusFor(
  p: Project,
  t: <T>(zh: T, en: T) => T,
):
  | { status: "live" | "wip" | "showcase"; label: string; ariaLabel?: string }
  | undefined {
  if (isWip(p.slug)) {
    return {
      status: "wip",
      label: t("進行中", "WIP"),
      ariaLabel: t("狀態:開發中", "Status: work in progress"),
    };
  }
  if (p.presentation === "live-demo") {
    return {
      status: "live",
      label: "Live",
      ariaLabel: t("狀態:可線上遊玩", "Status: playable live"),
    };
  }
  if (p.presentation === "showcase") {
    return { status: "showcase", label: "Showcase" };
  }
  return undefined;
}

/** 卡片動作:依連結規則組出主/次按鈕,每張都附 GitHub。 */
function actionsFor(p: Project): CardAction[] {
  const actions: CardAction[] = [];
  const link = primaryLink(p);

  if (p.presentation === "live-demo" && p.liveUrl) {
    actions.push({
      labelZh: "線上遊玩",
      labelEn: "Live demo",
      href: p.liveUrl,
      variant: "primary",
      external: true,
      play: true,
    });
    actions.push({
      labelZh: "看詳情",
      labelEn: "Details",
      href: `/projects/${p.slug}/`,
      variant: "secondary",
    });
  } else if (p.presentation === "showcase") {
    actions.push({
      labelZh: "看詳情",
      labelEn: "Details",
      href: link.href,
      variant: "secondary",
    });
  }

  actions.push({
    labelZh: "GitHub",
    labelEn: "GitHub",
    href: p.githubUrl,
    variant: "ghost",
    external: true,
    arrow: true,
  });
  return actions;
}

export function ProjectsSection() {
  const { t } = useLang();
  const groups = projectsByTier();

  return (
    <>
      {/* FEATURED */}
      <TierBlock
        name={t("Featured · 代表作", "Featured")}
        count={groups.featured.length}
      >
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2">
          {groups.featured.map((p, i) => (
            <FeaturedCard
              key={p.slug}
              title={p.repoName}
              titleHref={primaryLink(p).href}
              titleExternal={primaryLink(p).external}
              status={statusFor(p, t)}
              desc={t(p.oneLinerZh, p.oneLinerEn)}
              techStack={p.techStack.slice(0, 5)}
              actions={actionsFor(p)}
              glyph={i === 0 ? "AI" : "λ"}
              accentBar={i === 0 ? "accent" : "brand"}
            />
          ))}
        </div>
      </TierBlock>

      {/* NOTABLE */}
      <TierBlock
        name={t("Notable · 值得一提", "Notable")}
        count={groups.notable.length}
      >
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {groups.notable.map((p) => (
            <NotableCard
              key={p.slug}
              title={p.repoName}
              titleHref={primaryLink(p).href}
              titleExternal={primaryLink(p).external}
              status={statusFor(p, t)}
              desc={t(p.oneLinerZh, p.oneLinerEn)}
              techStack={p.techStack.slice(0, 4)}
              actions={actionsFor(p)}
            />
          ))}
        </div>
      </TierBlock>

      {/* MINI */}
      <TierBlock
        name={t("Mini · 小品與工具", "Mini · tools")}
        count={groups.mini.length}
      >
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {groups.mini.map((p) => {
            const link = primaryLink(p);
            return (
              <MiniCard
                key={p.slug}
                title={p.repoName}
                titleHref={link.href}
                titleExternal={link.external}
                status={statusFor(p, t)}
                langLine={langLineFor(p)}
                langColor={langColor(p)}
                githubUrl={p.githubUrl}
                githubLabel={t(
                  `${p.repoName} GitHub(另開新視窗)`,
                  `${p.repoName} GitHub (opens in new tab)`,
                )}
              />
            );
          })}
        </div>
      </TierBlock>

      {/* ACADEMIC(摺疊) */}
      {groups.academic.length > 0 && (
        <div className="mb-0">
          <details className="card-surface border border-border rounded-lg overflow-hidden group/details">
            <summary className="px-5 py-4 min-h-[44px] cursor-pointer font-medium flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
              <span>
                {t(
                  "Academic · 課程與學術專案(Verilog / Assembly / C++)",
                  "Academic · coursework (Verilog / Assembly / C++)",
                )}
              </span>
              <ChevronDown
                className="h-5 w-5 text-text-muted transition-transform duration-DEFAULT ease-ease group-open/details:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {groups.academic.map((p) => (
                <a
                  key={p.slug}
                  href={p.githubUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="link-underline flex items-center justify-between gap-3 min-h-[44px] px-4 py-3 bg-surface-2 rounded-md text-sm hover:text-brand transition-colors"
                >
                  <span>{t(p.titleZh, p.titleEn)}</span>
                  <span className="font-mono text-xs text-text-subtle inline-flex items-center gap-1">
                    {p.techStack[0]}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </span>
                </a>
              ))}
            </div>
          </details>
        </div>
      )}
    </>
  );
}

function TierBlock({
  name,
  count,
  children,
}: {
  name: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-3 mb-5">
        <span className="font-mono text-sm text-text-muted tracking-[0.03em] uppercase">
          {name}
        </span>
        <span aria-hidden="true" className="flex-1 h-px bg-border-strong" />
        <span className="font-mono text-xs text-text-subtle">
          {String(count).padStart(2, "0")}
        </span>
      </div>
      {children}
    </div>
  );
}
