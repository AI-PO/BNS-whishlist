import Big from "big.js";

import { useCurrencyApi } from "@/api/exchangeApi/api";

import { convertBtcToSats, convertSatsToBtc } from "./formatters";

export const usePrice = (
  currencyApiConfig?: Parameters<typeof useCurrencyApi>[0],
) => {
  const { data } = useCurrencyApi(currencyApiConfig);
  const currency = "BTC";

  const formatPrice = (
    value: number,
    decimalPrecision?: number,
    format?: "BTC" | "USD",
    options: { shorten?: boolean } = { shorten: format === "USD" },
  ) => {
    const crypto = (format || currency) === "BTC";
    value = crypto
      ? Big(value)
          .div(Big(10 ** (decimalPrecision ?? 8)))
          .toNumber()
      : value;

    if ((value || data) === undefined) {
      return "Syncing...";
    }

    const formattingOptions: Intl.NumberFormatOptions = {
      style: !crypto ? "currency" : undefined,
      currency: !crypto ? "USD" : undefined,
    };

    if (!crypto && options?.shorten && value >= 1000) {
      formattingOptions.notation = "compact";
      formattingOptions.compactDisplay = "short";
      formattingOptions.maximumFractionDigits = 1;
    } else {
      formattingOptions.maximumFractionDigits = !crypto
        ? (decimalPrecision || 2) >= 2
          ? value < 0.01
            ? 5
            : 2
          : decimalPrecision
        : decimalPrecision || 8;
    }

    return (
      (value.toLocaleString("en-US", formattingOptions) || "0") +
      (crypto ? " BTC" : "")
    );
  };

  const convertSatsToUsd = (value: number) => {
    const priceValue = Big(data || 0)
      .mul(Big(value || 0))
      .div(Big(10 ** 8));
    return priceValue.toNumber();
  };
  return { formatPrice, convertSatsToUsd, convertBtcToSats, convertSatsToBtc };
};
