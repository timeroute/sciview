import type { MetadataRoute } from "next";

const SITE_URL = "https://sci.spaceroute.cn";
const TODAY = new Date().toISOString().split("T")[0];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(TODAY),
      changeFrequency: "monthly",
      priority: 1.0,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}/`,
          "en-US": `${SITE_URL}/`,
        },
      },
    },
    {
      url: `${SITE_URL}/netcdf`,
      lastModified: new Date(TODAY),
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}/netcdf`,
          "en-US": `${SITE_URL}/netcdf`,
        },
      },
    },
    {
      url: `${SITE_URL}/hdf5`,
      lastModified: new Date(TODAY),
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: {
        languages: {
          "zh-CN": `${SITE_URL}/hdf5`,
          "en-US": `${SITE_URL}/hdf5`,
        },
      },
    },
  ];
}
