"use client";

import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { m, useReducedMotion } from "motion/react";

export type NameCellStatus = "available" | "taken" | "featured";

type Props = {
  index: number;
  name: string;
  status: NameCellStatus;
};

const STATUS_COPY: Record<NameCellStatus, string> = {
  available: "Available",
  taken: "Taken",
  featured: "Premium",
};

export const NameCell = ({ index, name, status }: Props) => {
  const prefersReduced = useReducedMotion();

  const isTaken = status === "taken";
  const isFeatured = status === "featured";
  const isAvailable = status === "available";

  return (
    <m.div
      initial={{
        opacity: 0,
        y: prefersReduced ? 0 : 12,
      }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
        delay: (index % 6) * 0.04,
      }}
      whileHover={isTaken || prefersReduced ? undefined : { y: -2 }}
      className={`group relative rounded-xl border bg-white px-4 py-4 transition-all cursor-pointer ${
        isTaken
          ? "border-bn-line opacity-60"
          : isFeatured
            ? "border-bn-accent-30 bg-gradient-to-br from-white to-bn-accent-06"
            : "border-bn-line hover:border-bn-ink/40 hover:shadow-[0_10px_30px_-18px_rgba(10,10,10,0.25)]"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isAvailable
              ? "bg-bn-accent"
              : isFeatured
                ? "bg-bn-accent animate-pulse"
                : "bg-bn-ink-dim"
          }`}
        />
        <div className="flex items-center gap-1">
          <span
            className={`font-mono-bn text-[9px] uppercase tracking-[0.14em] ${
              isTaken
                ? "text-bn-ink-muted"
                : isFeatured
                  ? "text-bn-accent"
                  : "text-bn-ink-muted"
            }`}
          >
            {STATUS_COPY[status]}
          </span>
          {!isTaken && (
            <ArrowUpRight
              weight="bold"
              size={10}
              className="text-bn-ink-muted opacity-0 group-hover:opacity-100 group-hover:text-bn-accent transition-opacity"
            />
          )}
        </div>
      </div>
      <div className="font-mono-bn text-[15px] text-bn-ink truncate">{name}</div>
    </m.div>
  );
};
