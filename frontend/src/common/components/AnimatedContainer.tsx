"use client";

import autoAnimate from "@formkit/auto-animate";
import React, { useRef, useEffect } from "react";

export const AnimatedContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parentRef.current) {
      autoAnimate(parentRef.current);
    }
  }, []);

  return (
    <div ref={parentRef} className={className}>
      {children}
    </div>
  );
};
