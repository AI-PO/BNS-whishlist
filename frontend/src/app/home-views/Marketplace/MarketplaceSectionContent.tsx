import { getListings } from "@/app/actions/listings";
import { Listing, SupabaseStatus } from "@/common/types/business";

import { MarketplaceListViewContent } from "./components/MarketplaceListViewContent";
import { DomainsListContextProvider } from "./context/MarketplaceListContextProvider";

export const MarketplaceSectionContent: React.FC = async () => {
  const listings: Listing[] = await getListings();

  return (
    <>
      <h2 className="mt-8 md:mt-16 mb-4 text-[clamp(2.4rem,6vw,4.4rem)] font-medium text-bn-ink tracking-tight leading-tight text-center">
        <span className="text-[#f7931a]">Premium names</span> available now ⚡️
      </h2>
      <div className="mt-[24px] w-full flex flex-col">
        <DomainsListContextProvider
          listings={listings.filter((l) => l.status === SupabaseStatus.ACTIVE)}
        >
          <MarketplaceListViewContent />
        </DomainsListContextProvider>
      </div>
    </>
  );
};
