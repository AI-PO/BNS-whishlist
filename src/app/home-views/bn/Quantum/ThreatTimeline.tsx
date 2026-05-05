"use client";

import { type Icon } from "@phosphor-icons/react";
import {
  Atom,
  Cpu,
  FileLock,
  FlagCheckered,
  ShieldCheck,
  Vault,
  Warning,
} from "@phosphor-icons/react/dist/ssr";
import {
  m,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useRef, useState } from "react";

type Point = {
  year: string;
  title: string;
  body: string;
  icon: Icon;
  accent?: boolean;
  tag?: string;
};

const POINTS: Point[] = [
  {
    year: "2019",
    title: "Quantum supremacy",
    body: "Google Sycamore completes in 200 seconds a task that would take classical supercomputers millennia.",
    icon: Atom,
    tag: "Milestone",
  },
  {
    year: "2022",
    title: "Satoshi-era exposure",
    body: "Millions of BTC sit in P2PK and reused addresses with already-revealed public keys — a direct quantum target.",
    icon: Vault,
    tag: "Threat",
  },
  {
    year: "2024",
    title: "NIST finalises PQC",
    body: "ML-KEM, ML-DSA and SLH-DSA become the first official post-quantum cryptographic standards.",
    icon: FileLock,
    tag: "Standard",
  },
  {
    year: "2026",
    title: "Bitcoin Names launches",
    body: "Hybrid Taproot and post-quantum signatures ship together from day one — not retrofitted, native.",
    icon: ShieldCheck,
    accent: true,
    tag: "Live now",
  },
  {
    year: "2027",
    title: "Fault-tolerant qubits",
    body: "Industry roadmaps from IBM, Google and IonQ target usable logical qubits. The scaling curve steepens.",
    icon: Cpu,
    tag: "Projection",
  },
  {
    year: "2030",
    title: "EU quantum mandate",
    body: "Critical infrastructure in the EU must be quantum-resistant under the updated Cyber Resilience framework.",
    icon: FlagCheckered,
    tag: "Policy",
  },
  {
    year: "2034+",
    title: "CRQC horizon",
    body: "Cryptographically-relevant quantum computers capable of breaking secp256k1 become feasible. Ownership without PQC becomes a liability.",
    icon: Warning,
    tag: "Inflection",
  },
];

const SPEED = 38; // px/sec

export const ThreatTimeline = () => {
  const prefersReduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  useAnimationFrame((_, delta) => {
    if (prefersReduced) return;
    if (pausedRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    if (!half) return;
    let next = x.get() - (SPEED * delta) / 1000;
    if (next <= -half) next += half;
    x.set(next);
  });

  if (prefersReduced) {
    return (
      <div className="overflow-x-auto">
        <div className="flex gap-5 md:gap-6 px-[5vw] py-10">
          {POINTS.map((p) => (
            <TimelineCard key={p.year} point={p} />
          ))}
        </div>
      </div>
    );
  }

  const doubled = [
    ...POINTS.map((p) => ({ ...p, _half: "a" as const })),
    ...POINTS.map((p) => ({ ...p, _half: "b" as const })),
  ];

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-bn-border to-transparent opacity-50"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-24 md:w-40 z-10 pointer-events-none bg-gradient-to-r from-bn-bg to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-24 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-bn-bg to-transparent"
      />

      <m.div
        ref={trackRef}
        style={{ x }}
        className="flex gap-5 md:gap-6 py-10 md:py-14 w-max will-change-transform"
      >
        {doubled.map((p) => (
          <TimelineCard key={`${p._half}-${p.year}`} point={p} />
        ))}
      </m.div>

      <div className="flex justify-center pt-2">
        <div className="inline-flex items-center gap-2 font-mono-bn text-[10px] uppercase tracking-[0.18em] text-bn-text-muted">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              paused ? "bg-bn-accent" : "bg-bn-border-light animate-pulse"
            }`}
          />
          {paused ? "Paused" : "Auto-scrolling · hover to pause"}
        </div>
      </div>
    </div>
  );
};

const TimelineCard = ({ point }: { point: Point }) => {
  const Icon = point.icon;
  const isAccent = point.accent;
  return (
    <article
      tabIndex={0}
      className={`group relative shrink-0 w-[280px] md:w-[340px] lg:w-[360px] rounded-2xl border backdrop-blur-sm p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 focus:-translate-y-1 outline-none focus-visible:ring-2 focus-visible:ring-bn-accent/60 ${
        isAccent
          ? "border-bn-accent/50 bg-gradient-to-br from-bn-accent/10 to-transparent hover:border-bn-accent"
          : "border-bn-border bg-bn-surface/60 hover:border-bn-border-mid hover:bg-bn-surface/80"
      }`}
    >
      <div
        aria-hidden
        className={`absolute -top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full ring-4 ring-bn-bg ${
          isAccent ? "bg-bn-accent" : "bg-bn-border-light group-hover:bg-bn-text-muted"
        } transition-colors`}
      />

      <div className="flex items-center justify-between mb-6">
        <span
          className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border transition-colors ${
            isAccent
              ? "border-bn-accent/40 bg-bn-accent/15 text-bn-accent"
              : "border-bn-border bg-bn-surface text-bn-text-2 group-hover:text-bn-text"
          }`}
        >
          <Icon size={18} weight="bold" />
        </span>
        <div className="flex flex-col items-end">
          <span
            className={`font-mono-bn text-[15px] tabular-nums leading-none ${
              isAccent ? "text-bn-accent" : "text-bn-text"
            }`}
          >
            {point.year}
          </span>
          {point.tag && (
            <span
              className={`mt-1.5 font-mono-bn text-[9px] uppercase tracking-[0.18em] ${
                isAccent ? "text-bn-accent" : "text-bn-text-muted"
              }`}
            >
              {point.tag}
            </span>
          )}
        </div>
      </div>

      <h3 className="text-[18px] md:text-[20px] font-medium tracking-tight text-bn-text mb-2 leading-snug">
        {point.title}
      </h3>
      <p className="text-[13px] md:text-[13.5px] leading-[1.6] text-bn-text-muted">
        {point.body}
      </p>

      {isAccent && (
        <div className="mt-5 inline-flex items-center gap-2 font-mono-bn text-[10px] uppercase tracking-[0.16em] text-bn-accent">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-bn-accent animate-ping opacity-75" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-bn-accent" />
          </span>
          Shipping today
        </div>
      )}
    </article>
  );
};
