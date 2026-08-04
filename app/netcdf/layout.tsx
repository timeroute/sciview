// NetCDF 页局部 Server Layout：注入多语言 SoftwareApplication + BreadcrumbList 结构化数据
import { getServerLocale } from "@/lib/i18n/server";
import { buildNetcdfPageJsonLd } from "@/lib/i18n/metadata";

export default async function NetCDFRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();
  const jsonLd = buildNetcdfPageJsonLd(locale);

  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
