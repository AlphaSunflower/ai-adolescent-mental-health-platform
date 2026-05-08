"use client";

import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function FloatingButtons() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-20 right-5 z-20 flex flex-col gap-3 transition-all duration-300"
      style={{ opacity: show ? 1 : 0, transform: show ? "translateX(0)" : "translateX(16px)" }}
    >
      {/* Back to top */}
      <Button
        size="icon-lg"
        variant="ghost"
        onClick={scrollToTop}
        className="rounded-full bg-white/10 hover:bg-white/20"
        style={{ alignSelf: "center" }}
      >
        <ArrowUp className="size-5" />
      </Button>
    </div>
  );
}
