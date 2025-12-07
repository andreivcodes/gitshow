"use client";

import { useCallback } from "react";

export function useViewTransition() {
  const startViewTransition = useCallback((callback: () => void) => {
    if (!document.startViewTransition) {
      callback();
      return;
    }
    document.startViewTransition(callback);
  }, []);

  return startViewTransition;
}
