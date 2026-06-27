import { useEffect, useMemo, useState } from "react";
import { copy } from "../i18n/copy";
import type { Language } from "../types/pet";

const languageKey = "deskpaw-language";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem(languageKey);
    return stored === "en" ? "en" : "zh";
  });

  useEffect(() => {
    localStorage.setItem(languageKey, language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const t = useMemo(() => copy[language], [language]);

  return { language, setLanguage, t };
}
