import {
  MagnifyingGlass,
  CurrencyBtc,
  GlobeHemisphereWest,
} from "@phosphor-icons/react/dist/ssr";

import { RevealOnView, SectionEyebrow } from "@/common/components/bn";

import { StepCard } from "./StepCard";

const ICON_PROPS = { size: 22, weight: "bold" as const };

const STEPS = [
  {
    icon: <MagnifyingGlass {...ICON_PROPS} />,
    title: "Search",
    body: "Type any name. We resolve availability against the Bitcoin chain in real time.",
    code: "$ btc-domains check yourname",
  },
  {
    icon: <CurrencyBtc {...ICON_PROPS} />,
    title: "Register on-chain",
    body: "Mint directly on Bitcoin via the Orobit protocol. Hybrid Taproot and post-quantum from day one.",
    code: "$ btc-domains mint yourname.btc",
  },
  {
    icon: <GlobeHemisphereWest {...ICON_PROPS} />,
    title: "Use everywhere",
    body: "Resolve a wallet, host a site, sign in to apps. Your name is portable identity.",
    code: "@yourname.btc → bc1q9xj7…p7z",
  },
];

export const HowItWorks = () => (
  <section
    id="how"
    className="relative bg-bn-page py-20 md:py-32 border-b border-bn-line"
  >
    <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
      <RevealOnView className="mb-6">
        <SectionEyebrow chapter="02" label="How it works" />
      </RevealOnView>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-10 md:mb-14">
        <RevealOnView delay={0.05}>
          <h2 className="bn-section-title text-bn-ink max-w-[640px]">
            Three steps. <span className="text-bn-ink-dim">No middlemen.</span>
          </h2>
        </RevealOnView>
        <RevealOnView delay={0.1}>
          <p className="text-[14px] text-bn-ink-muted max-w-[320px]">
            Settled on Bitcoin. Owned by your keys. No registrar, no renewal,
            no rug pull.
          </p>
        </RevealOnView>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <StepCard key={step.title} index={i} {...step} />
        ))}
      </div>
    </div>
  </section>
);
