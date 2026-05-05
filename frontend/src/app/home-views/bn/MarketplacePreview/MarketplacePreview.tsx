import {
  ArrowRight,
  ChartLineUp,
  Coins,
  Storefront,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { RevealOnView, SectionEyebrow } from "@/common/components/bn";

import { SalesCard } from "./SalesCard";

const ICON_PROPS = { size: 16, weight: "bold" as const };

const CARDS = [
  {
    icon: <ChartLineUp {...ICON_PROPS} />,
    label: "Recent sale",
    primary: "satoshi.btc",
    hint: "0.84 BTC · 2 days ago",
    trend: "+18%",
    isMono: true,
  },
  {
    icon: <Coins {...ICON_PROPS} />,
    label: "Floor",
    primary: "0.0042 BTC",
    hint: "Lowest active listing",
    trend: "+4.1%",
    isMono: false,
  },
  {
    icon: <Storefront {...ICON_PROPS} />,
    label: "Active listings",
    primary: "1,284",
    hint: "Across all extensions",
    trend: "+62 / 24h",
    isMono: false,
  },
];

export const MarketplacePreview = () => (
  <section className="bg-bn-page py-20 md:py-32 border-b border-bn-line">
    <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
      <RevealOnView className="mb-6">
        <SectionEyebrow chapter="04" label="Marketplace" />
      </RevealOnView>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between mb-10 md:mb-12">
        <RevealOnView>
          <h2 className="bn-section-title text-bn-ink max-w-[620px]">
            Tradeable the moment you own them.
          </h2>
        </RevealOnView>
        <RevealOnView delay={0.08}>
          <Link
            href="/marketplace"
            className="group inline-flex items-center gap-2 text-[14px] font-medium text-bn-ink hover:text-bn-accent transition-colors"
          >
            Browse the marketplace
            <ArrowRight
              weight="bold"
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </RevealOnView>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {CARDS.map((c, i) => (
          <SalesCard key={c.label} index={i} {...c} />
        ))}
      </div>
    </div>
  </section>
);
