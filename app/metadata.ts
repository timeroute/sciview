import type { Metadata } from "next";

const CANONICAL_URL = "/";
const OG_IMAGE = "/og-image.png";
const HOME_TITLE = "NCView - NetCDF / HDF5 科学数据可视化查看器";
const HOME_DESC =
  "免费专业的 NetCDF 与 HDF5 在线查看器，浏览器端即时解析多维科学数据与层级结构，100% 本地处理不离开设备，支持变量/维度/属性浏览与图表可视化。";
const HOME_KEYWORDS = [
  "NetCDF 在线查看器",
  "HDF5 在线查看器",
  ".nc 打开",
  ".h5 打开",
  "科学数据可视化",
  "NetCDF 可视化",
  "HDF5 可视化",
  "气候数据查看",
  "多维数组",
  "本地解析",
];

export const metadata: Metadata = {
  title: {
    default: HOME_TITLE,
    absolute: HOME_TITLE + " | 浏览器端本地解析与图表可视化",
  },
  description: HOME_DESC,
  keywords: HOME_KEYWORDS,
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    type: "website",
    url: CANONICAL_URL,
    title: {
      default: HOME_TITLE,
      absolute: HOME_TITLE + " | 浏览器端本地解析与图表可视化",
    },
    description: HOME_DESC,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "NCView 首页 - NetCDF 与 HDF5 在线可视化工具",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESC,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "NCView 首页 - NetCDF 与 HDF5 在线可视化工具",
      },
    ],
  },
};

