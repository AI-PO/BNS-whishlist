"use client";

import { HTMLMotionProps, m, useReducedMotion } from "motion/react";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  delay?: number;
  y?: number;
  once?: boolean;
  amount?: number;
}> &
  Omit<HTMLMotionProps<"div">, "initial" | "whileInView" | "viewport" | "transition">;

export const RevealOnView = ({
  children,
  delay = 0,
  y = 40,
  once = true,
  amount = 0.2,
  ...rest
}: Props) => {
  const prefersReduced = useReducedMotion();

  return (
    <m.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      {...rest}
    >
      {children}
    </m.div>
  );
};
