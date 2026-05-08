"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-display font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-text-primary",
        primary: "bg-accent-cobalt/10 text-accent-cobalt",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        danger: "bg-red-50 text-rose",
        teal: "bg-teal/10 text-teal",
        violet: "bg-violet/10 text-violet",
        outline: "border border-border-default text-text-muted",
        pro: "bg-gradient-to-r from-amber to-amber/80 text-white",
        new: "bg-accent-cobalt text-white",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
