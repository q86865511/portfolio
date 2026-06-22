// ── 工具 ──────────────────────────────────
export { cn } from "./lib/cn";

// ── Providers / hooks ─────────────────────
export { LangProvider, useLang, type Lang } from "./providers/LangProvider";
export {
  ThemeProvider,
  useTheme,
  themeInitScript,
  type Theme,
} from "./providers/ThemeProvider";

// ── 元件 ──────────────────────────────────
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from "./components/Button";
export {
  TechBadge,
  inferTechCategory,
  type TechBadgeProps,
  type TechCategory,
} from "./components/TechBadge";
export {
  StatusBadge,
  type StatusBadgeProps,
  type ProjectStatus,
} from "./components/StatusBadge";
export { Nav, type NavProps, type NavLink } from "./components/Nav";
export { Hero, type HeroProps, type HeroTermLine } from "./components/Hero";
export { Section, type SectionProps } from "./components/Section";
export { LangToggle } from "./components/LangToggle";
export { ThemeToggle } from "./components/ThemeToggle";
export { Footer, type FooterProps, type FooterLink } from "./components/Footer";
export {
  FeaturedCard,
  NotableCard,
  MiniCard,
  type FeaturedCardProps,
  type MiniCardProps,
  type CardAction,
} from "./components/Card";
export {
  ProjectDetail,
  type ProjectDetailProps,
  type ProjectDetailNav,
} from "./components/ProjectDetail";
export {
  LiveDemoShell,
  type LiveDemoShellProps,
} from "./components/LiveDemoShell";

// ── Tailwind preset(供 app 的 tailwind.config 引用)──
export { default as tailwindPreset } from "./tailwind-preset";
