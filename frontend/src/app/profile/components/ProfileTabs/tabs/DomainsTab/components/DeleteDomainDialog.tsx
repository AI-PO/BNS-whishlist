import { useState } from "react";
import { toast } from "react-toastify";

import { finalizeDomainBurn } from "@/app/actions/domains";
import { Spinner } from "@/common/components/bn";
import { Button } from "@/common/components/Button";
import { Tooltip } from "@/common/components/Tooltip";
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
import { waitForTxBeingPending } from "@/utils/waitForTxBeingPending";

export const DeleteDomainDialog: React.FC<{
  supabaseDomainId: number;
  contractId: string;
  domainName: string;
  disabled?: boolean;
  onCloseDialog?: () => void;
}> = ({
  supabaseDomainId,
  contractId,
  domainName,
  disabled,
  onCloseDialog,
}) => {
  const { connectedAccount } = useWalletContext();
  const { callContract } = useOrobitContext();

  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTransfer = async () => {
    setIsProcessing(true);

    if (!connectedAccount) {
      toast.error("Please connect your wallet to transfer the domain.");
      setIsProcessing(false);
      return;
    }

    try {
      const res = await callContract({
        nodeUrl: NEXT_PUBLIC_SCL_NODE_URL,
        contractId: NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ID,
        functionName: "burn",
        argsJson: JSON.stringify([{ type: "str", value: domainName }]),
        isView: false,
      });
      const txId = res.data?.result?.txid;

      if (!txId) {
        throw new Error("Transaction ID is missing in the response.");
      }

      console.log("Transaction sent:", res);
      // await waitForTxBeingPending("send-tx", "", txId);
      // await createTransferSaleOrderInSupabase({
      //   type: OrderType.TRANSFER,
      //   sender: connectedAccount.address,
      //   receiver: address.value,
      //   transactionId: res.transactionId,
      //   supabaseDomainId,
      // });
      await finalizeDomainBurn({
        txId,
        domain: domainName,
        btcAddress: connectedAccount.address,
        contractId,
        supabaseDomainId,
      });

      setIsOpen(false);
      toast("Domain transfer initiated successfully.");
    } catch (error) {
      console.log("Error sending transaction:", error);
      toast.error("Failed to transfer domain. Please try again.");
    }

    setIsProcessing(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      onCloseDialog?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {/* <Tooltip
          triggerAsChild
          disabled={true}
          // disabled={!disabled}
          trigger={ */}
        <button
          className={cn("text-16 font-medium py-3 text-start", {
            "text-neutral-400": disabled,
          })}
          disabled={disabled}
          onClick={() => setIsOpen(true)}
        >
          Delete domain
        </button>
        {/* }
          content={"Listed domains cannot be deleted."}
        /> */}
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
                Delete {domainName}
              </p>
            </DialogTitle>
          </DialogHeader>
          <p className="text-14 text-black font-medium">
            Are you sure you want to delete {domainName}? Once deleted, you will
            no longer own this domain, and this action cannot be undone. Please
            confirm this action is intentional.
          </p>
          <div className="mt-[45px] flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-4 w-full">
            <DialogClose disabled={isProcessing} asChild>
              <Button variant="secondary" size="M" className="w-full">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleTransfer}
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
                "Delete domain"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
