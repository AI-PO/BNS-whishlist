"use client";

import { format } from "date-fns";
import { Box, Info } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { createTransferSaleOrderInSupabase } from "@/app/actions/domains";
import {
  createOrUpdateListingSupabase,
  getDetailedListing,
  revalidateOnModifyListing,
} from "@/app/actions/listings";
import { Spinner } from "@/common/components/bn";
import { Button } from "@/common/components/Button";
import { EmptyTableInfo } from "@/common/components/EmptyTableInfo";
import { Tooltip } from "@/common/components/Tooltip";
import { TruncatedText } from "@/common/components/TruncatedText";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import {
  Listing,
  ListingBid,
  ListingDetailed,
  OrderType,
} from "@/common/types/business";
import { cn } from "@/lib/utils";
import { useOrobitContext } from "@/orobit-sdk/context/context";
import { useWalletContext } from "@/providers/walletContext";
import { usePrice } from "@/utils/usePrice";
import { waitForTxBeingPending } from "@/utils/waitForTxBeingPending";

export const ListingDetailsDialog: React.FC<{ listing: Listing }> = ({
  listing,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // used to block other actions while processing

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  const handleProcessingChange = (processing: boolean) => {
    setIsProcessing(processing);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="S" className="text-16 font-medium">
          Details
        </Button>
      </DialogTrigger>
      <DialogContent
        isProcessing={isProcessing}
        className="px-3 py-6 sm:px-[30px] sm:py-[30px] h-fit max-h-[90vh] overflow-y-auto sm:w-none md:w-2xl sm:max-w-[calc(100%-2rem)]"
        showCloseButton={false}
      >
        <div className="h-full w-full flex flex-col gap-y-[45px] items-center justify-between">
          <DialogHeader className="w-full">
            <DialogTitle asChild>
              <p className="text-24 font-bold text-black">
                Listing details
              </p>
            </DialogTitle>
          </DialogHeader>
          <ListingDetailsDialogBody
            listing={listing}
            isProcessing={isProcessing}
            onProcessingChange={handleProcessingChange}
            onCloseDialog={handleCloseDialog}
          />
          <DialogClose disabled={isProcessing} asChild>
            <Button variant="secondary" size="M" className="w-full">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const useAcceptBid = (
  onSuccess?: () => void,
  onProcessingChange?: (processing: boolean) => void
) => {
  const { connectedAccount } = useWalletContext();
  const { acceptBid } = useOrobitContext();
  const [isLoading, setIsLoading] = useState(false);

  const acceptBidHandler = async (bid: ListingBid) => {
    setIsLoading(true);
    onProcessingChange?.(true);
    try {
      const res = await acceptBid({
        acceptTx: bid.acceptTx,
        amount: bid.amount.toString(),
        contractId: bid.contractId,
        fulfillTx: bid.fulfillTx,
      });
      if (res.error) throw new Error(res.error);
      await waitForTxBeingPending("accept-bid", bid.contractId);
      await createOrUpdateListingSupabase({ contractId: bid.contractId }); // Update listing status in Supabase to Accepted
      await createTransferSaleOrderInSupabase({
        type: OrderType.SALE,
        sender: connectedAccount?.address || "",
        receiver: bid.bidder,
        transactionId: res.data?.transactionId || "",
        supabaseDomainId: bid.supabaseDomainId,
      });
      await revalidateOnModifyListing();
      toast("Processing the transaction.");
      onSuccess?.();
      // Handle success, e.g., show a success message or refresh the listing
    } catch (error) {
      console.log("Failed to accept bid:", error);
      toast.error("Failed to accept bid. Please try again.");
      // Handle error, e.g., show an error message
    }
    setIsLoading(false);
    onProcessingChange?.(false);
  };
  return { acceptBidHandler, isLoading };
};

const ListingDetailsDialogBody: React.FC<{
  listing: Listing;
  isProcessing: boolean;
  onProcessingChange: (processing: boolean) => void;
  onCloseDialog: () => void;
}> = ({ listing, isProcessing, onProcessingChange, onCloseDialog }) => {
  const [detailedListing, setDetailedListing] =
    useState<ListingDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetailedListing = async () => {
      setIsLoading(true);
      try {
        const detailedListing = await getDetailedListing(listing);
        setDetailedListing(detailedListing);
      } catch (error) {
        console.error("Failed to fetch detailed listing:", error);
        toast.error("Failed to load listing details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailedListing();
  }, [listing]);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-[30px]">
        <div className="flex-1 flex flex-col gap-y-3">
          <ListingDomainName
            isPremium={listing.isPremium || false}
            domain={listing.domain}
          />
          <ListingPriceInfo price={listing.price} />
        </div>
        <EndListingButton
          listing={listing}
          isProcessing={isProcessing}
          onProcessingChange={onProcessingChange}
          onCloseDialog={onCloseDialog}
        />
      </div>
      <div className="mt-[60px]">
        <ListingOffers
          listing={detailedListing}
          isProcessing={isProcessing}
          isLoading={isLoading}
          onProcessingChange={onProcessingChange}
          onCloseDialog={onCloseDialog}
        />
      </div>
    </div>
  );
};

const ListingDomainName: React.FC<{ isPremium: boolean; domain: string }> = ({
  isPremium,
  domain,
}) => {
  return (
    <div className="flex items-center gap-x-3">
      {isPremium && <p className="text-24 w-min">⭐️</p>}
      <p className="text-[32px] sm:text-[48px] font-semibold text-black">
        <TruncatedText name={domain} tooltip fullScreen />
      </p>
    </div>
  );
};

const ListingPriceInfo: React.FC<{
  price: number;
}> = ({ price }) => {
  const { formatPrice, convertSatsToUsd } = usePrice();

  return (
    <div className="flex items-center gap-x-3 text-black">
      <p className="text-20 sm:text-24 font-semibold flex items-center gap-x-1.5">
        {formatPrice(price, 8, "BTC")}
      </p>
      <div className="w-[1px] h-7 bg-neutral-200" />
      <p className="text-16 font-medium">
        {formatPrice(convertSatsToUsd(price), 8, "USD")}
      </p>
    </div>
  );
};

const EndListingButton: React.FC<{
  listing: Listing;
  isProcessing: boolean;
  onProcessingChange: (processing: boolean) => void;
  onCloseDialog: () => void;
}> = ({ listing, isProcessing, onProcessingChange, onCloseDialog }) => {
  const { cancelListing } = useOrobitContext();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelListing = async () => {
    setIsLoading(true);
    onProcessingChange(true);
    try {
      const res = await cancelListing({
        listingUtxo: listing.listingUtxo,
        contractId: listing.contractId,
      });
      if (res.error) throw new Error(res.error);
      // needed to transaction be marked as pending
      await waitForTxBeingPending("end-listing", listing.contractId);
      await createOrUpdateListingSupabase({ contractId: listing.contractId }); // Update listing status in Supabase to Ended
      await revalidateOnModifyListing();
      toast("Listing has been successfully ended.");
      onCloseDialog();
      // Optionally, you can refresh the listing or perform any other action
    } catch (error) {
      console.log("Failed to cancel listing:", error);
      toast.error("Failed to cancel listing. Please try again.");
    }
    setIsLoading(false);
    onProcessingChange(false);
  };

  return (
    <Button
      disabled={isLoading || isProcessing}
      onClick={handleCancelListing}
      size="M"
      variant="secondary"
      className="w-fit"
    >
      {isLoading ? (
        <div className="w-[81px] flex items-center justify-center">
          <Spinner size={30} color="#E8E0E0" />
        </div>
      ) : (
        "End listing"
      )}
    </Button>
  );
};

const ListingOffers: React.FC<{
  listing: ListingDetailed | null;
  isProcessing: boolean;
  isLoading?: boolean;
  onProcessingChange: (processing: boolean) => void;
  onCloseDialog: () => void;
}> = ({
  listing,
  isProcessing,
  isLoading: isLoadingOffers,
  onProcessingChange,
  onCloseDialog,
}) => {
  const bids = listing?.bids
    .sort((a, b) => b.price - a.price)
    .filter((bid) => {
      const isPendingOrCancelled = bid.isPending || bid.isCancelled;
      if (isPendingOrCancelled) {
        return false; // Exclude pending or cancelled bids not made by the connected user
      }
      return true; // Include all other bids
    });

  const { acceptBidHandler, isLoading } = useAcceptBid(
    onCloseDialog,
    onProcessingChange
  );

  if (isLoadingOffers) {
    return (
      <div className="my-[60px] flex flex-col items-center justify-center gap-y-5">
        <Box width={60} height={60} className="text-[#f7931a]" />
        <p className="text-16 text-center font-medium text-neutral-500">
          Loading offers...
        </p>
      </div>
    );
  }

  if (!bids?.length) {
    return (
      <div className="my-[60px]">
        <EmptyTableInfo
          title={
            <span>
              There are no offers yet. <br />
              It will appear here when someone makes an offer in the
              Marketplace.
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <>
        <p className="text-24 font-bold">Newest offer</p>
        <div className="mt-6">
          <SingleOfferRow bid={bids[0]} />
        </div>
        <Button
          onClick={() => acceptBidHandler(bids[0])}
          disabled={isLoading || isProcessing}
          variant="primary"
          size="M"
          className="mt-3 w-full"
        >
          {isLoading ? (
            <div className="w-fit m-auto">
              <Spinner size={30} color="#2D2B37" />
            </div>
          ) : (
            "Accept offer"
          )}
        </Button>
      </>
      <p className="text-24 font-bold mt-[45px]">Previous offers</p>
      <div className="mt-6">
        <PreviousOffersList
          bids={bids.slice(1)}
          onCloseDialog={onCloseDialog}
        />
      </div>
    </div>
  );
};

const PreviousOffersList: React.FC<{
  bids: ListingBid[];
  onCloseDialog: () => void;
}> = ({ bids, onCloseDialog }) => {
  if (!bids.length) {
    return (
      <EmptyTableInfo title={<span>There are no previous offers.</span>} />
    );
  }

  return (
    <ul className="flex flex-col gap-x-4">
      {bids.map((bid) => (
        <SingleOfferRow
          key={bid.resevedUtxo}
          bid={bid}
          withAcceptButton
          onCloseDialog={onCloseDialog}
        />
      ))}
    </ul>
  );
};

const SingleOfferRow: React.FC<{
  bid: ListingBid;
  withAcceptButton?: boolean;
  isProcessing?: boolean;
  onProcessingChange?: (processing: boolean) => void;
  onCloseDialog?: () => void;
}> = ({
  bid,
  withAcceptButton = false,
  isProcessing = false,
  onProcessingChange,
  onCloseDialog,
}) => {
  const { formatPrice } = usePrice();

  const { acceptBidHandler, isLoading } = useAcceptBid(
    onCloseDialog,
    onProcessingChange
  );

  return (
    <div
      key={bid.resevedUtxo}
      className={cn(
        "flex items-center justify-between gap-y-3 py-1 text-16 font-normal",
        {
          "text-neutral-400": bid.isCancelled || bid.isPending,
        }
      )}
    >
      <p className="font-semibold">{formatPrice(bid.price, 8, "BTC")}</p>
      <p className="hidden sm:inline-block">
        {format(new Date(bid.createdAt), "yyyy-MM-dd")}
      </p>
      <div className="flex items-center">
        <p>
          <TruncatedText fullScreen charsAtEnd={3} name={bid.bidder} tooltip />
        </p>
        <div className="sm:hidden ml-4">
          <Tooltip
            trigger={<Info size={12} />}
            content={
              <div className="text-16">
                <p>{format(new Date(bid.createdAt), "yyyy-MM-dd")}</p>
              </div>
            }
          />
        </div>
        {withAcceptButton && (
          <div className="ml-[18px] sm:ml-9">
            <Button
              onClick={() => acceptBidHandler(bid)}
              disabled={
                isLoading || isProcessing || bid.isCancelled || bid.isPending
              }
              size="S"
              variant="secondary"
              className={cn({
                "opacity-50 cursor-not-allowed":
                  isLoading || isProcessing || bid.isCancelled || bid.isPending,
              })}
            >
              {isLoading ? (
                <div className="w-[60px] flex items-center justify-center">
                  <Spinner size={20} color="#E8E0E0" />
                </div>
              ) : (
                "Accept"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
