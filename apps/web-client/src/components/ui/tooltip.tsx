"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function Tooltip({
  content,
  children,
  className,
}: {
  content: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [show, setShow] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });
  const ref = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left + rect.width / 2 });
    }
    setShow(true);
  };

  return (
    <div ref={ref} onMouseEnter={handleMouseEnter} onMouseLeave={() => setShow(false)} className="inline-flex">
      {children}
      {show && (
        <div
          className={cn(
            "cosmic-dropdown fixed z-50 rounded-lg px-3 py-1.5 text-xs text-cosmic-header",
            className
          )}
          style={{ top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export { Tooltip, TooltipProvider };
