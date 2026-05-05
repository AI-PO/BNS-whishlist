"use client";

import { format } from "date-fns";
import { ExternalLink, Info, WalletIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useExplorerApi } from "@/api/exchangeApi/api";
import {
  createOrUpdateBidSupabase,
  updateBidsSupabase,
} from "@/app/actions/bids";
import { revalidateProfile } from "@/app/profile/actions";
import { AnimatedContainer } from "@/common/components/AnimatedContainer";
import { Spinner } from "@/common/components/bn";
import { Button } from "@/common/components/Button";
import { ConnectWallet } from "@/common/components/ConnectWallet";
import { EmptyTableInfo } from "@/common/components/EmptyTableInfo";
import { MakeAnOfferInput } from "@/common/components/MakeAnOfferInput";
import { Tooltip } from "@/common/components/Tooltip";
import { TruncatedText } from "@/common/components/TruncatedText";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/common/components/ui/accordion";
import { ListingDetailed, SupabaseStatus } from "@/common/types/business";
import { NEXT_PUBLIC_EXPLORER_APP_URL } from "@/env";
import { cn } from "@/lib/utils";
import { useOrobitContext } from "@/orobit-sdk/context/context";
import { useWalletContext } from "@/providers/walletContext";
import { usePrice } from "@/utils/usePrice";
import { waitForTxBeingPending } from "@/utils/waitForTxBeingPending";

import { revalidateMarketplace } from "../actions";

export const ListingPageContent: React.FC<{
  listing: ListingDetailed;
}> = ({ listing }) => {
  const { connectedAccount } = useWalletContext();
  const { placeBid } = useOrobitContext();
  const { convertSatsToUsd, formatPrice, convertBtcToSats } = usePrice();

  const [offerPrice, setOfferPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

    const satsPrice = convertBtcToSats(offerPrice);
    if (satsPrice > walletBalance) {
      setError("Insufficient balance");
      setIsProcessing(false);
      return;
    } else {
      setError(null);
    }

    try {
      const res = await placeBid({
        contractId: listing.contractId,
        amount: (1 * 10 ** 8).toString(), // amount always equal to 1 because it's nft standard
        price: convertBtcToSats(offerPrice).toString(),
        listingUtxo: listing.listingUtxo,
        orderId: listing.orderId,
        payAddress: listing.recAddress,
      });
      if (res.error || !res.data?.bidId)
        throw new Error(res.error || "Transaction failed");

      await waitForTxBeingPending(
        "place-bid",
        listing.contractId,
        res.data.bidId
      );
      await createOrUpdateBidSupabase({
        bidUtxo: res.data.bidId,
        listingUtxo: listing.listingUtxo,
        contractId: listing.contractId,
        owner: connectedAccount?.address || "",
        price: convertBtcToSats(offerPrice),
      });
      await new Promise((resolve) => setTimeout(resolve, 2000)); // wait for supabase to be consistent
      await revalidateMarketplace(listing.contractId);
      await revalidateProfile(connectedAccount?.address);
      setOfferPrice("");
      toast("Processing your offer.");
    } catch (error) {
      console.log("Error placing bid:", error);
      toast.error("Failed to place a bid. Please try again.");
    }

    setIsProcessing(false);
  };

  return (
    <div className="w-full md:w-[667px] flex flex-col gap-y-[30px] sm:gap-y-[60px]">
      <div className="flex flex-col gap-y-3 text-14 sm:text-16 font-medium">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-1 sm:gap-x-6">
            <p className="text-20 sm:text-24 font-semibold">
              {formatPrice(listing.price, 8, "BTC")}
            </p>
            <div className="w-[1px] h-7 bg-neutral-200" />
            <p>
              {formatPrice(convertSatsToUsd(listing.price), 8, "USD", {
                shorten: false,
              })}
            </p>
          </div>
          <p>
            Owned by:{"  "}
            <span>
              <TruncatedText
                fullScreen
                charsAtEnd={3}
                name={listing.recAddress}
                serverSide
                tooltip
              />
            </span>
          </p>
        </div>
        <p className="self-end">
          Renewal date:{" "}
          <span>
            {format(new Date(listing.supabaseDomain.expiry), "yyyy-MM-dd")}
          </span>
        </p>
      </div>
      <div>
        <label>
          <p className="text-16 text-neutral-500">Make your offer</p>
          <MakeAnOfferInput
            error={error}
            offerPrice={offerPrice}
            onOfferPriceChange={handleOfferPriceChange}
            setError={setError}
            walletBalance={walletBalance}
            disabled={isProcessing}
          />
        </label>
        <AnimatedContainer>
          {error && <p className="text-12 text-negative-red mt-2">{error}</p>}
        </AnimatedContainer>
        <button
          // onClick={handleSetOfferPriceToWalletBalance}
          disabled={isProcessing || !connectedAccount}
          className="mt-3 flex items-center gap-x-1.5 text-bn-accent/80"
        >
          <WalletIcon width={16} height={16} />
          <p className="text-16 font-medium">
            {formatPrice(walletBalance, 8, "BTC")}
          </p>
        </button>
        <p className="mt-5 text-16 text-black font-medium">
          Domain owner will see your offer and can accept or reject it. If the
          offer is accepted, the purchase will complete automatically.
        </p>
        <div className="mt-5">
          <SubmitOfferButton
            isProcessing={isProcessing}
            onClick={handlePlaceOffer}
          />
        </div>
      </div>
      <OffersList listing={listing} />
    </div>
  );
};

const SubmitOfferButton: React.FC<{
  isProcessing: boolean;
  onClick: () => void;
}> = ({ isProcessing, onClick }) => {
  const { connectedAccount } = useWalletContext();

  if (!connectedAccount) {
    return (
      <ConnectWallet
        triggerProps={{
          className: "sm:w-full button-cta button-size-m",
        }}
      />
    );
  }

  return (
    <Button
      onClick={onClick}
      disabled={isProcessing}
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
  );
};

const OffersList: React.FC<{ listing: ListingDetailed }> = ({ listing }) => {
  const { connectedAccount } = useWalletContext();
  const { formatPrice } = usePrice();

  useEffect(() => {
    const bids: Parameters<typeof updateBidsSupabase>[0] = listing.bids
      .filter((bid) => {
        const connectedAddress = connectedAccount?.address || "";
        return bid.bidder === connectedAddress;
      })
      .map((bid) => ({
        bid_utxo: bid.resevedUtxo.split(":")[0],
        listings: {
          list_utxo: bid.listingUtxo,
          name: listing.domain,
        },
        contract_id: listing.contractId,
        price: bid.price,
        owner: bid.bidder,
        created_at: bid.createdAt,
        list_utxo: listing.listingUtxo,
        status: bid.isPending
          ? SupabaseStatus.PENDING
          : bid.isCancelled
            ? SupabaseStatus.ENDED
            : SupabaseStatus.ACTIVE,
      }));
    const update = async () => {
      try {
        await updateBidsSupabase(bids);
      } catch (error) {
        console.warn("Error updating bids in supabase:", error);
      }
    };
    update();
    const interval = setInterval(() => {
      update();
    }, 60_000); // Update every minute

    return () => clearInterval(interval);
  }, [listing.bids]);

  if (!listing.bids.length) {
    return (
      <div className="my-[60px]">
        <EmptyTableInfo title={<span>There are no offers yet.</span>} />
      </div>
    );
  }

  const bids = listing.bids.filter((bid) => {
    const connectedAddress = connectedAccount?.address || "";
    if ((bid.isPending && bid.bidder !== connectedAddress) || bid.isCancelled) {
      return false; // Exclude pending bids not made by the connected user and all cancelled bids
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
                        "text-neutral-400": bid.isPending,
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
