"use client";

import { useEffect, useMemo, useState } from "react";

import { Tooltip } from "./Tooltip";

interface TruncatedDomainNameProps {
  name: string;
  /** Number of characters to show at the start when truncating. */
  charsAtStart?: number;
  /** Number of characters to show at the end when truncating (fixed at 5 as per requirement). */
  charsAtEnd?: number;
  /** The minimum length of the name to consider for truncation. */
  truncateLengthThreshold?: number;
  /**  If true, always show full name regardless of screen size */
  fullScreen?: boolean;
  /** This prop is not used in the client-side component but can be useful for server-side rendering scenarios */
  serverSide?: boolean;
  /** If true, the truncated text will be wrapped in a tooltip and full text displayed on hover */
  tooltip?: boolean;
}

const SM_BREAKPOINT = 640; // Tailwind's default sm breakpoint (640px)

export const TruncatedText: React.FC<TruncatedDomainNameProps> = ({
  name,
  charsAtStart = 6,
  charsAtEnd = 7,
  truncateLengthThreshold = 16,
  fullScreen = false,
  serverSide = false,
  tooltip = false,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs once on mount to set isClient to true
    // and to set the initial screen size.
    setIsClient(true);
    const checkScreenSize = () => {
      const isActive = fullScreen || window.innerWidth < SM_BREAKPOINT;
      setIsActive(isActive);
    };
    checkScreenSize(); // Initial check
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const shortenText = () => {
    if (name.length > charsAtStart + 3 + charsAtEnd) {
      const startStr = name.substring(0, charsAtStart);
      const endStr = name.substring(name.length - charsAtEnd);
      return `${startStr}...${endStr}`;
    }
    return name;
  };

  const displayText = useMemo(() => {
    if (serverSide) return shortenText();
    if (isClient && isActive && name.length > truncateLengthThreshold) {
      // Ensure we only truncate if the name is long enough for a meaningful truncation
      // (i.e., longer than start chars + '...' + end chars)
      return shortenText();
    }
    return name; // Return full name if not on small screen, not client-side yet, or too short to truncate
  }, [
    name,
    isActive,
    isClient,
    charsAtStart,
    charsAtEnd,
    truncateLengthThreshold,
  ]);

  if (!tooltip || !isActive || !isClient || displayText.length === name.length)
    return <>{displayText}</>;

  return (
    <Tooltip
      triggerAsChild
      trigger={
        <span className="cursor-pointer" title={name}>
          {displayText}
        </span>
      }
      content={name}
    />
  );
};
