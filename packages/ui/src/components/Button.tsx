"use client";

import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-md border border-transparent cursor-pointer whitespace-nowrap transition-all duration-DEFAULT ease-ease active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed";

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-brand text-text-onbrand hover:bg-brand-hover",
  secondary:
    "bg-transparent text-text border-border-strong hover:bg-surface-2 hover:border-text-subtle",
  ghost: "bg-transparent text-text-muted hover:bg-surface-2 hover:text-text",
  icon: "bg-transparent text-text-muted border-border justify-center p-0 hover:bg-surface-2 hover:text-text hover:border-border-strong",
};

// 觸控目標 ≥44px:最小尺寸(sm)也保證 min-h-[44px](WCAG 2.5.5)。
const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-[44px] py-2 text-sm px-4",
  md: "min-h-[44px] h-11 text-sm px-5",
  lg: "min-h-[48px] h-12 text-base px-6",
  xl: "min-h-[56px] h-14 text-base px-7",
};

const iconSizeClass: Record<ButtonSize, string> = {
  sm: "h-11 w-11 px-0",
  md: "h-11 w-11 px-0",
  lg: "h-12 w-12 px-0",
  xl: "h-14 w-14 px-0",
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    as?: "button";
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    as: "a";
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function classesFor(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
): string {
  return cn(
    base,
    variantClass[variant],
    variant === "icon" ? iconSizeClass[size] : sizeClass[size],
    className,
  );
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(props, ref) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = classesFor(variant, size, className);

  if (props.as === "a") {
    const { as: _as, variant: _v, size: _s, className: _c, ...rest } = props;
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  const { as: _as, variant: _v, size: _s, className: _c, ...rest } = props;
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} {...rest}>
      {children}
    </button>
  );
});
