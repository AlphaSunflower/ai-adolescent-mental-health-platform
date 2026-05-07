import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-gold/30 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "cosmic-btn min-h-[44px]",
        primary: "cosmic-btn-primary min-h-[44px]",
        outline: "border border-white/20 bg-transparent text-white hover:border-cosmic-gold/40 hover:bg-white/5",
        secondary: "bg-white/10 text-white hover:bg-white/15",
        ghost: "text-cosmic-muted hover:bg-white/10 hover:text-white",
        destructive: "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30",
        link: "text-cosmic-sky underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        xs: "h-8 rounded-lg px-2.5 text-xs",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
