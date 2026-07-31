import type { MetadataRoute } from "next";

const SITE_URL = "https://ncview.vercel.app";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NCView - 科学数据可视化查看器",
    short_name: "NCView",
    description:
      "专业的 NetCDF 与 HDF5 科学数据文件查看与可视化工具，浏览器端本地解析，隐私安全，图表丰富。",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "portrait-primary",
    background_color: "#0a0e1a",
    theme_color: "#0a0e1a",
    dir: "ltr",
    lang: "zh-CN",
    id: "ncview-app",
    categories: ["developer-tools", "productivity", "science", "utilities"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "NetCDF 在线查看器",
        short_name: "NetCDF",
        description: "打开 NetCDF 在线查看器页面",
        url: `${SITE_URL}/netcdf`,
        icons: [{ src: "/favicon.ico", sizes: "any" }],
      },
      {
        name: "HDF5 在线查看器",
        short_name: "HDF5",
        description: "打开 HDF5 在线查看器页面",
        url: `${SITE_URL}/hdf5`,
        icons: [{ src: "/favicon.ico", sizes: "any" }],
      },
    ],
    prefer_related_applications: false,
    launch_handler: {
      client_mode: ["navigate-existing", "auto"],
    },
  };
}
