"use client";

import { m, useReducedMotion } from "motion/react";
import { ReactNode } from "react";

type Props = {
  index: number;
  icon: ReactNode;
  title: string;
  body: string;
  code: string;
};

export const StepCard = ({ index, icon, title, body, code }: Props) => {
  const prefersReduced = useReducedMotion();

  return (
    <m.div
      initial={{
        opacity: 0,
        y: prefersReduced ? 0 : 20,
      }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.08,
      }}
      className="group relative rounded-2xl border border-bn-line bg-white p-7 hover:border-bn-line-2 hover:shadow-[0_20px_50px_-30px_rgba(10,10,10,0.25)] transition-all"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-bn-page-2 text-bn-ink group-hover:bg-bn-accent group-hover:text-white transition-colors">
          {icon}
        </div>
        <span className="font-mono-bn text-[11px] tabular-nums text-bn-ink-dim">
          0{index + 1} / 03
        </span>
      </div>
      <h3 className="bn-card-title text-bn-ink mb-2">{title}</h3>
      <p className="text-[14px] leading-[1.55] text-bn-ink-muted mb-6">
        {body}
      </p>
      <div className="rounded-lg border border-bn-line bg-bn-page-2 px-3 py-2.5 overflow-hidden">
        <code className="font-mono-bn text-[12px] text-bn-ink-2 whitespace-nowrap overflow-hidden text-ellipsis block">
          {code}
        </code>
      </div>
    </m.div>
  );
};
