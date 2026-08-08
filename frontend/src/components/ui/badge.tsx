/**
 * Badge Component
 *
 * Small label for status, categories, and metadata.
 * Multiple variants for different semantic meanings.
 *
 * @example
 * <Badge variant="default">New</Badge>
 * <Badge variant="success" size="sm">Active</Badge>
 * <Badge variant="glass">Beta</Badge>
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1",
    "font-medium transition-colors duration-150",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "select-none",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm shadow-primary/20",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground shadow-sm shadow-destructive/20",
        outline: "border border-border text-foreground bg-transparent",
        success: [
          "bg-emerald-100 text-emerald-800",
          "dark:bg-emerald-900/30 dark:text-emerald-400",
        ],
        warning: [
          "bg-amber-100 text-amber-800",
          "dark:bg-amber-900/30 dark:text-amber-400",
        ],
        info: [
          "bg-blue-100 text-blue-800",
          "dark:bg-blue-900/30 dark:text-blue-400",
        ],
        glass: [
          "bg-white/15 text-foreground backdrop-blur-xl border border-white/20",
          "dark:bg-white/10 dark:border-white/10",
        ],
      },
      size: {
        sm: "px-1.5 py-0.5 text-[10px] rounded-md",
        md: "px-2.5 py-0.5 text-xs rounded-lg",
        lg: "px-3 py-1 text-sm rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
export type { BadgeProps };
