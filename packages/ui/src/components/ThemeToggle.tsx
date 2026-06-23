"use client";

import { Moon, Sun } from "lucide-react";
import { useLang } from "../providers/LangProvider";
import { useTheme } from "../providers/ThemeProvider";
import { Button } from "./Button";

/** 深淺色切換 icon button。 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLang();
  const isDark = theme === "dark";

  return (
    <Button
      variant="icon"
      onClick={toggleTheme}
      aria-label={t("切換深淺色主題", "Toggle color theme")}
      title={t("切換主題", "Toggle theme")}
      className={className}
    >
      {isDark ? (
        <Moon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Sun className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
}
