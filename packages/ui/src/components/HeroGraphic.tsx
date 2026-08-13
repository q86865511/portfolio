/**
 * 簽名幾何圖形:三軸色(藍/紫/綠)+ 墨色的平面構圖。
 * 純裝飾(aria-hidden),色彩全走 token 變數,雙主題自動適應。
 * 進場動畫用 globals.css 的 hero-plane keyframes,
 * reduced-motion 由全域 kill-switch 直接停在最終態。
 */
export interface HeroGraphicProps {
  className?: string;
}

/** 依序進場的延遲(ms),一次編排的單一動畫時刻。 */
function delay(i: number) {
  return { ["--hg-delay" as string]: `${i * 90}ms` };
}

export function HeroGraphic({ className }: HeroGraphicProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 560 420"
      className={className}
      role="presentation"
    >
      {/* 底層淡藍大圓:空間感 */}
      <circle
        className="hg-plane"
        style={delay(0)}
        cx="200"
        cy="300"
        r="104"
        fill="var(--color-brand)"
        opacity="0.14"
      />
      {/* 主圓:左藍右墨,參考圖的核心構圖 */}
      <g className="hg-plane" style={delay(1)}>
        <circle cx="336" cy="168" r="126" fill="var(--color-brand)" />
        <path d="M336 42 A126 126 0 0 1 336 294 Z" fill="var(--color-text)" />
      </g>
      {/* 紫色四分之一圓:AI-ML 軸 */}
      <path
        className="hg-plane"
        style={delay(2)}
        d="M118 148 A72 72 0 0 1 190 76 L190 148 Z"
        fill="var(--color-accent)"
      />
      {/* 綠色半圓:DevOps 軸 */}
      <path
        className="hg-plane"
        style={delay(3)}
        d="M356 330 A84 84 0 0 1 524 330 Z"
        fill="var(--color-infra)"
      />
      {/* 墨色小半圓與藍點:節奏收尾 */}
      <path
        className="hg-plane"
        style={delay(4)}
        d="M472 214 A54 54 0 0 1 472 322 Z"
        fill="var(--color-text)"
      />
      <circle
        className="hg-plane"
        style={delay(5)}
        cx="120"
        cy="228"
        r="13"
        fill="var(--color-brand)"
      />
      {/* 點陣:工程網格的密碼 */}
      <g className="hg-plane" style={delay(6)} fill="var(--color-text-subtle)">
        {Array.from({ length: 20 }).map((_, i) => (
          <circle
            key={i}
            cx={438 + (i % 5) * 18}
            cy={58 + Math.floor(i / 5) * 18}
            r="2.4"
          />
        ))}
      </g>
    </svg>
  );
}
