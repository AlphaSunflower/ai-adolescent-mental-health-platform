import * as React from "react";
import { cn } from "@/lib/utils";

/** Pouf skeleton — a soft lavender shimmer that mirrors the clay shapes it
 *  replaces. Sizing comes entirely from className (pages pass h-4 w-24, a whole
 *  card, a row), so no fixed height is baked in. Reuses the pouf-shimmer
 *  keyframe from pouf.css. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-control bg-[linear-gradient(90deg,var(--bg)_25%,rgba(201,168,255,0.35)_50%,var(--bg)_75%)] bg-[length:200%_100%]",
        "[animation:pouf-shimmer_1.4s_ease-in-out_infinite]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
