import { GOVERNANCE_TOKEN } from "@/config/token";
import { useFormatBalance } from "@/hooks/useFormatBalance";
import { usePrice } from "@/utils/usePrice";

import { useRegisterContext } from "../context";

export const RegisterOrderSummarySection = () => {
  const { formatPrice } = usePrice();
  const { formatBalance } = useFormatBalance();

  const { claimYears, prices, currency } = useRegisterContext();
  const claimYearsText = claimYears === 1 ? "year" : "years";

  return (
    <div className="xl:h-[240px] xl:w-[380px] flex flex-col gap-y-6 xl:gap-y-0 xl:justify-between">
      <div className="flex flex-col gap-y-[30px]">
        <div className="flex items-center justify-between">
          <p className="text-base text-neutral-600 font-medium">
            Rent/{claimYears} {claimYearsText}
          </p>
          <p className="text-base font-bold text-black">
            {formatBalance(
              prices.domain * claimYears,
              GOVERNANCE_TOKEN.decimals,
              GOVERNANCE_TOKEN.symbol,
            )}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base text-neutral-600 font-medium">
            Registration fee
          </p>
          <p className="text-base font-bold text-black">
            {formatPrice(prices.registrationFee, 8, currency)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-base text-neutral-600 font-medium">
            Transaction fee
          </p>
          {prices.gasFee ? (
            <p className="text-base font-bold text-black">
              ~{formatPrice(prices.gasFee, 8, currency)}
            </p>
          ) : (
            <div className="w-[120px] h-6 bg-neutral-200 rounded-full animate-pulse" />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 xl:mt-0 pt-4 border-t border-neutral-200">
        <p className="text-lg font-bold text-neutral-900">Total</p>
        <p className="text-2xl font-black text-[#f7931a]">
          {formatBalance(
            prices.domain * claimYears,
            GOVERNANCE_TOKEN.decimals,
            GOVERNANCE_TOKEN.symbol,
          )}
        </p>
      </div>
    </div>
  );
};
