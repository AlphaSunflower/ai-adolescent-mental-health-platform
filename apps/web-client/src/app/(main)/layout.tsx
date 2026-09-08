import { PoufAppShell } from "@/components/pouf-shell/pouf-app-shell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <PoufAppShell>{children}</PoufAppShell>;
}
