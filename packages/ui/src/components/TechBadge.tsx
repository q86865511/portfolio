import { type ReactNode } from "react";
import { cn } from "../lib/cn";

export type TechCategory = "neutral" | "ml" | "infra";

const categoryClass: Record<TechCategory, string> = {
  neutral: "bg-surface-2 text-text-muted border-border",
  ml: "bg-accent-dim text-accent border-transparent",
  infra: "bg-brand-dim text-brand border-transparent",
};

/** AI/ML 類技術關鍵字(套 accent 色) */
const ML_TERMS = new Set(
  [
    "yolov8",
    "tensorrt",
    "onnx",
    "triton",
    "tensorflow",
    "tensorflow 1.x",
    "pytorch",
    "opencv",
    "mediapipe",
    "fc-densenet103",
    "openai api",
    "gemini ai",
    "語義分割",
    "語意分割",
    "numpy",
    "pillow",
  ].map((s) => s.toLowerCase()),
);

/** DevOps / 基礎設施類關鍵字(套 brand 色) */
const INFRA_TERMS = new Set(
  [
    "docker",
    "kubernetes",
    "k8s",
    "prometheus",
    "grafana",
    "github actions",
    "oracle cloud",
    "cloudflare",
    "caddy",
    "aws ec2",
    "pm2",
    "postgresql",
    "redis",
    "cuda",
    "linux/arm64",
    "vite",
    "canvas",
    "canvas api",
  ].map((s) => s.toLowerCase()),
);

/** 依技術名稱推斷分類著色。 */
export function inferTechCategory(tech: string): TechCategory {
  const key = tech.toLowerCase();
  if (ML_TERMS.has(key)) return "ml";
  if (INFRA_TERMS.has(key)) return "infra";
  return "neutral";
}

export interface TechBadgeProps {
  children: ReactNode;
  /** 顯式分類;省略時依文字內容自動推斷。 */
  category?: TechCategory;
  /** 自動推斷分類的來源字串(預設用 children 若為 string)。 */
  autoFrom?: string;
  className?: string;
}

export function TechBadge({
  children,
  category,
  autoFrom,
  className,
}: TechBadgeProps) {
  const source =
    autoFrom ?? (typeof children === "string" ? children : undefined);
  const resolved: TechCategory =
    category ?? (source ? inferTechCategory(source) : "neutral");

  return (
    <span
      className={cn(
        // 展示性(非觸控):padding 對稱、對齊 8px 柵格。
        "inline-block font-mono text-xs leading-[1.4] border rounded-sm px-2 py-1",
        categoryClass[resolved],
        className,
      )}
    >
      {children}
    </span>
  );
}
