"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DropdownContextValue = { open: boolean; setOpen: (open: boolean) => void };

const DropdownContext = React.createContext<DropdownContextValue>({ open: false, setOpen: () => {} });

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return <DropdownContext.Provider value={{ open, setOpen }}>{children}</DropdownContext.Provider>;
}

function DropdownMenuTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = React.useContext(DropdownContext);
  return (
    <span onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className={cn("inline-flex", className)}>
      {children}
    </span>
  );
}

function DropdownMenuContent({ className, align = "end", children }: {
  className?: string;
  align?: "start" | "end";
  children: React.ReactNode;
}) {
  const { open, setOpen } = React.useContext(DropdownContext);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "cosmic-dropdown absolute z-50 mt-2 min-w-[180px] overflow-hidden py-1 animate-slideUp",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { setOpen } = React.useContext(DropdownContext);
  return (
    <div
      className={cn("flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm text-cosmic-header hover:bg-white/10 hover:text-cosmic-nav-hover", className)}
      onClick={() => setOpen(false)}
      {...props}
    />
  );
}

function DropdownMenuSeparator() {
  return <div className="mx-2 my-1 h-px bg-white/10" />;
}

function DropdownMenuLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-2 text-xs font-semibold text-cosmic-muted", className)} {...props} />;
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel };
