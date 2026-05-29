import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "心愈智联 - 管理端",
  description: "青少年心理健康 AI 平台管理端",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
