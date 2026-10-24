"use client";

import {
  Footer,
  Nav,
  ProjectDetail,
  useLang,
  type ProjectDetailNav,
} from "@resume/ui";
import { navLinks, profile } from "@/lib/site";
import { getProject, hasDetailPage, homeOrder, isWip } from "@/lib/projects";

export function ProjectDetailView({ slug }: { slug: string }) {
  const { t } = useLang();
  const project = getProject(slug);
  if (!project) return null;

  // 上一個/下一個依首頁呈現順序,只在有詳情頁的專案間移動。
  const detailList = homeOrder().filter(hasDetailPage);
  const idx = detailList.findIndex((p) => p.slug === slug);
  const prevP = idx > 0 ? detailList[idx - 1] : undefined;
  const nextP =
    idx >= 0 && idx < detailList.length - 1 ? detailList[idx + 1] : undefined;

  const toNav = (p: typeof project): ProjectDetailNav => ({
    slug: p.slug,
    titleZh: p.titleZh,
    titleEn: p.titleEn,
  });

  const status = isWip(slug)
    ? {
        status: "wip" as const,
        label: t("進行中", "WIP"),
        ariaLabel: t("狀態:開發中", "Status: work in progress"),
      }
    : project.liveUrl
      ? {
          status: "live" as const,
          label: "Live",
          ariaLabel: t("狀態:可線上使用", "Status: live"),
        }
      : { status: "showcase" as const, label: "Showcase" };

  const pdfHref = t("/resume-zh.pdf", "/resume-en.pdf");
  const footerNav = navLinks.filter((l) => l.href !== "/#contact");
  const contactLinks = [
    { href: `mailto:${profile.email}`, labelZh: "Email", labelEn: "Email" },
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
  ];
  const downloadLinks = [
    {
      href: "/resume-zh.pdf",
      labelZh: "中文履歷 PDF",
      labelEn: "Résumé PDF (Chinese)",
      external: true,
    },
    {
      href: "/resume-en.pdf",
      labelZh: "英文履歷 PDF (English)",
      labelEn: "Résumé PDF (English)",
      external: true,
    },
  ];

  return (
    <>
      <a href="#main" className="skip-link">
        {t("跳至主要內容", "Skip to content")}
      </a>
      <Nav links={navLinks} brandName={profile.brand} pdfHref={pdfHref} />
      <main id="main">
        <ProjectDetail
          title={t(project.titleZh, project.titleEn)}
          oneLiner={t(project.oneLinerZh, project.oneLinerEn)}
          description={t(project.descZh, project.descEn)}
          highlights={project.highlights.map((h) => t(h.zh, h.en))}
          techStack={project.techStack}
          challenges={t(project.challengesZh, project.challengesEn)}
          githubUrl={project.githubUrl}
          liveUrl={project.liveUrl}
          cover={project.cover}
          kind={
            project.kindZh
              ? t(project.kindZh, project.kindEn ?? project.kindZh)
              : undefined
          }
          period={
            project.periodZh
              ? t(project.periodZh, project.periodEn ?? project.periodZh)
              : undefined
          }
          repoName={project.repoName}
          status={status}
          prev={prevP ? toNav(prevP) : undefined}
          next={nextP ? toNav(nextP) : undefined}
        />
      </main>
      <Footer
        brandName={profile.brand}
        navLinks={footerNav}
        contactLinks={contactLinks}
        downloadLinks={downloadLinks}
      />
    </>
  );
}
