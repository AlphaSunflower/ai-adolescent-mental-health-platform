import * as React from "react";
import { cn } from "@/lib/utils";

/** Pouf clay card — the soft white slab that carries the whole home surface.
 *  The cushion shadow (inset top highlight + floor lip + outer drop) is the
 *  clay read; the radius is the shared --radius-card 32px. */
function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("cushion-card rounded-card bg-surface/85", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-black text-ink", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm font-bold text-muted", className)} {...props} />;
}

export { Card, CardContent, CardTitle, CardDescription };
