"use client";

import { useReducedMotion } from "motion/react";
import { type CSSProperties, useEffect, useRef } from "react";

export const HeroBackground = () => {
  const prefersReduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReduced) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const root = rootRef.current;
    if (!root) return;

    let rafId = 0;
    let targetX = 50;
    let targetY = 38;
    let currentX = 50;
    let currentY = 38;

    const onMove = (e: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width) * 100;
      targetY = ((e.clientY - rect.top) / rect.height) * 100;
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      root.style.setProperty("--mx", `${currentX}%`);
      root.style.setProperty("--my", `${currentY}%`);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
    };
  }, [prefersReduced]);

  const rootStyle = { "--mx": "50%", "--my": "38%" } as CSSProperties;

  return (
    <div
      ref={rootRef}
      aria-hidden
      style={rootStyle}
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      {/* base warm wash: gentle orange rising from bottom-left to center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 15% 100%, rgba(247,147,26,0.10), transparent 65%), radial-gradient(ellipse 70% 55% at 100% 20%, rgba(247,147,26,0.09), transparent 60%)",
        }}
      />

      {/* subtle grid, masked so it fades at the edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(10,10,10,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,10,10,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          backgroundPosition: "center center",
          maskImage:
            "radial-gradient(ellipse 85% 70% at 50% 45%, black 30%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 70% at 50% 45%, black 30%, transparent 85%)",
        }}
      />

      {/* larger grid overlay for depth — accent-tinted, masked to spotlight */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(247,147,26,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(247,147,26,0.18) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          backgroundPosition: "center center",
          maskImage:
            "radial-gradient(260px circle at var(--mx) var(--my), black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(260px circle at var(--mx) var(--my), black 0%, transparent 70%)",
        }}
      />

      {/* soft orange spotlight following the cursor */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(520px circle at var(--mx) var(--my), rgba(247,147,26,0.16), transparent 60%)",
        }}
      />

      {/* tighter bright hotspot */}
      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{
          background:
            "radial-gradient(180px circle at var(--mx) var(--my), rgba(255,167,51,0.18), transparent 70%)",
        }}
      />

      {/* ambient right-side bloom (preserved from original) */}
      <div className="absolute top-1/2 right-[-15%] -translate-y-1/2 w-[900px] h-[700px] bn-orange-glow-soft" />

      {/* edge vignette — fade to pure page at the top so nav reads clean */}
      <div
        className="absolute inset-x-0 top-0 h-32"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)",
        }}
      />
    </div>
  );
};
