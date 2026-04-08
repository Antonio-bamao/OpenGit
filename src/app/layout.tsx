import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenGit",
  description: "Interactive Git and GitHub visualization learning platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

