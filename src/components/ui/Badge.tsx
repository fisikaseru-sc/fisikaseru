import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-900",
        className,
      )}
      {...props}
    />
  );
}
