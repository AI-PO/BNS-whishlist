"use client";

import Lottie from "lottie-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import succesLottieAnimation from "../successLottieAnimation.json";

export const SuccessAnimation = () => {
  const [animationEnd, setAnimationEnd] = useState(false);

  return (
    <div
      className={cn("absolute min-h-screen min-w-[1400px]", {
        hidden: animationEnd,
      })}
    >
      <Lottie
        animationData={succesLottieAnimation}
        onComplete={() => {
          setAnimationEnd(true);
        }}
        loop={false}
      />
      ;
    </div>
  );
};
