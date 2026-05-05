import { TCryptoAddress } from "@/common/types/business";

export type RegisterDomainCryptoAddress = TCryptoAddress & {
  source?: "wallet" | "manual";
};
export enum PaymentCurrency {
  BTC = "BTC",
  USD = "USD",
}
export const isPaymentCurrency = (
  value?: string | null
): value is PaymentCurrency => {
  return Object.values(PaymentCurrency).includes(value as PaymentCurrency);
};
