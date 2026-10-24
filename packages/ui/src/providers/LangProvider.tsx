"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "zh" | "en";

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  /** 依當前語言挑選 zh/en 值的小工具。 */
  t: <T>(zh: T, en: T) => T;
}

const STORAGE_KEY = "resume-lang";
const DEFAULT_LANG: Lang = "zh";

const LangContext = createContext<LangContextValue | null>(null);

function htmlLang(lang: Lang): string {
  return lang === "zh" ? "zh-Hant" : "en";
}

export function LangProvider({
  children,
  initialLang = DEFAULT_LANG,
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  // 首次掛載:網址 ?lang=zh|en 優先(可分享的英文版連結,如 PDF / LinkedIn 上的 ?lang=en),
  // 其次 localStorage,預設 zh。
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const fromUrl = url.searchParams.get("lang");
      if (fromUrl === "zh" || fromUrl === "en") {
        setLangState(fromUrl);
        // 套用後從網址移除,之後使用者手動切換語言就不會在重新整理/返回時被參數蓋回去。
        url.searchParams.delete("lang");
        window.history.replaceState(window.history.state, "", url);
        return;
      }
      const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored === "zh" || stored === "en") {
        setLangState(stored);
      }
    } catch {
      /* localStorage 不可用時靜默退回預設 */
    }
  }, []);

  // 同步 <html lang> 與持久化
  useEffect(() => {
    document.documentElement.lang = htmlLang(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(
    () => setLangState((prev) => (prev === "zh" ? "en" : "zh")),
    [],
  );
  const t = useCallback(
    <T,>(zh: T, en: T): T => (lang === "zh" ? zh : en),
    [lang],
  );

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang 必須在 <LangProvider> 內使用");
  }
  return ctx;
}
