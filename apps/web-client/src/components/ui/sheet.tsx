"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { X } from "lucide-react";

type SheetContextValue = { open: boolean; setOpen: (open: boolean) => void };

const SheetContext = React.createContext<SheetContextValue>({ open: false, setOpen: () => {} });

function Sheet({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = (value: boolean) => {
    if (onOpenChange) onOpenChange(value);
    if (controlledOpen === undefined) setUncontrolledOpen(value);
  };
  return <SheetContext.Provider value={{ open, setOpen }}>{children}</SheetContext.Provider>;
}

function SheetTrigger({
  children,
  className,
  asChild,
}: {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}) {
  const { setOpen } = React.useContext(SheetContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<{ onClick?: React.MouseEventHandler }>).props.onClick?.(e);
        setOpen(true);
      },
    });
  }
  return (
    <span onClick={() => setOpen(true)} className={cn("inline-flex", className)}>
      {children}
    </span>
  );
}

function SheetContent({
  className,
  children,
  side = "left",
}: {
  className?: string;
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
}) {
  const { open, setOpen } = React.useContext(SheetContext);

  const sideClasses = {
    left: "left-0 top-0 h-full w-80 max-w-[85vw] animate-slide-in-left",
    right: "right-0 top-0 h-full w-80 max-w-[85vw] animate-slide-in-right",
    top: "left-0 top-0 w-full h-auto",
    bottom: "left-0 bottom-0 w-full h-auto",
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className={cn("cosmic-dropdown fixed z-50 overflow-y-auto p-6", sideClasses[side], className)}>
        <Button variant="ghost" size="icon-sm" className="absolute right-4 top-4 text-cosmic-muted hover:text-white" onClick={() => setOpen(false)}>
          <X />
        </Button>
        {children}
      </div>
    </>
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-cosmic-gold", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-sm text-cosmic-muted", className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription };
