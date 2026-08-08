/**
 * Card Component
 *
 * Versatile container with glassmorphism support and subtle shadows.
 * Follows Apple HIG with rounded corners and clean whitespace.
 *
 * @example
 * <Card variant="glass">
 *   <CardHeader><CardTitle>Title</CardTitle></CardHeader>
 *   <CardContent>Content</CardContent>
 * </Card>
 */

"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  [
    "rounded-2xl text-card-foreground",
    "transition-all duration-300 ease-out",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-card border border-border",
          "shadow-sm shadow-black/5",
        ],
        elevated: [
          "bg-card border border-border",
          "shadow-lg shadow-black/8",
          "hover:shadow-xl hover:shadow-black/10",
        ],
        glass: [
          "bg-white/60 backdrop-blur-2xl",
          "border border-white/30",
          "shadow-xl shadow-black/5",
          "dark:bg-white/5 dark:border-white/10",
        ],
        ghost: [
          "bg-transparent border-none shadow-none",
        ],
        interactive: [
          "bg-card border border-border",
          "shadow-sm shadow-black/5",
          "hover:shadow-lg hover:shadow-black/8",
          "hover:border-border/80",
          "cursor-pointer",
          "active:scale-[0.99]",
        ],
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "none",
    },
  }
);

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const MotionCard = React.forwardRef<
  HTMLDivElement,
  CardProps & HTMLMotionProps<"div">
>(({ className, variant, padding, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn(cardVariants({ variant, padding, className }))}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    {...props}
  />
));
MotionCard.displayName = "MotionCard";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-0", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  MotionCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};
export type { CardProps };
