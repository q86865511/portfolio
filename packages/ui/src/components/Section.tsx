import { type ReactNode } from "react";
import { cn } from "../lib/cn";

export interface SectionProps {
  id: string;
  /** 區塊小編號 / eyebrow,如 "01 / SKILLS"。 */
  eyebrow?: string;
  title: ReactNode;
  /** 綁定 H2 的 id(用於 aria-labelledby)。預設 `${id}-h2`。 */
  headingId?: string;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
  /** 是否渲染區塊標頭(eyebrow + 標題 + 導言)。 */
  withHeader?: boolean;
}

export function Section({
  id,
  eyebrow,
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
      className={cn("py-9 scroll-mt-20", className)}
    >
      <div className="container">
        {withHeader && (
          <div className="mb-6 max-w-measure">
            {eyebrow && (
              <p className="font-mono text-sm text-brand tracking-[0.04em] mb-[10px]">
                {eyebrow}
              </p>
            )}
            <h2
              id={hid}
              className="text-2xl md:text-3xl mb-3"
              style={{ fontSize: "clamp(28px,4vw,39px)" }}
            >
              {title}
            </h2>
            {intro && (
              <p className="text-text-muted text-[17px]">{intro}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
