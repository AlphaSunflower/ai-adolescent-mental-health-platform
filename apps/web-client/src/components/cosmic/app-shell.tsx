import { Starfield } from "./starfield";
import { NavBar } from "./nav-bar";
import { Footer } from "./footer";
import { FloatingButtons } from "./floating-buttons";
import { FeedbackDialogProvider } from "@/components/feedback/feedback-dialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <FeedbackDialogProvider>
      <Starfield />
      <div className="relative z-10 flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingButtons />
      </div>
    </FeedbackDialogProvider>
  );
}
