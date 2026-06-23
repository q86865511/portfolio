"use client";

import {
  ArrowRight,
  Download,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";
import { type ReactNode } from "react";
import { useLang } from "../providers/LangProvider";
import { Button } from "./Button";

export interface HeroTermLine {
  type: "prompt" | "output" | "kv";
  /** prompt/output 用 text;kv 用 k + v */
  text?: string;
  cmd?: string;
  k?: string;
  v?: string;
}

export interface HeroProps {
  eyebrowZh: string;
  eyebrowEn: string;
  name: string;
  /** 角色定位,已含高亮標記的 ReactNode。 */
  role: ReactNode;
  ledeZh: string;
  ledeEn: string;
  githubUrl: string;
  linkedinUrl: string;
  email: string;
  locationZh: string;
  locationEn: string;
  eduZh: string;
  eduEn: string;
  /** 下載 PDF 履歷的連結(依當前語言)。 */
  pdfHref: string;
  /** 終端機卡片內容行。 */
  termLines: HeroTermLine[];
  termTitle?: string;
}

export function Hero(props: HeroProps) {
  const { t } = useLang();

  return (
    <section
      className="pt-9 pb-8 lg:pt-10"
      aria-labelledby="hero-h1"
    >
      <div className="container grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] gap-7 lg:gap-8 items-center">
        <div>
          <span className="inline-flex items-center gap-2 font-mono text-sm text-brand bg-brand-dim px-3 py-2 rounded-full mb-5">
            <span
              aria-hidden="true"
              className="w-[7px] h-[7px] rounded-full bg-success shadow-[0_0_0_3px_var(--color-success-dim)]"
            />
            {t(props.eyebrowZh, props.eyebrowEn)}
          </span>

          <h1
            id="hero-h1"
            className="mb-3"
            style={{ fontSize: "clamp(38px,7vw,49px)" }}
          >
            {props.name}
          </h1>

          <p
            className="font-medium text-text-muted mb-5 leading-[1.3]"
            style={{ fontSize: "clamp(22px,4vw,31px)" }}
          >
            {props.role}
          </p>

          <p className="text-base text-text-muted max-w-[54ch] mb-7">
            {t(props.ledeZh, props.ledeEn)}
          </p>

          {/* 統一 CTA 列:文字按鈕與圖示按鈕同為 44px 高、底線對齊;
              手機版文字按鈕全寬堆疊、圖示按鈕並排,排列收齊一致。 */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 mb-6">
            <Button
              as="a"
              variant="primary"
              href="#projects"
              className="w-full sm:w-auto"
            >
              {t("看專案", "View projects")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              as="a"
              variant="secondary"
              href={props.pdfHref}
              rel="noopener"
              className="w-full sm:w-auto"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              {t("下載 PDF 履歷", "Download résumé")}
            </Button>
            <div className="flex gap-3">
              <Button
                as="a"
                variant="icon"
                href={props.githubUrl}
                aria-label={t(
                  "GitHub 個人頁(另開新視窗)",
                  "GitHub profile (opens in new tab)",
                )}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Github className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                as="a"
                variant="icon"
                href={props.linkedinUrl}
                aria-label={t(
                  "LinkedIn(另開新視窗)",
                  "LinkedIn (opens in new tab)",
                )}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Linkedin className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-subtle">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 opacity-80" aria-hidden="true" />
              {t(props.locationZh, props.locationEn)}
            </span>
            <span className="inline-flex items-center gap-2">
              <GraduationCap
                className="h-4 w-4 opacity-80"
                aria-hidden="true"
              />
              {t(props.eduZh, props.eduEn)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4 opacity-80" aria-hidden="true" />
              {props.email}
            </span>
          </div>
        </div>

        {/* 終端機卡片裝飾(B 立體層次:提亮表面 + 頂部高光邊) */}
        <div
          className="card-surface border border-border rounded-lg overflow-hidden shadow-lg"
          role="img"
          aria-label={t(
            "模擬終端機:顯示技術定位與主力技術棧",
            "Mock terminal showing positioning and core tech stack",
          )}
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-surface-2 border-b border-border">
            <span className="w-[11px] h-[11px] rounded-full bg-[#FF5F56]" />
            <span className="w-[11px] h-[11px] rounded-full bg-[#FFBD2E]" />
            <span className="w-[11px] h-[11px] rounded-full bg-[#27C93F]" />
            <span className="ml-2 font-mono text-xs text-text-subtle truncate">
              {props.termTitle ?? "terry@portfolio: ~"}
            </span>
          </div>
          <div
            className="px-4 py-4 sm:px-5 font-mono leading-[1.9]"
            style={{ fontSize: "clamp(12px,3vw,13.5px)" }}
            aria-hidden="true"
          >
            {props.termLines.map((line, i) => {
              if (line.type === "prompt") {
                return (
                  <div key={i}>
                    <span className="text-brand">$</span>{" "}
                    <span className="text-text">{line.cmd}</span>
                    {line.text && (
                      <>
                        {" "}
                        <span className="text-text-muted">{line.text}</span>
                      </>
                    )}
                  </div>
                );
              }
              if (line.type === "kv") {
                return (
                  <div key={i}>
                    <span className="text-accent">{line.k}</span>:{" "}
                    <span className="text-success">{line.v}</span>
                  </div>
                );
              }
              return (
                <div key={i} className="text-text-muted">
                  {line.text}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
