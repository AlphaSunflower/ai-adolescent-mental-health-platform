"use client";

import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export function PlaceholderPage({
  title,
  description = "该功能正在建设中，敬请期待。",
  backHref = "/me",
  backLabel = "返回个人中心",
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1 text-sm text-cosmic-muted hover:text-cosmic-sky transition-colors"
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Link>
      <div className="cosmic-card p-12 text-center">
        <Construction className="mx-auto mb-4 size-16 text-cosmic-gold opacity-40" />
        <h1 className="mb-2 text-2xl font-bold text-white">{title}</h1>
        <p className="text-cosmic-muted">{description}</p>
      </div>
    </div>
  );
}
