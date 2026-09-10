import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import ChunkReloadGuard from "@/components/ChunkReloadGuard";
import { PoufBackground } from "@/components/pouf-shell/pouf-background";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  // 不过早预加载：本 app 正文多走 pouf 的 Nunito，Geist 较少第一时间用到，
  // preload 会导致 console 报“preloaded but not used within a few seconds”警告。
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "心愈智联 — 青少年心理健康 AI 平台",
  description: "AI 问诊、真人咨询、量表评估、内容库",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="icon" href="/xinyuzhilian.svg" />
      </head>
      <body className="h-full antialiased">
        <PoufBackground />
        {children}
        <ChunkReloadGuard />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
