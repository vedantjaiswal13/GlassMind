/**
 * Input Component
 *
 * Clean text input with variant and size support.
 * Follows Apple HIG — minimal chrome, generous padding, subtle borders.
 *
 * @example
 * <Input variant="default" size="md" placeholder="Search..." />
 * <Input variant="glass" size="lg" />
 */

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  [
    "flex w-full rounded-xl bg-transparent",
    "text-foreground placeholder:text-muted-foreground/60",
    "transition-all duration-200 ease-out",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: [
          "border border-border bg-background",
          "hover:border-border/80",
          "focus-visible:border-transparent",
        ],
        filled: [
          "border border-transparent bg-secondary",
          "hover:bg-secondary/80",
          "focus-visible:bg-background focus-visible:border-transparent",
        ],
        glass: [
          "border border-white/20 bg-white/10 backdrop-blur-xl",
          "hover:bg-white/15",
          "focus-visible:bg-white/20 focus-visible:border-white/30",
          "dark:bg-white/5 dark:border-white/10",
          "dark:hover:bg-white/8",
          "dark:focus-visible:bg-white/10",
        ],
        ghost: [
          "border border-transparent bg-transparent",
          "hover:bg-accent",
          "focus-visible:bg-accent",
        ],
      },
      inputSize: {
        sm: "h-8 px-3 text-sm rounded-lg",
        md: "h-9 px-3.5 text-sm",
        lg: "h-10 px-4 text-base",
        xl: "h-12 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  }
);

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
export type { InputProps };
