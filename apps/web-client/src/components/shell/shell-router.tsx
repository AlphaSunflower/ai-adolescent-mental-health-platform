"use client";

import { usePathname } from "next/navigation";
import { PoufAppShell } from "@/components/pouf-shell/pouf-app-shell";
import { AppShell } from "@/components/cosmic/app-shell";

/** Routes that have graduated to the pouf clay shell. This list grows as each
 *  main route is migrated (P1) and is deleted entirely in P2 once every route
 *  is pouf, collapsing the dual shell to a single always-on PoufAppShell. */
const POUF_ROUTES = new Set(["/home", "/ai", "/assessment", "/consultation"]);

/** Route-level shell selection. Graduated routes get the pouf clay shell; the
 *  rest keep the cosmic shell until the global migration lands. Prefix match so
 *  nested/dynamic routes (e.g. /consultation/psychologist/123) inherit their
 *  section's shell without being listed individually. */
export function ShellRouter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPouf = [...POUF_ROUTES].some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (isPouf) {
    return <PoufAppShell>{children}</PoufAppShell>;
  }
  return <AppShell>{children}</AppShell>;
}
