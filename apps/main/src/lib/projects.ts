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
  /** 首頁卡片的精簡雙語摘要;詳情頁與 PDF 仍使用完整 oneLiner。 */
  cardSummaryZh?: string;
  cardSummaryEn?: string;
  /** 卡片上明確挑選的代表技術,不影響完整技術棧與 ATS 關鍵字。 */
  cardTechStack?: string[];
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
  /** 卡片頂部與詳情頁封面圖路徑(public 下,如 /covers/<slug>.webp),可選。 */
  cover?: string;
  /** 學術/來源標籤(如 碩士論文 / 大學專題 / 課程專案),可選。 */
  kindZh?: string;
  kindEn?: string;
  /** 專案期間(如 2026/4 – 2026/6;進行中寫「至今」/ present),目前只在 PDF 履歷顯示,可選。 */
  periodZh?: string;
  periodEn?: string;
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
 * notable  = cyclepact(開發中) / food-map / soulshard-hunter / steam-sale-checker / erp-system / server-monitor / usage-monitor
 * mini     = mcpglass / discord-auto-bot / lolhelper / discord-guild-keeper / mini-moba / anime-tracker / ros-ball-chaser(課程專案)
 * academic = 其餘(放摺疊區)
 * 註:pay-the-money 為 fork,已自 content/projects.json 移除。
 */
const TIER_MAP: Record<string, Tier> = {
  "ai-deployment-pipeline": "featured",
  "smart-pedestrian-navigation": "featured",
  cyclepact: "notable",
  "food-map": "notable",
  "soulshard-hunter": "notable",
  "steam-sale-checker": "notable",
  "erp-system": "notable",
  "server-monitor": "notable",
  "usage-monitor": "notable",
  mcpglass: "mini",
  "discord-auto-bot": "mini",
  lolhelper: "mini",
  "discord-guild-keeper": "mini",
  "mini-moba": "mini",
  "anime-tracker": "mini",
  "ros-ball-chaser": "mini",
};

/** WIP 專案 slug(文案已含 WIP)。 */
const WIP_SLUGS = new Set<string>(["cyclepact"]);

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

/**
 * 線上作品的顯示順序:最有說服力的放前面(手機只先露前兩張)。
 * 未列入的 liveUrl 專案仍會顯示,排在最後(依 projects.json 順序)。
 */
const LIVE_ORDER = [
  "erp-system",
  "steam-sale-checker",
  "food-map",
  "soulshard-hunter",
];

/** 已上線(有 liveUrl)的專案:首頁第一區「線上作品」,其餘分區不再重複列出。 */
export function liveProjects(): Project[] {
  const rank = (p: Project) => {
    const i = LIVE_ORDER.indexOf(p.slug);
    return i === -1 ? LIVE_ORDER.length : i;
  };
  return projects.filter((p) => p.liveUrl).sort((a, b) => rank(a) - rank(b));
}

/** liveUrl 的主機名(如 erp.terrychou.com),供首屏部署架構圖使用。 */
export function liveHosts(): string[] {
  return liveProjects().map((p) => new URL(p.liveUrl as string).hostname);
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

/**
 * 是否有專屬 /projects/[slug] 詳情頁。
 * showcase 故事頁,以及 live-demo(同樣給故事頁;卡片另有「線上遊玩/體驗」直連 liveUrl)。
 * external / academic 不給詳情頁(卡片直連 GitHub)。
 */
export function hasDetailPage(p: Project): boolean {
  return p.presentation === "showcase" || p.presentation === "live-demo";
}

/** 會產生 /projects/[slug] 詳情頁的專案(用於 generateStaticParams / sitemap)。 */
export function detailProjects(): Project[] {
  return projects.filter(hasDetailPage);
}

/**
 * 首頁呈現順序:線上作品 → 代表作 → 其他 notable → mini → academic。
 * 詳情頁的上一個/下一個依此順序,避免從旗艦作品直接跳到小工具。
 */
export function homeOrder(): Project[] {
  const live = liveProjects();
  const groups = projectsByTier();
  const notLive = (p: Project) => !p.liveUrl;
  return [
    ...live,
    ...groups.featured.filter(notLive),
    ...groups.notable.filter(notLive),
    ...groups.mini.filter(notLive),
    ...groups.academic.filter(notLive),
  ];
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

/**
 * PDF 履歷收錄的專案、分區與顯示順序(使用者指定;只影響 PDF,不動首頁分層)。
 * 這份清單就是唯一真相——不由 tier 推導,所以 mcpglass 雖在首頁是 mini,仍能進履歷。
 * 分兩區:學術(大學專題 → 碩士論文,依時間順序)一區,其餘 side projects 一區;
 * side projects 區內最強、最相關(求職主攻 AI 部署 / DevOps)的放前面。
 */
export interface ResumeSection {
  titleZh: string;
  titleEn: string;
  slugs: string[];
}

const RESUME_SECTIONS: ResumeSection[] = [
  {
    titleZh: "學術專案",
    titleEn: "Academic Projects",
    slugs: ["smart-pedestrian-navigation", "ai-deployment-pipeline"],
  },
  {
    titleZh: "個人專案 (Side Projects)",
    titleEn: "Side Projects",
    slugs: [
      "erp-system",
      "mcpglass",
      "server-monitor",
      "usage-monitor",
      "steam-sale-checker",
      "food-map",
      "soulshard-hunter",
    ],
  },
];

/** PDF 履歷的分區與各區專案(slug 對不上就在 build 時炸掉,避免專案從履歷無聲消失)。 */
export function resumeSections(): Array<
  Omit<ResumeSection, "slugs"> & { projects: Project[] }
> {
  return RESUME_SECTIONS.map(({ titleZh, titleEn, slugs }) => ({
    titleZh,
    titleEn,
    projects: slugs.map((slug) => {
      const p = getProject(slug);
      if (!p)
        throw new Error(
          `RESUME_SECTIONS 的 slug "${slug}" 在 content/projects.json 找不到`,
        );
      return p;
    }),
  }));
}

/** 全部進履歷的專案(攤平各區,保留順序)。 */
export function resumeProjects(): Project[] {
  return resumeSections().flatMap((s) => s.projects);
}

/** PDF 每案印幾條 highlight:學術專案敘述多一些(碩論 3、專題 2),side projects 精簡為 1 條,中文版守在兩頁內。 */
const RESUME_HIGHLIGHT_LIMIT: Record<string, number> = {
  "ai-deployment-pipeline": 3,
  "smart-pedestrian-navigation": 2,
};

export function resumeHighlights(p: Project): Highlight[] {
  return p.highlights.slice(0, RESUME_HIGHLIGHT_LIMIT[p.slug] ?? 1);
}
