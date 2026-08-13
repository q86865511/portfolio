"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 捲動進場 reveal(IntersectionObserver + CSS transition,零依賴)。
 * 原則:初始 HTML 恆可見——JS 掛上 observer 時才隱藏尚未入視口的元素,
 * 無 JS / 爬蟲 / reduced-motion 一律直接看到最終態。
 */
export interface RevealProps {
  children: ReactNode;
  /** 進場延遲(ms),供卡片群做 stagger。 */
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // 已在首屏可視範圍內的元素不做進場,避免載入閃爍。
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    el.classList.add("reveal-hidden");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("reveal-shown");
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
