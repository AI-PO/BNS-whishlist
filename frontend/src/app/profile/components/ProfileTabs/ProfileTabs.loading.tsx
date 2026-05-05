import { SkeletonBox } from "@/common/components/SkeletonBox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/common/components/ui/tabs";

import { ProfileMarketplaceTab, ProfileTab } from "../../types";

const tabs = [
  { value: "domains", label: "My domains" },
  { value: "orders", label: "Orders" },
  { value: "marketplace", label: "Marketplace" },
];

const subTabs = [
  { value: "listings", label: "My listings" },
  { value: "offers", label: "My offers" },
];

export const ProfileTabsLoading: React.FC<{
  tab: ProfileTab;
  subTab?: ProfileMarketplaceTab;
}> = ({ tab, subTab }) => {
  return (
    <Tabs
      defaultValue={tab}
      className="w-full max-w-[720px] h-full flex flex-col gap-y-[45px] min-h-0 flex-1"
    >
      <TabsList className="bg-transparent flex items-center gap-x-3 sm:gap-x-6 h-fit! p-0!">
        {tabs.map((tab) => (
          <TabsTrigger
            className="button! state-active:button-primary! state-inactive:button-secondary! button-size-m!"
            key={tab.value}
            value={tab.value}
            disabled
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="flex-1 min-h-0 flex flex-col">
        <TabsContent value="domains" className="flex-1 min-h-0 flex flex-col">
          <div className="flex flex-col gap-4">
            <SkeletonBox className="h-12 w-full" />
            <SkeletonBox className="h-12 w-full" />
            <SkeletonBox className="h-12 w-full" />
            <SkeletonBox className="h-12 w-full" />
          </div>
        </TabsContent>
        <TabsContent value="orders" className="flex-1 min-h-0 flex flex-col">
          <div className="flex flex-col gap-4">
            <SkeletonBox className="h-12 w-full" />
            <SkeletonBox className="h-12 w-full" />
            <SkeletonBox className="h-12 w-full" />
            <SkeletonBox className="h-12 w-full" />
          </div>
        </TabsContent>
        <TabsContent
          value="marketplace"
          className="flex-1 min-h-0 flex flex-col"
        >
          <Tabs
            defaultValue={subTab || "listings"}
            className="w-full max-w-[720px] h-full flex flex-col gap-y-[85px] min-h-0 flex-1"
          >
            <TabsList className="bg-transparent flex items-center gap-x-3 sm:gap-x-6 h-fit! p-0!">
              {subTabs.map((tab) => (
                <TabsTrigger
                  className="text-black text-16 font-medium p-3 rounded-[10px] shadow-sm border border-transparent state-active:border-neutral-300 transition-colors"
                  key={tab.value}
                  value={tab.value}
                  disabled
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent
              value="listings"
              className="flex-1 min-h-0 flex flex-col"
            >
              <div className="flex flex-col gap-4">
                <SkeletonBox className="h-12 w-full" />
                <SkeletonBox className="h-12 w-full" />
                <SkeletonBox className="h-12 w-full" />
                <SkeletonBox className="h-12 w-full" />
              </div>
            </TabsContent>
            <TabsContent
              value="offers"
              className="flex-1 min-h-0 flex flex-col"
            >
              <div className="flex flex-col gap-4">
                <SkeletonBox className="h-12 w-full" />
                <SkeletonBox className="h-12 w-full" />
                <SkeletonBox className="h-12 w-full" />
                <SkeletonBox className="h-12 w-full" />
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </div>
    </Tabs>
  );
};
