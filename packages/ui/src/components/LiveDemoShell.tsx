"use client";

import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { type ReactNode } from "react";
import { useLang } from "../providers/LangProvider";
import { LangToggle } from "./LangToggle";

export interface LiveDemoShellProps {
  /** 子站專案名稱(顯示於頂條中央)。 */
  projectName: string;
  /** 返回主站作品集的連結。 */
  homeUrl: string;
  githubUrl: string;
  /** 主站對應的 showcase 詳情頁。 */
  showcaseUrl?: string;
  children: ReactNode;
}

/**
 * Live demo 子站頂部薄外殼(48px),把獨立 app 包進統一品牌,
 * 並提供清楚的「返回作品集」逃生路徑。
 */
export function LiveDemoShell({
  projectName,
  homeUrl,
  githubUrl,
  showcaseUrl,
  children,
}: LiveDemoShellProps) {
  const { t } = useLang();

  return (
    <div className="flex flex-col h-screen">
      {/* 薄外殼維持 48px 高度;內部連結用負 margin 外擴 ≥44px 命中區,
          不撐高頂條,兼顧觸控目標與緊湊外觀。 */}
      <header className="h-12 shrink-0 bg-elevated border-b border-border flex items-center justify-between px-4 gap-3">
        <a
          href={homeUrl}
          className="link-underline inline-flex items-center gap-2 min-h-[44px] -my-2 text-sm text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("返回作品集", "Back to portfolio")}
        </a>
        <span className="font-medium text-sm truncate">{projectName}</span>
        <div className="flex items-center gap-1">
          {showcaseUrl && (
            <a
              href={showcaseUrl}
              className="link-underline hidden sm:inline-flex items-center min-h-[44px] -my-2 px-2 text-sm text-text-muted hover:text-brand transition-colors"
            >
              {t("看 showcase", "Showcase")}
            </a>
          )}
          <a
            href={githubUrl}
            aria-label="GitHub"
            rel="noopener noreferrer"
            target="_blank"
            className="inline-flex items-center justify-center h-11 w-11 -my-2 text-text-muted hover:text-text transition-colors"
          >
            <Github className="h-5 w-5" aria-hidden="true" />
          </a>
          <LangToggle />
        </div>
      </header>
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}

export { ExternalLink };
