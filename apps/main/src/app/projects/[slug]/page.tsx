import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Providers } from "../../providers";
import { ProjectDetailView } from "@/components/ProjectDetailView";
import { detailProjects, getProject, hasDetailPage } from "@/lib/projects";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

export function generateStaticParams() {
  return detailProjects().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

/** 有封面衍生的 public/og/<slug>.jpg 就用專案專屬分享圖,否則退回全站 og.png。 */
function ogImageFor(slug: string): { url: string; width: number; height: number } {
  const custom = `/og/${slug}.jpg`;
  return existsSync(join(process.cwd(), "public", custom))
    ? { url: custom, width: 1200, height: 630 }
    : { url: "/og.png", width: 1200, height: 630 };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project || !hasDetailPage(project)) {
    return { title: "找不到專案 / Project Not Found" };
  }

  const title = `${project.titleZh} / ${project.titleEn}`;
  // oneLiner 可能偏長,描述取中文摘要(社群預覽通常截斷至 ~160 字)。
  const description = project.oneLinerZh;
  const url = absoluteUrl(`/projects/${slug}/`);
  const og = ogImageFor(slug);

  return {
    title,
    description,
    keywords: project.techStack,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "zh_TW",
      alternateLocale: ["en_US"],
      images: [{ ...og, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og.url],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project || !hasDetailPage(project)) {
    notFound();
  }

  return (
    <Providers>
      <ProjectDetailView slug={slug} />
    </Providers>
  );
}
