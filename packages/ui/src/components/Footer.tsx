"use client";

import { useLang } from "../providers/LangProvider";

export interface FooterLink {
  href: string;
  labelZh: string;
  labelEn: string;
  external?: boolean;
}

export interface FooterProps {
  brandName?: string;
  navLinks: FooterLink[];
  contactLinks: FooterLink[];
  year?: number;
}

export function Footer({
  brandName = "周暐倫 · Terry",
  navLinks,
  contactLinks,
  year = new Date().getFullYear(),
}: FooterProps) {
  const { t } = useLang();

  return (
    <footer
      id="contact"
      aria-labelledby="foot-h"
      className="border-t border-border pt-7 pb-6 mt-8"
    >
      <div className="container">
        <h2 id="foot-h" className="sr-only">
          {t("聯絡與頁尾", "Contact & footer")}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-5">
          <div>
            <a href="#main" className="flex items-center gap-[10px] font-medium mb-3">
              <span
                aria-hidden="true"
                className="w-[10px] h-[10px] rounded-full bg-brand shadow-[0_0_0_4px_var(--color-brand-dim)]"
              />
              {brandName}
            </a>
            <p className="text-text-muted text-sm max-w-[42ch]">
              {t(
                "全端 / AI-ML 部署 / DevOps 工程師。開放工作機會,歡迎來信聊聊。",
                "Full-stack / AI-ML deployment / DevOps engineer. Open to work — let's talk.",
              )}
            </p>
            <p className="text-text-subtle text-sm mt-4">
              © {year} {brandName}
            </p>
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-[0.05em] text-text-subtle mb-[14px] font-medium font-mono">
              {t("導覽", "Navigate")}
            </h3>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                {...(link.external
                  ? { rel: "noopener noreferrer", target: "_blank" }
                  : {})}
                className="text-text-muted text-sm block py-[3px] transition-colors duration-DEFAULT ease-ease hover:text-brand"
              >
                {t(link.labelZh, link.labelEn)}
              </a>
            ))}
          </div>

          <div>
            <h3 className="text-sm uppercase tracking-[0.05em] text-text-subtle mb-[14px] font-medium font-mono">
              {t("聯絡", "Contact")}
            </h3>
            {contactLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                {...(link.external
                  ? { rel: "noopener noreferrer", target: "_blank" }
                  : {})}
                className="text-text-muted text-sm block py-[3px] transition-colors duration-DEFAULT ease-ease hover:text-brand"
              >
                {t(link.labelZh, link.labelEn)}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-[14px] justify-between items-center text-sm text-text-subtle">
          <span className="font-mono text-xs">
            {t("本站技術", "Built with")} ·{" "}
            <b className="text-text-muted font-medium">Next.js</b> ·{" "}
            <b className="text-text-muted font-medium">Tailwind</b> ·{" "}
            <b className="text-text-muted font-medium">Cloudflare Tunnel</b> ·{" "}
            <b className="text-text-muted font-medium">Oracle A1</b>
          </span>
          <span>
            {t(
              "以無障礙 (WCAG AA) 與 RWD 為前提設計",
              "Designed for accessibility (WCAG AA) and responsive layout",
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
