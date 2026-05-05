"use client";

import { animate, useInView, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Format = "plain" | "millions";

type Props = {
  to: number;
  suffix?: string;
  duration?: number;
  format?: Format;
  className?: string;
};

const formatters: Record<Format, (n: number) => string> = {
  plain: (n) => String(n),
  millions: (n) => `${n}M`,
};

export const CountUp = ({
  to,
  suffix = "",
  duration = 1.6,
  format = "plain",
  className,
}: Props) => {
  const prefersReduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const fmt = formatters[format];
    if (!inView) return;
    if (prefersReduced) {
      setDisplay(fmt(to));
      return;
    }
    const controls = animate(mv, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        setDisplay(fmt(Math.round(v)));
      },
    });
    return () => controls.stop();
  }, [inView, to, duration, mv, format, prefersReduced]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
};
