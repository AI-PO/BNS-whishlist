"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { ProfileMarketplaceTab, ProfileTab } from "@/app/profile/types";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import { Listing, SupabaseBidWithListing } from "@/common/types/business";

import { NewListingDialog } from "./NewListingDialog";
import { ListingsTab } from "./tabs/ListingsTab";
import { OffersTab } from "./tabs/OffersTab";

const tabs = [
  { value: ProfileMarketplaceTab.LISTINGS, label: "My listings" },
  { value: ProfileMarketplaceTab.OFFERS, label: "My offers" },
];

const getInitialTab = (tab: string | null | undefined) => {
  if (
    !tab ||
    tab === "undefined" ||
    !Object.values(ProfileMarketplaceTab).includes(tab as ProfileMarketplaceTab)
  ) {
    return ProfileMarketplaceTab.LISTINGS;
  }
  return tab as ProfileMarketplaceTab;
};

export const MarketplaceTab: React.FC<{
  listings: Listing[];
  bids: SupabaseBidWithListing[];
}> = ({ listings, bids }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<ProfileMarketplaceTab>(
    getInitialTab(searchParams.get("subtab"))
  );

  const onTabChange = (value: ProfileMarketplaceTab) => {
    router.replace(`?tab=${ProfileTab.MARKETPLACE}&subtab=${value}`, {
      scroll: false,
    });
    setActiveTab(value);
  };

  return (
    <div className="min-h-0 flex-1 flex flex-col max-w-[790px]">
      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as ProfileMarketplaceTab)}
        defaultValue={ProfileMarketplaceTab.LISTINGS}
        className="w-full flex flex-col flex-1 min-h-0 gap-y-[45px]"
      >
        <TabsList className="bg-transparent flex items-center gap-x-3 sm:gap-x-6 h-fit! p-0! flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger
              className="button! state-active:button-primary! state-inactive:button-secondary! button-size-s!"
              key={tab.value}
              value={tab.value}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <TabsContent
            value={ProfileMarketplaceTab.LISTINGS}
            className="flex-1 min-h-0 flex flex-col overflow-hidden"
          >
            <ListingsTab listings={listings} />
          </TabsContent>
          <TabsContent
            value={ProfileMarketplaceTab.OFFERS}
            className="flex-1 min-h-0 flex flex-col overflow-hidden"
          >
            <OffersTab bids={bids} />
          </TabsContent>
        </div>
        {activeTab === ProfileMarketplaceTab.LISTINGS && (
          <div className="flex-shrink-0">
            <NewListingDialog />
          </div>
        )}
      </Tabs>
    </div>
  );
};
