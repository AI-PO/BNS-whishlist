import {
  MinusCircleIcon,
  PlusCircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";

import { finalizeDomainRenewal } from "@/app/actions/domains";
import { Spinner } from "@/common/components/bn";
import { Button } from "@/common/components/Button";
import { ShadowContainer } from "@/common/components/ShadowContainer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import {
  NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ID,
  NEXT_PUBLIC_SCL_NODE_URL,
} from "@/env";
import { cn } from "@/lib/utils";
import { useOrobitContext } from "@/orobit-sdk/context/context";
import { useWalletContext } from "@/providers/walletContext";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const getMaxRenewYears = (expiryDate: Date): number => {
  const now = new Date();
  const yearsUntilExpiry = Math.max(
    0,
    Math.floor((expiryDate.getTime() - now.getTime()) / ONE_YEAR_MS),
  );
  const maxAllowedByPolicy = 4 - yearsUntilExpiry;
  return Math.min(4, Math.max(1, maxAllowedByPolicy));
};

export const RenewDomainDialog: React.FC<{
  supabaseDomainId: number;
  contractId: string;
  domainName: string;
  expiryDate: Date;
  disabled?: boolean;
  onCloseDialog?: () => void;
}> = ({
  supabaseDomainId,
  contractId,
  domainName,
  expiryDate,
  disabled,
  onCloseDialog,
}) => {
  const { connectedAccount } = useWalletContext();
  const { callContract } = useOrobitContext();

  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const maxRenewYears = useMemo(
    () => getMaxRenewYears(expiryDate),
    [expiryDate],
  );
  const [renewYears, setRenewYears] = useState(1);

  const handleRenew = async () => {
    setIsProcessing(true);

    if (!connectedAccount) {
      toast.error("Please connect your wallet to renew the domain.");
      setIsProcessing(false);
      return;
    }

    if (renewYears < 1 || renewYears > maxRenewYears) {
      toast.error(
        `Please select between 1 and ${maxRenewYears} renewal years.`,
      );
      setIsProcessing(false);
      return;
    }

    try {
      const res = await callContract({
        nodeUrl: NEXT_PUBLIC_SCL_NODE_URL,
        contractId: NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ID,
        functionName: "renew_domain",
        argsJson: JSON.stringify([
          { type: "str", value: domainName },
          { type: "int", value: renewYears },
        ]),
        isView: false,
      });

      const txId = res.data?.result?.txid;
      if (!txId) {
        throw new Error("Transaction ID is missing after renewal.");
      }

      await finalizeDomainRenewal({
        txId,
        domain: domainName,
        btcAddress: connectedAccount.address,
        contractId,
        supabaseDomainId,
        renewalYears: renewYears,
      });

      setIsOpen(false);
      toast("Domain renewal initiated successfully.");
    } catch (error) {
      console.log("Error sending renewal transaction:", error);
      toast.error("Failed to renew domain. Please try again.");
    }

    setIsProcessing(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      onCloseDialog?.();
      setRenewYears(1);
      setIsProcessing(false);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <button
          className={cn("text-16 font-medium py-3 text-start", {
            "text-neutral-400": disabled,
          })}
          disabled={disabled}
          onClick={() => setIsOpen(true)}
        >
          Renew
        </button>
      </DialogTrigger>
      <DialogContent
        isProcessing={isProcessing}
        className="p-[30px] w-[90vw] sm:max-w-[720px]"
        showCloseButton={false}
      >
        <div className="h-full w-full flex flex-col">
          <DialogHeader>
            <DialogTitle asChild>
              <p className="text-20 sm:text-24 font-bold mb-[30px]">
                Renew {domainName}
              </p>
            </DialogTitle>
          </DialogHeader>
          <p className="text-14 text-black font-medium mb-4">
            Choose renewal period. Final expiration date cannot exceed 4 full
            years from now.
          </p>
          <NumberSelector
            value={renewYears}
            onChange={setRenewYears}
            maxValue={maxRenewYears}
          />
          <p className="text-14 text-neutral-500 mt-3">
            Maximum for this domain: {maxRenewYears}{" "}
            {maxRenewYears === 1 ? "year" : "years"}.
          </p>
          <div className="mt-[45px] flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-4 w-full">
            <DialogClose disabled={isProcessing} asChild>
              <Button variant="secondary" size="M" className="w-full">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleRenew}
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
                "Renew domain"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const NumberSelector: React.FC<{
  value: number;
  onChange: (v: number) => void;
  maxValue: number;
}> = ({ value, onChange, maxValue }) => {
  const handleChange = (op: "+" | "-") => {
    if (op === "+" && value < maxValue) {
      onChange(value + 1);
      return;
    }

    if (op === "-" && value > 1) {
      onChange(value - 1);
    }
  };

  return (
    <ShadowContainer>
      <div className="py-5 px-4 flex items-center justify-between">
        <button
          disabled={value === 1}
          onClick={() => handleChange("-")}
          className="text-neutral-500 disabled:text-neutral-300"
        >
          <MinusCircleIcon />
        </button>
        <p className="text-20 font-semibold">{`${value} ${value === 1 ? "year" : "years"}`}</p>
        <button
          disabled={value === maxValue}
          className="text-neutral-500 disabled:text-neutral-300"
          onClick={() => handleChange("+")}
        >
          <PlusCircleIcon />
        </button>
      </div>
    </ShadowContainer>
  );
};
