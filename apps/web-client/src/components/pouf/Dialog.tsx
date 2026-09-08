"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { IconButton } from "./Button";
import { X } from "lucide-react";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue>({
  open: false,
  setOpen: () => {},
});

/** Pouf modal — a centred clay card over a frosted backdrop, driven by the same
 *  controlled/uncontrolled context API the cosmic ui/dialog uses, but styled
 *  with the pouf overlay/dialog chrome (the .pouf-dialog cushion + blur, with a
 *  full-screen sheet fallback under 900px from pouf.css). */
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
      className={cn("pouf-overlay", className)}
      data-state="open"
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
      <div
        className={cn("pouf-dialog", className)}
        data-state="open"
        role="dialog"
        aria-modal="true"
      >
        {showClose && (
          <div className="pouf-dialog__head">
            <span />
            <IconButton
              icon={<X />}
              label="关闭"
              size="sm"
              variant="quiet"
              onClick={() => setOpen(false)}
            />
          </div>
        )}
        <div className="pouf-dialog__body">{children}</div>
      </div>
    </>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pouf-stack", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-black text-ink", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mt-1 text-[15px] font-bold text-muted", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex justify-end gap-2 pt-4", className)} {...props} />
  );
}

function DialogClose({ children }: { children?: React.ReactNode }) {
  const { setOpen } = useDialog();
  return (
    <Button size="sm" variant="quiet" onClick={() => setOpen(false)}>
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
