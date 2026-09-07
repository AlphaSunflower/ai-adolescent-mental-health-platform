import { ShellRouter } from "@/components/shell/shell-router";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <ShellRouter>{children}</ShellRouter>;
}
