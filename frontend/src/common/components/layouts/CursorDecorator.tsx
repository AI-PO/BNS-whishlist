import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

export const CursorDecorator = () => {
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

  const rootStyle = { "--mx": "50%", "--my": "38%" } as React.CSSProperties;

  return (
    <div
      ref={rootRef}
      style={rootStyle}
      className="fixed inset-0 z-[1] pointer-events-none overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 15% 100%, rgba(247,147,26,0.08), transparent 65%), radial-gradient(ellipse 62% 52% at 100% 15%, rgba(247,147,26,0.06), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(560px circle at var(--mx) var(--my), rgba(247,147,26,0.16), transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 mix-blend-multiply"
        style={{
          background:
            "radial-gradient(190px circle at var(--mx) var(--my), rgba(255,167,51,0.17), transparent 70%)",
        }}
      />
    </div>
  );
};
