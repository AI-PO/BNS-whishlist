"use client";

import { MarketplaceListTopBar } from "./MarketplaceListTopBar";
import { DomainsListViewTable } from "./MarketplaceListViewTable";

export const MarketplaceListViewContent: React.FC = () => {
  return (
    <div className="flex flex-col gap-y-10 w-full">
      <MarketplaceListTopBar />
      <div className="w-full">
        <DomainsListViewTable />
      </div>
    </div>
  );
};
