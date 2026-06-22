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
        "inline-flex bg-surface-2 border border-border rounded-md p-[2px]",
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
              "font-medium text-sm border-none rounded-[7px] px-3 py-[5px] cursor-pointer transition-all duration-DEFAULT ease-ease",
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
