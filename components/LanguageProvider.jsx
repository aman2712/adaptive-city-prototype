"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem("app-lang");
    return stored === "ar" ? "ar" : "en";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("app-lang", lang);
    document.documentElement.lang = lang === "ar" ? "ar" : "en";
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang: setLangState,
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
