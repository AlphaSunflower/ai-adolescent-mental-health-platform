import * as React from "react";
import { cn } from "@/lib/utils";
import { toneClass, type Tone } from "./tone";

type BadgeVariant = "default" | "gold" | "warning" | "destructive" | "success" | "secondary";

/** Map the shadcn badge "intent" variants onto pouf tones. Two tones are NOT
 *  thin aliases: gold→yellow and warning→orange deliberately diverge so a
 *  "gold" highlight and a "warning" state stay distinguishable on screen. */
const variantToTone: Record<BadgeVariant, Tone> = {
  default: "purple",
  gold: "yellow",
  warning: "orange",
  destructive: "pink",
  success: "mint",
  secondary: "purple",
};

/** Pouf badge — a small pastel pill with dark ink, the pouf "chip" language.
 *  Uses the tone classes so --tone resolves once; the fill is read off it
 *  (bg-[var(--tone)]) and the label off the on-accent token. */
function Badge({
  className,
  variant = "default",
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  tone?: Tone;
}) {
  const resolved = tone ?? variantToTone[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-3 py-1 text-xs font-black",
        toneClass(resolved),
        "bg-[var(--tone)] text-[var(--on-accent)]",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
