"use client";

import { m, useReducedMotion } from "motion/react";
import { ReactNode } from "react";

type Props = {
  index: number;
  icon: ReactNode;
  label: string;
  primary: string;
  hint: string;
  trend: string;
  isMono: boolean;
};

export const SalesCard = ({
  index,
  icon,
  label,
  primary,
  hint,
  trend,
  isMono,
}: Props) => {
  const prefersReduced = useReducedMotion();

  return (
    <m.div
      initial={{
        opacity: 0,
        y: prefersReduced ? 0 : 16,
      }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.07,
      }}
      className="group relative rounded-2xl border border-bn-line bg-white p-6 hover:border-bn-line-2 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-24px_rgba(10,10,10,0.18)] transition-all"
    >
      <div className="flex items-center justify-between mb-5">
        <span className="font-mono-bn text-[10px] uppercase tracking-[0.14em] text-bn-ink-muted">
          {label}
        </span>
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-bn-page-2 text-bn-ink-2 group-hover:bg-bn-ink group-hover:text-bn-accent transition-colors">
          {icon}
        </span>
      </div>
      <div
        className={`text-[26px] leading-none mb-3 tabular-nums tracking-tight text-bn-ink ${
          isMono ? "font-mono-bn" : "font-medium"
        }`}
      >
        {primary}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-bn-ink-muted">{hint}</div>
        <div className="inline-flex items-center rounded-full bg-bn-accent-10 text-bn-accent-link font-mono-bn text-[11px] px-2 py-0.5 tabular-nums">
          {trend}
        </div>
      </div>
    </m.div>
  );
};
