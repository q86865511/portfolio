import type { Config } from "tailwindcss";

/**
 * 共用 Tailwind preset。
 * 把 docs/01-design-system.md 的 token 映成 theme.extend。
 * 顏色一律走 CSS 變數(於 globals.css 的 :root / [data-theme] 定義),
 * 讓主題切換只換值不換名。
 */
const preset: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-2": "var(--color-surface-2)",
        elevated: "var(--color-elevated)",
        overlay: "var(--color-overlay)",
        text: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
          subtle: "var(--color-text-subtle)",
          onbrand: "var(--color-text-onbrand)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        focus: "var(--color-focus)",
        brand: {
          DEFAULT: "var(--color-brand)",
          hover: "var(--color-brand-hover)",
          dim: "var(--color-brand-dim)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          dim: "var(--color-accent-dim)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          dim: "var(--color-success-dim)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          dim: "var(--color-warning-dim)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          dim: "var(--color-danger-dim)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          dim: "var(--color-info-dim)",
        },
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      fontSize: {
        // Major Third (1.250) scale,[size, line-height]
        xs: ["0.75rem", { lineHeight: "1.5" }], // 12
        sm: ["0.875rem", { lineHeight: "1.6" }], // 14
        base: ["1rem", { lineHeight: "1.7" }], // 16
        lg: ["1.25rem", { lineHeight: "1.5" }], // 20
        xl: ["1.5625rem", { lineHeight: "1.35" }], // 25
        "2xl": ["1.9375rem", { lineHeight: "1.25" }], // 31
        "3xl": ["2.4375rem", { lineHeight: "1.15" }], // 39
        "4xl": ["3.0625rem", { lineHeight: "1.1" }], // 49
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        bold: "700",
      },
      spacing: {
        // 8px 基準柵格(對齊 docs/01 的 --space-*)
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "24px",
        "6": "32px",
        "7": "48px",
        "8": "64px",
        "9": "96px",
        "10": "128px",
      },
      maxWidth: {
        container: "1120px",
        measure: "68ch",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
        full: "999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,.30)",
        md: "0 6px 20px rgba(0,0,0,.35)",
        lg: "0 16px 48px rgba(0,0,0,.45)",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(.2,.7,.2,1)",
        ease: "cubic-bezier(.2,.7,.2,1)",
      },
      transitionDuration: {
        fast: "120ms",
        DEFAULT: "200ms",
        slow: "320ms",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
  },
  plugins: [],
};

export default preset;
