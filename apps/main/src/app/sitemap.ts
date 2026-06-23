import type { MetadataRoute } from "next";
import { showcaseProjects } from "@/lib/projects";
import { absoluteUrl } from "@/lib/seo";

/**
 * 動態 sitemap:首頁 + /print + 所有 showcase 專案頁。
 * output:'export' 下,Next 於 build 時輸出靜態 sitemap.xml。
 */
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/print/"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const projectPages: MetadataRoute.Sitemap = showcaseProjects().map((p) => ({
    url: absoluteUrl(`/projects/${p.slug}/`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...projectPages];
}
