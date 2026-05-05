"use client";

import {
  ArrowSquareOut,
  Cube,
  CurrencyBtc,
  GlobeHemisphereWest,
  Lightning,
  Lock,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import { m, useReducedMotion } from "motion/react";
import { useState } from "react";

import { RevealOnView, SectionEyebrow } from "@/common/components/bn";
import { cn } from "@/lib/utils";

type Layer = "base" | "protocol" | "payments" | "app" | "storage" | "security";

const STACK: Array<{
  key: string;
  name: string;
  role: string;
  layer: Layer;
  desc: string;
  icon: typeof CurrencyBtc;
  href?: string;
}> = [
  {
    key: "bitcoin",
    name: "Bitcoin",
    role: "Settlement",
    layer: "base",
    desc: "Every name is recorded on the most secure base layer in the world.",
    icon: CurrencyBtc,
    href: "https://bitcoin.org",
  },
  {
    key: "taproot",
    name: "Taproot",
    role: "Signatures",
    layer: "security",
    desc: "Schnorr signatures for efficient, private ownership proofs.",
    icon: ShieldCheck,
  },
  {
    key: "lightning",
    name: "Lightning",
    role: "Payments",
    layer: "payments",
    desc: "Instant, low-fee transfers for names and offers.",
    icon: Lightning,
  },
  {
    key: "orobit",
    name: "Orobit",
    role: "Protocol",
    layer: "protocol",
    desc: "Open registry protocol that powers Bitcoin Names.",
    icon: Cube,
    href: "https://orobit.ai",
  },
  {
    key: "ipfs",
    name: "IPFS",
    role: "Storage",
    layer: "storage",
    desc: "Content-addressed hosting for name-powered websites.",
    icon: GlobeHemisphereWest,
  },
  {
    key: "pqc",
    name: "NIST PQC",
    role: "Post-quantum",
    layer: "security",
    desc: "Hybrid quantum-resistant keys from day one.",
    icon: Lock,
  },
];

export const ProofRow = () => {
  const prefersReduced = useReducedMotion();
  const [active, setActive] = useState<string>(STACK[0].key);
  const current = STACK.find((s) => s.key === active) ?? STACK[0];

  return (
    <section className="relative bg-bn-page py-20 md:py-32 border-t border-bn-line overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bn-line-2 to-transparent"
      />

      <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
        <RevealOnView className="mb-6">
          <SectionEyebrow chapter="01" label="The stack" />
        </RevealOnView>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-14">
          <RevealOnView>
            <h2 className="bn-section-title text-bn-ink max-w-[640px]">
              Built on the open{" "}
              <span className="text-bn-accent">Bitcoin</span> stack.
            </h2>
          </RevealOnView>

          {/* Active-item description panel */}
          <RevealOnView delay={0.08}>
            <m.div
              key={current.key}
              initial={{ opacity: 0, y: prefersReduced ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[360px] lg:text-right"
            >
              <div className="flex items-center gap-2 lg:justify-end mb-1.5">
                <span className="font-mono-bn text-[11px] uppercase tracking-[0.14em] text-bn-accent">
                  {current.name}
                </span>
                <span className="inline-block h-[3px] w-[3px] rounded-full bg-bn-ink-dim" />
                <span className="font-mono-bn text-[11px] uppercase tracking-[0.14em] text-bn-ink-muted">
                  {current.role}
                </span>
              </div>
              <p className="text-[14px] leading-[1.55] text-bn-ink-2">
                {current.desc}
              </p>
            </m.div>
          </RevealOnView>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STACK.map((item, i) => (
            <StackCard
              key={item.key}
              item={item}
              index={i}
              active={active === item.key}
              onActivate={() => setActive(item.key)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

type CardProps = {
  item: (typeof STACK)[number];
  index: number;
  active: boolean;
  onActivate: () => void;
};

const StackCard = ({ item, index, active, onActivate }: CardProps) => {
  const { name, role, icon: Icon, href } = item;
  const prefersReduced = useReducedMotion();
  const Inner = (
    <m.div
      initial={{
        opacity: 0,
        y: prefersReduced ? 0 : 10,
      }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.04,
      }}
      className={cn(
        "relative h-full rounded-2xl border bg-white p-5 md:p-6 flex flex-col items-start gap-4 transition-all cursor-default min-h-[148px]",
        active
          ? "border-bn-accent/50 shadow-[0_14px_32px_-18px_rgba(247,147,26,0.55)]"
          : "border-bn-line hover:border-bn-ink/30",
      )}
    >
      <div className="flex items-center justify-between w-full">
        <span
          className={cn(
            "inline-flex items-center justify-center w-11 h-11 rounded-xl transition-colors",
            active
              ? "bg-bn-accent text-white"
              : "bg-bn-page-2 text-bn-ink-2 group-hover:bg-bn-ink group-hover:text-bn-accent",
          )}
        >
          <Icon weight="bold" size={20} />
        </span>
        <span className="font-mono-bn text-[10px] tabular-nums text-bn-ink-dim">
          0{index + 1}
        </span>
      </div>
      <div>
        <div className="flex items-center gap-1 text-bn-ink text-[16px] md:text-[17px] font-medium tracking-tight">
          {name}
          {href ? (
            <ArrowSquareOut
              weight="bold"
              size={11}
              className={cn(
                "transition-colors",
                active ? "text-bn-accent" : "text-bn-ink-muted",
              )}
            />
          ) : null}
        </div>
        <div className="font-mono-bn text-[10px] uppercase tracking-[0.14em] text-bn-ink-muted mt-1">
          {role}
        </div>
      </div>

      {/* active underline */}
      <span
        aria-hidden
        className={cn(
          "absolute left-5 right-5 bottom-0 h-[2px] rounded-full origin-left transition-transform duration-300",
          active ? "bg-bn-accent scale-x-100" : "bg-bn-accent scale-x-0",
        )}
      />
    </m.div>
  );

  const commonProps = {
    onMouseEnter: onActivate,
    onFocus: onActivate,
    onClick: onActivate,
    className: "group block h-full outline-none focus-visible:ring-2 focus-visible:ring-bn-accent/40 rounded-xl",
  };

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        {...commonProps}
      >
        {Inner}
      </a>
    );
  }

  return (
    <button type="button" {...commonProps}>
      {Inner}
    </button>
  );
};
