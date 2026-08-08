/**
 * useScrollToHighlighted — Auto-scroll to highlighted elements during sync
 *
 * Hover-triggered scrolling has been removed. This hook now only preserves the
 * ref contract for callers that still expect a highlighted element ref.
 */

import { useRef } from "react";

export function useScrollToHighlighted(
  _isHighlighted: boolean,
  _debounceMs = 80
) {
  return useRef<HTMLDivElement>(null);
}
