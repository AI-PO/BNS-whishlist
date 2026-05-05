import { Lock, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

import { RevealOnView, SectionEyebrow } from "@/common/components/bn";

import { CountUp } from "./CountUp";
import { ThreatTimeline } from "./ThreatTimeline";

export const Quantum = () => (
  <section
    id="quantum"
    className="relative bg-bn-bg text-bn-text pt-20 md:pt-36 pb-20 md:pb-36"
  >
    {/* Clipped decoration layer — kept separate so it doesn't break sticky inside the timeline */}
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      <div className="absolute inset-0 bn-grid-dark bn-grid-fade opacity-80" />
      <div className="absolute -top-40 -right-40 w-[800px] h-[800px] bn-orange-glow opacity-70" />
    </div>

    <div className="relative mx-auto max-w-[1240px] px-5 lg:px-10">
      <RevealOnView className="mb-8 md:mb-10">
        <SectionEyebrow chapter="03" label="Quantum security" tone="dark" />
      </RevealOnView>

      <div className="grid gap-10 md:gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20 mb-14 md:mb-20 items-start">
        <div>
          <RevealOnView>
            <h2 className="bn-section-title mb-6 text-bn-text">
              Your ownership survives the{" "}
              <span className="text-bn-accent">quantum transition</span>.
            </h2>
          </RevealOnView>
          <RevealOnView delay={0.08}>
            <p className="bn-body text-bn-text-2 mb-5 max-w-[520px]">
              Between four and ten million BTC sit in addresses whose keys can
              be derived once quantum computing matures. NIST finalised its
              first post-quantum standards in August 2024.
            </p>
          </RevealOnView>
          <RevealOnView delay={0.16}>
            <p className="bn-body text-bn-text-2 max-w-[520px]">
              Every Bitcoin Names name is secured with hybrid Taproot and
              post-quantum cryptography from day one. Not despite the
              transition. Because of it.
            </p>
          </RevealOnView>

          <RevealOnView
            delay={0.22}
            className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-bn-border-mid bg-bn-surface/60 backdrop-blur-sm px-4 py-2"
          >
            <ShieldCheck weight="fill" size={14} className="text-bn-accent" />
            <span className="font-mono-bn text-[11px] uppercase tracking-[0.16em] text-bn-text-2">
              Hybrid Taproot · NIST PQC
            </span>
          </RevealOnView>
        </div>

        <RevealOnView delay={0.1}>
          <div className="grid gap-3">
            <Stat
              label="Bitcoin holders worldwide"
              value={
                <CountUp
                  to={500}
                  suffix="+"
                  format="millions"
                  className="tabular-nums"
                />
              }
            />
            <Stat
              label="Native identity standards on Bitcoin (until now)"
              value={<CountUp to={0} className="tabular-nums" />}
            />
            <Stat
              label="EU deadline for quantum-resistant infrastructure"
              value={<CountUp to={2030} className="tabular-nums" />}
              accent
            />
          </div>
        </RevealOnView>
      </div>

      <RevealOnView>
        <div className="flex items-start gap-3 max-w-[640px]">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-bn-accent-10 border border-bn-accent-30 text-bn-accent shrink-0">
            <Lock size={16} weight="bold" />
          </div>
          <div className="mt-1">
            <p className="bn-body text-bn-text-2">
              The transition is already in motion. These are the dates that
              shape the next decade of Bitcoin infrastructure.
            </p>
            <p className="mt-2 font-mono-bn text-[11px] uppercase tracking-[0.16em] text-bn-text-muted">
              Hover the timeline to pause
            </p>
          </div>
        </div>
      </RevealOnView>
    </div>

    <div className="relative mt-16 md:mt-20">
      <ThreatTimeline />
    </div>
  </section>
);

const Stat = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) => (
  <div
    className={`group relative rounded-2xl border bg-bn-surface/60 backdrop-blur-sm px-5 md:px-7 py-5 md:py-6 transition-colors hover:border-bn-border-mid ${
      accent ? "border-bn-accent-30 hover:border-bn-accent" : "border-bn-border"
    }`}
  >
    <div
      className={`text-[clamp(1.875rem,4.5vw,3.25rem)] leading-none mb-2 font-medium tracking-tight ${
        accent ? "text-bn-accent" : "text-bn-text"
      }`}
    >
      {value}
    </div>
    <div className="font-mono-bn text-[10px] uppercase tracking-[0.16em] text-bn-text-muted">
      {label}
    </div>
  </div>
);
