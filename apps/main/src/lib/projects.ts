import projectsJson from "../../../../content/projects.json";

export type Presentation = "live-demo" | "showcase" | "external" | "academic";
export type Tier = "featured" | "notable" | "mini" | "academic";

export interface Highlight {
  zh: string;
  en: string;
}

export interface DemoFeasibility {
  canRunInBrowser: boolean;
  notes: string;
}

export interface Project {
  slug: string;
  repoName: string;
  titleZh: string;
  titleEn: string;
  oneLinerZh: string;
  oneLinerEn: string;
  descZh: string;
  descEn: string;
  highlights: Highlight[];
  techStack: string[];
  challengesZh: string;
  challengesEn: string;
  presentation: Presentation;
  demoFeasibility: DemoFeasibility;
  githubUrl: string;
  liveUrl?: string;
  /** 學術/來源標籤(如 碩士論文 / 大學專題 / 課程專案),可選。 */
  kindZh?: string;
  kindEn?: string;
}

interface RawProject extends Omit<Project, "highlights"> {
  highlights?: Highlight[];
}

interface ProjectsFile {
  count: number;
  projects: RawProject[];
}

const raw = projectsJson as ProjectsFile;

/**
 * Tier 對照表(依使用者指定)。
 * featured = ai-deployment-pipeline(碩士論文) / smart-pedestrian-navigation(大學專題)
 * notable  = soulshard-hunter / discord-auto-bot / cyclepact
 * mini     = lolhelper / discord-guild-keeper / mini-moba / anime-tracker / ros-ball-chaser(課程專案)
 * academic = 其餘(放摺疊區)
 * 註:pay-the-money 為 fork,已自 content/projects.json 移除。
 */
const TIER_MAP: Record<string, Tier> = {
  "ai-deployment-pipeline": "featured",
  "smart-pedestrian-navigation": "featured",
  "soulshard-hunter": "notable",
  "discord-auto-bot": "notable",
  cyclepact: "notable",
  lolhelper: "mini",
  "discord-guild-keeper": "mini",
  "mini-moba": "mini",
  "anime-tracker": "mini",
  "ros-ball-chaser": "mini",
};

/** WIP 專案 slug(文案已含 WIP)。 */
const WIP_SLUGS = new Set(["cyclepact"]);

export function tierOf(slug: string): Tier {
  return TIER_MAP[slug] ?? "academic";
}

export function isWip(slug: string): boolean {
  return WIP_SLUGS.has(slug);
}

/** 正規化後的全部專案(highlights 補空陣列)。 */
export const projects: Project[] = raw.projects.map((p) => ({
  ...p,
  highlights: p.highlights ?? [],
  liveUrl: p.liveUrl && p.liveUrl.length > 0 ? p.liveUrl : undefined,
}));

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** 依 tier 分組(保留 projects.json 內的原始順序)。 */
export function projectsByTier(): Record<Tier, Project[]> {
  const groups: Record<Tier, Project[]> = {
    featured: [],
    notable: [],
    mini: [],
    academic: [],
  };
  for (const p of projects) {
    groups[tierOf(p.slug)].push(p);
  }
  return groups;
}

/** presentation === 'showcase' 的專案(用於 generateStaticParams)。 */
export function showcaseProjects(): Project[] {
  return projects.filter((p) => p.presentation === "showcase");
}

/** showcase 專案的有序列表(用於上一個/下一個導覽)。 */
export function showcaseSlugs(): string[] {
  return showcaseProjects().map((p) => p.slug);
}

/**
 * 專案主連結規則:
 * - 'live-demo' → liveUrl(外連)
 * - 'showcase'  → 站內 /projects/[slug]
 * - 'external' / 'academic' → githubUrl(外連)
 */
export function primaryLink(p: Project): { href: string; external: boolean } {
  if (p.presentation === "live-demo" && p.liveUrl) {
    return { href: p.liveUrl, external: true };
  }
  if (p.presentation === "showcase") {
    return { href: `/projects/${p.slug}/`, external: false };
  }
  return { href: p.githubUrl, external: true };
}

/** PDF 履歷的專案顯示順序(使用者指定;只影響 PDF,不動首頁分層順序)。 */
const RESUME_ORDER = [
  "ai-deployment-pipeline",
  "smart-pedestrian-navigation",
  "soulshard-hunter",
  "discord-auto-bot",
  "cyclepact",
];

/** PDF 履歷會用到的 featured + notable 專案(依 RESUME_ORDER 排序)。 */
export function resumeProjects(): Project[] {
  const inResume = projects.filter((p) => {
    const t = tierOf(p.slug);
    return t === "featured" || t === "notable";
  });
  const rank = (slug: string) => {
    const i = RESUME_ORDER.indexOf(slug);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...inResume].sort((a, b) => rank(a.slug) - rank(b.slug));
}
