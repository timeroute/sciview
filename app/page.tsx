import type { Metadata } from "next";
import HomeClient from "@/components/HomePage";
import { getServerLocale } from "@/lib/i18n/server";
import {
  buildHomeMetadata,
  buildHomePageJsonLd,
} from "@/lib/i18n/metadata";

/**
 * 首页动态 Metadata：根据服务器端检测的 locale 生成对应语言
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildHomeMetadata(locale);
}

/**
 * 首页（Server Component）：
 * - 服务器端生成多语言页面级 JSON-LD（WebPage + WebApplication + BreadcrumbList）
 * - UI 由客户端 HomeClient 组件渲染
 */
export default async function Home() {
  const locale = await getServerLocale();
  const pageJsonLd = buildHomePageJsonLd(locale);

  return (
    <>
      <HomeClient />
      {/* 页面级 SEO 结构化数据：多语言版本 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
    </>
  );
}
