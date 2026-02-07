"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";

const CACHE_KEY = "i18n-cache";
const CHUNK_SIZE = 12;
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "CODE", "PRE"]);

function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

function loadCache() {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return new Map();
    const parsed = JSON.parse(raw);
    return new Map(Object.entries(parsed));
  } catch {
    return new Map();
  }
}

function saveCache(cache) {
  if (typeof window === "undefined") return;
  try {
    const obj = Object.fromEntries(cache.entries());
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore quota or serialization errors.
  }
}

async function translateBatch(texts) {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, sourceLocale: "en", targetLocale: "ar" }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Translation failed");
  return Array.isArray(json.data?.texts) ? json.data.texts : [];
}

export default function AutoTranslate({ children }) {
  const { lang } = useLanguage();
  const rootRef = useRef(null);
  const originalsRef = useRef(new WeakMap());
  const cache = useMemo(() => loadCache(), []);
  useEffect(() => {
    if (!rootRef.current) return;

    const restoreOriginals = () => {
      const walker = document.createTreeWalker(rootRef.current, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const original = originalsRef.current.get(node);
        if (original) node.textContent = original;
        node = walker.nextNode();
      }
    };

    const translateNodeText = async () => {
      const textNodes = [];
      const walker = document.createTreeWalker(rootRef.current, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const parent = node.parentElement;
        const text = node.textContent || "";
        const trimmed = text.trim();
        if (
          parent &&
          !SKIP_TAGS.has(parent.tagName) &&
          !parent.closest("[data-no-translate]") &&
          trimmed &&
          !isArabic(trimmed)
        ) {
          if (!originalsRef.current.has(node)) originalsRef.current.set(node, text);
          textNodes.push(node);
        }
        node = walker.nextNode();
      }

      const uniqueTexts = [];
      const indexMap = new Map();
      textNodes.forEach((n) => {
        const original = originalsRef.current.get(n) || n.textContent || "";
        if (!indexMap.has(original)) {
          indexMap.set(original, uniqueTexts.length);
          uniqueTexts.push(original);
        }
      });

      const translated = new Array(uniqueTexts.length).fill("");
      const toTranslate = [];
      const toTranslateIdx = [];

      uniqueTexts.forEach((text, idx) => {
        if (cache.has(text)) {
          translated[idx] = cache.get(text);
        } else {
          toTranslate.push(text);
          toTranslateIdx.push(idx);
        }
      });

      for (let i = 0; i < toTranslate.length; i += CHUNK_SIZE) {
        const chunk = toTranslate.slice(i, i + CHUNK_SIZE);
        const results = await translateBatch(chunk);
        results.forEach((value, offset) => {
          const idx = toTranslateIdx[i + offset];
          translated[idx] = value || chunk[offset];
          cache.set(chunk[offset], translated[idx]);
        });
        saveCache(cache);
      }

      textNodes.forEach((n) => {
        const original = originalsRef.current.get(n) || n.textContent || "";
        const idx = indexMap.get(original);
        const next = translated[idx] || original;
        n.textContent = next;
      });
    };

    if (lang === "ar") {
      translateNodeText();
    } else {
      restoreOriginals();
    }
  }, [lang, cache]);

  return <div ref={rootRef}>{children}</div>;
}
