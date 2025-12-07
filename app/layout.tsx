import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Tableau - Data Visualization Studio",
  description: "轻量级数据可视化平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

