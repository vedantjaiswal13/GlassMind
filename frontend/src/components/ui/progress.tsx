/**
 * Progress Component
 *
 * Animated progress bar built on Radix Progress.
 * Smooth fill animation with variant and size support.
 *
 * @example
 * <Progress value={66} variant="default" size="md" />
 * <Progress value={33} variant="gradient" size="sm" />
 */

"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const progressTrackVariants = cva(
  [
    "relative w-full overflow-hidden rounded-full",
    "bg-secondary",
  ],
  {
    variants: {
      size: {
        xs: "h-1",
        sm: "h-1.5",
        md: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const progressIndicatorVariants = cva(
  [
    "h-full rounded-full",
    "transition-all duration-500 ease-out",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        destructive: "bg-destructive",
        gradient: "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
        glass: [
          "bg-white/40 backdrop-blur-sm",
          "dark:bg-white/20",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressTrackVariants>,
    VariantProps<typeof progressIndicatorVariants> {}

const Progress = React.forwardRef<
  React.ComponentRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant, size, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressTrackVariants({ size, className }))}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(progressIndicatorVariants({ variant }))}
      style={{ width: `${value ?? 0}%` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = "Progress";

export { Progress, progressTrackVariants, progressIndicatorVariants };
export type { ProgressProps };
