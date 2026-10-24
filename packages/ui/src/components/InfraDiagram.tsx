"use client";

import { useLang } from "../providers/LangProvider";

/**
 * 首屏「本站部署架構」圖:訪客 → Cloudflare 邊緣 → Tunnel(零入站)→ Oracle ARM 上的 Caddy
 * 依網域分流到主站與各子站;左側 GitHub Actions 兩段式部署。
 * 取代純裝飾的幾何圖形——首屏右半直接放 DevOps 主張的實物證據。
 * 色彩走三軸 token(藍=全端/邊緣、紫=CI、綠=infra),雙主題自動適應;
 * Tunnel 虛線流動動畫由全域 reduced-motion kill-switch 停用。
 */
export interface InfraDiagramProps {
  className?: string;
}

const SITES: { host: string; tone: "brand" | "infra" }[] = [
  { host: "terrychou.com", tone: "brand" },
  { host: "erp.", tone: "infra" },
  { host: "eat.", tone: "infra" },
  { host: "steam.", tone: "infra" },
  { host: "soulshard.", tone: "infra" },
];

function delay(i: number) {
  return { ["--hg-delay" as string]: `${i * 90}ms` };
}

export function InfraDiagram({ className }: InfraDiagramProps) {
  const { t } = useLang();

  return (
    <svg
      viewBox="0 0 560 420"
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
          "訪客經 Cloudflare 邊緣與零入站 Tunnel 連到 Oracle Cloud ARM 主機,由 Caddy 依網域分流到主站與四個上線子站;GitHub Actions 建置後由主機上的 runner 部署。",
          "Visitors reach Cloudflare's edge, which forwards through a zero-inbound tunnel to an Oracle Cloud ARM host where Caddy routes each domain to the main site or one of four live subsites; GitHub Actions builds, and a runner on the host deploys.",
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
          TLS · CDN · {t("部署後自動清快取", "auto purge on deploy")}
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
        className="infra-flow"
      />
      <text x="382" y="112" className="infra-sub infra-strong">
        Cloudflare Tunnel
      </text>
      <text x="382" y="130" className="infra-sub">
        {t("零入站埠", "zero inbound ports")}
      </text>

      {/* Oracle ARM + Caddy */}
      <g className="hg-plane" style={delay(2)}>
        <rect
          x="200"
          y="148"
          width="336"
          height="248"
          rx="16"
          fill="var(--color-surface)"
          stroke="var(--color-text)"
          strokeWidth="1.5"
        />
        <text x="222" y="180" className="infra-title">
          Oracle Cloud ARM · Caddy
        </text>
        <text x="222" y="202" className="infra-sub">
          {t(
            "自架主機 · 依網域分流 · /api 反代",
            "self-hosted · host routing · /api proxy",
          )}
        </text>
        {SITES.map((s, i) => {
          const col = i === 0 ? 0 : (i - 1) % 2;
          const row = i === 0 ? 0 : Math.floor((i - 1) / 2) + 1;
          const wide = i === 0;
          const x = 222 + col * 152;
          const y = 222 + row * 52;
          const w = wide ? 292 : 140;
          return (
            <g key={s.host}>
              <rect
                x={x}
                y={y}
                width={w}
                height="38"
                rx="10"
                fill={`var(--color-${s.tone}-dim)`}
                stroke={`var(--color-${s.tone})`}
                strokeOpacity="0.45"
              />
              <text x={x + 14} y={y + 24} className="infra-mono">
                {s.host}
              </text>
            </g>
          );
        })}
      </g>

      {/* GitHub Actions 兩段式部署 */}
      <g className="hg-plane" style={delay(3)}>
        <rect
          x="12"
          y="196"
          width="172"
          height="124"
          rx="14"
          fill="var(--color-accent-dim)"
          stroke="var(--color-accent)"
        />
        <text x="26" y="226" className="infra-title infra-small">
          GitHub Actions
        </text>
        <text x="26" y="252" className="infra-sub">
          {t("① 雲端 build + PDF", "① hosted build + PDF")}
        </text>
        <text x="26" y="274" className="infra-sub">
          {t("② ARM runner 部署", "② ARM runner deploys")}
        </text>
        <text x="26" y="296" className="infra-sub">
          {t("依路徑分流", "path-filtered")}
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
