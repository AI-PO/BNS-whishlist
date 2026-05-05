"use client";

import { CaretRight as ChevronRight } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { ComponentProps, useState } from "react";
import { toast } from "react-toastify";

import { Spinner } from "@/common/components/bn";
import { cn } from "@/lib/utils";
import {
  SupportedWalletProviders,
  useWalletContext,
  WalletProvider,
} from "@/providers/walletContext";

import { Button } from "./Button";
import { CallbackWithData } from "../types/generic";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type Props = {
  triggerProps?: Omit<
    ComponentProps<typeof ConnectWalletModalTrigger>,
    "isConnecting" | "onClick"
  >;
};

export const ConnectWallet: React.FC<Props> = ({ triggerProps }) => {
  const { connect } = useWalletContext();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (provider: WalletProvider) => {
    try {
      setIsConnecting(true);
      await connect(provider);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message !== "User closed the wallet window")
          toast(error.message || "Failed to connect wallet");
      } else {
        toast("Failed to connect wallet");
      }
    }
    setIsConnecting(false);
  };

  return (
    <ConnectWalletModal
      handleConnect={handleConnect}
      isConnecting={isConnecting}
      triggerProps={triggerProps}
    />
  );
};

const ConnectWalletModalTrigger: React.FC<{
  isConnecting: boolean;
  className?: string;
  text?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}> = ({ isConnecting, className, text = "Connect Wallet", onClick }) => {
  return (
    <button
      onClick={(e) => {
        onClick(e);
      }}
      className={cn(
        "button w-full sm:w-auto relative flex items-center justify-center",
        className
      )}
    >
      {isConnecting && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-fit m-auto">
          <Spinner
            size={className?.includes("button-size-s") ? 28 : 32}
            color="#2D2B37"
          />
        </div>
      )}
      <p
        className={cn({
          invisible: isConnecting,
          visible: !isConnecting,
        })}
      >
        {text}
      </p>
    </button>
  );
};

const ConnectWalletModal: React.FC<
  {
    isConnecting: boolean;
    handleConnect: CallbackWithData<WalletProvider>;
  } & Pick<Props, "triggerProps">
> = ({ isConnecting, triggerProps, handleConnect }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ConnectWalletModalTrigger
          isConnecting={isConnecting}
          onClick={() => setOpen(true)}
          {...triggerProps}
        />
      </DialogTrigger>
      <DialogContent
        className="py-[60px] px-[45px] h-[600px]"
        showCloseButton={false}
      >
        <div className="h-full w-full flex flex-col items-center justify-between">
          <DialogHeader>
            <DialogTitle asChild>
              <div className="w-full flex flex-col items-center gap-y-10">
                <Image
                  src="/logo_bn.svg"
                  alt="Logo"
                  width={150}
                  height={150}
                />
                <p className="text-20 sm:text-24 font-bold">
                  Connect wallet to continue
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <ul className="w-full">
            {SupportedWalletProviders.map((provider) => (
              <li key={provider.provider}>
                <WalletsListItem
                  logo={provider.logo}
                  name={provider.label}
                  provider={provider.provider}
                  handleConnect={handleConnect}
                />
              </li>
            ))}
          </ul>
          <DialogClose asChild>
            <Button variant="secondary" size="M" className="w-full">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const WalletsListItem: React.FC<{
  logo: string;
  name: string;
  provider: WalletProvider;
  handleConnect: CallbackWithData<WalletProvider>;
}> = ({ logo, name, provider, handleConnect }) => {
  return (
    <button
      onClick={() => handleConnect(provider)}
      className="w-full flex items-center justify-between hover:bg-black/5 px-2 sm:px-4 py-3 sm:py-5 transition-colors rounded-[10px] text-left"
    >
      <div className="flex items-center gap-x-6">
        <Image src={logo} alt="Wallet Logo" width={46} height={46} />
        <p className="text-20 sm:text-24 font-semibold">{name} wallet</p>
      </div>
      <ChevronRight width={28} height={28} />
    </button>
  );
};
