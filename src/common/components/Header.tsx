import React, { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type HaeaderVariant = "h1" | "h4";

type Props = PropsWithChildren<{
  variant: HaeaderVariant;
  leading?: React.ReactNode;
  following?: React.ReactNode;
}>;

export const Header: React.FC<Props> = ({
  leading,
  variant,
  following,
  children,
}) => {
  return (
    <div
      className={cn("flex items-center", {
        "gap-x-6": variant === "h1",
      })}
    >
      {leading}
      <HeaderContent variant={variant}>{children}</HeaderContent>
      {following}
    </div>
  );
};

const HeaderContent: React.FC<
  PropsWithChildren<{ variant: HaeaderVariant }>
> = ({ variant, children }) => {
  if (variant === "h1") {
    return <h1 className="text-[clamp(1.5rem,4vw,3rem)] font-semibold tracking-tighter text-black">{children}</h1>;
  }
  if (variant === "h4") {
    return <h4 className="text-xl font-medium text-black">{children}</h4>;
  }
};
