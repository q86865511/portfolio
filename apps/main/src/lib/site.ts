/** 個人資料(真實值,單一來源)。 */
export const profile = {
  nameZh: "周暐倫",
  nameEn: "Terry (Wei-Lun) Chou",
  brand: "周暐倫 · Terry",
  email: "q86865511@gmail.com",
  github: "https://github.com/q86865511",
  linkedin: "https://www.linkedin.com/in/weilun-chou-a7b2453b8/",
  website: "https://terrychou.com",
  locationZh: "桃園市,台灣",
  locationEn: "Taoyuan, Taiwan",
  bioZh:
    "A CS Master's graduate with hands-on experience building and deploying AI systems in production.",
  bioEn:
    "A CS Master's graduate with hands-on experience building and deploying AI systems in production.",
} as const;

export const eduItems = [
  {
    schoolZh: "國立中央大學",
    schoolEn: "National Central University",
    degreeZh: "資訊工程 碩士",
    degreeEn: "M.S. in Computer Science & Information Engineering",
    period: "2023 – 2025",
  },
  {
    schoolZh: "中原大學",
    schoolEn: "Chung Yuan Christian University",
    degreeZh: "資訊工程 學士",
    degreeEn: "B.S. in Computer Science & Information Engineering",
    period: "2019 – 2023",
  },
] as const;

/** 役期(僅 PDF 履歷的學歷段列出;首頁時間軸不顯示)。 */
export const serviceNote = {
  zh: "兵役:義務役 2025/11 – 2026/2,已退伍",
  en: "Military service (mandatory), Nov 2025 – Feb 2026 — completed",
} as const;

export interface SkillGroup {
  titleZh: string;
  titleEn: string;
  icon: "fullstack" | "ml" | "devops" | "languages" | "game";
  category: "neutral" | "ml" | "infra";
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    titleZh: "程式語言",
    titleEn: "Languages",
    icon: "languages",
    category: "neutral",
    items: ["Python", "TypeScript/JavaScript", "Go", "Rust", "C++", "Java", "Assembly", "Verilog"],
  },
  {
    titleZh: "前端開發",
    titleEn: "Frontend",
    icon: "fullstack",
    category: "neutral",
    items: ["React", "Next.js", "Mantine", "Tailwind", "Electron", "Tauri"],
  },
  {
    titleZh: "後端開發",
    titleEn: "Backend",
    icon: "fullstack",
    category: "neutral",
    items: ["FastAPI", "Spring Boot", "SQLAlchemy", "PostgreSQL", "Redis", "asyncio"],
  },
  {
    titleZh: "AI / ML 部署",
    titleEn: "AI / ML",
    icon: "ml",
    category: "ml",
    items: ["YOLOv8", "TensorRT", "ONNX", "Triton", "TensorFlow", "OpenCV", "MediaPipe"],
  },
  {
    titleZh: "DevOps / 基礎設施",
    titleEn: "DevOps",
    icon: "devops",
    category: "infra",
    items: [
      "Docker",
      "Prometheus",
      "Grafana",
      "Oracle Cloud ARM",
      "Caddy",
      "GitHub Actions",
      "Cloudflare",
    ],
  },
  {
    titleZh: "遊戲 / 圖形",
    titleEn: "Game / Graphics",
    icon: "game",
    category: "neutral",
    items: ["Godot 4", "GDScript", "C#", "raylib", "HTML5 Canvas"],
  },
];

/** 主導覽 / 頁尾連結。 */
export const navLinks = [
  { href: "#about", labelZh: "關於", labelEn: "About" },
  { href: "#skills", labelZh: "技能", labelEn: "Skills" },
  { href: "#projects", labelZh: "專案", labelEn: "Projects" },
  { href: "#contact", labelZh: "聯絡", labelEn: "Contact" },
];
