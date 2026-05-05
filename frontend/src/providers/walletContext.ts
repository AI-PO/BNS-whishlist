import { createSafeContext } from "@/utils/createSafeContext";

export enum WalletProvider {
  OROBIT = "OROBIT",
}
export const SupportedWalletProviders: {
  provider: WalletProvider;
  label: string;
  logo: string;
}[] = [
  {
    provider: WalletProvider.OROBIT,
    label: "OroBit",
    logo: "/wallets/orobit_logo_black.svg",
  },
];
export type WalletAccount = {
  address: string;
  provider: WalletProvider;
};
export type TWalletContext = {
  isConnected: boolean;
  connectedAccount?: WalletAccount | null;
  connect: (provider: WalletProvider) => Promise<string>;
  disconnect: () => Promise<void>;
  sendTransaction: (data: {
    toAddress: string;
    amount: string; // Amount in satoshis
    contractId: string; // BTC || contract_id
  }) => Promise<{ transactionId: string }>;
};

export const [WalletContext, useWalletContext] =
  createSafeContext<TWalletContext>("wallet");
