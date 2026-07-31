import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const SITE_URL = "https://sci.spaceroute.cn";
const SITE_NAME = "NCView";
const SITE_DESC =
  "专业的 NetCDF 与 HDF5 科学数据文件查看与可视化工具，在浏览器端即时解析多维数组与层级结构，本地安全处理，支持丰富图表可视化。";
const SITE_KEYWORDS = [
  "NetCDF",
  "NetCDF Viewer",
  "netcdfjs",
  "HDF5",
  "HDF5 Viewer",
  "h5wasm",
  ".nc 查看器",
  ".h5 查看器",
  "科学数据可视化",
  "多维数组解析",
  "气候数据",
  "气象数据",
  "NCView",
  "在线查看 NetCDF",
  "在线查看 HDF5",
  "浏览器端解析",
  "数据洞察",
];
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const OG_IMAGE_ALT = "NCView - 科学数据可视化查看器";
const AUTHOR = "NCView Team";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - 科学数据可视化查看器`,
    template: `%s · ${SITE_NAME}`,
    absolute: `${SITE_NAME} - 科学数据可视化查看器 | NetCDF 与 HDF5 在线解析`,
  },
  description: SITE_DESC,
  keywords: SITE_KEYWORDS,
  category: "Science / Data Visualization",
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR, url: SITE_URL }],
  creator: AUTHOR,
  publisher: SITE_NAME,
  generator: "Next.js",
  alternates: {
    canonical: "/",
    languages: {
      "zh-CN": "/",
      "en-US": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: {
      default: `${SITE_NAME} - 科学数据可视化查看器`,
      template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESC,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: OG_IMAGE_ALT,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: `${SITE_NAME} - 科学数据可视化查看器`,
      template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESC,
    creator: "@ncview",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: OG_IMAGE_ALT,
      },
    ],
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
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/favicon.ico", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  abstract: SITE_DESC,
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
  verification: {
    google: "ncview-site-verification",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0e1a" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
  colorScheme: "dark light",
};

// 防止主题闪烁的内联脚本 - 在渲染前执行
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || 'system';
    var isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    var html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
    // 设置 meta theme-color
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', isDark ? '#0a0e1a' : '#f8fafc');
    }
  } catch (e) {}
})();
`;

// 站点级 JSON-LD：WebSite + Organization（所有页面共用，提升爬虫语义理解）
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      "url": SITE_URL,
      "name": "NCView",
      "alternateName": "NCView - 科学数据可视化查看器",
      "description":
        "专业的 NetCDF 与 HDF5 科学数据文件查看与可视化工具，在浏览器端即时解析多维数组与层级结构，本地安全处理，支持丰富图表可视化。",
      "inLanguage": "zh-CN",
      "potentialAction": [
        {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${SITE_URL}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      ],
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      "name": "NCView Team",
      "url": SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/favicon.ico`,
        "width": 64,
        "height": 64,
      },
      "sameAs": [
        "https://github.com/timeroute/sciview",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* theme-color 与 viewport 已由 metadata / viewport 导出处理；保留 script 防止主题闪烁 */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
