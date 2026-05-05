"use client";

import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import { PropsWithChildren } from "react";

export const MotionProvider = ({ children }: PropsWithChildren) => (
  <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  </LazyMotion>
);
