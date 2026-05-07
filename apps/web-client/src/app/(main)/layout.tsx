import { AppShell } from "@/components/cosmic/app-shell";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
