import * as React from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "./tone";

/** Static tone → background map. Tailwind cannot see a computed `bg-${tone}`
 *  string, so the fill must pick a literal class. */
const toneBg: Record<Tone, string> = {
  pink: "bg-pink",
  purple: "bg-purple",
  blue: "bg-blue",
  mint: "bg-mint",
  yellow: "bg-yellow",
  orange: "bg-orange",
  up: "bg-mint",
  down: "bg-pink",
  warn: "bg-yellow",
  info: "bg-blue",
  idle: "bg-purple",
};

/** Pouf progress bar — a soft clay track filled by a pastel tone. The track
 *  keeps a subtle inner field so it reads as recessed, not flat. */
export function Progress({
  className,
  value = 0,
  tone = "mint",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value?: number; tone?: Tone }) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-2 w-full overflow-hidden rounded-pill bg-muted/40",
        className,
      )}
      {...props}
    >
      <div
        className={cn("h-full rounded-pill [transition:width_500ms_ease]", toneBg[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
