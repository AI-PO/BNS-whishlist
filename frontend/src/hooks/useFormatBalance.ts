import { GOVERNANCE_TOKEN } from "@/config/token";
import { usePrice } from "@/utils/usePrice";

/**
 * Hook for formatting XRB token balances
 * Uses the same formatting logic as BTC with configurable decimals
 */
export const useFormatBalance = () => {
  const { formatPrice } = usePrice();

  /**
   * Format XRB balance with proper decimal places
   * @param balance - Raw balance value
   * @param precision - Optional decimal precision (defaults to token decimals)
   * @returns Formatted balance string (e.g., "1.23456789 XRB")
   */
  const formatBalance = (
    balance: number,
    precision?: number,
    currency = GOVERNANCE_TOKEN.symbol,
  ): string => {
    const formatted = formatPrice(
      balance,
      precision ?? GOVERNANCE_TOKEN.decimals,
      "BTC",
    );

    // Replace "BTC" with actual token symbol
    return formatted.replace(" BTC", ` ${currency}`);
  };

  return { formatBalance };
};
