import { CurrencyBtc } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  className?: string;
  tone?: "light" | "dark";
};

/**
 * Bitcoin Names mark — the Bitcoin symbol set on a small card.
 * Light tone: white tile with a subtle border + orange symbol.
 * Dark tone: ink tile with orange symbol.
 */
export const Logo = ({ size = 34, className, tone = "light" }: Props) => {
  const iconSize = Math.round(size * 0.55);
  const isDark = tone === "dark";

  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-[9px] shrink-0",
        isDark
          ? "bg-bn-surface border border-bn-border shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "bg-white border border-bn-line shadow-[0_1px_0_rgba(10,10,10,0.02),0_4px_12px_-6px_rgba(10,10,10,0.12)]",
        className,
      )}
    >
      {/* soft orange wash */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-[9px] bg-[radial-gradient(80%_80%_at_50%_30%,rgba(247,147,26,0.18)_0%,transparent_70%)]"
      />
      <CurrencyBtc
        weight="bold"
        size={iconSize}
        className="relative text-bn-accent"
      />
      {/* bottom highlight line */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-1.5 bottom-0 h-px rounded-full",
          isDark ? "bg-white/10" : "bg-bn-accent/30",
        )}
      />
    </span>
  );
};
