"use client";

import {
  Footer,
  Hero,
  Nav,
  Section,
  TechBadge,
  useLang,
} from "@resume/ui";
import {
  Boxes,
  Code2,
  Cpu,
  FolderGit2,
  Gamepad2,
  GraduationCap,
  Layers,
  MonitorPlay,
  ShieldCheck,
} from "lucide-react";
import {
  eduItems,
  navLinks,
  profile,
  skillGroups,
  type SkillGroup,
} from "@/lib/site";
import { projects } from "@/lib/projects";
import { ProjectsSection } from "./ProjectsSection";

const skillIcon: Record<SkillGroup["icon"], typeof Cpu> = {
  fullstack: Layers,
  ml: Cpu,
  devops: Boxes,
  languages: Code2,
  game: Gamepad2,
};

/** 三軸色系統:全端/中性=藍、AI-ML=紫、DevOps=綠。 */
const skillIconClass: Record<SkillGroup["category"], string> = {
  neutral: "bg-brand-dim text-brand",
  ml: "bg-accent-dim text-accent",
  infra: "bg-infra-dim text-infra",
};

export function HomeView() {
  const { t } = useLang();

  const footerNav = navLinks.filter((l) => l.href !== "#contact");
  const pdfHref = t("/resume-zh.pdf", "/resume-en.pdf");
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
      // 兩種語言的履歷都給明確入口(Nav 的按鈕仍依當前語言切換)。
      href: "/resume-zh.pdf",
      labelZh: "下載 PDF 履歷(中文)",
      labelEn: "Résumé PDF (Chinese)",
      external: true,
    },
    {
      href: "/resume-en.pdf",
      labelZh: "英文履歷 PDF (English)",
      labelEn: "Download résumé (English)",
      external: true,
    },
    {
      // 作品附件:八案各一頁的圖表版(截圖 + 規模數字表),中文;靜態檔由 Work 的產生器產出後放進 public/。
      href: "/portfolio-appendix.pdf",
      labelZh: "作品附件 PDF(圖表版)",
      labelEn: "Portfolio appendix PDF (Chinese)",
      external: true,
    },
  ];

  // 統計列:全部由真實資料計算,不寫死。
  const liveDemos = projects.filter((p) => p.liveUrl).length;
  const languagesCount =
    skillGroups.find((g) => g.icon === "languages")?.items.length ?? 0;
  const stats = [
    {
      icon: FolderGit2,
      value: String(projects.length),
      labelZh: "公開專案",
      labelEn: "Public projects",
      tone: "bg-brand-dim text-brand",
    },
    {
      icon: MonitorPlay,
      value: String(liveDemos),
      labelZh: "Live demo 站",
      labelEn: "Live demos",
      tone: "bg-infra-dim text-infra",
    },
    {
      icon: Code2,
      value: String(languagesCount),
      labelZh: "程式語言",
      labelEn: "Languages",
      tone: "bg-accent-dim text-accent",
    },
  ];

  // 歷程時間軸:學歷(真實日期)+ 現在進行式。
  const journey = [
    {
      period: t("現在", "Now"),
      titleZh: "開放工作機會",
      titleEn: "Open to opportunities",
      descZh: "打磨作品集、持續出貨 side projects 與 live demo 子站。",
      descEn: "Polishing this portfolio and shipping side projects and live demos.",
      now: true,
    },
    ...eduItems.map((e) => ({
      period: e.period,
      titleZh: e.schoolZh,
      titleEn: e.schoolEn,
      descZh: e.degreeZh,
      descEn: e.degreeEn,
      now: false,
    })),
  ];

  // 「本站即證據」:直接可驗證的 live demo 連結(取前三個)。
  const proofLinks = projects
    .filter((p) => p.liveUrl)
    .slice(0, 3)
    .map((p) => ({
      label: p.repoName,
      href: p.liveUrl as string,
    }));

  return (
    <>
      <a href="#main" className="skip-link">
        {t("跳至主要內容", "Skip to content")}
      </a>

      <Nav links={navLinks} brandName={profile.brand} pdfHref={pdfHref} />

      <main id="main">
        {/* HERO */}
        <Hero
          name={`${profile.nameZh} Terry`}
          role={
            <>
              <span className="text-brand">{t("全端", "Full-stack")}</span>
              <span className="text-text-subtle font-medium"> / </span>
              <span className="text-accent">
                {t("AI-ML 部署", "AI-ML deployment")}
              </span>
              <span className="text-text-subtle font-medium"> / </span>
              <span className="text-infra">DevOps</span>
              <span className="text-text">
                {" "}
                {t("工程師", "engineer")}
              </span>
            </>
          }
          ledeZh="CS 碩士,擁有把 AI 系統實際建構並部署到生產環境的實務經驗。從推論最佳化、容器化到 CI/CD 與雲端部署一條龍。喜歡能跑、可維護、有架構的東西。"
          ledeEn="A CS Master's graduate with hands-on experience building and deploying AI systems in production — from inference optimization and containerization to CI/CD and cloud deployment. I like things that run, that are maintainable, and that have real architecture."
          statusZh="開放工作機會"
          statusEn="Open to opportunities"
          githubUrl={profile.github}
          linkedinUrl={profile.linkedin}
          email={profile.email}
          locationZh={`${profile.locationZh} / 遠端`}
          locationEn={`${profile.locationEn} / Remote`}
          eduZh="資訊工程 碩士"
          eduEn="M.S. in CSIE"
          pdfHref={pdfHref}
        />

        {/* 統計列:真實數字(專案數 / live demo 數 / 語言數皆由資料計算) */}
        <div className="container">
          <dl className="card-surface border border-border rounded-lg shadow-sm grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-border)]">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.labelEn}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <span
                      aria-hidden="true"
                      className={`w-[44px] h-[44px] rounded-md flex items-center justify-center shrink-0 ${s.tone}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <dt className="sr-only">{t(s.labelZh, s.labelEn)}</dt>
                      <dd className="text-2xl font-bold leading-none">
                        {s.value}
                      </dd>
                      <dd className="text-sm text-text-muted mt-1">
                        {t(s.labelZh, s.labelEn)}
                      </dd>
                    </div>
                  </div>
                );
              })}
          </dl>
        </div>

        {/* ABOUT:左=關於我+歷程,右=本站即證據 */}
        <Section
          id="about"
          title={t("關於我", "About")}
          intro={t(
            "把模型從筆記本帶到生產環境,並讓整條鏈路自動化、可維運。",
            "Taking models from notebooks to production — and making the whole pipeline automated and operable.",
          )}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
            <div className="card-surface border border-border rounded-lg shadow-sm p-6">
                <div className="text-text-muted leading-[1.8] flex flex-col gap-4 mb-6">
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

                {/* 歷程時間軸:藍點軸線,學歷用真實年份 */}
                <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                  <GraduationCap
                    className="h-4 w-4 text-brand"
                    aria-hidden="true"
                  />
                  {t("歷程", "Journey")}
                </h3>
                <ol className="relative border-l border-border-strong ml-[5px] flex flex-col gap-5">
                  {journey.map((item) => (
                    <li key={item.period} className="pl-5 relative">
                      <span
                        aria-hidden="true"
                        className={`absolute -left-[5.5px] top-[6px] w-[10px] h-[10px] rounded-full ${
                          item.now
                            ? "bg-success shadow-[0_0_0_3px_var(--color-success-dim)]"
                            : "bg-brand"
                        }`}
                      />
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <span className="font-bold">
                          {t(item.titleZh, item.titleEn)}
                        </span>
                        <span className="font-mono text-xs text-text-subtle">
                          {item.period}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted mt-1">
                        {t(item.descZh, item.descEn)}
                      </p>
                    </li>
                  ))}
                </ol>
            </div>

            <div className="card-surface border border-border rounded-lg shadow-sm p-6">
                <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                  <ShieldCheck
                    className="h-4 w-4 text-infra"
                    aria-hidden="true"
                  />
                  {t("本站就是證據", "This site is the proof")}
                </h3>
                <p className="text-sm text-text-muted leading-[1.8] mb-4">
                  {t(
                    "這個網站自架在 Oracle Cloud ARM 上,經 Cloudflare Tunnel 零入站連線發布,CI/CD 依路徑分流自動部署 —— 部署架構本身就是 DevOps 能力的實物證明。",
                    "This site is self-hosted on Oracle Cloud ARM, published through a zero-inbound Cloudflare Tunnel, and deployed by path-filtered CI/CD — the deployment architecture itself is working proof of the DevOps claim.",
                  )}
                </p>
                <p className="text-sm font-medium mb-2">
                  {t("馬上可驗證:", "Verify it now:")}
                </p>
                <ul className="flex flex-col">
                  {proofLinks.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="link-underline inline-flex items-center min-h-[44px] gap-2 text-sm text-text-muted hover:text-brand transition-colors duration-DEFAULT ease-ease"
                      >
                        <span
                          aria-hidden="true"
                          className="w-[6px] h-[6px] rounded-full bg-success"
                        />
                        {l.label} ↗
                      </a>
                    </li>
                  ))}
                  <li>
                    <a
                      href={profile.github}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="link-underline inline-flex items-center min-h-[44px] gap-2 text-sm text-text-muted hover:text-brand transition-colors duration-DEFAULT ease-ease"
                    >
                      <span
                        aria-hidden="true"
                        className="w-[6px] h-[6px] rounded-full bg-brand"
                      />
                      GitHub ↗
                    </a>
                  </li>
                </ul>
            </div>
          </div>
        </Section>

        {/* SKILLS */}
        <Section
          id="skills"
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
                  className="card-surface border border-border rounded-lg shadow-sm p-5 h-full"
                >
                    <h3 className="text-lg flex items-center gap-3 mb-4 font-bold">
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
                        <TechBadge
                          key={item}
                          category={
                            group.category === "neutral"
                              ? undefined
                              : group.category
                          }
                        >
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
          title={t("精選專案", "Projects")}
          intro={t(
            "依重要性分層呈現。代表作可進 showcase 詳情頁或直接玩 live demo;課程作業收在底部摺疊區。",
            "Layered by importance. Highlights open a showcase page or a live demo; coursework is tucked into the bottom collapsible.",
          )}
        >
          <ProjectsSection />
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
