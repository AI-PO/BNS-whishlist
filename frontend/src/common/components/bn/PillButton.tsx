import { cva, type VariantProps } from "class-variance-authority";
import { ComponentProps, forwardRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

const pillButton = cva(
  "inline-flex items-center justify-center gap-2 font-medium text-[14px] leading-[1.14] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bn-accent/40 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-bn-accent text-white rounded-full px-7 py-3 hover:bg-bn-accent-hover shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_24px_-12px_rgba(247,147,26,0.6)]",
        dark:
          "bg-bn-ink text-white rounded-full px-7 py-3 border border-bn-ink hover:bg-black",
        outline:
          "bg-transparent text-bn-ink rounded-full px-7 py-3 border border-bn-line-2 hover:border-bn-ink hover:bg-bn-page-2",
        outlineDark:
          "bg-transparent text-bn-text rounded-full px-7 py-3 border border-bn-border-mid hover:border-bn-text hover:bg-bn-surface-2",
        ghost:
          "bg-transparent text-bn-ink rounded-md px-3 py-2 hover:bg-bn-page-2",
      },
      size: {
        sm: "text-[13px] px-5 py-2",
        md: "",
        lg: "text-[15px] px-9 py-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type Props = ComponentProps<"button"> &
  VariantProps<typeof pillButton> & {
    iconLeft?: ReactNode;
    iconRight?: ReactNode;
  };

export const PillButton = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant, size, iconLeft, iconRight, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(pillButton({ variant, size }), className)}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  ),
);

PillButton.displayName = "PillButton";
