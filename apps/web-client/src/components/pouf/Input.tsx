import * as React from "react";
import { cn } from "@/lib/utils";

/** Pouf text field — a recessed clay channel on a white surface. The recessed
 *  ring (cushion-field) reads as a groove the text sits inside; focus pushes the
 *  focus ring over the same groove (pouf-field-focus) rather than adding an
 *  outline, so the control never shifts. */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "cushion-field h-11 w-full rounded-control bg-surface px-4 py-2.5 text-[15px] font-bold text-ink",
        "placeholder:text-muted focus-visible:cushion-field-focus focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
