"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-medium transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cobalt disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-cobalt text-white hover:bg-accent-cobalt-light active:scale-[0.97] shadow-sm hover:shadow-md",
        secondary:
          "bg-primary-navy text-white hover:bg-primary-navy-light active:scale-[0.97]",
        outline:
          "border border-border-default bg-transparent text-text-primary hover:bg-gray-50 hover:border-accent-cobalt/30 active:scale-[0.97]",
        ghost:
          "text-text-primary hover:bg-gray-50 active:scale-[0.97]",
        link: "text-accent-cobalt underline-offset-4 hover:underline p-0 h-auto",
        teal: "bg-teal text-white hover:bg-teal-light active:scale-[0.97]",
        danger:
          "bg-danger text-white hover:bg-red-600 active:scale-[0.97]",
      },
      size: {
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-10 rounded-lg px-5 text-sm",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
