"use client";

import {
  CurrencyBtc,
  Globe,
  Lightning,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import { m, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

const ROWS = [
  {
    icon: CurrencyBtc,
    label: "wallet",
    value: "bc1q9xj7fk…p7z",
    mono: true,
  },
  {
    icon: Globe,
    label: "site",
    value: "ipfs://bafybei…",
    mono: true,
  },
  {
    icon: Lightning,
    label: "lightning",
    value: "yourname@btc",
    mono: true,
  },
];

export const IdentityCard = () => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), {
    stiffness: 150,
    damping: 16,
  });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 16,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mx.set(x);
      my.set(y);
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [mx, my]);

  return (
    <div
      ref={ref}
      className="relative w-full max-w-[400px] md:max-w-[460px] mx-auto"
      style={{ perspective: "1400px" }}
    >
      {/* orange glow behind */}
      <div
        aria-hidden
        className="absolute inset-0 -m-6 md:-m-8 bn-orange-glow-soft pointer-events-none"
      />

      <m.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative rounded-[22px] md:rounded-3xl border border-bn-line bg-white p-1 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_32px_60px_-40px_rgba(10,10,10,0.3),0_12px_28px_-18px_rgba(247,147,26,0.22)]"
      >
        {/* gradient ring */}
        <div
          aria-hidden
          className="absolute -inset-px rounded-[22px] md:rounded-3xl bg-gradient-to-br from-bn-accent/40 via-transparent to-bn-accent/10 opacity-80 pointer-events-none"
          style={{ mask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)", WebkitMask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)", WebkitMaskComposite: "xor", maskComposite: "exclude", padding: 1 }}
        />

        <div className="relative rounded-[18px] md:rounded-[22px] bg-white overflow-hidden">
          {/* card header */}
          <div className="flex items-center justify-between px-4 md:px-5 pt-3.5 md:pt-4 pb-3 border-b border-bn-line">
            <span className="inline-flex items-center gap-1.5 font-mono-bn text-[10px] uppercase tracking-[0.16em] text-bn-ink-muted">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-bn-accent/10 text-bn-accent">
                <CurrencyBtc weight="bold" size={10} />
              </span>
              btc identity
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-bn-ink-muted">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-bn-accent animate-ping opacity-75" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-bn-accent" />
              </span>
              <span className="font-mono-bn uppercase tracking-[0.14em]">
                live
              </span>
            </span>
          </div>

          {/* big name */}
          <div className="px-4 md:px-5 pt-5 md:pt-7 pb-5 md:pb-6">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[26px] md:text-[36px] leading-none text-bn-ink font-medium tracking-tight">
                @yourname
              </span>
              <span className="text-[26px] md:text-[36px] leading-none text-bn-accent font-medium tracking-tight">
                .btc
              </span>
            </div>

            <div className="mt-2.5 md:mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-bn-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck weight="fill" size={12} className="text-bn-accent" />
                Taproot + NIST PQC
              </span>
              <span aria-hidden className="hidden sm:inline-block h-2.5 w-px bg-bn-line-2" />
              <span className="font-mono-bn tabular-nums">
                block #874,291
              </span>
            </div>
          </div>

          {/* resolves to rows */}
          <div className="px-1.5 md:px-2.5 pb-2 md:pb-3">
            <span className="block font-mono-bn text-[9px] uppercase tracking-[0.18em] text-bn-ink-dim px-3 md:px-2.5 pb-2">
              resolves to
            </span>
            <div className="flex flex-col gap-0.5 md:gap-1">
              {ROWS.map((row, i) => {
                const Icon = row.icon;
                return (
                  <m.div
                    key={row.label}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.6 + i * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group flex items-center gap-2.5 md:gap-3 rounded-xl px-2 md:px-2.5 py-1.5 md:py-2 hover:bg-bn-page-2 transition-colors"
                  >
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-bn-page-2 text-bn-ink-2 group-hover:bg-bn-ink group-hover:text-bn-accent transition-colors">
                      <Icon weight="bold" size={13} />
                    </span>
                    <span className="font-mono-bn text-[10px] uppercase tracking-[0.16em] text-bn-ink-muted w-14 md:w-16 shrink-0">
                      {row.label}
                    </span>
                    <span
                      className={`flex-1 text-[12.5px] md:text-[13px] text-bn-ink truncate ${row.mono ? "font-mono-bn" : ""}`}
                    >
                      {row.value}
                    </span>
                  </m.div>
                );
              })}
            </div>
          </div>

          {/* footer */}
          <div className="flex items-center justify-between px-4 md:px-5 py-2.5 md:py-3 border-t border-bn-line bg-bn-page-2">
            <span className="font-mono-bn text-[10px] uppercase tracking-[0.16em] text-bn-ink-muted">
              one key · everywhere
            </span>
            <span className="text-[11px] font-medium text-bn-accent-link">
              owned by you
            </span>
          </div>
        </div>
      </m.div>

      {/* floating mini ticker — absolutely positioned under card */}
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="absolute -bottom-5 md:-bottom-6 right-2 sm:-right-4 md:-right-6 rounded-full border border-bn-line bg-white shadow-[0_8px_24px_-10px_rgba(10,10,10,0.18)] pl-1 pr-3 md:pr-3.5 py-1 flex items-center gap-2 max-w-[calc(100%-1rem)]"
      >
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-bn-accent text-white">
          <Lightning weight="fill" size={11} />
        </span>
        <span className="text-[11px] text-bn-ink-2 truncate">
          <span className="font-mono-bn text-bn-ink">halving.btc</span>{" "}
          <span className="text-bn-ink-muted">just registered</span>
        </span>
      </m.div>
    </div>
  );
};
