"use client";

import Image from "next/image";
import React from "react";

import { Button } from "@/common/components/Button";
import { ConnectWallet } from "@/common/components/ConnectWallet";
import { TruncatedText } from "@/common/components/TruncatedText";
import { useWalletContext } from "@/providers/walletContext";

export const WalletConnection = () => {
  const { disconnect, connectedAccount, isConnected } = useWalletContext();

  if (isConnected) {
    return (
      <Button
        variant="secondary"
        size="S"
        className={"w-full sm:w-auto button-size-m sm:button-size-s"}
        onClick={disconnect}
      >
        <div className="flex items-center justify-between sm:justify-start gap-x-2.5">
          <div className="flex items-center gap-x-2">
            <Image src={"/wallet.svg"} alt={"wallet"} width={24} height={24} />
            <TruncatedText
              name={connectedAccount?.address || ""}
              charsAtStart={4}
              charsAtEnd={4}
              truncateLengthThreshold={11}
              fullScreen
              serverSide
            />
          </div>
          <Image src={"/link.svg"} alt={"link"} width={20} height={20} />
        </div>
      </Button>
    );
  }

  return (
    <ConnectWallet
      triggerProps={{
        className: "button-primary button-size-m sm:button-size-s",
      }}
    />
  );
};
