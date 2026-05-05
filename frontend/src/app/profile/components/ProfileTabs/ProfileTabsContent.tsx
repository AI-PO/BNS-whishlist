"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";
import {
  Domain,
  Listing,
  OrderWithDomain,
  SupabaseBidWithListing,
} from "@/common/types/business";

import { useUpdateSupabase } from "./hooks/useUpdateSupabase";
import { DomainsTab } from "./tabs/DomainsTab";
import { MarketplaceTab } from "./tabs/MarketplaceTabContent";
import { OrdersTab } from "./tabs/OrdersTab";
import { ProfileTab } from "../../types";

const tabs = [
  { value: ProfileTab.DOMAINS, label: "My domains" },
  { value: ProfileTab.ORDERS, label: "Orders" },
  // { value: ProfileTab.MARKETPLACE, label: "Marketplace" },
];

export const ProfileTabsContent: React.FC<{
  initTab: ProfileTab;
  userListings: Listing[];
  userDomains: Domain[];
  userOrders: OrderWithDomain[];
  userBids: SupabaseBidWithListing[];
}> = ({ initTab, userListings, userDomains, userOrders, userBids }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>(initTab);

  useUpdateSupabase(userOrders, userListings, userBids);

  const onTabChange = (value: ProfileTab) => {
    router.replace(`?tab=${value}`, { scroll: false });
    setActiveTab(value);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as ProfileTab)}
      defaultValue={ProfileTab.DOMAINS}
      className="w-full h-full flex flex-col gap-y-[45px] min-h-0 flex-1"
    >
      <TabsList className="bg-transparent flex items-center gap-x-3 sm:gap-x-6 h-fit! p-0! flex-wrap">
        {tabs.map((tab) => (
          <TabsTrigger
            className="button! state-active:button-primary! state-inactive:button-secondary! button-size-m!"
            key={tab.value}
            value={tab.value}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="flex-1 min-h-0 flex flex-col">
        <TabsContent
          value={ProfileTab.DOMAINS}
          className="flex-1 min-h-0 flex flex-col"
        >
          <DomainsTab userListings={userListings} userDomains={userDomains} />
        </TabsContent>
        <TabsContent
          value={ProfileTab.ORDERS}
          className="flex-1 min-h-0 flex flex-col"
        >
          <OrdersTab orders={userOrders} />
        </TabsContent>
        {/* <TabsContent
          value={ProfileTab.MARKETPLACE}
          className="flex-1 min-h-0 flex flex-col"
        >
          <MarketplaceTab listings={userListings} bids={userBids} />
        </TabsContent> */}
      </div>
    </Tabs>
  );
};
