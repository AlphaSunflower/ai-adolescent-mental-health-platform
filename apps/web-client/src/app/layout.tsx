import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
