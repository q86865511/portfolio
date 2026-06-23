"use client";

import { useLang, type Lang } from "../providers/LangProvider";
import { cn } from "../lib/cn";

const options: { value: Lang; label: string }[] = [
  { value: "zh", label: "繁" },
  { value: "en", label: "EN" },
];

/** 雙語分段切換(segmented control)。 */
export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();

  return (
    <div
      role="group"
      aria-label="Language / 語言"
      className={cn(
        "inline-flex bg-surface-2 border border-border rounded-md p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = lang === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(opt.value)}
            className={cn(
              // 觸控目標 ≥44px:每顆 segment 本身 min-h 40px,
              // 加上外框 p-1(各 4px)總高 48px,單顆命中區也夠大。
              "inline-flex items-center justify-center min-h-[40px] min-w-[40px] font-medium text-sm border-none rounded-sm px-3 cursor-pointer transition-all duration-DEFAULT ease-ease",
              active
                ? "bg-brand text-text-onbrand"
                : "bg-transparent text-text-muted hover:text-text",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
