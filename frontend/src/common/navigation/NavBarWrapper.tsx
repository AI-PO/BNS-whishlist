"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export const NavBarWrapper = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return <>{children}</>;
};
