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
      className="border-t border-border mt-9 scroll-mt-20"
    >
      <div className="container py-8">
        {/* 宣言列:一句話 + 聯絡管道,參照首屏語氣收尾 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pb-7 border-b border-border">
          <div>
            <h2
              id="foot-h"
              className="leading-[1.2] mb-2"
              style={{ fontSize: "clamp(24px,3.2vw,31px)" }}
            >
              {t("來做點有用的東西吧。", "Let's build something useful.")}
            </h2>
            <p className="text-text-muted text-sm max-w-[46ch]">
              {t(
                "開放工作機會 — 全端 / AI-ML 部署 / DevOps。歡迎來信聊聊。",
                "Open to opportunities — full-stack / AI-ML deployment / DevOps. Drop me a line.",
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {contactLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                {...(link.external
                  ? { rel: "noopener noreferrer", target: "_blank" }
                  : {})}
                className="link-underline text-sm font-medium inline-flex items-center min-h-[44px] text-text-muted transition-colors duration-DEFAULT ease-ease hover:text-brand"
              >
                {t(link.labelZh, link.labelEn)}
              </a>
            ))}
          </div>
        </div>

        {/* 次要列:版權 + 站內導覽 + 技術註記 */}
        <div className="pt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm text-text-subtle">
          <span>
            © {year} {brandName}
          </span>
          <nav
            aria-label={t("頁尾導覽", "Footer navigation")}
            className="flex flex-wrap gap-x-5"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                {...(link.external
                  ? { rel: "noopener noreferrer", target: "_blank" }
                  : {})}
                className="link-underline inline-flex items-center min-h-[44px] transition-colors duration-DEFAULT ease-ease hover:text-text"
              >
                {t(link.labelZh, link.labelEn)}
              </a>
            ))}
          </nav>
          <span className="font-mono text-xs">
            Next.js · Tailwind · Cloudflare Tunnel · Oracle A1 ·{" "}
            {t("自架 · WCAG AA", "self-hosted · WCAG AA")}
          </span>
        </div>
      </div>
    </footer>
  );
}
