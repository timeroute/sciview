import type { Metadata } from "next";
import { Theme } from "@radix-ui/themes";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NCView - 科学数据可视化查看器",
  description: "专业的 NetCDF 和 HDF5 科学数据文件查看与可视化工具",
  keywords: ["NetCDF", "HDF5", "科学数据", "数据可视化", "NCView"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0a0e1a" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <Theme
          appearance="dark"
          accentColor="cyan"
          grayColor="slate"
          scaling="100%"
          panelBackground="solid"
          hasBackground={false}
        >
          {children}
        </Theme>
        <Analytics />
      </body>
    </html>
  );
}
