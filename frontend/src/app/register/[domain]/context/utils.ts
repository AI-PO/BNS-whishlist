import validate from "bitcoin-address-validation";
import { useSearchParams } from "next/navigation";

import { useWalletContext } from "@/providers/walletContext";

import { isPaymentCurrency, PaymentCurrency, RegisterDomainCryptoAddress } from "../types";

export const useRegisterContextDefaults = () => {
  const searchParams = useSearchParams();
  const { connectedAccount } = useWalletContext();

  const getInitialClaimYears = () => {
    const claimYearsParam = searchParams.get("claimYears");
    const claimYears = claimYearsParam ? parseInt(claimYearsParam, 10) : 1;
    if (!Number.isInteger(claimYears) || claimYears < 1 || claimYears > 4) {
      return 1; // Default to 1 year if invalid
    }
    return claimYears;
  };
  const getInitialAddress = () => {
    const addressFromParams = searchParams.get("address");
    if (addressFromParams && validate(addressFromParams)) {
      return {
        value: addressFromParams,
        isValid: true,
        source: (addressFromParams === connectedAccount?.address
          ? "wallet"
          : undefined) as RegisterDomainCryptoAddress["source"],
      };
    }
    return {
      value: connectedAccount?.address || "",
      isValid: !!connectedAccount,
      source: (connectedAccount ? "wallet" : undefined) as RegisterDomainCryptoAddress["source"],
    };
  };
  const getInitialCurrency = () => {
    const currencyFromParams = searchParams.get("currency");
    if (isPaymentCurrency(currencyFromParams)) {
      return currencyFromParams as PaymentCurrency;
    }
    return PaymentCurrency.BTC; // Default to BTC if not specified
  };

  return {
    claimYears: getInitialClaimYears(),
    address: getInitialAddress(),
    currency: getInitialCurrency(),
  };
};
