"use client";

import { EmptyTableInfo } from "@/common/components/EmptyTableInfo";
import { DataTable } from "@/common/components/ui/data-table";
import {
  SupabaseBidWithListing,
  SupabaseStatus,
} from "@/common/types/business";
import { usePrice } from "@/utils/usePrice";

import { columns, OfferTableRow } from "./columns";

export const OffersTab: React.FC<{ bids: SupabaseBidWithListing[] }> = ({
  bids,
}) => {
  const { formatPrice } = usePrice();

  const tableBids = bids.filter((bid) => bid.status !== SupabaseStatus.ENDED);

  if (!tableBids.length) {
    return (
      <div className="my-[60px]">
        <EmptyTableInfo
          title={
            <span>
              There are no offers yet. <br />
              It will appear here when you place an offer in the Marketplace.
            </span>
          }
        />
      </div>
    );
  }

  const data: OfferTableRow[] = tableBids.map((bid) => ({
    id: bid.bid_utxo,
    domain: bid.listings.name,
    offer: formatPrice(bid.price, 8, "BTC"),
    bidData: bid,
  }));

  return <DataTable columns={columns} data={data} />;
};
