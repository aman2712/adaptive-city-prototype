"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-2 py-1 text-xs text-slate-300">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`rounded px-1.5 py-0.5 ${lang === "en" ? "text-slate-100" : "text-slate-500"}`}
      >
        EN
      </button>
      <span className="text-slate-600">|</span>
      <button
        type="button"
        onClick={() => setLang("ar")}
        className={`rounded px-1.5 py-0.5 ${lang === "ar" ? "text-slate-100" : "text-slate-500"}`}
      >
        AR
      </button>
    </div>
  );
}
