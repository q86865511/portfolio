"use client";

import { Github, Menu, X } from "lucide-react";
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
  githubUrl: string;
  brandName?: string;
}

export function Nav({
  links,
  githubUrl,
  brandName = "周暐倫 · Terry",
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
          "bg-[color-mix(in_srgb,var(--color-elevated)_86%,transparent)] backdrop-blur-[10px] border-border shadow-md",
      )}
    >
      <div className="container flex items-center justify-between h-16">
        <a href="#main" className="flex items-center gap-[10px] font-medium">
          <span
            aria-hidden="true"
            className="w-[10px] h-[10px] rounded-full bg-brand shadow-[0_0_0_4px_var(--color-brand-dim)]"
          />
          {brandName}
        </a>

        <nav
          className="hidden md:flex gap-7 items-center"
          aria-label={t("主導覽", "Main navigation")}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-text-muted text-sm transition-colors duration-DEFAULT ease-ease hover:text-text"
            >
              {t(link.labelZh, link.labelEn)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <Button
            as="a"
            variant="icon"
            href={githubUrl}
            aria-label={t("GitHub(另開新視窗)", "GitHub (opens in new tab)")}
            rel="noopener noreferrer"
            target="_blank"
            className="hidden sm:inline-flex"
          >
            <Github className="h-[18px] w-[18px]" aria-hidden="true" />
          </Button>
          <Button
            variant="icon"
            className="md:hidden"
            aria-label={t("開啟選單", "Open menu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <X className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : (
              <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* 行動版抽屜選單 */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-border bg-elevated"
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
          </nav>
        </div>
      )}
    </header>
  );
}
