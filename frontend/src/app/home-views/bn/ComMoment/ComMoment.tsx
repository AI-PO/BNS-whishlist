"use client";

import { ArrowUpRight, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { m, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";

import { RevealOnView, SectionEyebrow } from "@/common/components/bn";

import { AddressMorph } from "./AddressMorph";

// Still SSR-disabled (WebGL is client-only) but we drop the default viewport-
// based lazy mount so the canvas boots with the page and is ready well before
// the user scrolls down — no pop-in on scroll.
const ShaderBackground = dynamic(
  () => import("./ShaderBackground").then((m) => m.ShaderBackground),
  { ssr: false, loading: () => null },
);

const MILESTONES = [
  { year: "1995", cost: "$100", worth: "$3M+", label: "sex.com" },
  { year: "1997", cost: "$150", worth: "$18M", label: "insurance.com" },
  { year: "1999", cost: "$70", worth: "$90M", label: "cars.com" },
];

export const ComMoment = () => {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-bn-bg text-bn-text">
      {/* Fullscreen animated shader */}
      <div aria-hidden className="absolute inset-0">
        <ShaderBackground />
      </div>

      {/* Readability veil + grain */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-bn-bg/60 via-bn-bg/35 to-bn-bg/85 pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute inset-0 bn-grid-dark opacity-[0.12] pointer-events-none"
      />

      <div className="relative mx-auto max-w-[1240px] px-5 lg:px-10 py-20 md:py-32 lg:py-40">
        <RevealOnView className="mb-8 md:mb-10">
          <SectionEyebrow chapter="01" label="The .com moment" tone="dark" />
        </RevealOnView>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20 items-center">
          <div>
            <RevealOnView>
              <h2 className="bn-section-title text-white mb-6 drop-shadow-[0_2px_20px_rgba(0,0,0,0.35)]">
                In 1995, a name cost{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-bn-accent">$100</span>
                  <m.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-x-0 bottom-0 h-[6px] bg-bn-accent/30 origin-left"
                  />
                </span>
                .
                <br />
                Some are worth{" "}
                <span className="italic font-medium text-white">millions</span>{" "}
                today.
              </h2>
            </RevealOnView>

            <RevealOnView delay={0.08}>
              <p className="bn-body text-white/80 mb-8 max-w-[540px]">
                Early movers who registered{" "}
                <span className="font-mono-bn text-white">gold.com</span> and{" "}
                <span className="font-mono-bn text-white">bank.com</span> in the
                1990s held assets worth millions decades later.
              </p>
            </RevealOnView>

            {/* Animated milestone ticker */}
            <RevealOnView delay={0.14}>
              <div className="space-y-2.5 mb-8 max-w-[540px]">
                {MILESTONES.map((item, i) => (
                  <m.div
                    key={item.label}
                    initial={{
                      opacity: 0,
                      x: prefersReduced ? 0 : -12,
                    }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.2 + i * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="group flex items-center gap-3 sm:gap-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3 hover:border-bn-accent/50 hover:bg-white/[0.07] transition-all"
                  >
                    <span className="font-mono-bn text-[10px] sm:text-[11px] tabular-nums text-white/60 w-9 sm:w-10 shrink-0">
                      {item.year}
                    </span>
                    <span className="font-mono-bn text-[13px] sm:text-[14px] text-white flex-1 truncate">
                      {item.label}
                    </span>
                    <span className="hidden sm:inline-block font-mono-bn text-[12px] text-white/60 tabular-nums">
                      {item.cost}
                    </span>
                    <ArrowUpRight
                      weight="bold"
                      size={12}
                      className="text-bn-accent opacity-60 group-hover:opacity-100 transition-opacity shrink-0"
                    />
                    <span className="font-mono-bn text-[13px] sm:text-[14px] text-bn-accent tabular-nums tracking-tight">
                      {item.worth}
                    </span>
                  </m.div>
                ))}
              </div>
            </RevealOnView>

            <RevealOnView delay={0.22}>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-bn-accent/40 bg-bn-accent/10 backdrop-blur-md px-4 py-2 text-white">
                <TrendUp weight="bold" size={14} className="text-bn-accent" />
                <span className="text-[13px] font-medium">
                  Bitcoin names are at that stage <em>now</em>.
                </span>
              </div>
            </RevealOnView>
          </div>

          <RevealOnView delay={0.12}>
            <div className="relative rounded-2xl border border-white/15 bg-black/60 backdrop-blur-xl p-1 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)] overflow-hidden">
              <div
                aria-hidden
                className="absolute -inset-px rounded-2xl bg-gradient-to-br from-bn-accent/40 via-transparent to-white/10 opacity-60 pointer-events-none"
              />
              <div className="relative rounded-[14px] bg-bn-bg/90 backdrop-blur-xl border border-white/10 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="font-mono-bn text-[10px] uppercase tracking-wider text-white/50">
                    identity.btc · resolver
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-white/50">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inset-0 rounded-full bg-bn-accent animate-ping opacity-75" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-bn-accent" />
                    </span>
                    live
                  </span>
                </div>
                <div className="relative px-6 py-12 md:px-10 md:py-16 overflow-hidden">
                  <div
                    aria-hidden
                    className="absolute inset-0 bn-orange-glow opacity-50 pointer-events-none"
                  />
                  <div className="relative">
                    <AddressMorph />
                  </div>
                </div>
              </div>
            </div>
          </RevealOnView>
        </div>
      </div>
    </section>
  );
};
