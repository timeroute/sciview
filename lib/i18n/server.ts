/**
 * 服务器端 i18n 工具：供 generateMetadata / layout / sitemap / robots 等服务器代码使用
 * 不依赖 React / Context，不依赖 "use client" 模块，可以直接 import 使用
 */
import { cookies, headers } from "next/headers";
import { messages as zhMessages, type Messages } from "./zh";
import { messages as enMessages } from "./en";
import { messages as esMessages } from "./es";
import {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type Locale,
} from "./shared";

export type { Locale } from "./shared";

/** 语言包映射（直接导入的静态对象） */
const LOCALE_BUNDLES: Record<Locale, Messages> = {
  zh: zhMessages,
  en: enMessages,
  es: esMessages,
};

/** locale 到 HTML lang 标签 / OG locale / JSON-LD inLanguage 的映射 */
export const LOCALE_LANG_TAG: Record<
  Locale,
  { htmlLang: string; ogLocale: string; jsonLdLang: string }
> = {
  zh: { htmlLang: "zh-CN", ogLocale: "zh_CN", jsonLdLang: "zh-CN" },
  en: { htmlLang: "en-US", ogLocale: "en_US", jsonLdLang: "en-US" },
  es: { htmlLang: "es-ES", ogLocale: "es_ES", jsonLdLang: "es-ES" },
};

/** hreflang 交替语言标签：所有页面通用，包含 x-default */
export const HREFLANG_MAP: Record<string, string> & { "x-default"?: string } = {
  "zh-CN": "/",
  "en-US": "/",
  "es-ES": "/",
  "x-default": "/",
};

/**
 * 从 accept-language header 值中解析最匹配的 locale
 * 仅在 cookie 未命中时回退到此方法
 */
function parseAcceptLanguage(raw: string | null): Locale {
  if (!raw) return DEFAULT_LOCALE;
  const entries = raw
    .split(",")
    .map((seg) => {
      const [tag, qPart] = seg.split(";") as [string, string?];
      const q = qPart ? Number(qPart.split("=")[1] ?? 1) : 1;
      return { tag: (tag || "").trim().toLowerCase(), q: isNaN(q) ? 1 : q };
    })
    .filter((e) => e.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of entries) {
    if (tag.startsWith("es")) return "es";
    if (tag.startsWith("en")) return "en";
    if (tag.startsWith("zh")) return "zh";
  }
  return DEFAULT_LOCALE;
}

/**
 * 从 Cookie header 字符串中解析 locale cookie
 */
function parseCookieLocale(cookieHeader: string | null): Locale | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(LOCALE_STORAGE_KEY + "="));
  if (!match) return null;
  const raw = match.split("=")[1];
  if (!raw) return null;
  const decoded = decodeURIComponent(raw);
  if ((LOCALES as string[]).includes(decoded)) return decoded as Locale;
  return null;
}

/**
 * 服务器端 locale 检测：
 * 优先级：cookie 手动选择值 > accept-language 浏览器偏好 > DEFAULT_LOCALE
 *
 * 在静态预渲染（prerender）场景下，cookies() / headers() 会抛错，
 * 此时安全地回退到 DEFAULT_LOCALE。
 */
export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get(LOCALE_STORAGE_KEY)?.value;
    if (cookieVal && (LOCALES as string[]).includes(cookieVal)) {
      return cookieVal as Locale;
    }
  } catch {
    // 静态生成场景 cookies() 不可用；继续尝试 headers
  }
  try {
    const h = await headers();
    const cookieHeader = h.get("cookie");
    const fromCookie = parseCookieLocale(cookieHeader);
    if (fromCookie) return fromCookie;
    const acceptLang = h.get("accept-language");
    return parseAcceptLanguage(acceptLang);
  } catch {
    return DEFAULT_LOCALE;
  }
}

/** 根据 locale 获取翻译消息包（服务器端用） */
export function getMessages(locale: Locale): Messages {
  return LOCALE_BUNDLES[locale] ?? LOCALE_BUNDLES[DEFAULT_LOCALE];
}

/** 安全的嵌套字段读取：支持 "seo.root.titleDefault" 路径 */
function getByPath(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const seg of path.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return cur;
}

/** 服务器端简易翻译函数：按路径取值，失败回退到默认语言 */
export function serverT(
  locale: Locale,
  key: string,
  variables?: Record<string, string | number>,
): string {
  const bundle = LOCALE_BUNDLES[locale] ?? LOCALE_BUNDLES[DEFAULT_LOCALE];
  const fallbackBundle = LOCALE_BUNDLES[DEFAULT_LOCALE];
  const value = getByPath(bundle, key);
  const fallback = getByPath(fallbackBundle, key);
  const template =
    typeof value === "string"
      ? value
      : typeof fallback === "string"
        ? fallback
        : key;
  if (!variables) return template;
  return template.replace(/\{([a-zA-Z_][\w]*)\}/g, (_, k: string) =>
    variables[k] !== undefined ? String(variables[k]) : `{${k}}`,
  );
}

/** 获取 locale 的语言描述符（html lang, og locale, jsonld lang） */
export function getLangMeta(locale: Locale) {
  return LOCALE_LANG_TAG[locale] ?? LOCALE_LANG_TAG[DEFAULT_LOCALE];
}
