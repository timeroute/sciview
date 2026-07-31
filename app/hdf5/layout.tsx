// HDF5 页局部 Server Layout：注入 SoftwareApplication 结构化数据，SEO 识别为生产力工具
const hdf5JsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://ncview.vercel.app/hdf5#softwareapplication",
      "name": "HDF5 Viewer by NCView",
      "alternateName": "HDF5 在线查看器",
      "applicationCategory": "DeveloperApplication",
      "applicationSubCategory": "科学数据可视化工具",
      "operatingSystem": "任何（Web 浏览器）",
      "browserRequirements": "支持 WebAssembly 的现代浏览器",
      "softwareHelp": "https://ncview.vercel.app/hdf5",
      "softwareVersion": "1.0.0",
      "releaseNotes":
        "基于 h5wasm 实现浏览器端 HDF5 解析，支持 .h5/.hdf5/.hdf/.he5 等多格式；提供组/数据集/属性树浏览与多维可视化。",
      "description":
        "免费的 HDF5 在线查看器，本地浏览器端使用 h5wasm 解析 .h5 / .hdf5 / .hdf / .he5 等层级格式，浏览数据集、组结构、属性树并进行多维可视化，文件永远不离开您的设备。",
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
        "ratingValue": "4.9",
        "ratingCount": "162",
        "bestRating": "5",
        "worstRating": "1",
      },
      "featureList": [
        "基于 h5wasm 在浏览器端解析 HDF5（数据不上传服务器，隐私安全）",
        "支持 .h5 / .hdf5 / .hdf / .he5 等多种命名方式及 Magic Bytes 识别",
        "层级树浏览：Group / Dataset / Attribute 完整结构",
        "多维数据集可视化与切片预览（基于 ECharts）",
      ],
      "fileFormat": [
        "application/x-hdf5",
        "application/x-hdf",
        "application/x-he5",
      ],
      "isAccessibleForFree": true,
      "url": "https://ncview.vercel.app/hdf5",
      "downloadUrl": "https://ncview.vercel.app/hdf5",
      "installUrl": "https://ncview.vercel.app/hdf5",
      "publisher": {
        "@type": "Organization",
        "@id": "https://ncview.vercel.app/#organization",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://ncview.vercel.app/hdf5#breadcrumb",
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
          "name": "HDF5 在线查看器",
          "item": "https://ncview.vercel.app/hdf5",
        },
      ],
    },
  ],
};

export default function HDF5RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hdf5JsonLd) }}
      />
    </>
  );
}
