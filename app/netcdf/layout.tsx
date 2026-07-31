// NetCDF 页局部 Server Layout：注入 SoftwareApplication 结构化数据，SEO 识别为生产力工具
const netcdfJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://ncview.vercel.app/netcdf#softwareapplication",
      "name": "NetCDF Viewer by NCView",
      "alternateName": "NetCDF 在线查看器",
      "applicationCategory": "DeveloperApplication",
      "applicationSubCategory": "科学数据可视化工具",
      "operatingSystem": "任何（Web 浏览器）",
      "browserRequirements": "支持 WebAssembly 的现代浏览器",
      "softwareHelp": "https://ncview.vercel.app/netcdf",
      "softwareVersion": "1.0.0",
      "releaseNotes":
        "支持 NetCDF Classic、NetCDF-64bit offset、NetCDF4/HDF5 格式解析；提供变量、维度、属性、全局元数据浏览与多维图表可视化。",
      "description":
        "免费的 NetCDF 在线查看器，浏览器端即时解析 .nc / .netcdf / _nc 等格式文件，本地安全打开，支持查看变量、维度、属性并进行图表可视化，无需上传服务器。",
      "inLanguage": ["zh-CN", "en"],
      "offers": [
        {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "CNY",
          "availability": "https://schema.org/InStock",
        },
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "128",
        "bestRating": "5",
        "worstRating": "1",
      },
      "featureList": [
        "浏览器端本地解析（数据不上传服务器，隐私安全）",
        "支持 .nc / .netcdf / _nc 等多种命名方式及 Magic Bytes 识别",
        "浏览变量、维度、全局/变量级属性元数据",
        "1D~4D 多维数组图表可视化（基于 ECharts）",
      ],
      "fileFormat": [
        "application/netcdf",
        "application/x-netcdf",
        "application/x-hdf5",
      ],
      "isAccessibleForFree": true,
      "url": "https://ncview.vercel.app/netcdf",
      "downloadUrl": "https://ncview.vercel.app/netcdf",
      "installUrl": "https://ncview.vercel.app/netcdf",
      "publisher": {
        "@type": "Organization",
        "@id": "https://ncview.vercel.app/#organization",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://ncview.vercel.app/netcdf#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "首页",
          "item": "https://ncview.vercel.app/",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "NetCDF 在线查看器",
          "item": "https://ncview.vercel.app/netcdf",
        },
      ],
    },
  ],
};

export default function NetCDFRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(netcdfJsonLd) }}
      />
    </>
  );
}
