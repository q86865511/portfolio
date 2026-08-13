"use client";

import { Download, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/cn";
import { useLang } from "../providers/LangProvider";
import { Button } from "./Button";
import { LangToggle } from "./LangToggle";
import { ThemeToggle } from "./ThemeToggle";

export interface NavLink {
  href: string;
  labelZh: string;
  labelEn: string;
}

export interface NavProps {
  links: NavLink[];
  /** 保留供相容;新版導覽不再顯示 GitHub 圖示(移至頁尾)。 */
  githubUrl?: string;
  brandName?: string;
  /** 下載 PDF 履歷連結(依當前語言);提供時顯示主行動鈕。 */
  pdfHref?: string;
}

export function Nav({
  links,
  brandName = "周暐倫 · Terry",
  pdfHref,
}: NavProps) {
  const { t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 抽屜開啟時鎖背景捲動 + Esc 關閉
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-transparent transition-all duration-DEFAULT ease-ease",
        scrolled &&
          "bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] backdrop-blur-[10px] border-border shadow-sm",
      )}
    >
      <div className="container flex items-center justify-between h-16">
        <a
          href="#main"
          className="inline-flex items-center gap-3 min-h-[44px] font-bold"
          aria-label={brandName}
        >
          {/* TC 字標:墨色方塊 + 白字,品牌識別的最小單位 */}
          <span
            aria-hidden="true"
            className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-md bg-text text-bg text-sm font-bold tracking-tight select-none"
          >
            TC
          </span>
          <span className="hidden sm:inline text-base tracking-tight">
            {brandName}
          </span>
        </a>

        <nav
          className="hidden md:flex gap-6 items-center"
          aria-label={t("主導覽", "Main navigation")}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="link-underline inline-flex items-center min-h-[44px] px-1 text-text-muted text-sm font-medium transition-colors duration-DEFAULT ease-ease hover:text-text"
            >
              {t(link.labelZh, link.labelEn)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LangToggle />
          <ThemeToggle />
          {pdfHref && (
            <>
              <Button
                as="a"
                variant="secondary"
                size="sm"
                href={pdfHref}
                rel="noopener"
                className="hidden md:inline-flex"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {t("下載履歷", "Download résumé")}
              </Button>
              {/* 行動版:履歷下載收成 icon 鈕,首屏即可觸及(HR 主要行動) */}
              <Button
                as="a"
                variant="icon"
                href={pdfHref}
                rel="noopener"
                className="md:hidden"
                aria-label={t("下載 PDF 履歷", "Download résumé (PDF)")}
              >
                <Download className="h-5 w-5" aria-hidden="true" />
              </Button>
            </>
          )}
          <Button
            variant="icon"
            className="md:hidden"
            aria-label={t("開啟選單", "Open menu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* 行動版抽屜選單 */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-border bg-surface"
        >
          <nav
            className="container flex flex-col py-4 gap-1"
            aria-label={t("行動版導覽", "Mobile navigation")}
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-text py-3 px-2 rounded-md hover:bg-surface-2 min-h-[44px] flex items-center"
              >
                {t(link.labelZh, link.labelEn)}
              </a>
            ))}
            {pdfHref && (
              <a
                href={pdfHref}
                rel="noopener"
                onClick={() => setMenuOpen(false)}
                className="text-brand font-medium py-3 px-2 rounded-md hover:bg-surface-2 min-h-[44px] flex items-center gap-2"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {t("下載 PDF 履歷", "Download résumé")}
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
