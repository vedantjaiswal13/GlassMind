/**
 * Button Component
 *
 * Versatile button with multiple variants, sizes, and motion support.
 * Built on Radix Slot for polymorphic rendering.
 *
 * @example
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="ghost" size="sm" asChild><Link href="/">Home</Link></Button>
 */

"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap rounded-xl font-medium",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    "select-none cursor-pointer",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-primary text-primary-foreground",
          "shadow-sm shadow-primary/20",
          "hover:brightness-110 hover:shadow-md hover:shadow-primary/25",
          "active:scale-[0.98] active:shadow-sm",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground",
          "shadow-sm shadow-black/5",
          "hover:bg-secondary/80 hover:shadow-md",
          "active:scale-[0.98]",
        ],
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-sm shadow-destructive/20",
          "hover:brightness-110 hover:shadow-md hover:shadow-destructive/25",
          "active:scale-[0.98]",
        ],
        outline: [
          "border border-border bg-transparent text-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          "active:scale-[0.98]",
        ],
        ghost: [
          "text-foreground bg-transparent",
          "hover:bg-accent hover:text-accent-foreground",
          "active:scale-[0.98]",
        ],
        link: [
          "text-primary underline-offset-4",
          "hover:underline",
          "p-0 h-auto",
        ],
        glass: [
          "bg-white/10 text-foreground backdrop-blur-xl",
          "border border-white/20",
          "shadow-lg shadow-black/5",
          "hover:bg-white/15 hover:shadow-xl",
          "active:scale-[0.98]",
          "dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10",
        ],
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-lg [&_svg]:size-3",
        sm: "h-8 px-3 text-sm rounded-lg [&_svg]:size-3.5",
        md: "h-9 px-4 text-sm [&_svg]:size-4",
        lg: "h-10 px-5 text-base [&_svg]:size-4",
        xl: "h-12 px-6 text-base [&_svg]:size-5",
        icon: "size-9 p-0 [&_svg]:size-4",
        "icon-sm": "size-7 p-0 rounded-lg [&_svg]:size-3.5",
        "icon-lg": "size-11 p-0 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

/**
 * MotionButton — Button with Framer Motion tap/hover animations.
 */
const MotionButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & HTMLMotionProps<"button">
>(({ className, variant, size, ...props }, ref) => {
  return (
    <motion.button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    />
  );
});
MotionButton.displayName = "MotionButton";

export { Button, MotionButton, buttonVariants };
export type { ButtonProps };
