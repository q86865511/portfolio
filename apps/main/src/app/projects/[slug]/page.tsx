import { notFound } from "next/navigation";
import { Providers } from "../../providers";
import { ProjectDetailView } from "@/components/ProjectDetailView";
import { getProject, showcaseProjects } from "@/lib/projects";

export function generateStaticParams() {
  return showcaseProjects().map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

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
