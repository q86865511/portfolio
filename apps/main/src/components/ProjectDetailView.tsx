"use client";

import {
  Footer,
  Nav,
  ProjectDetail,
  useLang,
  type ProjectDetailNav,
} from "@resume/ui";
import { navLinks, profile } from "@/lib/site";
import {
  getProject,
  isWip,
  showcaseProjects,
} from "@/lib/projects";

export function ProjectDetailView({ slug }: { slug: string }) {
  const { t } = useLang();
  const project = getProject(slug);
  if (!project) return null;

  const showcase = showcaseProjects();
  const idx = showcase.findIndex((p) => p.slug === slug);
  const prevP = idx > 0 ? showcase[idx - 1] : undefined;
  const nextP = idx >= 0 && idx < showcase.length - 1 ? showcase[idx + 1] : undefined;

  const toNav = (p: typeof project): ProjectDetailNav => ({
    slug: p.slug,
    titleZh: p.repoName,
    titleEn: p.repoName,
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
          ariaLabel: t("狀態:可線上遊玩", "Status: live"),
        }
      : { status: "showcase" as const, label: "Showcase" };

  const footerNav = navLinks.filter((l) => l.href !== "#contact");
  const contactLinks = [
    { href: `mailto:${profile.email}`, labelZh: "Email", labelEn: "Email" },
    { href: profile.github, labelZh: "GitHub ↗", labelEn: "GitHub ↗", external: true },
    {
      href: profile.linkedin,
      labelZh: "LinkedIn ↗",
      labelEn: "LinkedIn ↗",
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
        <ProjectDetail
          title={project.repoName}
          oneLiner={t(project.oneLinerZh, project.oneLinerEn)}
          description={t(project.descZh, project.descEn)}
          highlights={project.highlights.map((h) => t(h.zh, h.en))}
          techStack={project.techStack}
          challenges={t(project.challengesZh, project.challengesEn)}
          githubUrl={project.githubUrl}
          liveUrl={project.liveUrl}
          status={status}
          prev={prevP ? toNav(prevP) : undefined}
          next={nextP ? toNav(nextP) : undefined}
        />
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
