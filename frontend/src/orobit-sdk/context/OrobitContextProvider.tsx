"use client";

import { PropsWithChildren, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";

import { OROBIT_CONNECTED_ACCOUNT_KEY } from "../consts";
import { OrobitBrowserProvider } from "../provider";
import {
  AcceptBidRequest,
  CallContractRequest,
  CancelBidRequest,
  CancelListingRequest,
  MintNFTRequest,
  PlaceBidRequest,
  PlaceListingRequest,
  SendTransactionRequest,
} from "../types";
import { IOrobitContext, OrobitContext } from "./context";

export const OrobitContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const provider = useMemo(() => {
    if (typeof window === "undefined") return null;

    return new OrobitBrowserProvider();
  }, []);
  const [account, setAccount] = useLocalStorage<string | undefined>(
    OROBIT_CONNECTED_ACCOUNT_KEY,
    ""
  );

  const executeAction = async <T,>(
    action: () => Promise<T>,
    actionName: string,
    requireAccount = true
  ) => {
    if (!provider) {
      console.error("Provider is not initialized");
      return { error: "Provider is not initialized" };
    }
    if (requireAccount && !account) {
      return { error: "No account connected" };
    }

    try {
      return await action();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "User closed the wallet window"
      ) {
        return { error: "User closed the wallet window" };
      } else {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`Failed to ${actionName}:`, errorMsg);
        return { error: errorMsg };
      }
    }
  };

  const connect = async () => {
    return executeAction(
      async () => {
        const result = await provider!.connect();
        if (result.data?.address) setAccount(result.data?.address);
        return result;
      },
      "connect",
      false
    );
  };

  const disconnect = async () => {
    if (!provider) {
      console.error("Provider is not initialized");
      return;
    }

    await provider.disconnect();
    setAccount("");
  };

  const sendTx = async (data: SendTransactionRequest["data"]) =>
    executeAction(() => provider!.sendTransaction(data), "send transaction");

  const mintNFT = async (data: MintNFTRequest["data"]) =>
    executeAction(() => provider!.mintNFT(data), "mint NFT");

  const placeListing = async (data: PlaceListingRequest["data"]) =>
    executeAction(() => provider!.placeListing(data), "place listing");

  const cancelListing = async (data: CancelListingRequest["data"]) =>
    executeAction(() => provider!.cancelListing(data), "cancel listing");

  const placeBid = async (data: PlaceBidRequest["data"]) =>
    executeAction(() => provider!.placeBid(data), "place bid");

  const acceptBid = async (data: AcceptBidRequest["data"]) =>
    executeAction(() => provider!.acceptBid(data), "accept bid");

  const cancelBid = async (data: CancelBidRequest["data"]) =>
    executeAction(() => provider!.cancelBid(data), "cancel bid");

  const callContract = async (
    data: CallContractRequest["data"]
  ) => executeAction(() => provider!.callContract(data), "call contract");

  const value = useMemo<IOrobitContext>(
    () => ({
      account,
      isConnected: !!account,
      setAccount,
      connect,
      disconnect,
      sendTx,
      mintNFT,
      placeListing,
      placeBid,
      acceptBid,
      cancelListing,
      cancelBid,
      callContract,
    }),
    [
      account,
      setAccount,
      connect,
      disconnect,
      sendTx,
      mintNFT,
      placeListing,
      placeBid,
      acceptBid,
      cancelListing,
      cancelBid,
      callContract,
    ]
  );

  return (
    <OrobitContext.Provider value={value}>{children}</OrobitContext.Provider>
  );
};
