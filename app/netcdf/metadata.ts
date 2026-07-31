import type { Metadata } from "next";

const CANONICAL_URL = "/netcdf";
const OG_IMAGE = "/og-image.png";

export const metadata: Metadata = {
  title: {
    default: "NetCDF Viewer - 在线解析多维科学数据",
    absolute: "NetCDF 在线查看器 | 多维数组解析与可视化 · NCView",
  },
  description:
    "免费的 NetCDF 在线查看器，浏览器端即时解析 .nc / .netcdf / _nc 等格式文件，本地安全打开，支持查看变量、维度、属性并进行图表可视化，无需上传服务器。",
  keywords: [
    "NetCDF",
    "NetCDF Viewer",
    "在线查看 NetCDF",
    ".nc 文件查看器",
    ".nc 在线打开",
    "netcdfjs",
    "气候数据",
    "气象数据",
    "海洋数据",
    "多维数组",
    "netCDF4",
    "NetCDF Classic",
    "科学数据可视化",
  ],
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    type: "website",
    url: CANONICAL_URL,
    title: {
      default: "NetCDF Viewer - 在线解析多维科学数据",
      absolute: "NetCDF 在线查看器 | 多维数组解析与可视化 · NCView",
    },
    description:
      "免费的 NetCDF 在线查看器，浏览器端即时解析 .nc / .netcdf / _nc 等格式文件，本地安全打开，支持查看变量、维度、属性并进行图表可视化。",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "NetCDF 在线查看器 - NCView",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NetCDF 在线查看器 | 多维数组解析与可视化 · NCView",
    description:
      "免费的 NetCDF 在线查看器，浏览器端即时解析 .nc / .netcdf / _nc 等格式文件，本地安全打开，支持查看变量、维度、属性并进行图表可视化。",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "NetCDF 在线查看器 - NCView",
      },
    ],
  },
};
