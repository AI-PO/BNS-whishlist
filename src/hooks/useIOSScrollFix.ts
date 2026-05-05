"use client";

import { useEffect, useRef } from "react";

// Extend CSSStyleDeclaration to include webkit properties
interface ExtendedCSSStyleDeclaration extends CSSStyleDeclaration {
  webkitOverflowScrolling?: string;
}

/**
 * Hook to fix iOS Safari scrolling issues where scrolling to the bottom
 * causes the scroll position to jump back to the top due to momentum scrolling
 */
export const useIOSScrollFix = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Detect iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (!isIOS || !isSafari) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScrollStart = () => {
      // Disable momentum scrolling during active scroll
      (scrollContainer.style as ExtendedCSSStyleDeclaration).webkitOverflowScrolling = "auto";
    };

    const handleScrollEnd = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Re-enable momentum scrolling after scroll ends
        (scrollContainer.style as ExtendedCSSStyleDeclaration).webkitOverflowScrolling = "touch";
      }, 150);
    };

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const { scrollTop, scrollHeight, clientHeight } = target;
      
      // If we're near the bottom (within 50px), prevent further scrolling
      // to avoid the iOS bug where it jumps back to top
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        target.scrollTop = scrollHeight - clientHeight;
        e.preventDefault();
        return false;
      }
    };

    const handleTouchStart = () => {
      handleScrollStart();
    };

    const handleTouchEnd = () => {
      handleScrollEnd();
    };

    // Add event listeners
    scrollContainer.addEventListener("scroll", handleScroll, { passive: false });
    scrollContainer.addEventListener("touchstart", handleTouchStart, { passive: true });
    scrollContainer.addEventListener("touchend", handleTouchEnd, { passive: true });
    scrollContainer.addEventListener("wheel", handleScrollStart, { passive: true });

    // Cleanup
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
      scrollContainer.removeEventListener("touchstart", handleTouchStart);
      scrollContainer.removeEventListener("touchend", handleTouchEnd);
      scrollContainer.removeEventListener("wheel", handleScrollStart);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  return scrollContainerRef;
};
