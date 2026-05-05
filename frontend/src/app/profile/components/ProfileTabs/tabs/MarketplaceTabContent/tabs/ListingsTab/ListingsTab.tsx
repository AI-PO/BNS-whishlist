"use client";

import { EmptyTableInfo } from "@/common/components/EmptyTableInfo";
import { DataTable } from "@/common/components/ui/data-table";
import { Listing } from "@/common/types/business";
import { usePrice } from "@/utils/usePrice";

import { columns, ListingTableRow } from "./columns";

export const ListingsTab: React.FC<{ listings: Listing[] }> = ({
  listings,
}) => {
  const { formatPrice } = usePrice();

  if (!listings.length) {
    return (
      <div className="my-[60px]">
        <EmptyTableInfo title={<span>There are no listings yet.</span>} />
      </div>
    );
  }

  const data: ListingTableRow[] = listings.map((listing) => ({
    id: listing.listingUtxo,
    domain: listing.domain,
    offersNumber: listing.bidCount,
    currentOffer:
      listing.bestBid > 0 ? formatPrice(listing.bestBid, 8, "BTC") : null,
    listingData: listing,
  }));

  return (
    <div className="h-full min-h-0 flex-1 flex flex-col relative overflow-auto">
      <DataTable columns={columns} data={data} />
    </div>
  );
};
