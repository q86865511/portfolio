import { type ReactNode } from "react";
import { cn } from "../lib/cn";

export interface SectionProps {
  id: string;
  title: ReactNode;
  /** 綁定 H2 的 id(用於 aria-labelledby)。預設 `${id}-h2`。 */
  headingId?: string;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
  /** 是否渲染區塊標頭(標題 + 導言)。 */
  withHeader?: boolean;
}

export function Section({
  id,
  title,
  headingId,
  intro,
  children,
  className,
  withHeader = true,
}: SectionProps) {
  const hid = headingId ?? `${id}-h2`;
  return (
    <section
      id={id}
      aria-labelledby={hid}
      className={cn("py-8 scroll-mt-20", className)}
    >
      <div className="container">
        {withHeader && (
          <div className="mb-6 max-w-measure">
            {/* 單一流體字級:避免 Tailwind 字級 class 與 inline clamp 衝突。 */}
            <h2
              id={hid}
              className="mb-3 leading-[1.15]"
              style={{ fontSize: "clamp(26px,3.5vw,34px)" }}
            >
              {title}
            </h2>
            {intro && (
              <p className="text-text-muted text-base">{intro}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
