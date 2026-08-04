import type { MetadataRoute } from "next";

const SITE_URL = "https://sci.spaceroute.cn";
const TODAY = new Date().toISOString().split("T")[0];

/**
 * Sitemap：为每个 URL 声明所有支持语言的 hreflang alternates，
 * 并添加 x-default（当无匹配语言时的回退）。
 * 注意：由于此项目采用单 URL（语言通过 cookie / Accept-Language 内部协商，
 * 而非 /en/xxx /zh/xxx 前缀），所有交替语言指向同一 canonical URL。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const alternatesAll = {
    languages: {
      "zh-CN": SITE_URL,          // 中文（简体）
      "en-US": SITE_URL,          // 英语（美国）
      "es-ES": SITE_URL,          // 西班牙语（西班牙）
      "x-default": SITE_URL,      // 无匹配语言时的回退（Google 推荐）
    },
  };

  const buildEntry = (
    path: string,
    priority: number,
    changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"],
  ): MetadataRoute.Sitemap[number] => {
    const url = `${SITE_URL}${path === "/" ? "" : path}`;
    return {
      url,
      lastModified: new Date(TODAY),
      changeFrequency: changeFreq,
      priority,
      alternates: {
        languages: {
          "zh-CN": url,
          "en-US": url,
          "es-ES": url,
          "x-default": url,
        },
      },
    };
  };

  return [
    buildEntry("/", 1.0, "monthly"),
    buildEntry("/netcdf", 0.9, "monthly"),
    buildEntry("/hdf5", 0.9, "monthly"),
  ];
}
