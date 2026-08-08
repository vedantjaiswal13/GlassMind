/**
 * Utility functions for className merging.
 *
 * Combines clsx (conditional classes) with tailwind-merge
 * (deduplicates/resolves Tailwind class conflicts).
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
