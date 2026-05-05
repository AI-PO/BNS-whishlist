"use server";

import { cookies } from "next/headers";

import { WalletAccount } from "@/providers/walletContext";

const CONNECTED_ACCOUNT_COOKIE_NAME = "btc_dns_connected_account";

export const setWalletAddressInCookies = async (
  address: WalletAccount | null
) => {
  const cookieStore = await cookies();

  if (!address) {
    cookieStore.delete(CONNECTED_ACCOUNT_COOKIE_NAME);
    return;
  }

  cookieStore.set({
    name: CONNECTED_ACCOUNT_COOKIE_NAME,
    value: JSON.stringify(address),
  });
};

export const getWalletAddressFromCookies = async () => {
  const cookieStore = await cookies();
  const connectedAccount = cookieStore.get(CONNECTED_ACCOUNT_COOKIE_NAME);

  try {
    if (connectedAccount?.value) {
      return JSON.parse(connectedAccount.value) as WalletAccount;
    }
    return null;
  } catch (error) {
    console.error("Failed to parse connected account from cookies", error);
    return null;
  }
};
