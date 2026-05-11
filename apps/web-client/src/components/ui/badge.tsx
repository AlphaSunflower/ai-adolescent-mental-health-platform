import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "cosmic-tag",
        gold: "bg-gradient-to-r from-[#f6d365]/30 to-[#fda085]/30 border border-cosmic-gold/40 text-cosmic-gold",
        warning: "bg-orange-500/20 border border-orange-500/30 text-orange-300",
        destructive: "bg-red-500/20 border border-red-500/30 text-red-300",
        success: "bg-green-500/20 border border-green-500/30 text-green-300",
        secondary: "bg-white/10 border border-white/15 text-cosmic-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
