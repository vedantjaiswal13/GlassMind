/**
 * Separator Component
 *
 * Visual divider built on Radix Separator.
 * Supports horizontal and vertical orientations.
 *
 * @example
 * <Separator />
 * <Separator orientation="vertical" className="h-6" />
 * <Separator variant="gradient" />
 */

"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const separatorVariants = cva("shrink-0", {
  variants: {
    variant: {
      default: "bg-border",
      muted: "bg-border/50",
      gradient: "bg-gradient-to-r from-transparent via-border to-transparent",
      strong: "bg-foreground/20",
    },
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full w-px",
    },
  },
  defaultVariants: {
    variant: "default",
    orientation: "horizontal",
  },
});

interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
    Omit<VariantProps<typeof separatorVariants>, "orientation"> {}

const Separator = React.forwardRef<
  React.ComponentRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      className,
      variant,
      orientation = "horizontal",
      decorative = true,
      ...props
    },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(separatorVariants({ variant, orientation, className }))}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator, separatorVariants };
export type { SeparatorProps };
