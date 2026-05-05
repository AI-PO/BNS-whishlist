import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";

import { ConnectWallet } from "@/common/components/ConnectWallet";
import { TruncatedText } from "@/common/components/TruncatedText";
import { Listing } from "@/common/types/business";
import { useWalletContext } from "@/providers/walletContext";

import { MakeAnOfferDialog } from "../MakeAnOfferDialog";

export interface MarketplaceTableRow {
  id: string;
  isPremium: boolean;
  domain: string;
  priceBtc: string;
  priceUsd: string;
  listingData: Listing;
}

export const columns: ColumnDef<MarketplaceTableRow>[] = [
  {
    accessorKey: "premium",
    header: "",
    size: 30,
    cell: ({ row }) =>
      row.original.isPremium ? <p className="text-24 w-min">⭐️</p> : null,
  },
  {
    accessorKey: "domain",
    header: "",
    size: 200,
    cell: ({ row }) => (
      <p className="text-[length:24px] lg:text-[length:36px] text-bn-ink font-medium tracking-tight">
        <TruncatedText
          name={row.original.domain}
          serverSide
          tooltip
          fullScreen
        />
      </p>
    ),
  },
  {
    accessorKey: "price",
    header: "",
    size: 280,
    cell: ({ row }) => (
      <div className="grid grid-cols-[auto_1px_90px] items-center gap-x-3 text-neutral-600 font-medium">
        <p className="text-16 lg:text-24 font-medium text-bn-ink flex items-center justify-end gap-x-1.5">
          <Image src="/btc.png" alt="btc" width={20} height={20} className="opacity-90" />
          {row.original.priceBtc}
        </p>
        <div className="w-[1px] h-7 bg-neutral-200" />
        <p className="text-16 lg:text-24">{row.original.priceUsd}</p>
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "",
    size: 250,
    cell: ({ row }) => {
      const { contractId } = row.original.listingData;
      return (
        <div className="w-full flex items-center justify-end gap-x-3">
          <Link
            href={`/marketplace/${contractId}`}
            className="button button-secondary button-size-s shadow-sm hover:shadow-md"
          >
            Details
          </Link>
          <MakeAnOfferButton {...row.original} />
        </div>
      );
    },
  },
];

const MakeAnOfferButton: React.FC<MarketplaceTableRow> = (data) => {
  const { isConnected } = useWalletContext();

  if (!isConnected) {
    return (
      <ConnectWallet
        triggerProps={{
          text: "Make an offer",
          className: "button-size-s button-primary",
        }}
      />
    );
  }
  return <MakeAnOfferDialog key={data.id} {...data} />;
};
