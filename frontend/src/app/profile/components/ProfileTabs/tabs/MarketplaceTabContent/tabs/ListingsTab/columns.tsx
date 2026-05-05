"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";

import { TruncatedText } from "@/common/components/TruncatedText";
import { Listing, SupabaseStatus } from "@/common/types/business";
import { NEXT_PUBLIC_EXPLORER_APP_URL } from "@/env";
import { cn } from "@/lib/utils";

import { ListingDetailsDialog } from "./ListingDetailsDialog";

export type ListingTableRow = {
  id: string;
  domain: string;
  offersNumber: number;
  currentOffer: string | null;
  listingData: Listing;
};

export const columns: ColumnDef<ListingTableRow>[] = [
  {
    accessorKey: "domain",
    header: () => <div className="max-w-[300px]"></div>,
    size: 300,
    cell: ({ row }) => {
      return (
        <p
          className={cn("max-w-[300px] font-semibold text-20 sm:text-24", {
            "text-neutral-400":
              row.original.listingData.status === SupabaseStatus.PENDING,
          })}
        >
          <TruncatedText name={row.getValue("domain")} tooltip />
        </p>
      );
    },
  },
  {
    accessorKey: "offersNumber",
    size: 80,
    header: () => <p className="text-16 text-neutral-500">Offers</p>,
    cell: ({ row }) => {
      const offersNumber = row.getValue<number>("offersNumber");
      return (
        <p
          className={cn("text-20 sm:text-24 font-semibold", {
            "text-neutral-400":
              row.original.listingData.status === SupabaseStatus.PENDING,
          })}
        >
          {offersNumber > 0 ? offersNumber : "-"}
        </p>
      );
    },
  },
  {
    accessorKey: "currentOffer",
    header: () => <p className="text-16 text-neutral-500">Current offer</p>,
    size: 220,
    cell: ({ row }) => {
      const currentOffer = row.getValue<string | null>("currentOffer");
      const offerFitsPrice =
        row.original.listingData.bestBid >= row.original.listingData.price;
      return (
        <div className="gap-x-3 flex items-center">
          <p
            className={cn("text-20 sm:text-24 font-semibold", {
              "text-neutral-400":
                row.original.listingData.status === SupabaseStatus.PENDING,
              "text-green-500": offerFitsPrice,
            })}
          >
            {currentOffer ? currentOffer : "0 BTC"}
          </p>
          {offerFitsPrice && (
            <p className="text-black text-14 sm:text-16 font-medium">Max</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "",
    size: 100,
    cell: ({ row }) => {
      if (row.original.listingData.status === SupabaseStatus.PENDING) {
        return (
          <div className="flex items-center gap-x-1.5">
            <p className="text-20 font-medium text-neutral-400">Pending</p>
            <a
              href={`${NEXT_PUBLIC_EXPLORER_APP_URL}/tx/${row.original.listingData.listingUtxo.split(":")[0]}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink width={16} height={16} color="#525252" />
            </a>
          </div>
        );
      }

      return <ListingDetailsDialog listing={row.original.listingData} />;
    },
  },
];
