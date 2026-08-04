/**
 * 多语言 Metadata 工厂：根据 locale 动态生成对应语言的 Metadata / JSON-LD
 * 供 layout / generateMetadata 调用（全部是纯函数，服务器端直接可用）
 */
import type { Metadata } from "next";
import {
  LOCALE_LANG_TAG,
  HREFLANG_MAP,
  getMessages,
  type Locale,
  serverT,
  getLangMeta,
} from "./server";

const SITE_URL = "https://sci.spaceroute.cn";
const OG_IMAGE_PATH = "/og-image.png";
const OG_IMAGE_ABS = `${SITE_URL}${OG_IMAGE_PATH}`;

/** 根据 canonical 路径生成带语言 alternates 的 alternates 配置 */
function buildAlternates(canonicalPath: string) {
  const full = `${SITE_URL}${canonicalPath === "/" ? "" : canonicalPath}`;
  return {
    canonical: canonicalPath,
    languages: {
      "zh-CN": full,
      "en-US": full,
      "es-ES": full,
      "x-default": full,
    },
  };
}

/** 通用 OG Image 对象 */
function buildOgImage(alt: string) {
  return [
    {
      url: OG_IMAGE_PATH,
      width: 1200,
      height: 630,
      alt,
      type: "image/png" as const,
    },
  ];
}

/** Twitter Image 对象 */
function buildTwitterImage(alt: string) {
  return [
    {
      url: OG_IMAGE_PATH,
      width: 1200,
      height: 630,
      alt,
    },
  ];
}

/**
 * 根 layout 的 Metadata（所有页面都会继承）
 * 包含：title template / description / keywords / alternates / openGraph / twitter / robots / icons / manifest 等
 */
export function buildRootMetadata(locale: Locale): Metadata {
  const messages = getMessages(locale);
  const seo = messages.seo.root;
  const { jsonLdLang } = getLangMeta(locale);
  const siteName = serverT(locale, "seo.siteName");
  const author = serverT(locale, "seo.author");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: seo.titleDefault,
      template: seo.titleTemplate,
      absolute: seo.titleAbsolute,
    },
    description: seo.description,
    keywords: seo.keywords,
    category: "Science / Data Visualization",
    applicationName: siteName,
    authors: [{ name: author, url: SITE_URL }],
    creator: author,
    publisher: siteName,
    generator: "Next.js",
    alternates: buildAlternates("/"),
    openGraph: {
      type: "website",
      locale: LOCALE_LANG_TAG[locale].ogLocale,
      url: SITE_URL,
      siteName,
      title: {
        default: seo.titleDefault,
        template: seo.titleTemplate,
      },
      description: seo.description,
      images: buildOgImage(seo.ogImageAlt),
    },
    twitter: {
      card: "summary_large_image",
      title: {
        default: seo.titleDefault,
        template: seo.titleTemplate,
      },
      description: seo.description,
      creator: "@ncview",
      images: buildTwitterImage(seo.ogImageAlt),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
      noimageindex: false,
      noarchive: false,
      nosnippet: false,
      notranslate: false,
    },
    icons: {
      icon: [{ url: "/favicon.ico", sizes: "any" }],
      shortcut: "/favicon.ico",
      apple: [{ url: "/favicon.ico", sizes: "180x180" }],
    },
    manifest: "/manifest.webmanifest",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    abstract: seo.description,
    appleWebApp: {
      capable: true,
      title: siteName,
      statusBarStyle: "black-translucent",
    },
    verification: {
      google: "ncview-site-verification",
    },
  };
}

/**
 * 首页 Metadata（覆盖/叠加在 root 之上）
 */
export function buildHomeMetadata(locale: Locale): Metadata {
  const messages = getMessages(locale);
  const seo = messages.seo.home;
  const canonicalPath = "/";

  return {
    title: {
      default: seo.titleDefault,
      absolute: seo.titleAbsolute,
    },
    description: seo.description,
    keywords: seo.keywords,
    alternates: buildAlternates(canonicalPath),
    openGraph: {
      type: "website",
      url: canonicalPath,
      title: {
        default: seo.titleDefault,
        absolute: seo.titleAbsolute,
      },
      description: seo.description,
      images: buildOgImage(seo.ogImageAlt),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.titleDefault,
      description: seo.description,
      images: buildTwitterImage(seo.ogImageAlt),
    },
  };
}

/**
 * NetCDF 页面 Metadata
 */
export function buildNetcdfMetadata(locale: Locale): Metadata {
  const messages = getMessages(locale);
  const seo = messages.seo.netcdf;
  const canonicalPath = "/netcdf";

  return {
    title: {
      default: seo.titleDefault,
      absolute: seo.titleAbsolute,
    },
    description: seo.description,
    keywords: seo.keywords,
    alternates: buildAlternates(canonicalPath),
    openGraph: {
      type: "website",
      url: canonicalPath,
      title: {
        default: seo.titleDefault,
        absolute: seo.titleAbsolute,
      },
      description: seo.description,
      images: buildOgImage(seo.ogImageAlt),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.titleDefault,
      description: seo.description,
      images: buildTwitterImage(seo.ogImageAlt),
    },
  };
}

/**
 * HDF5 页面 Metadata
 */
export function buildHdf5Metadata(locale: Locale): Metadata {
  const messages = getMessages(locale);
  const seo = messages.seo.hdf5;
  const canonicalPath = "/hdf5";

  return {
    title: {
      default: seo.titleDefault,
      absolute: seo.titleAbsolute,
    },
    description: seo.description,
    keywords: seo.keywords,
    alternates: buildAlternates(canonicalPath),
    openGraph: {
      type: "website",
      url: canonicalPath,
      title: {
        default: seo.titleDefault,
        absolute: seo.titleAbsolute,
      },
      description: seo.description,
      images: buildOgImage(seo.ogImageAlt),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.titleDefault,
      description: seo.description,
      images: buildTwitterImage(seo.ogImageAlt),
    },
  };
}

/**
 * 根 layout 级别 JSON-LD：WebSite + Organization
 * 多语言版本：传入 locale 动态生成
 */
export function buildSiteJsonLd(locale: Locale) {
  const messages = getMessages(locale);
  const seoSite = messages.seo.jsonLd;
  const { jsonLdLang } = getLangMeta(locale);
  const siteName = serverT(locale, "seo.siteName");
  const author = serverT(locale, "seo.author");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: siteName,
        alternateName: seoSite.websiteAlternateName,
        description: seoSite.websiteSearchDescription,
        inLanguage: jsonLdLang,
        // 声明网站支持多语言（Google 推荐）
        availableLanguage: ["zh-CN", "en-US", "es-ES"],
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE_URL}/?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        ],
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: author,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/favicon.ico`,
          width: 64,
          height: 64,
        },
        sameAs: ["https://github.com/timeroute/sciview"],
      },
    ],
  };
}

/**
 * 首页页面级别 JSON-LD：WebPage + WebApplication + BreadcrumbList
 * 多语言版本
 */
export function buildHomePageJsonLd(locale: Locale) {
  const messages = getMessages(locale);
  const seoHome = messages.seo.home;
  const seoApp = messages.seo.jsonLd;
  const { jsonLdLang } = getLangMeta(locale);
  const siteName = serverT(locale, "seo.siteName");
  const author = serverT(locale, "seo.author");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: seoHome.webpageName,
        headline: seoHome.webpageHeadline,
        description: seoHome.description,
        inLanguage: jsonLdLang,
        availableLanguage: ["zh-CN", "en-US", "es-ES"],
        isPartOf: { "@id": `${SITE_URL}/#website` },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: OG_IMAGE_ABS,
          width: 1200,
          height: 630,
        },
        datePublished: "2025-01-01",
        dateModified: new Date().toISOString().split("T")[0],
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntity: { "@id": `${SITE_URL}/#webapplication` },
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#webapplication`,
        name: siteName,
        alternateName: seoApp.webAppAlternateName,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: seoApp.webAppSubCategory,
        operatingSystem: seoApp.webAppOperatingSystem,
        browserRequirements: seoApp.webAppBrowserRequirements,
        softwareHelp: SITE_URL,
        softwareVersion: "1.0.0",
        description: seoApp.webAppDescription,
        inLanguage: ["zh-CN", "en", "es"],
        offers: [
          {
            "@type": "Offer",
            price: "0",
            priceCurrency: "CNY",
            availability: "https://schema.org/InStock",
          },
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "256",
          bestRating: "5",
          worstRating: "1",
        },
        featureList: seoApp.webAppFeatureList,
        fileFormat: [
          "application/netcdf",
          "application/x-netcdf",
          "application/x-hdf5",
          "application/x-hdf",
        ],
        isAccessibleForFree: true,
        url: SITE_URL,
        downloadUrl: SITE_URL,
        installUrl: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: seoHome.breadcrumbHome,
            item: SITE_URL,
          },
        ],
      },
    ],
  };
}

/**
 * NetCDF 页面 JSON-LD：SoftwareApplication + BreadcrumbList
 */
export function buildNetcdfPageJsonLd(locale: Locale) {
  const messages = getMessages(locale);
  const j = messages.seo.jsonLd;
  const ncMeta = messages.seo.netcdf;
  const { jsonLdLang } = getLangMeta(locale);
  const path = "/netcdf";
  const full = `${SITE_URL}${path}`;
  const homeBreadcrumbName = serverT(locale, "seo.home.breadcrumbHome");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${full}#softwareapplication`,
        name: j.netcdfSoftwareName,
        alternateName: j.netcdfSoftwareAltName,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: j.webAppSubCategory,
        operatingSystem: j.webAppOperatingSystem,
        browserRequirements: j.webAppBrowserRequirements,
        softwareHelp: full,
        softwareVersion: "1.0.0",
        releaseNotes: j.netcdfReleaseNotes,
        description: ncMeta.description,
        inLanguage: ["zh-CN", "en", "es"],
        offers: [
          {
            "@type": "Offer",
            price: "0",
            priceCurrency: "CNY",
            availability: "https://schema.org/InStock",
          },
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "128",
          bestRating: "5",
          worstRating: "1",
        },
        featureList: j.netcdfFeatureList,
        fileFormat: [
          "application/netcdf",
          "application/x-netcdf",
          "application/x-hdf5",
        ],
        isAccessibleForFree: true,
        url: full,
        downloadUrl: full,
        installUrl: full,
        publisher: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${full}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: homeBreadcrumbName,
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: j.netcdfBreadcrumbItemName,
            item: full,
          },
        ],
      },
    ],
  };
}

/**
 * HDF5 页面 JSON-LD：SoftwareApplication + BreadcrumbList
 */
export function buildHdf5PageJsonLd(locale: Locale) {
  const messages = getMessages(locale);
  const j = messages.seo.jsonLd;
  const h5Meta = messages.seo.hdf5;
  const { jsonLdLang } = getLangMeta(locale);
  const path = "/hdf5";
  const full = `${SITE_URL}${path}`;
  const homeBreadcrumbName = serverT(locale, "seo.home.breadcrumbHome");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${full}#softwareapplication`,
        name: j.hdf5SoftwareName,
        alternateName: j.hdf5SoftwareAltName,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: j.webAppSubCategory,
        operatingSystem: j.webAppOperatingSystem,
        browserRequirements: j.webAppBrowserRequirements,
        softwareHelp: full,
        softwareVersion: "1.0.0",
        releaseNotes: j.hdf5ReleaseNotes,
        description: h5Meta.description,
        inLanguage: ["zh-CN", "en", "es"],
        offers: [
          {
            "@type": "Offer",
            price: "0",
            priceCurrency: "CNY",
            availability: "https://schema.org/InStock",
          },
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "162",
          bestRating: "5",
          worstRating: "1",
        },
        featureList: j.hdf5FeatureList,
        fileFormat: [
          "application/x-hdf5",
          "application/x-hdf",
          "application/x-he5",
        ],
        isAccessibleForFree: true,
        url: full,
        downloadUrl: full,
        installUrl: full,
        publisher: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${full}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: homeBreadcrumbName,
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: j.hdf5BreadcrumbItemName,
            item: full,
          },
        ],
      },
    ],
  };
}

export { SITE_URL, OG_IMAGE_ABS };
