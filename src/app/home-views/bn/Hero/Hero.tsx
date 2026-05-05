"use client";

import { ArrowDown } from "@phosphor-icons/react/dist/ssr";
import { m, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { DomainChecker, type DomainCheckerHandle } from "./DomainChecker";
import { HeroBackground } from "./HeroBackground";
import { IdentityCard } from "./IdentityCard";

const SUGGESTIONS = ["satoshi", "vault", "miner", "halving", "lightning"];

export const Hero = () => {
  const prefersReduced = useReducedMotion();
  const checkerRef = useRef<DomainCheckerHandle>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        checkerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden bg-bn-page flex flex-col justify-center min-h-[100svh] pt-24 pb-12 md:pt-[110px] md:pb-20"
    >
      <HeroBackground />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-bn-line to-transparent"
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-5 lg:px-10">
        <div className="grid gap-10 md:gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-14 xl:gap-20 items-center">
          {/* LEFT — copy + search */}
          <div className="relative flex flex-col items-center text-center md:items-start md:text-left">
            <m.span
              initial={{ opacity: 0, y: prefersReduced ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 font-mono-bn text-[10px] uppercase tracking-[0.18em] text-bn-ink-muted mb-5 md:mb-6"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-bn-accent animate-ping opacity-75" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-bn-accent" />
              </span>
              <span>Live · Bitcoin-native registry</span>
            </m.span>

            <h1 className="text-bn-ink font-medium leading-[0.98] tracking-[-0.03em] text-[clamp(2.25rem,7vw,4.25rem)] mb-5 md:mb-6 max-w-[14ch] md:max-w-none">
              <m.span
                initial={{ opacity: 0, y: prefersReduced ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                Your name.
              </m.span>
              <m.span
                initial={{ opacity: 0, y: prefersReduced ? 0 : 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="block text-bn-ink-dim"
              >
                On <span className="text-bn-accent">Bitcoin</span>.
              </m.span>
            </h1>

            <m.p
              initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32 }}
              className="text-[15px] md:text-[17px] leading-[1.55] text-bn-ink-2 max-w-[380px] md:max-w-[480px] mb-7 md:mb-8"
            >
              One portable identity for every wallet, site, and app. Settled
              on-chain. Quantum-secure forever.
            </m.p>

            <m.div
              initial={{ opacity: 0, y: prefersReduced ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full max-w-[560px]"
            >
              <DomainChecker ref={checkerRef} />
            </m.div>

            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="hidden md:flex mt-5 flex-wrap items-center gap-2 max-w-[560px]"
            >
              <span className="font-mono-bn text-[10px] uppercase tracking-[0.16em] text-bn-ink-muted mr-0.5">
                Try
              </span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => checkerRef.current?.setValue(s)}
                  className="group inline-flex items-center rounded-full border border-bn-line bg-white hover:border-bn-ink/30 hover:bg-bn-page-2 px-2.5 py-1 text-[12px] text-bn-ink-2 hover:text-bn-ink transition-colors"
                >
                  <span className="font-mono-bn">{s}</span>
                  <span className="font-mono-bn text-bn-ink-muted group-hover:text-bn-accent transition-colors">
                    .btc
                  </span>
                </button>
              ))}
              <span className="inline-flex items-center gap-1.5 ml-auto text-[11px] text-bn-ink-muted">
                <kbd className="inline-flex items-center justify-center h-[18px] min-w-[18px] px-1 rounded border border-bn-line bg-white font-mono-bn text-[10px] text-bn-ink-2">
                  /
                </kbd>
                focus search
              </span>
            </m.div>
          </div>

          {/* RIGHT — interactive identity card (desktop only; removed on mobile to keep hero uncluttered) */}
          <m.div
            initial={{ opacity: 0, y: prefersReduced ? 0 : 24, scale: 0.98 }}
            animate={
              ready
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 24, scale: 0.98 }
            }
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:block relative lg:justify-self-end w-full"
          >
            <IdentityCard />
          </m.div>
        </div>
      </div>

      {/* scroll indicator — desktop only */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="hidden lg:block relative mx-auto w-full max-w-[1240px] px-5 lg:px-10 mt-14 md:mt-16"
      >
        <Link
          href="#how"
          aria-label="Scroll to how it works"
          className="group inline-flex items-center gap-2 text-[11px] font-mono-bn uppercase tracking-[0.18em] text-bn-ink-muted hover:text-bn-ink transition-colors"
        >
          <span>Scroll</span>
          <ArrowDown
            weight="bold"
            size={11}
            className="group-hover:translate-y-0.5 transition-transform"
          />
        </Link>
      </m.div>
    </section>
  );
};
