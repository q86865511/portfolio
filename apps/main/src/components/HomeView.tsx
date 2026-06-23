"use client";

import {
  Footer,
  Hero,
  Nav,
  Section,
  TechBadge,
  useLang,
} from "@resume/ui";
import { Boxes, Cpu, GraduationCap, Layers } from "lucide-react";
import {
  eduItems,
  heroTermLines,
  navLinks,
  profile,
  skillGroups,
  type SkillGroup,
} from "@/lib/site";
import { ProjectsSection } from "./ProjectsSection";

const skillIcon: Record<SkillGroup["icon"], typeof Cpu> = {
  fullstack: Layers,
  ml: Cpu,
  devops: Boxes,
  languages: Layers,
};

const skillIconClass: Record<SkillGroup["category"], string> = {
  neutral: "bg-brand-dim text-brand",
  ml: "bg-accent-dim text-accent",
  infra: "bg-info-dim text-info",
};

export function HomeView() {
  const { t } = useLang();

  const footerNav = navLinks.filter((l) => l.href !== "#contact");
  const contactLinks = [
    {
      href: `mailto:${profile.email}`,
      labelZh: "Email",
      labelEn: "Email",
    },
    {
      href: profile.github,
      labelZh: "GitHub ↗",
      labelEn: "GitHub ↗",
      external: true,
    },
    {
      href: profile.linkedin,
      labelZh: "LinkedIn ↗",
      labelEn: "LinkedIn ↗",
      external: true,
    },
    {
      href: "/resume-zh.pdf",
      labelZh: "下載 PDF 履歷",
      labelEn: "Download résumé",
      external: true,
    },
  ];

  return (
    <>
      <a href="#main" className="skip-link">
        {t("跳至主要內容", "Skip to content")}
      </a>

      <Nav links={navLinks} githubUrl={profile.github} brandName={profile.brand} />

      <main id="main">
        {/* HERO */}
        <Hero
          eyebrowZh="OPEN TO WORK · 桃園 / 遠端"
          eyebrowEn="OPEN TO WORK · Taoyuan / Remote"
          name={`${profile.nameZh} Terry`}
          role={
            <>
              <b className="text-text font-bold">
                {t("全端工程師", "Full-stack")}
              </b>{" "}
              · <span className="text-brand font-bold">{t("AI-ML 部署", "AI-ML deployment")}</span>{" "}
              · <b className="text-text font-bold">DevOps</b>
            </>
          }
          ledeZh="CS 碩士,擁有把 AI 系統實際建構並部署到生產環境的實務經驗。從推論最佳化、容器化到 CI/CD 與雲端部署一條龍。喜歡能跑、可維護、有架構的東西。"
          ledeEn="A CS Master's graduate with hands-on experience building and deploying AI systems in production — from inference optimization and containerization to CI/CD and cloud deployment. I like things that run, that are maintainable, and that have real architecture."
          githubUrl={profile.github}
          linkedinUrl={profile.linkedin}
          email={profile.email}
          locationZh={profile.locationZh}
          locationEn={profile.locationEn}
          eduZh="資訊工程 碩士"
          eduEn="M.S. in CSIE"
          pdfHref="/resume-zh.pdf"
          termLines={heroTermLines}
        />

        {/* ABOUT */}
        <Section
          id="about"
          eyebrow="00 / ABOUT"
          title={t("關於我", "About")}
          intro={t(
            "把模型從筆記本帶到生產環境,並讓整條鏈路自動化、可維運。",
            "Taking models from notebooks to production — and making the whole pipeline automated and operable.",
          )}
        >
          <div className="max-w-measure text-text-muted leading-[1.8] flex flex-col gap-4">
            <p>
              {t(
                "我是周暐倫(Terry),國立中央大學資工碩士。專長橫跨三條主線:全端應用開發、把機器學習模型送上線(推論最佳化、Triton 服務、效能監控),以及讓一切自動化部署且可維運的 DevOps。",
                "I'm Terry (Wei-Lun) Chou, a CS Master's graduate from National Central University. My work spans three tracks: full-stack application development, shipping ML models to production (inference optimization, Triton serving, performance monitoring), and the DevOps that makes everything deploy automatically and stay operable.",
              )}
            </p>
            <p>
              {t(
                "我喜歡有清楚架構、能長期維護的系統,並把無障礙與工程細節視為品質的一部分 —— 這個作品集網站本身就是一個例子。",
                "I gravitate toward systems with clear architecture that last, and I treat accessibility and engineering details as part of quality — this portfolio site itself is one example.",
              )}
            </p>
          </div>
        </Section>

        {/* SKILLS */}
        <Section
          id="skills"
          eyebrow="01 / SKILLS"
          title={t("技術棧", "Tech stack")}
          intro={t(
            "三條主線:全端應用、把 ML 模型送上線、以及讓一切自動化部署且可維運。",
            "Three tracks: full-stack apps, shipping ML to production, and automating deployment and operations.",
          )}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillGroups.map((group) => {
              const Icon = skillIcon[group.icon];
              return (
                <div
                  key={group.titleEn}
                  className="card-surface border border-border rounded-lg p-5"
                >
                  <h3 className="text-lg flex items-center gap-3 mb-4 font-medium">
                    <span
                      aria-hidden="true"
                      className={`w-[36px] h-[36px] rounded-md flex items-center justify-center shrink-0 ${skillIconClass[group.category]}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {t(group.titleZh, group.titleEn)}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <TechBadge key={item} category={group.category === "neutral" ? undefined : group.category}>
                        {item}
                      </TechBadge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* PROJECTS */}
        <Section
          id="projects"
          eyebrow="02 / PROJECTS"
          title={t("精選專案", "Projects")}
          intro={t(
            "依重要性分層呈現。代表作可進 showcase 詳情頁或直接玩 live demo;課程作業收在底部摺疊區。",
            "Layered by importance. Highlights open a showcase page or a live demo; coursework is tucked into the bottom collapsible.",
          )}
        >
          <ProjectsSection />
        </Section>

        {/* EDUCATION */}
        <Section
          id="education"
          eyebrow="03 / EDUCATION"
          title={t("學歷", "Education")}
        >
          <div className="flex flex-col gap-3 max-w-measure">
            {eduItems.map((edu) => (
              <div
                key={edu.period}
                className="card-surface border border-border rounded-lg p-5 flex items-start gap-4"
              >
                <span
                  aria-hidden="true"
                  className="w-[36px] h-[36px] rounded-md flex items-center justify-center shrink-0 bg-brand-dim text-brand"
                >
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg">{t(edu.schoolZh, edu.schoolEn)}</h3>
                    <span className="font-mono text-sm text-text-subtle">
                      {edu.period}
                    </span>
                  </div>
                  <p className="text-text-muted text-sm mt-1">
                    {t(edu.degreeZh, edu.degreeEn)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </main>

      <Footer
        brandName={profile.brand}
        navLinks={footerNav}
        contactLinks={contactLinks}
        year={2026}
      />
    </>
  );
}
