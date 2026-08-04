import type { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";
import { buildHdf5Metadata } from "@/lib/i18n/metadata";

/**
 * HDF5 页面动态 Metadata：根据服务器端检测的 locale 生成对应语言
 */
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildHdf5Metadata(locale);
}
