// 自研轻量级 i18n 方案：Context + useHook，零外部依赖
// 支持浏览器语言自动检测 + localStorage 持久化 + 手动切换
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { messages as zhMessages, type Messages } from "./zh";
import { messages as enMessages } from "./en";
import { messages as esMessages } from "./es";
// 共享常量：与服务器代码共用，避免重复定义不同步
import {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  LOCALE_META,
  getLocaleMeta,
  type Locale,
} from "./shared";

export type { Locale } from "./shared";
export { LOCALES, DEFAULT_LOCALE, LOCALE_STORAGE_KEY, getLocaleMeta };

const LOCALE_BUNDLES: Record<Locale, Messages> = {
  zh: zhMessages,
  en: enMessages,
  es: esMessages,
};

/** 判断浏览器偏好与 Accept-Language 映射 */
function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const raw: readonly string[] =
    // navigator.languages 优先级高于单个 language
    (navigator.languages as string[] | undefined) ??
    (navigator.language ? [navigator.language] : []);
  for (const lang of raw) {
    if (!lang) continue;
    const lower = lang.toLowerCase();
    // 西班牙语族
    if (lower.startsWith("es")) return "es";
    // 英语族
    if (lower.startsWith("en")) return "en";
    // 中文族
    if (lower.startsWith("zh")) return "zh";
    // 常见别名 catch
    if (lower.includes("spanish")) return "es";
    if (lower.includes("english")) return "en";
    if (lower.includes("chinese")) return "zh";
  }
  return DEFAULT_LOCALE;
}

/** 翻译键路径：支持 "common.ready" 这样的嵌套字符串 */
type KeysOf<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? K extends string
          ? `${K}.${KeysOf<T[K]>}`
          : never
        : K extends string
          ? K
          : never;
    }[keyof T]
  : never;
type TranslationKeys = KeysOf<Messages>;

function getByPath(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const seg of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

/** 简单变量插值：支持 {name} 占位符 */
function interpolate(
  template: string,
  variables?: Record<string, string | number>,
): string {
  if (!variables) return template;
  return template.replace(
    /\{([a-zA-Z_][\w]*)\}/g,
    (_, key: string) =>
      variables[key] !== undefined ? String(variables[key]) : `{${key}}`,
  );
}

interface I18nContextShape {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (
    key: TranslationKeys | (string & {}),
    variables?: Record<string, string | number>,
  ) => string;
  formatLocale: (n: number) => string;
  formatFileSize: (bytes: number) => string;
  messages: Messages;
  /** 用户是否已经手动选择过（决定是否自动跟随浏览器变化） */
  isUserSelected: boolean;
}

const I18nContext = createContext<I18nContextShape | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isUserSelected, setIsUserSelected] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // 初始化：读取 localStorage 或浏览器偏好，并同步写入 cookie
  useEffect(() => {
    let resolved: Locale = DEFAULT_LOCALE;
    let userSel = false;
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as
        | Locale
        | null;
      if (stored && (LOCALES as string[]).includes(stored)) {
        resolved = stored;
        userSel = true;
      } else {
        resolved = detectBrowserLocale();
        userSel = false;
      }
    } catch {
      resolved = detectBrowserLocale();
      userSel = false;
    } finally {
      setLocaleState(resolved);
      setIsUserSelected(userSel);
      setIsHydrated(true);
    }
    // 同步写入 cookie，便于 SSR / generateMetadata 读取
    try {
      const maxAge = 60 * 60 * 24 * 365;
      document.cookie = `${LOCALE_STORAGE_KEY}=${encodeURIComponent(
        resolved,
      )}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } catch {
      /* ignore */
    }
  }, []);

  // 自动跟随浏览器语言变化（仅用户未手动选择过时）
  useEffect(() => {
    if (isUserSelected || !isHydrated) return;
    if (typeof window === "undefined") return;
    const handler = () => {
      setLocaleState((prev) => {
        const detected = detectBrowserLocale();
        return detected === prev ? prev : detected;
      });
    };
    window.addEventListener("languagechange", handler);
    return () => window.removeEventListener("languagechange", handler);
  }, [isUserSelected, isHydrated]);

  // 同步到 <html lang> 属性
  useEffect(() => {
    if (!isHydrated) return;
    const root = document.documentElement;
    root.setAttribute("lang", LOCALE_META[locale].langTag);
  }, [locale, isHydrated]);

  const setLocale = useCallback((l: Locale) => {
    if (!(LOCALES as string[]).includes(l)) return;
    setLocaleState(l);
    setIsUserSelected(true);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    // 写入 cookie（1 年过期，path=/），以便服务器端 generateMetadata / SSR 能读取
    try {
      const maxAge = 60 * 60 * 24 * 365;
      document.cookie = `${LOCALE_STORAGE_KEY}=${encodeURIComponent(
        l,
      )}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (
      key: TranslationKeys | (string & {}),
      variables?: Record<string, string | number>,
    ): string => {
      const bundle = LOCALE_BUNDLES[locale];
      const value = getByPath(bundle, key);
      const fallback =
        getByPath(LOCALE_BUNDLES[DEFAULT_LOCALE], key) ?? key;
      const template =
        typeof value === "string" ? value : (fallback as string);
      return interpolate(template, variables);
    },
    [locale],
  );

  const formatLocale = useCallback(
    (n: number) => {
      try {
        return new Intl.NumberFormat(LOCALE_META[locale].langTag).format(n);
      } catch {
        return String(n);
      }
    },
    [locale],
  );

  const formatFileSize = useCallback(
    (bytes: number) => {
      if (bytes === 0) return `0 ${t("common.bytes")}`;
      const k = 1024;
      const sizes = ["common.bytes", "common.kb", "common.mb", "common.gb", "common.tb"];
      const i = Math.min(
        Math.floor(Math.log(bytes) / Math.log(k)),
        sizes.length - 1,
      );
      const n = bytes / Math.pow(k, i);
      const numStr = n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2);
      try {
        const formatted = new Intl.NumberFormat(
          LOCALE_META[locale].langTag,
        ).format(Number(numStr));
        return `${formatted} ${t(sizes[i])}`;
      } catch {
        return `${numStr} ${t(sizes[i])}`;
      }
    },
    [locale, t],
  );

  const value = useMemo<I18nContextShape>(
    () => ({
      locale,
      setLocale,
      t,
      formatLocale,
      formatFileSize,
      messages: LOCALE_BUNDLES[locale],
      isUserSelected,
    }),
    [locale, setLocale, t, formatLocale, formatFileSize, isUserSelected],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextShape {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // 对于在 Provider 外部调用的组件（如 SSR 阶段 / 静态属性引用），返回降级包装，避免崩溃
    const _locale = DEFAULT_LOCALE;
    const fallbackT: I18nContextShape["t"] = (key, variables) => {
      const fallback = getByPath(LOCALE_BUNDLES[_locale], key) ?? key;
      return interpolate(fallback as string, variables);
    };
    return {
      locale: _locale,
      setLocale: () => undefined,
      t: fallbackT,
      formatLocale: (n) => String(n),
      formatFileSize: (bytes) => {
        if (bytes === 0) return `0 ${fallbackT("common.bytes")}`;
        const k = 1024;
        const sizes = ["common.bytes", "common.kb", "common.mb", "common.gb", "common.tb"];
        const i = Math.min(
          Math.floor(Math.log(bytes) / Math.log(k)),
          sizes.length - 1,
        );
        const n = bytes / Math.pow(k, i);
        const numStr = n.toFixed(n >= 100 ? 0 : n >= 10 ? 1 : 2);
        return `${numStr} ${fallbackT(sizes[i])}`;
      },
      messages: LOCALE_BUNDLES[_locale],
      isUserSelected: false,
    };
  }
  return ctx;
}
