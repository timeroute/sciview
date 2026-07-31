import type { Metadata } from "next";

const CANONICAL_URL = "/hdf5";
const OG_IMAGE = "/og-image.png";

export const metadata: Metadata = {
  title: {
    default: "HDF5 Viewer - 在线浏览层级数据集",
    absolute: "HDF5 在线查看器 | 层级数据集解析与可视化 · NCView",
  },
  description:
    "免费的 HDF5 在线查看器，本地浏览器端使用 h5wasm 解析 .h5 / .hdf5 / .hdf / .he5 等层级格式，浏览数据集、组结构、属性树并进行多维可视化，文件永远不离开您的设备。",
  keywords: [
    "HDF5",
    "HDF5 Viewer",
    "在线查看 HDF5",
    ".h5 文件查看器",
    ".h5 在线打开",
    "h5wasm",
    "HDF5 层级结构",
    "HDF5 数据集",
    ".he5",
    "HDF-EOS",
    "科学数据可视化",
    "多维数组",
    "Hierarchical Data Format",
  ],
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    type: "website",
    url: CANONICAL_URL,
    title: {
      default: "HDF5 Viewer - 在线浏览层级数据集",
      absolute: "HDF5 在线查看器 | 层级数据集解析与可视化 · NCView",
    },
    description:
      "免费的 HDF5 在线查看器，本地浏览器端使用 h5wasm 解析 .h5 / .hdf5 / .hdf / .he5 等层级格式，浏览数据集、组结构、属性树并进行多维可视化。",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "HDF5 在线查看器 - NCView",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HDF5 在线查看器 | 层级数据集解析与可视化 · NCView",
    description:
      "免费的 HDF5 在线查看器，本地浏览器端使用 h5wasm 解析 .h5 / .hdf5 / .hdf / .he5 等层级格式，浏览数据集、组结构、属性树并进行多维可视化。",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "HDF5 在线查看器 - NCView",
      },
    ],
  },
};
