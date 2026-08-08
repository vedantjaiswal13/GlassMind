/**
 * Skeleton Component
 *
 * Loading placeholder with shimmer animation.
 * Supports multiple shapes for different content types.
 *
 * @example
 * <Skeleton variant="text" className="w-48" />
 * <Skeleton variant="circular" className="size-10" />
 * <Skeleton variant="rectangular" className="h-32 w-full" />
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const skeletonVariants = cva(
  [
    "animate-pulse bg-muted",
  ],
  {
    variants: {
      variant: {
        default: "rounded-xl",
        text: "h-4 rounded-md",
        circular: "rounded-full aspect-square",
        rectangular: "rounded-xl",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
      },
    },
    compoundVariants: [
      { variant: "text", size: "sm", class: "h-3" },
      { variant: "text", size: "md", class: "h-4" },
      { variant: "text", size: "lg", class: "h-5" },
      { variant: "circular", size: "sm", class: "size-8" },
      { variant: "circular", size: "md", class: "size-10" },
      { variant: "circular", size: "lg", class: "size-12" },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

export { Skeleton, skeletonVariants };
export type { SkeletonProps };
