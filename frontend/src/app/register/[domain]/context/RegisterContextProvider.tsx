"use client";

import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { useSearchParamsMapping } from "@/hooks/useSearchParamsMapping";
import { useWalletContext } from "@/providers/walletContext";
import { getTransactionFee } from "@/utils/mempool/getFeesRecommended";
import { usePrice } from "@/utils/usePrice";

import { RegisterContext, RegisterDomainPrices } from ".";
import { PaymentCurrency, RegisterDomainCryptoAddress } from "../types";
import { useRegisterContextDefaults } from "./utils";

const PRICE_REFETCH_INTERVAL = 1000 * 30; // 30 seconds

type Props = PropsWithChildren<{
  domainName: string;
}>;

export const RegisterContextProvider: React.FC<Props> = ({
  domainName,
  children,
}) => {
  const { connectedAccount } = useWalletContext();
  const defaults = useRegisterContextDefaults();

  const [claimYears, setClaimYears] = useState(defaults.claimYears); // Default to 1 year if not specified in search params
  const [address, setAddress] = useState<RegisterDomainCryptoAddress>(defaults.address);
  // const [currency, setCurrency] = useState<PaymentCurrency>(defaults.currency);
  const [currency, setCurrency] = useState<PaymentCurrency>(
    PaymentCurrency.BTC
  );
  const [prices, setPrices] = useState<Omit<RegisterDomainPrices, "total">>({
    domain: 10 * 10**6, // TODO: adjust it to the actual domain price based on prices guidelines,
    registrationFee: 200, // TODO: how to calculate it?
    gasFee: undefined,
  });

  const { convertSatsToUsd } = usePrice({
    refetchInterval:
      currency === PaymentCurrency.USD ? PRICE_REFETCH_INTERVAL : undefined,
  });
  const currencyConvertedPrices = useMemo<typeof prices>(() => {
    if (currency === PaymentCurrency.BTC) return prices;
    return {
      domain: convertSatsToUsd(prices.domain),
      registrationFee: convertSatsToUsd(prices.registrationFee),
      gasFee: prices.gasFee ? convertSatsToUsd(prices.gasFee) : undefined,
    };
  }, [currency, prices, convertSatsToUsd]);

  useSearchParamsMapping({
    claimYears,
    currency,
    address: address.value,
  });

  useEffect(() => {
    // listen to transaction fee changes
    const fetchTransactionFee = async () => {
      try {
        const feeInSats = await getTransactionFee(); // Assuming this returns satoshis
        setPrices((prev) => ({
          ...prev,
          gasFee: feeInSats,
        }));
      } catch (error) {
        console.error("Failed to fetch transaction fee:", error);
        toast("Could not load transaction fee.");
      }
    };

    const interval = setInterval(async () => {
      fetchTransactionFee();
    }, PRICE_REFETCH_INTERVAL);

    fetchTransactionFee();

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // listen to connected account changes
    if (connectedAccount) {
      setAddress({
        value: connectedAccount.address,
        isValid: true,
        source: "wallet",
      });
    } else if (address.source === "wallet") {
      setAddress({
        value: "",
        isValid: false,
        source: undefined,
      });
    }
  }, [connectedAccount]);

  const value = useMemo(
    () => ({
      domainName,
      claimYears,
      setClaimYears,
      address,
      setAddress,
      currency,
      setCurrency,
      prices: {
        ...currencyConvertedPrices,
        total:
          currencyConvertedPrices.domain * claimYears +
          (currencyConvertedPrices.gasFee || 0) +
          currencyConvertedPrices.registrationFee,
      },
    }),
    [domainName, claimYears, address, currency, currencyConvertedPrices]
  );

  return (
    <RegisterContext.Provider value={value}>
      {children}
    </RegisterContext.Provider>
  );
};
