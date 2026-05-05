import { format } from "date-fns";
import { Box, ExternalLink, Info, WalletIcon, XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useExplorerApi } from "@/api/exchangeApi/api";
import { createOrUpdateBidSupabase } from "@/app/actions/bids";
import { getDetailedListing } from "@/app/actions/listings";
import { revalidateMarketplace } from "@/app/marketplace/[contract_id]/actions";
import { revalidateProfile } from "@/app/profile/actions";
import { AnimatedContainer } from "@/common/components/AnimatedContainer";
import { Spinner } from "@/common/components/bn";
import { Button } from "@/common/components/Button";
import { EmptyTableInfo } from "@/common/components/EmptyTableInfo";
import { MakeAnOfferInput } from "@/common/components/MakeAnOfferInput";
import { SkeletonBox } from "@/common/components/SkeletonBox";
import { Tooltip } from "@/common/components/Tooltip";
import { TruncatedText } from "@/common/components/TruncatedText";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/common/components/ui/accordion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import { Listing, ListingDetailed } from "@/common/types/business";
import { NEXT_PUBLIC_EXPLORER_APP_URL } from "@/env";
import { cn } from "@/lib/utils";
import { useOrobitContext } from "@/orobit-sdk/context/context";
import { useWalletContext } from "@/providers/walletContext";
import { usePrice } from "@/utils/usePrice";
import { waitForTxBeingPending } from "@/utils/waitForTxBeingPending";

export const MakeAnOfferDialog: React.FC<{
  domain: string;
  isPremium: boolean;
  priceBtc: string;
  priceUsd: string;
  listingData: Listing;
}> = ({ domain, isPremium, priceBtc, priceUsd, listingData }) => {
  const { connectedAccount } = useWalletContext();
  const { placeBid } = useOrobitContext();

  const [offerPrice, setOfferPrice] = useState(""); // in BTC
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { convertBtcToSats } = usePrice();

  const handleOfferPriceChange = (value: string) => {
    setOfferPrice(value);
  };

  const handlePlaceOffer = async () => {
    setIsProcessing(true);

    if (!offerPrice || offerPrice.length === 0) {
      toast.error("Please enter a valid offer price.");
      setIsProcessing(false);
      return;
    }
    try {
      const res = await placeBid({
        contractId: listingData.contractId,
        amount: (1 * 10 ** 8).toString(), // amount always equal to 1 because it's nft standard
        price: convertBtcToSats(offerPrice).toString(),
        listingUtxo: listingData.listingUtxo,
        orderId: listingData.orderId,
        payAddress: listingData.recAddress,
      });
      if (res.error || !res.data?.bidId)
        throw new Error(res.error || "Transaction failed");

      await waitForTxBeingPending(
        "place-bid",
        listingData.contractId,
        res.data.bidId
      );
      await createOrUpdateBidSupabase({
        bidUtxo: res.data.bidId,
        listingUtxo: listingData.listingUtxo,
        contractId: listingData.contractId,
        owner: connectedAccount?.address || "",
        price: convertBtcToSats(offerPrice),
      });
      await revalidateMarketplace(listingData.contractId);
      await revalidateProfile(connectedAccount?.address);
      toast("Processing your offer.");
      setIsDialogOpen(false);
    } catch (error) {
      console.warn("Error placing bid:", error);
      toast.error("Failed to place a bid. Please try again.");
    }

    setIsProcessing(false);
  };

  const resetForm = () => {
    setOfferPrice("");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog
      key={domain}
      open={isDialogOpen}
      onOpenChange={handleDialogOpenChange}
    >
      <DialogTrigger asChild>
        {
          <Button variant="primary" size="S" className="shadow-sm hover:shadow-md">
            Make an Offer
          </Button>
        }
      </DialogTrigger>
      <DialogContent
        isProcessing={isProcessing}
        className="p-[30px] sm:p-[60px] h-fit max-h-[90vh] overflow-y-auto sm:w-none md:w-3xl sm:max-w-[calc(100%-2rem)]"
        showCloseButton={false}
      >
        <div className="h-full w-full flex flex-col items-center justify-between">
          <div className="w-full h-full">
            <DialogHeader className="w-full">
              <DialogTitle asChild>
                <div className="flex items-center justify-between w-full">
                  <p className="text-24 font-bold text-black">
                    Make an offer
                  </p>
                  <DialogClose disabled={isProcessing}>
                    <XIcon />
                  </DialogClose>
                </div>
              </DialogTitle>
            </DialogHeader>
            <MakeAnOfferDialogBody
              isProcessing={isProcessing}
              domain={domain}
              isPremium={isPremium}
              priceBtc={priceBtc}
              priceUsd={priceUsd}
              listingData={listingData}
              offerPrice={offerPrice}
              onOfferPriceChange={handleOfferPriceChange}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-4 w-full">
            <DialogClose disabled={isProcessing} asChild>
              <Button variant="secondary" size="M" className="w-full">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handlePlaceOffer}
              disabled={isProcessing || offerPrice.length === 0}
              variant="cta"
              size="M"
              className="w-full"
            >
              {isProcessing ? (
                <div className="w-fit m-auto">
                  <Spinner size={30} color="#2D2B37" />
                </div>
              ) : (
                "Submit offer"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MakeAnOfferDialogBody: React.FC<{
  isProcessing: boolean;
  domain: string;
  isPremium: boolean;
  priceBtc: string;
  priceUsd: string;
  listingData: Listing;
  offerPrice: string;
  onOfferPriceChange: (value: string) => void;
}> = ({
  isProcessing,
  domain,
  isPremium,
  priceBtc,
  priceUsd,
  listingData,
  offerPrice,
  onOfferPriceChange,
}) => {
  const { connectedAccount } = useWalletContext();
  const { formatPrice } = usePrice();

  const [error, setError] = useState<string | null>(null);
  const [listingDetailed, setListingDetailed] =
    useState<ListingDetailed | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDetailedListing = async () => {
      setIsLoading(true);
      try {
        const detailedListing = await getDetailedListing(listingData);
        setListingDetailed(detailedListing);
      } catch (error) {
        console.error("Failed to fetch detailed listing:", error);
        toast.error("Failed to load listing details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetailedListing();
  }, [listingData.contractId]);

  const { data: addressData } = useExplorerApi<{
    address: string;
    chain_stats: {
      funded_txo_sum: number;
      spent_txo_sum: number;
    };
  }>({
    url: "address/:address",
    params: { address: connectedAccount?.address || "" },
    enabled: !!connectedAccount?.address,
  });

  const walletBalance = addressData
    ? addressData.chain_stats.funded_txo_sum -
      addressData.chain_stats.spent_txo_sum
    : 0;

  return (
    <>
      <div className="mt-[30px] flex items-center gap-x-3">
        {isPremium && <p className="text-24 w-min">⭐️</p>}
        <p className="text-[32px] sm:text-[48px] font-semibold text-neutral-900">
          <TruncatedText name={domain} tooltip />
        </p>
      </div>
      <div className="mt-3 w-full flex flex-col gap-y-4 sm:gap-y-3">
        <div className="w-full flex flex-col sm:flex-row sm:items-center gap-y-4 sm:justify-between">
          <div className="flex items-center gap-x-3 text-neutral-900">
            <p className="text-20 sm:text-24 font-semibold flex items-center gap-x-1.5">
              {priceBtc}
            </p>
            <div className="w-[1px] h-7 bg-[#e8e0e0]/10" />
            <p className="text-16 font-medium">{priceUsd}</p>
          </div>
          <div className="text-16 font-medium flex items-center gap-x-1">
            <span>Owned by:</span>
            {listingDetailed?.recAddress ? (
              <span>
                <TruncatedText
                  fullScreen
                  charsAtEnd={3}
                  name={listingDetailed.recAddress}
                  tooltip
                />
              </span>
            ) : (
              <SkeletonBox className="h-6 w-[100px]" />
            )}
          </div>
        </div>
        <p className="sm:self-end">
          Renewal date:{" "}
          <span>
            {format(new Date(listingData.supabaseDomain.expiry), "yyyy-MM-dd")}
          </span>
        </p>
      </div>
      <div className="mt-[60px]">
        <label>
          <p className="text-16 text-neutral-500">Make your offer</p>
          <MakeAnOfferInput
            error={error}
            offerPrice={offerPrice}
            onOfferPriceChange={onOfferPriceChange}
            setError={setError}
            walletBalance={walletBalance}
            disabled={isProcessing}
          />
        </label>
      </div>
      <AnimatedContainer>
        {error && <p className="text-12 text-negative-red mt-2">{error}</p>}
      </AnimatedContainer>
      <button
        // onClick={handleSetOfferPriceToWalletBalance}
        disabled={isProcessing}
        className="mt-3 flex items-center gap-x-1.5 text-bn-accent/80"
      >
        <WalletIcon width={16} height={16} />
        <p className="text-16 font-medium">
          {formatPrice(walletBalance, 8, "BTC")}
        </p>
      </button>
      <p className="mt-5 sm:text-16 text-neutral-900 font-medium">
        Domain owner will see your offer and can accept or reject it. If the
        offer is accepted, the purchase will complete automatically.
      </p>
      <div className="mt-[60px] mb-10">
        <OffersList listing={listingDetailed} isLoading={isLoading} />
      </div>
    </>
  );
};

const OffersList: React.FC<{
  listing: ListingDetailed | null;
  isLoading: boolean;
}> = ({ listing, isLoading }) => {
  const { connectedAccount } = useWalletContext();
  const { formatPrice } = usePrice();
  if (isLoading) {
    return (
      <div className="my-[60px] flex flex-col items-center justify-center gap-y-5">
        <Box width={60} height={60} className="text-[#f7931a]" />
        <p className="text-16 text-center font-medium text-neutral-500">
          Loading offers...
        </p>
      </div>
    );
  }

  if (!listing?.bids.length) {
    return (
      <div className="my-[60px]">
        <EmptyTableInfo title={<span>There are no offers yet.</span>} />
      </div>
    );
  }

  const bids = listing.bids.filter((bid) => {
    const connectedAddress = connectedAccount?.address || "";
    const isPendingOrCancelled = bid.isPending || bid.isCancelled;
    if (isPendingOrCancelled && bid.bidder !== connectedAddress) {
      return false; // Exclude pending or cancelled bids not made by the connected user
    }
    return true; // Include all other bids
  });

  return (
    <Accordion type="single" collapsible defaultValue="offers">
      <AccordionItem value="offers">
        <AccordionTrigger
          className="text-24 font-bold"
          chevronClassName="text-black size-7"
        >
          Offers ({bids.length || 0})
        </AccordionTrigger>
        <AccordionContent>
          <ul>
            {bids
              .sort((a, b) => b.price - a.price)
              .map((bid) => {
                const pendingText = bid.isPending ? "(pending)" : "";
                return (
                  <div
                    key={bid.resevedUtxo}
                    className={cn(
                      "grid grid-cols-2 sm:grid-cols-3 items-center gap-y-3 py-1 text-16 font-normal",
                      {
                        "text-[#706C89]": bid.isPending,
                      }
                    )}
                  >
                    <div className="flex items-center gap-x-1 flex-wrap">
                      <p className="font-semibold text-nowrap">
                        {formatPrice(bid.price, 8, "BTC")}
                      </p>
                      {bid.isPending && (
                        <div className="flex items-center gap-x-2 flex-nowrap">
                          <p className="font-semibold">{pendingText}</p>
                          <a
                            href={`${NEXT_PUBLIC_EXPLORER_APP_URL}/tx/${bid.resevedUtxo.split(":")[0]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink
                              width={16}
                              height={16}
                              color="#525252"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                    <p className="self-center w-fit m-auto hidden sm:inline-block">
                      {format(new Date(bid.createdAt), "yyyy-MM-dd")}
                    </p>
                    <div className="flex items-center justify-end">
                      <p className="ml-auto">
                        <TruncatedText
                          fullScreen
                          charsAtEnd={3}
                          name={bid.bidder}
                          serverSide
                          tooltip
                        />
                      </p>
                      <div className="sm:hidden ml-4 mr-2">
                        <Tooltip
                          trigger={<Info size={12} />}
                          content={
                            <div className="text-16">
                              <p>
                                {format(new Date(bid.createdAt), "yyyy-MM-dd")}
                              </p>
                            </div>
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
