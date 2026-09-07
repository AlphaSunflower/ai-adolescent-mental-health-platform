"use client";

import { usePathname } from "next/navigation";
import { PoufAppShell } from "@/components/pouf-shell/pouf-app-shell";
import { AppShell } from "@/components/cosmic/app-shell";

/** Route-level shell selection. /home gets the pouf clay shell; every other
 *  (main) route keeps the cosmic shell until the global migration lands. */
export function ShellRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/home") {
    return <PoufAppShell>{children}</PoufAppShell>;
  }
  return <AppShell>{children}</AppShell>;
}
