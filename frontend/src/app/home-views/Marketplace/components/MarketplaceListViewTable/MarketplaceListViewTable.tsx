"use client";

import { Box } from "lucide-react";
import Image from "next/image";

import { DataTable } from "@/common/components/ui/data-table";
import { SupabaseStatus } from "@/common/types/business";
import { usePrice } from "@/utils/usePrice";

import { columns, MarketplaceTableRow } from "./columns";
import { useMarketplaceListContext } from "../../context/marketplaceListContext";

export const DomainsListViewTable: React.FC = () => {
  const { listings } = useMarketplaceListContext();
  const { formatPrice, convertSatsToUsd } = usePrice();

  const listingsData: MarketplaceTableRow[] = listings
    .filter((l) => l.status === SupabaseStatus.ACTIVE)
    .flatMap((listing) => {
      try {
        return {
          id: listing.listingUtxo,
          isPremium: false,
          domain: listing.domain,
          priceBtc: formatPrice(listing.price, 8, "BTC"),
          priceUsd: formatPrice(convertSatsToUsd(listing.price), 8, "USD"),
          listingData: listing,
        };
      } catch (error) {
        console.error("Error processing listing:", error);
        return [];
      }
    });

  if (listingsData.length === 0) {
    return (
      <div className="my-[60px] flex flex-col items-center justify-center gap-y-5">
        <Box width={60} height={60} className="opacity-50 text-[#f7931a]" />
        <p className="text-lg font-bold text-black/50">
          There are no listings yet.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={listingsData}
        hideHeader
        className="marketplace-table"
      />
    </div>
  );
};
