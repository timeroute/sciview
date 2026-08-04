import type { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";
import { buildNetcdfMetadata } from "@/lib/i18n/metadata";

/**
 * NetCDF 页面动态 Metadata：根据服务器端检测的 locale 生成对应语言
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildNetcdfMetadata(locale);
}
