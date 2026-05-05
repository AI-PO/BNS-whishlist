import Big from "big.js";

/**
 * Convert BTC amount to Satoshis
 * @param value - BTC amount
 * @returns Amount in Satoshis
 */
export const convertBtcToSats = (value: number | string): number => {
  if (typeof value === "string") {
    value = parseFloat(value);
  }
  if (isNaN(value)) {
    return 0;
  }

  return Big(value || 0)
    .mul(Big(10 ** 8))
    .toNumber();
};

/**
 * Convert Satoshis to BTC amount
 * @param value - Amount in Satoshis
 * @returns BTC amount
 */
export const convertSatsToBtc = (value: number): number => {
  return Big(value || 0)
    .div(Big(10 ** 8))
    .toNumber();
};

/**
 * Format a price with currency formatting
 * @param price - Price to format
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @param decimalPrecision - Number of decimal places (default: 2)
 * @param shorten - Whether to use compact notation for large numbers
 * @returns Formatted price string
 */
export const formatPrice = (
  price: number,
  currency: string = "USD",
  decimalPrecision: number = 2,
  shorten: boolean = true
): string => {
  if (price === undefined || price === null) {
    return "N/A";
  }

  const formattingOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: currency,
  };

  if (shorten && price >= 1000) {
    formattingOptions.notation = "compact";
    formattingOptions.compactDisplay = "short";
    formattingOptions.maximumFractionDigits = 1;
  } else {
    formattingOptions.maximumFractionDigits =
      decimalPrecision >= 2 ? (price < 0.01 ? 5 : 2) : decimalPrecision;
  }

  return price.toLocaleString("en-US", formattingOptions) || "0";
};

/**
 * Format a token amount with specified decimal places
 * @param amount - Token amount
 * @param decimals - Number of decimal places (default: 18 for most ERC20 tokens)
 * @param displayDecimals - Number of decimal places to display (default: 4)
 * @returns Formatted token amount string
 */
export const formatTokenAmount = (
  amount: number | string,
  decimals: number = 18,
  displayDecimals: number = 4
): string => {
  if (amount === undefined || amount === null) {
    return "0";
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return "0";
  }

  const divisor = Big(10).pow(decimals);
  const formattedAmount = Big(numAmount).div(divisor);

  return formattedAmount.toFixed(displayDecimals);
};

/**
 * Format a cryptocurrency amount (BTC, ETH, etc.)
 * @param value - Amount in smallest unit (e.g., satoshis for BTC, wei for ETH)
 * @param decimals - Number of decimal places in the token (8 for BTC, 18 for ETH)
 * @param symbol - Token symbol to append (e.g., 'BTC', 'ETH')
 * @param displayDecimals - Number of decimal places to display
 * @returns Formatted crypto amount with symbol
 */
export const formatCryptoAmount = (
  value: number,
  decimals: number = 8,
  symbol: string = "BTC",
  displayDecimals?: number
): string => {
  const actualDisplayDecimals = displayDecimals ?? decimals;
  const formattedValue = Big(value || 0)
    .div(Big(10 ** decimals))
    .toFixed(actualDisplayDecimals);

  return `${formattedValue} ${symbol}`;
};
