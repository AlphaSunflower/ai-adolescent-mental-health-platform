import * as React from "react";
import { cn } from "@/lib/utils";

/** Pouf multiline text field — same recessed clay channel as Input, but taller
 *  for message bodies and long answers. */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "cushion-field min-h-[96px] w-full rounded-control bg-surface px-4 py-3 text-[15px] font-bold text-ink",
      "placeholder:text-muted focus-visible:cushion-field-focus focus-visible:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
