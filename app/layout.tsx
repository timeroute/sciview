import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppProviders } from "@/components/AppProviders";
import "./globals.css";
// 服务器端 i18n / metadata 工具
import { getServerLocale, getLangMeta } from "@/lib/i18n/server";
import {
  buildRootMetadata,
  buildSiteJsonLd,
} from "@/lib/i18n/metadata";

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

/**
 * 动态根 Metadata：服务器端根据 cookie / accept-language 检测 locale，
 * 生成对应语言的 title / description / keywords / OG / Twitter / alternates / robots 等
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildRootMetadata(locale);
}

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

/**
 * 根 Layout：在服务器端检测 locale，
 * - 动态设置 <html lang> 属性
 * - 动态生成站点级 JSON-LD（WebSite + Organization）
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const langMeta = getLangMeta(locale);
  const siteJsonLd = buildSiteJsonLd(locale);

  return (
    <html lang={langMeta.htmlLang} suppressHydrationWarning>
      <head>
        {/* theme-color 与 viewport 已由 metadata / viewport 导出处理；保留 script 防止主题闪烁 */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AppProviders>
          <ThemeProvider>{children}</ThemeProvider>
        </AppProviders>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
