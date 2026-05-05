"use client";

import {
  CheckIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import validate from "bitcoin-address-validation";
import Image from "next/image";
import { useState } from "react";

import { AnimatedContainer } from "@/common/components/AnimatedContainer";
import { Button } from "@/common/components/Button";
import { ConnectWallet } from "@/common/components/ConnectWallet";
import { ShadowContainer } from "@/common/components/ShadowContainer";
import { Subsection } from "@/common/components/Subsection";
import { TruncatedText } from "@/common/components/TruncatedText";
import { GOVERNANCE_TOKEN } from "@/config/token";
import { useFormatBalance } from "@/hooks/useFormatBalance";
import { cn } from "@/lib/utils";
import { useWalletContext } from "@/providers/walletContext";
import { usePrice } from "@/utils/usePrice";

import { useRegisterContext } from "../context";
import { PaymentCurrency } from "../types";

export const RegisterDetailsSection: React.FC = () => {
  const { formatBalance } = useFormatBalance();

  const { claimYears, setClaimYears, prices } = useRegisterContext();

  return (
    <div className="flex flex-col gap-y-[30px]">
      <Subsection label="Claim for">
        <div className="grid grid-cols-2 items-center gap-x-[18px]">
          <NumberSelector initialValue={claimYears} onChange={setClaimYears} />
          <div>
            <p className="text-xl font-bold mb-1.5 text-black">
              {formatBalance(
                prices.domain * claimYears,
                GOVERNANCE_TOKEN.decimals,
                GOVERNANCE_TOKEN.symbol,
              )}
            </p>
            <p className="ml-1 text-sm text-neutral-500 font-medium">
              {formatBalance(
                prices.domain,
                GOVERNANCE_TOKEN.decimals,
                GOVERNANCE_TOKEN.symbol,
              )}
              /year
            </p>
          </div>
        </div>
      </Subsection>
      <WalletAddressSubsection />
      {/* <PaymentCurrencySubsection /> */}
    </div>
  );
};

const WalletAddressSubsection: React.FC = () => {
  const { isConnected } = useWalletContext();

  return isConnected ? (
    <WalletConnectedAddressSubsection />
  ) : (
    <WalletNotConnectedAddressSubsection />
  );
};
const WalletConnectedAddressSubsection: React.FC = () => {
  const { connectedAccount, disconnect } = useWalletContext();

  if (!connectedAccount) return;

  return (
    <Subsection label="Wallet address">
      <ShadowContainer className="w-full overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-5 transition-colors bg-white hover:bg-neutral-50 rounded-2xl"
          onClick={disconnect}
        >
          <div className="flex items-center gap-x-2 text-black font-bold">
            <Image
              src={"/wallet.svg"}
              alt={"wallet"}
              width={24}
              height={24}
              className="opacity-80 mix-blend-difference"
            />
            <TruncatedText
              name={connectedAccount.address || ""}
              charsAtStart={4}
              charsAtEnd={4}
              truncateLengthThreshold={11}
              fullScreen
              tooltip
              serverSide
            />
          </div>
          <Image
            src={"/link.svg"}
            alt={"link"}
            width={20}
            height={20}
            className="opacity-80 mix-blend-difference"
          />
        </button>
      </ShadowContainer>
    </Subsection>
  );
};
const WalletNotConnectedAddressSubsection: React.FC = () => {
  const { address, setAddress } = useRegisterContext();

  // Block all keyboard input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow Cmd+V (Mac) or Ctrl+V (Win) for paste
    const isPaste = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v";
    const isDelete = e.key === "Backspace" || e.key === "Delete";

    if (isDelete) {
      setAddress({ value: "", isValid: false, source: undefined });
      e.preventDefault();
    } else if (!isPaste) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    const isValid = validate(pasted);
    setAddress({ value: pasted, isValid, source: "manual" });

    e.preventDefault();
  };

  const displayInvalidAddressErrorMessage = !!address.value && !address.isValid;

  return (
    <Subsection label="Wallet address for your domain">
      <AnimatedContainer className="gap-2 flex flex-col">
        <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full">
          <ShadowContainer
            className={cn("w-full overflow-hidden flex-1", {
              "border-red-500 ring-2 ring-red-500/20":
                displayInvalidAddressErrorMessage,
            })}
          >
            <div className="w-full flex items-center justify-between bg-white focus-within:ring-4 focus-within:ring-[#f7931a]/20 px-4 py-5 transition-all duration-300 rounded-[14px]">
              <input
                type="text"
                className="w-full bg-transparent text-black text-lg font-bold leading-5 placeholder:font-medium placeholder-neutral-400 outline-none"
                placeholder="Connect wallet or paste address here"
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                value={address.value}
                onChange={() => {}}
              />
              {!address.value ? null : address.isValid ? (
                <CheckIcon className="text-green-500 w-5 h-5" />
              ) : (
                <XIcon className="text-red-500 w-5 h-5" />
              )}
            </div>
          </ShadowContainer>
          <ConnectWallet
            triggerProps={{
              className: cn("w-full sm:w-fit button-size-m", {
                "button-primary": !address.isValid,
                "button-secondary": address.isValid,
              }),
            }}
          />
        </div>
        {displayInvalidAddressErrorMessage && (
          <p className="text-sm font-bold text-red-500 mt-1">
            This adress is invalid. Please provide valid BTC wallet address.
          </p>
        )}
      </AnimatedContainer>
    </Subsection>
  );
};

const PaymentCurrencySubsection: React.FC = () => {
  const { currency, setCurrency } = useRegisterContext();

  const handleChange = (selectedCurrency: PaymentCurrency) => {
    setCurrency(selectedCurrency);
  };

  return (
    <Subsection label="Payment currency">
      <div className="grid grid-cols-2 gap-x-[18px]">
        <Button
          variant={currency === PaymentCurrency.BTC ? "primary" : "secondary"}
          className="w-full"
          size={"M"}
          onClick={() => handleChange(PaymentCurrency.BTC)}
        >
          BTC
        </Button>
        <Button
          variant={currency === PaymentCurrency.USD ? "primary" : "secondary"}
          className="w-full"
          size={"M"}
          onClick={() => handleChange(PaymentCurrency.USD)}
        >
          USD
        </Button>
      </div>
    </Subsection>
  );
};

const NumberSelector: React.FC<{
  initialValue: number;
  onChange: (v: number) => void;
}> = ({ initialValue, onChange }) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (op: "+" | "-") => {
    if (op === "+") {
      setValue((prev) => prev + 1);
      onChange(value + 1);
    } else {
      setValue((prev) => prev - 1);
      onChange(value - 1);
    }
  };

  return (
    <ShadowContainer>
      <div className="py-5 px-4 flex items-center justify-between">
        <button
          disabled={value === 1}
          onClick={() => handleChange("-")}
          className="text-neutral-500 disabled:text-neutral-300"
        >
          <MinusCircleIcon />
        </button>
        <p className="text-20 font-semibold">{`${value} ${value === 1 ? "year" : "years"}`}</p>
        <button
          disabled={value === 4}
          className="text-neutral-500 disabled:text-neutral-300"
          onClick={() => handleChange("+")}
        >
          <PlusCircleIcon />
        </button>
      </div>
    </ShadowContainer>
  );
};
