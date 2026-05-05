import { Suspense } from "react";

import { MarketplaceLoading } from "./Marketplace.loading";
import { MarketplaceSectionContent } from "./MarketplaceSectionContent";

export const Marketplace: React.FC = async () => {
  return (
    <section
      id="marketplace"
      data-intersection-threshold={0.1}
      className={
        "relative min-h-screen-fixed flex flex-col items-center snap-start pt-[80px] sm:pt-[136px] max-w-[1240px] mx-auto px-[20px] md:px-[40px] pb-safe"
      }
    >
      <div className="relative z-10 w-full">
      <Suspense fallback={<MarketplaceLoading />}>
        <MarketplaceSectionContent />
      </Suspense>
      </div>
    </section>
  );
};
