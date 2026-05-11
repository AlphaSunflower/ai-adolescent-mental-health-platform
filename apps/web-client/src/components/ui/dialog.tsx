"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { X } from "lucide-react";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  setOpen: () => {},
});

function Dialog({
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
  return <DialogContext.Provider value={{ open, setOpen }}>{children}</DialogContext.Provider>;
}

function useDialog() {
  return React.useContext(DialogContext);
}

function DialogTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { setOpen } = useDialog();
  return (
    <span onClick={() => setOpen(true)} className={cn("inline-flex", className)}>
      {children}
    </span>
  );
}

function DialogOverlay({ className }: { className?: string }) {
  const { open, setOpen } = useDialog();
  if (!open) return null;
  return (
    <div
      className={cn("fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fadeIn", className)}
      onClick={() => setOpen(false)}
    />
  );
}

function DialogContent({
  className,
  children,
  showClose = true,
}: {
  className?: string;
  children: React.ReactNode;
  showClose?: boolean;
}) {
  const { open, setOpen } = useDialog();
  if (!open) return null;
  return (
    <>
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            "cosmic-dialog relative w-full max-w-lg animate-fadeInUp",
            className
          )}
        >
          {showClose && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute right-3 top-3 text-cosmic-muted hover:text-white"
              onClick={() => setOpen(false)}
            >
              <X />
            </Button>
          )}
          {children}
        </div>
      </div>
    </>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pt-6", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold text-cosmic-gold", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-2 text-sm text-cosmic-muted", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex justify-end gap-3 border-t border-white/10 px-6 py-4", className)} {...props} />;
}

function DialogClose({
  className,
  children,
  asChild,
}: {
  className?: string;
  children?: React.ReactNode;
  asChild?: boolean;
}) {
  const { setOpen } = useDialog();
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
      onClick: (e: React.MouseEvent) => {
        (children as React.ReactElement<{ onClick?: React.MouseEventHandler }>).props.onClick?.(e);
        setOpen(false);
      },
    });
  }
  return (
    <Button variant="outline" size="sm" className={className} onClick={() => setOpen(false)}>
      {children ?? "取消"}
    </Button>
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogOverlay,
};
