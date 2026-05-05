import { PropsWithChildren, useMemo, useState } from "react";

import { revalidateApp } from "@/app/actions/app";
import { setWalletAddressInCookies } from "@/app/actions/walletAddressInCookies";
import { useOrobitContext } from "@/orobit-sdk/context/context";

import {
  WalletAccount,
  WalletProvider,
  TWalletContext,
  WalletContext,
} from "./walletContext";

type Props = {
  init?: {
    connectedAccount?: WalletAccount | null;
  };
};

export const WalletContextProvider: React.FC<PropsWithChildren<Props>> = ({
  children,
  init,
}) => {
  const orobitProvider = useOrobitContext();

  const [connectedAccount, setConnectedAccount] =
    useState<WalletAccount | null>(init?.connectedAccount || null);

  const connect = async (provider: WalletProvider) => {
    if (provider === WalletProvider.OROBIT) {
      const account = await orobitProvider.connect();
      if (account.error) {
        throw new Error(account.error);
      }
      if (!account.data?.address) {
        throw new Error("No address returned from OROBIT provider");
      }
      setConnectedAccount({
        address: account.data.address,
        provider: WalletProvider.OROBIT,
      });
      setWalletAddressInCookies({
        address: account.data.address,
        provider: WalletProvider.OROBIT,
      });
      return account.data.address;
    }
    throw new Error("Unsupported wallet provider");
  };
  const disconnect = async () => {
    await orobitProvider.disconnect();
    setConnectedAccount(null);
    await setWalletAddressInCookies(null);
    await revalidateApp();
  };
  const sendTransaction = async ({
    toAddress,
    amount,
    contractId,
  }: {
    toAddress: string;
    amount: string; // Amount in satoshis
    contractId: string; // BTC || contract_id
  }) => {
    if (!connectedAccount) {
      throw new Error("No connected account");
    }
    if (connectedAccount.provider === WalletProvider.OROBIT) {
      const response = await orobitProvider.sendTx({
        toAddress,
        amount,
        contractId,
      });
      if (response.error) {
        throw new Error(response.error);
      }
      if (!response.data?.transactionId) {
        throw new Error(
          "Missing transaction ID. Transaction probably has failed. To ensure please check it out in your wallet."
        );
      }
      return { transactionId: response.data.transactionId };
    }

    throw new Error("Unsupported wallet provider");
  };

  const value = useMemo<TWalletContext>(
    () => ({
      isConnected: !!connectedAccount,
      connectedAccount,
      connect,
      disconnect,
      sendTransaction,
    }),
    [connectedAccount, connect, disconnect, sendTransaction]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
