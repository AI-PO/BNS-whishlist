import validate from "bitcoin-address-validation";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { createTransferSaleOrderInSupabase } from "@/app/actions/domains";
import { Spinner } from "@/common/components/bn";
import { Button } from "@/common/components/Button";
import { ShadowContainer } from "@/common/components/ShadowContainer";
import { Tooltip } from "@/common/components/Tooltip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import { OrderType, TCryptoAddress } from "@/common/types/business";
import {
  NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ID,
  NEXT_PUBLIC_SCL_NODE_URL,
} from "@/env";
import { cn } from "@/lib/utils";
import { useOrobitContext } from "@/orobit-sdk/context/context";
import { useWalletContext } from "@/providers/walletContext";
import { waitForTxBeingPending } from "@/utils/waitForTxBeingPending";

type TTransferAddress = Omit<TCryptoAddress, "isValid"> & {
  isValid: boolean | null;
};

export const TransferDomainDialog: React.FC<{
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
  const [address, setAddress] = useState<TTransferAddress>({
    value: "",
    isValid: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTransfer = async () => {
    setIsProcessing(true);

    if (!connectedAccount) {
      toast.error("Please connect your wallet to transfer the domain.");
      setIsProcessing(false);
      return;
    }

    if (!validate(address.value)) {
      toast.error("Please enter a valid bitcoin address.");
      setAddress({ value: address.value, isValid: false });
      setIsProcessing(false);
      return;
    }

    try {
      // const res = await sendTransaction({
      //   amount: "1",
      //   contractId,
      //   toAddress: address.value, // TODO: reaplce with actual address
      // });
      const res = await callContract({
        nodeUrl: NEXT_PUBLIC_SCL_NODE_URL,
        contractId: NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ID,
        functionName: "transfer",
        argsJson: JSON.stringify([
          { type: "str", value: address.value },
          { type: "str", value: domainName },
        ]),
        isView: false,
      });

      const txId = res.data?.result.txid;
      if (!txId) {
        throw new Error("Transaction ID is missing after transfer.");
      }

      console.log("Transaction sent:", res);
      // await waitForTxBeingPending("send-tx", "", txId);
      await createTransferSaleOrderInSupabase({
        type: OrderType.TRANSFER,
        sender: connectedAccount.address,
        receiver: address.value,
        transactionId: txId,
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

  const resetForm = () => {
    setAddress({ value: "", isValid: null });
    setIsProcessing(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      onCloseDialog?.();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
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
              Transfer domain
            </button>
          {/* }
          content={"Listed domains cannot be transferred to another address."}
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
                Transfer {domainName}
              </p>
            </DialogTitle>
          </DialogHeader>
          <TransferDomainDialogBody
            isProcessing={isProcessing}
            address={address}
            onAddressChange={setAddress}
          />
          <div className="mt-[45px] flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-4 w-full">
            <DialogClose disabled={isProcessing} asChild>
              <Button variant="secondary" size="M" className="w-full">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleTransfer}
              disabled={isProcessing || address.isValid === false}
              variant="cta"
              size="M"
              className="w-full"
            >
              {isProcessing ? (
                <div className="w-fit m-auto">
                  <Spinner size={30} color="#2D2B37" />
                </div>
              ) : (
                "Transfer"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TransferDomainDialogBody: React.FC<{
  isProcessing: boolean;
  address: TTransferAddress;
  onAddressChange: (address: TTransferAddress) => void;
}> = ({ isProcessing, address, onAddressChange }) => {
  const displayInvalidAddressErrorMessage = address.isValid === false;

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const isValid = validate(newValue);
    onAddressChange({ value: newValue, isValid: isValid ? isValid : null }); // check domain validity only on submit
  };

  return (
    <div>
      <p className="text-16 text-neutral-500 mb-3">
        Address or domain name to transfer domain to
      </p>
      <ShadowContainer
        className={cn("w-full overflow-hidden", {
          "border-red-500": displayInvalidAddressErrorMessage,
        })}
      >
        <div className="w-full flex items-center justify-between bg-white px-4 py-5 rounded-[10px]">
          <input
            type="text"
            className="w-full bg-white text-black rounded-[10px] text-16 font-medium leading-5 placeholder:text-neutral-500 outline-none"
            placeholder="Paste address or name here"
            value={address.value}
            onChange={handleAddressChange}
            disabled={isProcessing}
          />
          {address.isValid === null ? null : address.isValid ? (
            <Check className="text-positive-green w-5 h-5" />
          ) : (
            <X className="text-negative-red w-5 h-5" />
          )}
        </div>
      </ShadowContainer>
      <p className="mt-[30px] text-14 text-black font-medium">
        Once a domain is transferred to another address, you will no longer own
        it. Transferring it back is only possible if the recipient voluntarily
        returns it. Please ensure this transfer is intentional and not a
        mistake.
      </p>
    </div>
  );
};
