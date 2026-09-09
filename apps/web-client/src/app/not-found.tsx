import type { Metadata } from "next";
import { NotFoundBrickBreaker } from "@/components/effects/not-found-brick-breaker";

export const metadata: Metadata = {
  title: "404 · 找不到页面 — 心愈智联",
};

export default function NotFound() {
  return <NotFoundBrickBreaker />;
}
