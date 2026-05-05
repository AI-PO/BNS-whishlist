"use client";

import { useEffect } from "react";

export const SnapScrollHandler: React.FC = () => {
  useEffect(() => {
    const mainContainer = document.querySelector("[data-snap-container]");
    const marketplaceSection = document.querySelector("#marketplace");

    if (!mainContainer || !marketplaceSection) {
      return;
    }

    const handleScroll = () => {
      const marketplaceSectionRect = marketplaceSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Check if we're scrolling within the marketplace section
      const isInMarketplaceSection = marketplaceSectionRect.top <= 0 && marketplaceSectionRect.bottom > viewportHeight;
      
      if (isInMarketplaceSection) {
        // Disable snap when scrolling through marketplace content
        mainContainer.classList.remove("snap-y", "snap-mandatory");
      } else {
        // Re-enable snap when not in marketplace
        mainContainer.classList.add("snap-y", "snap-mandatory");
      }
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return null;
};
