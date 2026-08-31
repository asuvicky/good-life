import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "好生活社區｜包裹通知",
  description: "社區包裹與郵件通知系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
