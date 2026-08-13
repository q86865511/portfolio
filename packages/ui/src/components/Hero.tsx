"use client";

import {
  ArrowRight,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";
import { type ReactNode } from "react";
import { useLang } from "../providers/LangProvider";
import { Button } from "./Button";
import { HeroGraphic } from "./HeroGraphic";

export interface HeroProps {
  name: string;
  /** 角色定位,已含三軸色標記的 ReactNode。 */
  role: ReactNode;
  ledeZh: string;
  ledeEn: string;
  /** 求職狀態(綠點旁的文字),如「開放工作機會」。 */
  statusZh: string;
  statusEn: string;
  githubUrl: string;
  linkedinUrl: string;
  email: string;
  locationZh: string;
  locationEn: string;
  eduZh: string;
  eduEn: string;
  /** 下載 PDF 履歷的連結(依當前語言)。 */
  pdfHref: string;
}

export function Hero(props: HeroProps) {
  const { t } = useLang();

  return (
    <section className="pt-8 pb-7 lg:pt-9" aria-labelledby="hero-h1">
      <div className="container grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] gap-7 lg:gap-8 items-center">
        <div>
          <h1
            id="hero-h1"
            className="mb-3 tracking-[-0.03em]"
            style={{ fontSize: "clamp(40px,7.5vw,60px)" }}
          >
            {props.name}
          </h1>

          <p
            className="font-bold mb-4 leading-[1.25] tracking-[-0.01em]"
            style={{ fontSize: "clamp(21px,3.4vw,28px)" }}
          >
            {props.role}
          </p>

          <p className="text-base text-text-muted max-w-[54ch] mb-5">
            {t(props.ledeZh, props.ledeEn)}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted mb-6">
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
            <span className="inline-flex items-center gap-2 font-medium text-success">
              <span
                aria-hidden="true"
                className="w-[8px] h-[8px] rounded-full bg-success shadow-[0_0_0_3px_var(--color-success-dim)]"
              />
              {t(props.statusZh, props.statusEn)}
            </span>
          </div>

          {/* CTA 列:文字按鈕與圖示按鈕同高、手機版文字按鈕全寬堆疊。 */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
            <Button
              as="a"
              variant="primary"
              href="#projects"
              className="w-full sm:w-auto"
            >
              {t("看專案作品", "View my work")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              as="a"
              variant="secondary"
              href={`mailto:${props.email}`}
              className="w-full sm:w-auto"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t("Email 我", "Email me")}
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
        </div>

        {/* 簽名幾何圖形面板:三軸色的平面構圖,雙主題自動適應 */}
        <div className="rounded-xl border border-border bg-surface-2 overflow-hidden">
          <HeroGraphic className="block w-full h-auto" />
        </div>
      </div>
    </section>
  );
}
