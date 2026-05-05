"use client";

import { useEffect } from "react";

/**
 * Handles dynamic viewport height and safe area calculations
 * for mobile browsers with dynamic UI bars
 */
export const ViewportHandler: React.FC = () => {
  useEffect(() => {
    const setViewportProperties = () => {
      // Calculate actual viewport height (excluding browser UI)
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);

      // Set safe area inset values as CSS custom properties
      const safeAreaTop = getComputedStyle(document.documentElement)
        .getPropertyValue("env(safe-area-inset-top)")
        .trim();
      const safeAreaBottom = getComputedStyle(document.documentElement)
        .getPropertyValue("env(safe-area-inset-bottom)")
        .trim();

      if (safeAreaTop) {
        document.documentElement.style.setProperty("--safe-area-top", safeAreaTop);
      }
      if (safeAreaBottom) {
        document.documentElement.style.setProperty("--safe-area-bottom", safeAreaBottom);
      }

      // Detect mobile browser bottom bar
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile && !isStandalone) {
        // Add extra padding for mobile browser UI
        const browserUIHeight = window.screen.height - window.innerHeight;
        document.documentElement.style.setProperty(
          "--browser-ui-height", 
          `${Math.max(browserUIHeight, 50)}px`
        );
      }
    };

    // Initial call
    setViewportProperties();

    // Update on resize (includes orientation change)
    const handleResize = () => {
      // Delay to account for browser UI animation
      setTimeout(setViewportProperties, 100);
    };

    // Update on orientation change
    const handleOrientationChange = () => {
      // Longer delay for orientation change
      setTimeout(setViewportProperties, 500);
    };

    // Update on visual viewport change (iOS keyboard, etc.)
    const handleVisualViewportChange = () => {
      setViewportProperties();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);
    
    // Visual viewport API support (modern browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleVisualViewportChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleVisualViewportChange);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};
