import type { Metadata } from "next";
import { Theme } from "@radix-ui/themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "NCView - Scientific Data Viewer",
  description: "View NetCDF and HDF5 scientific data files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Theme>
          {children}
        </Theme>
      </body>
    </html>
  );
}
