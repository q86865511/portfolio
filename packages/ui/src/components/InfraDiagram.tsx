"use client";

import { useLang } from "../providers/LangProvider";

/**
 * 首屏「本站部署架構」圖:訪客 → Cloudflare 邊緣 → Tunnel(零入站)→ Oracle ARM 上的 Caddy
 * 依網域分流到主站與各子站;左側 GitHub Actions 部署。
 * 取代純裝飾的幾何圖形——首屏右半直接放 DevOps 主張的實物證據。
 * 圖上只留節點名稱(3 秒讀得出路徑),細節放在 <desc> 與「關於 → 本站就是證據」卡。
 * 色彩走三軸 token(藍=全端/邊緣、紫=CI、綠=infra),雙主題自動適應;
 * 進場沿用 hg-plane 一次編排動畫,無常駐動畫。
 */
export interface InfraDiagramProps {
  className?: string;
  /** 主站網域(圖中第一格,較寬)。 */
  mainHost?: string;
  /** 子站主機名(如 erp.terrychou.com),由 apps/main 依 projects.json 的 liveUrl 傳入。 */
  hosts?: string[];
}

function delay(i: number) {
  return { ["--hg-delay" as string]: `${i * 90}ms` };
}

const CHIP_H = 38;
const ROW_GAP = 14;

export function InfraDiagram({
  className,
  mainHost = "terrychou.com",
  hosts = [],
}: InfraDiagramProps) {
  const { t } = useLang();
  // 子站只顯示子網域前綴(erp.),主站顯示完整網域。
  const subs = hosts
    .filter((h) => h !== mainHost)
    .map((h) =>
      h.endsWith(`.${mainHost}`) ? h.slice(0, -mainHost.length) : h,
    );
  const subRows = Math.ceil(subs.length / 2);
  const boxTop = 148;
  const chipsTop = 216;
  const boxH = chipsTop - boxTop + (subRows + 1) * (CHIP_H + ROW_GAP) + 10;
  const viewH = Math.max(420, boxTop + boxH + 24);

  return (
    <svg
      viewBox={`0 0 560 ${viewH}`}
      className={className}
      role="img"
      aria-labelledby="infra-title"
      aria-describedby="infra-desc"
    >
      <title id="infra-title">
        {t("本站部署架構", "How this site is deployed")}
      </title>
      <desc id="infra-desc">
        {t(
          `訪客經 Cloudflare 邊緣(TLS、CDN,部署後自動清快取)與零入站 Tunnel 連到 Oracle Cloud ARM 自架主機,由 Caddy 依網域分流到主站與 ${subs.length} 個上線子站並反代 /api;GitHub Actions 依路徑分流,在雲端 build 與產生 PDF 後交給主機上的 runner 部署。`,
          `Visitors reach Cloudflare's edge (TLS, CDN, cache purged on every deploy), which forwards through a zero-inbound tunnel to a self-hosted Oracle Cloud ARM machine where Caddy routes each domain to the main site or one of ${subs.length} live subsites and proxies /api; path-filtered GitHub Actions build the site and PDFs in the cloud, then a runner on the host deploys them.`,
        )}
      </desc>

      <defs>
        <marker
          id="infra-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 Z" fill="var(--color-text-subtle)" />
        </marker>
      </defs>

      {/* 訪客 */}
      <g className="hg-plane" style={delay(0)}>
        <rect
          x="24"
          y="30"
          width="128"
          height="44"
          rx="22"
          fill="var(--color-surface)"
          stroke="var(--color-border-strong)"
        />
        <text x="88" y="57" textAnchor="middle" className="infra-label">
          {t("訪客", "Visitor")}
        </text>
      </g>
      <line
        x1="152"
        y1="52"
        x2="196"
        y2="52"
        stroke="var(--color-text-subtle)"
        strokeWidth="1.5"
        markerEnd="url(#infra-arrow)"
      />

      {/* Cloudflare 邊緣 */}
      <g className="hg-plane" style={delay(1)}>
        <rect
          x="200"
          y="20"
          width="336"
          height="64"
          rx="14"
          fill="var(--color-brand-dim)"
          stroke="var(--color-brand)"
        />
        <text x="222" y="48" className="infra-title">
          {t("Cloudflare 邊緣", "Cloudflare edge")}
        </text>
        <text x="222" y="70" className="infra-sub">
          TLS · CDN
        </text>
      </g>

      {/* Tunnel:零入站 */}
      <line
        x1="368"
        y1="84"
        x2="368"
        y2="144"
        stroke="var(--color-infra)"
        strokeWidth="2.5"
        strokeDasharray="6 6"
      />
      <text x="382" y="112" className="infra-sub infra-strong">
        Tunnel
      </text>
      <text x="382" y="131" className="infra-sub">
        {t("零入站埠", "zero inbound ports")}
      </text>

      {/* Oracle ARM + Caddy */}
      <g className="hg-plane" style={delay(2)}>
        <rect
          x="200"
          y={boxTop}
          width="336"
          height={boxH}
          rx="16"
          fill="var(--color-surface)"
          stroke="var(--color-text)"
          strokeWidth="1.5"
        />
        <text x="222" y="180" className="infra-title">
          Oracle Cloud ARM · Caddy
        </text>
        <text x="222" y="202" className="infra-sub">
          {t("自架主機 · 依網域分流", "self-hosted · routes by domain")}
        </text>
        {[mainHost, ...subs].map((host, i) => {
          const main = i === 0;
          const col = main ? 0 : (i - 1) % 2;
          const row = main ? 0 : Math.floor((i - 1) / 2) + 1;
          const x = 222 + col * 152;
          const y = chipsTop + row * (CHIP_H + ROW_GAP);
          const tone = main ? "brand" : "infra";
          return (
            <g key={host}>
              <rect
                x={x}
                y={y}
                width={main ? 292 : 140}
                height={CHIP_H}
                rx="10"
                fill={`var(--color-${tone}-dim)`}
                stroke={`var(--color-${tone})`}
                strokeOpacity="0.45"
              />
              <text x={x + 14} y={y + 24} className="infra-mono">
                {host}
              </text>
            </g>
          );
        })}
      </g>

      {/* GitHub Actions 部署 */}
      <g className="hg-plane" style={delay(3)}>
        <rect
          x="12"
          y="210"
          width="172"
          height="96"
          rx="14"
          fill="var(--color-accent-dim)"
          stroke="var(--color-accent)"
        />
        <text x="26" y="242" className="infra-title infra-small">
          GitHub Actions
        </text>
        <text x="26" y="268" className="infra-sub">
          build → {t("自動部署", "auto deploy")}
        </text>
        <text x="26" y="290" className="infra-sub">
          CI/CD
        </text>
      </g>
      <line
        x1="184"
        y1="258"
        x2="196"
        y2="258"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        markerEnd="url(#infra-arrow)"
      />
    </svg>
  );
}
