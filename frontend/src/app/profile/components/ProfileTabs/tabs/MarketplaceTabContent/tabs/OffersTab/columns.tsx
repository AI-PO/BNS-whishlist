"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { createOrUpdateBidSupabase } from "@/app/actions/bids";
import { revalidateProfile } from "@/app/profile/actions";
import { Spinner } from "@/common/components/bn";
import { Button } from "@/common/components/Button";
import { TruncatedText } from "@/common/components/TruncatedText";
import { SupabaseBid, SupabaseStatus } from "@/common/types/business";
import { NEXT_PUBLIC_EXPLORER_APP_URL } from "@/env";
import { cn } from "@/lib/utils";
import { useOrobitContext } from "@/orobit-sdk/context/context";
import { useWalletContext } from "@/providers/walletContext";
import { waitForTxBeingPending } from "@/utils/waitForTxBeingPending";

export type OfferTableRow = {
  id: string;
  domain: string;
  offer: string;
  bidData: SupabaseBid;
};

export const columns: ColumnDef<OfferTableRow>[] = [
  {
    accessorKey: "domain",
    header: () => <div className="max-w-[300px]"></div>,
    size: 300,
    cell: ({ row }) => {
      return (
        <p
          className={cn("max-w-[300px] font-semibold text-24", {
            "text-neutral-400":
              row.original.bidData.status === SupabaseStatus.PENDING,
          })}
        >
          <TruncatedText name={row.getValue("domain")} tooltip />
        </p>
      );
    },
  },
  {
    accessorKey: "offer",
    size: 200,
    header: () => <p className="text-16 text-neutral-500">Your offer</p>,
    cell: ({ row }) => {
      return (
        <p
          className={cn("text-24 font-semibold", {
            "text-neutral-400":
              row.original.bidData.status === SupabaseStatus.PENDING,
          })}
        >
          {row.getValue<string>("offer")}
        </p>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "",
    size: 90,
    cell: ({ row }) => {
      if (row.original.bidData.status === SupabaseStatus.PENDING) {
        return (
          <div className="flex items-center gap-x-1.5">
            <p className="text-20 font-medium text-neutral-400">Pending</p>
            <a
              href={`${NEXT_PUBLIC_EXPLORER_APP_URL}/tx/${row.original.bidData.bid_utxo}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink width={16} height={16} color="#525252" />
            </a>
          </div>
        );
      }
      return (
        <WithdrawButton
          contractId={row.original.bidData.contract_id}
          bidUtxo={row.original.id}
          listUtxo={row.original.bidData.list_utxo}
          price={row.original.bidData.price}
        />
      );
    },
  },
];

const WithdrawButton: React.FC<{ price: number;
  bidUtxo: string;
  contractId: string;
  listUtxo: string;
}> = ({ contractId, bidUtxo, listUtxo, price }) => {
  const { cancelBid } = useOrobitContext();
  const [isLoading, setIsLoading] = useState(false);
  const { connectedAccount } = useWalletContext();

  const handleCancelBid = async () => {
    setIsLoading(true);
    try {
      const res = await cancelBid({ bidUtxo: `${bidUtxo}:0`, contractId });
      if (res.error) throw new Error(res.error);
      await waitForTxBeingPending("cancel-bid", contractId, bidUtxo);
      await createOrUpdateBidSupabase({
        contractId,
        bidUtxo,
        listingUtxo: listUtxo,
        owner: connectedAccount?.address || "",
        price: price,
      });
      await revalidateProfile(connectedAccount?.address);
      toast("Processing your request.");
      // Optionally, you can add a success message or refresh the data
    } catch (error) {
      console.error("Error cancelling bid:", error);
      toast.error("Failed to withdraw offer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-end">
      <Button
        disabled={isLoading}
        variant="secondary"
        size="S"
        onClick={handleCancelBid}
      >
        {isLoading ? (
          <div className="w-[76px] flex items-center justify-center">
            <Spinner size={20} color="#E8E0E0" />
          </div>
        ) : (
          "Withdraw"
        )}
      </Button>
    </div>
  );
};
