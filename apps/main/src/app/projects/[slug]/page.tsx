import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Providers } from "../../providers";
import { ProjectDetailView } from "@/components/ProjectDetailView";
import { getProject, showcaseProjects } from "@/lib/projects";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

export function generateStaticParams() {
  return showcaseProjects().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project || project.presentation !== "showcase") {
    return { title: "找不到專案 / Project Not Found" };
  }

  const title = `${project.titleZh} / ${project.titleEn}`;
  // oneLiner 可能偏長,描述取中文摘要(社群預覽通常截斷至 ~160 字)。
  const description = project.oneLinerZh;
  const url = absoluteUrl(`/projects/${slug}/`);

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
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
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
  if (!project || project.presentation !== "showcase") {
    notFound();
  }

  return (
    <Providers>
      <ProjectDetailView slug={slug} />
    </Providers>
  );
}
