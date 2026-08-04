/**
 * i18n 共享常量：完全无 React / Client 依赖，
 * 可同时被 server 代码（generateMetadata/layout/sitemap）和
 * client 代码（I18nProvider）安全 import。
 */
export type Locale = "zh" | "en" | "es";

export const LOCALES: Locale[] = ["zh", "en", "es"];

export const LOCALE_STORAGE_KEY = "ncview.locale";

export const DEFAULT_LOCALE: Locale = "zh";

export const LOCALE_META: Record<
  Locale,
  { label: string; langTag: string; flagCode: string }
> = {
  zh: { label: "中文", langTag: "zh-CN", flagCode: "🇨🇳" },
  en: { label: "English", langTag: "en-US", flagCode: "🇺🇸" },
  es: { label: "Español", langTag: "es-ES", flagCode: "🇪🇸" },
};

export function getLocaleMeta(locale: Locale) {
  return LOCALE_META[locale];
}
