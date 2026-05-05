import { RevealOnView, SectionEyebrow } from "@/common/components/bn";

import { NameCell, NameCellStatus } from "./NameCell";

const NAMES: Array<{ name: string; status: NameCellStatus }> = [
  { name: "satoshi.btc", status: "taken" },
  { name: "wallet.btc", status: "featured" },
  { name: "ledger.btc", status: "available" },
  { name: "vault.btc", status: "available" },
  { name: "node.btc", status: "taken" },
  { name: "halving.btc", status: "available" },
  { name: "cold.btc", status: "available" },
  { name: "miner.btc", status: "taken" },
  { name: "hodl.btc", status: "featured" },
  { name: "sats.btc", status: "available" },
  { name: "lightning.btc", status: "taken" },
  { name: "taproot.btc", status: "available" },
];

export const PremiumNames = () => (
  <section
    id="premium"
    className="bg-bn-page-2 border-b border-bn-line py-20 md:py-32"
  >
    <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
      <RevealOnView className="mb-6">
        <SectionEyebrow chapter="05" label="Premium names" />
      </RevealOnView>

      <div className="mb-10 md:mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <RevealOnView>
          <h2 className="bn-section-title text-bn-ink max-w-[560px]">
            A preview of the registry.
          </h2>
        </RevealOnView>
        <RevealOnView delay={0.08}>
          <p className="text-[14px] text-bn-ink-muted max-w-[340px]">
            Thousands more available at mint. Live data updates as the registry
            opens.
          </p>
        </RevealOnView>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {NAMES.map((n, i) => (
          <NameCell key={n.name} index={i} {...n} />
        ))}
      </div>
    </div>
  </section>
);
