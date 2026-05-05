"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { getUserNotListedContracts } from "@/api/exchangeApi/actions/listings";
import { createOrUpdateListingSupabase } from "@/app/actions/listings";
import { revalidateProfile } from "@/app/profile/actions";
import { AnimatedContainer } from "@/common/components/AnimatedContainer";
import { Spinner } from "@/common/components/bn";
import { Button } from "@/common/components/Button";
import { ShadowContainer } from "@/common/components/ShadowContainer";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/common/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";
import { ScrollArea } from "@/common/components/ui/scroll-area";
import { CallbackWithData } from "@/common/types/generic";
import { cn } from "@/lib/utils";
import { useOrobitContext } from "@/orobit-sdk/context/context";
import { useWalletContext } from "@/providers/walletContext";
import { usePrice } from "@/utils/usePrice";
import { waitForTxBeingPending } from "@/utils/waitForTxBeingPending";

export const NewListingDialog = () => {
  const { placeListing } = useOrobitContext();
  const { convertBtcToSats } = usePrice();
  const { connectedAccount } = useWalletContext();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [priceBtc, setPriceBtc] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlaceListing = async () => {
    setIsProcessing(true);

    if (!domain || priceBtc.length === 0) {
      toast.error("Please select a domain and enter a price.");
      setIsProcessing(false);
      return;
    }

    if (error) {
      toast.error(error);
      setIsProcessing(false);
      return;
    }

    try {
      const res = await placeListing({
        contractId: domain,
        amount: (1 * 10 ** 8).toString(), // 1 BTC in sats - 1 domain token is always equal to 100.000.000
        price: convertBtcToSats(priceBtc).toString(),
      });
      if (res.error) throw new Error(res.error);

      await waitForTxBeingPending("place-listing", domain);
      await createOrUpdateListingSupabase({
        contractId: domain,
        price: convertBtcToSats(priceBtc),
        owner: connectedAccount?.address || "",
        listingUtxo: res.data?.listingId ? `${res.data.listingId}:0` : undefined,
        orderId: res.data?.listingId,
      }); // TODO: test it once SCL05 token is alive
      await revalidateProfile(connectedAccount?.address);
      toast("Processing your listing.");
      setIsDialogOpen(false);
    } catch (error) {
      console.log("Error placing listing:", error);
      toast.error("Failed to place listing. Please try again.");
    }

    setIsProcessing(false);
  };

  const handleDomainChange: CallbackWithData<string> = (newDomain) => {
    setDomain(newDomain);
    setPriceBtc("");
  };
  const handlePriceBtcChange: CallbackWithData<string> = (newPrice) => {
    setPriceBtc(newPrice);
  };

  const resetForm = () => {
    setDomain("");
    setPriceBtc("");
    setError(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const isPlaceListingDisabled =
    !domain || priceBtc.length === 0 || !!error || isProcessing;

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="cta"
          size="M"
          className="w-full text-16 font-semibold flex items-center justify-center"
        >
          New listing
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        isProcessing={isProcessing}
        className="p-[30px] h-auto max-h-[90vh] overflow-y-auto sm:w-none md:w-2xl sm:max-w-[calc(100%-2rem)]"
        showCloseButton={false}
      >
        <div className="w-full flex flex-col gap-y-[45px] items-center justify-between">
          <DialogHeader className="w-full">
            <DialogTitle asChild>
              <p className="text-24 font-bold text-black">New listing</p>
            </DialogTitle>
          </DialogHeader>
          <NewListingDialogBody
            isProcessing={isProcessing}
            domain={domain}
            priceBtc={priceBtc}
            error={error}
            setError={setError}
            handleDomainChange={handleDomainChange}
            handlePriceBtcChange={handlePriceBtcChange}
          />
          <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-4 w-full">
            <DialogClose disabled={isProcessing} asChild>
              <Button variant="secondary" size="M" className="w-full">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="cta"
              size="M"
              className="w-full"
              disabled={isPlaceListingDisabled}
              onClick={handlePlaceListing}
            >
              {isProcessing ? (
                <div className="w-fit m-auto">
                  <Spinner size={30} color="#2D2B37" />
                </div>
              ) : (
                "Place a listing"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const NewListingDialogBody: React.FC<{
  isProcessing: boolean;
  domain: string;
  priceBtc: string;
  error: string | null;
  setError: (error: string | null) => void;
  handleDomainChange: CallbackWithData<string>;
  handlePriceBtcChange: CallbackWithData<string>;
}> = ({
  isProcessing,
  domain,
  priceBtc,
  error,
  setError,
  handleDomainChange,
  handlePriceBtcChange,
}) => {
  const { formatPrice, convertBtcToSats, convertSatsToUsd } = usePrice();

  const spanRef = useRef<HTMLSpanElement | null>(null);
  const [inputWidth, setInputWidth] = useState(50); // default width

  useEffect(() => {
    if (spanRef.current) {
      const width = spanRef.current.offsetWidth;
      setInputWidth(width + 10); // add some padding for cursor
    }
  }, [priceBtc]);

  return (
    <div className="flex flex-col gap-y-[30px]">
      <label>
        <p className="text-neutral-500 text-16 mb-3">Choose domain to list</p>
        <DomainSelect
          isProcessing={isProcessing}
          domain={domain}
          handleDomainChange={handleDomainChange}
        />
      </label>
      <label>
        <p className="text-16 text-neutral-500">Make your offer</p>
        <ShadowContainer
          className={cn("flex-1 mt-3", {
            "border-red-500": error !== null,
          })}
        >
          <div
            className={cn(
              "w-full flex items-center justify-between transition-colors bg-white focus-within:bg-neutral-50 p-4 rounded-[10px]",
              {
                "bg-neutral-50": priceBtc.length > 0 && priceBtc !== "0",
              }
            )}
          >
            <div className="flex items-center gap-x-1">
              {/* Hidden span to measure text width */}
              <span
                ref={spanRef}
                className="invisible absolute whitespace-pre font-semibold text-lg"
                style={{ fontFamily: "inherit" }}
              >
                {priceBtc || "0.00 BTC"}
              </span>
              <input
                type="text"
                inputMode="decimal"
                pattern="^\d*\.?\d*$"
                className="w-min bg-transparent text-foreground font-semibold placeholder:font-normal placeholder:text-neutral-500 focus:placeholder:text-black transition-colors outline-none text-lg"
                style={{ width: inputWidth }}
                placeholder="0.00 BTC"
                value={priceBtc}
                disabled={isProcessing}
                onChange={(e) => {
                  const value = e.target.value;
                  setError(null);

                  if (value === "") {
                    handlePriceBtcChange("");
                    return;
                  }
                  // Allow only numbers and at most one decimal point
                  if (isNaN(parseFloat(value)) || !/^\d*\.?\d*$/.test(value))
                    return;

                  if (parseFloat(value) > 1000) {
                    setError("Maximum offer value is 1000 BTC");
                    return;
                  }
                  if (value.includes(".")) {
                    const decimals = value.split(".")[1];
                    if (decimals && decimals.length > 8) {
                      setError("Maximum 8 decimal places allowed");
                      return;
                    }
                  }

                  handlePriceBtcChange(value);
                }}
              />
              {priceBtc.length > 0 && (
                <p className="text-16 font-semibold">BTC</p>
              )}
            </div>
            <span className="text-12 text-neutral-500">
              {formatPrice(
                convertSatsToUsd(convertBtcToSats(priceBtc)),
                8,
                "USD"
              )}
            </span>
          </div>
        </ShadowContainer>
        <AnimatedContainer>
          {error && <p className="text-12 text-negative-red mt-2">{error}</p>}
        </AnimatedContainer>
      </label>
      <p className="text-16 font-medium text-black">
        Your domain will be listed in the marketplace. If it gets an offer, you
        can accept it and the domain will be automatically transferred to the
        accepted bidder.
      </p>
    </div>
  );
};

const DomainSelect: React.FC<{
  isProcessing: boolean;
  domain: string;
  handleDomainChange: CallbackWithData<string>;
}> = ({ isProcessing, domain, handleDomainChange }) => {
  const { connectedAccount } = useWalletContext();
  const [domains, setDomains] = useState<
    { domain: string; contractId: string }[]
  >([]);
  const [isFetching, setIsFetching] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDomains = async () => {
      setIsFetching(true);
      const userDomains = await getUserNotListedContracts(
        connectedAccount?.address || ""
      );
      setDomains(
        userDomains.map((d) => ({
          domain: d.ticker,
          contractId: d.contract_id,
        }))
      );
      setIsFetching(false);
    };
    fetchDomains();
  }, [connectedAccount?.address]);

  // Clear search when popover closes
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
    if (inputRef.current && open) {
      inputRef.current.focus();
    }
  }, [open]);

  const filteredDomains = domains.filter((d) =>
    d.domain.toLowerCase().includes(search.toLowerCase())
  );

  const selectedDomainLabel =
    domains.find((d) => d.contractId === domain)?.domain || "";

  const disabled = isFetching || isProcessing || domains.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ShadowContainer>
        <PopoverTrigger disabled={disabled} asChild>
          <label
            className={cn(
              "w-full transition-colors flex items-center justify-between bg-white p-4 rounded-[10px] cursor-pointer",
              {
                "bg-neutral-50": selectedDomainLabel || open,
                "cursor-auto": disabled,
              }
            )}
            onClick={(e) => {
              if (disabled) {
                e.preventDefault();
              }
            }}
          >
            {open ? (
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isFetching
                    ? "Loading your domains..."
                    : domains.length
                      ? "Search or select domain"
                      : "No domains available"
                }
                disabled={disabled}
                className="w-full bg-transparent outline-none text-black placeholder:text-neutral-500"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  // Close dropdown on Escape
                  if (e.key === "Escape") {
                    setOpen(false);
                    setSearch("");
                  }
                }}
                autoFocus
              />
            ) : (
              <span className="text-black">
                {selectedDomainLabel ||
                  (isFetching
                    ? "Loading your domains..."
                    : domains.length
                      ? "Choose domain"
                      : "No domains available")}
              </span>
            )}
          </label>
        </PopoverTrigger>
      </ShadowContainer>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        onWheel={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandList className="overflow-auto">
            <CommandEmpty>No results found.</CommandEmpty>
            <ScrollArea className="[&>[data-radix-scroll-area-viewport]]:max-h-[300px]">
              <CommandGroup
                className={cn({
                  "!p-0": filteredDomains.length === 0,
                })}
              >
                {filteredDomains.map((item) => (
                  <CommandItem
                    key={item.contractId}
                    value={item.contractId}
                    onSelect={() => {
                      handleDomainChange(item.contractId);
                      setSearch("");
                      setOpen(false);
                    }}
                    className="text-black text-16 font-medium p-3 rounded-md hover:bg-neutral-100 transition-colors"
                  >
                    {item.domain}
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
