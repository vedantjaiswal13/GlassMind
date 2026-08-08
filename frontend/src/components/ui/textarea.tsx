/**
 * Textarea Component
 *
 * Multi-line text input with auto-resize support.
 * Matches Input component styling conventions.
 *
 * @example
 * <Textarea variant="default" placeholder="Type your message..." />
 * <Textarea variant="glass" rows={4} />
 */

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  [
    "flex w-full rounded-xl bg-transparent",
    "text-foreground placeholder:text-muted-foreground/60",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "min-h-[80px] resize-none",
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
      textareaSize: {
        sm: "px-3 py-2 text-sm rounded-lg",
        md: "px-3.5 py-2.5 text-sm",
        lg: "px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      textareaSize: "md",
    },
  }
);

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, textareaSize, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, textareaSize, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
export type { TextareaProps };
