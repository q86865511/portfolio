import { cn } from "../lib/cn";

export type ProjectStatus = "live" | "wip" | "showcase";

const statusClass: Record<ProjectStatus, { wrap: string; dot: string }> = {
  live: { wrap: "bg-success-dim text-success", dot: "bg-success" },
  wip: { wrap: "bg-warning-dim text-warning", dot: "bg-warning" },
  showcase: { wrap: "bg-info-dim text-info", dot: "bg-info" },
};

export interface StatusBadgeProps {
  status: ProjectStatus;
  label: string;
  /** 給螢幕報讀器的更完整描述(可選)。 */
  ariaLabel?: string;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  ariaLabel,
  className,
}: StatusBadgeProps) {
  const s = statusClass[status];
  return (
    <span
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-[6px] text-xs font-medium px-[10px] py-1 rounded-full",
        s.wrap,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("w-[6px] h-[6px] rounded-full", s.dot)}
      />
      {label}
    </span>
  );
}
