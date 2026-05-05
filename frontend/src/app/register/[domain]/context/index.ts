import { SetState } from "@/common/types/generic";
import { createSafeContext } from "@/utils/createSafeContext";

import { PaymentCurrency, RegisterDomainCryptoAddress } from "../types";

export type RegisterDomainPrices = {
  domain: number;
  registrationFee: number;
  gasFee?: number;
  total: number;
};

export type TRegisterContext = {
  domainName: string;
  claimYears: number;
  setClaimYears: SetState<number>;
  address: RegisterDomainCryptoAddress;
  setAddress: SetState<RegisterDomainCryptoAddress>;
  currency: PaymentCurrency;
  setCurrency: SetState<PaymentCurrency>;
  prices: RegisterDomainPrices;
};

export const [RegisterContext, useRegisterContext] =
  createSafeContext<TRegisterContext>("RegisterContext");
