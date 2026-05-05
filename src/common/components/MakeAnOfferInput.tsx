"use client";

import React, { useEffect, useRef, useState } from "react";

import { ShadowContainer } from "@/common/components/ShadowContainer";
import { cn } from "@/lib/utils";
import { useWalletContext } from "@/providers/walletContext";
import { usePrice } from "@/utils/usePrice";

interface MakeAnOfferInputProps {
  error: string | null;
  offerPrice: string;
  onOfferPriceChange: (value: string) => void;
  setError: (error: string | null) => void;
  walletBalance: number;
  disabled?: boolean;
}

export const MakeAnOfferInput: React.FC<MakeAnOfferInputProps> = ({
  error,
  offerPrice,
  onOfferPriceChange,
  setError,
  walletBalance,
  disabled = false,
}) => {
  const { connectedAccount } = useWalletContext();
  const { convertBtcToSats, convertSatsToUsd, formatPrice } = usePrice();

  const spanRef = useRef<HTMLSpanElement | null>(null);
  const [inputWidth, setInputWidth] = useState(50); // default width
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (spanRef.current) {
      const width = spanRef.current.offsetWidth;
      setInputWidth(width + 10); // add some padding for cursor
    }
  }, [offerPrice]);

  const handleInputFocus = () => {
    setIsFocused(true);
    // Prevent zoom on iOS and small screens
    if (window.innerWidth < 768) {
      const viewport = document.querySelector("meta[name=viewport]");
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        );
      }
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Restore zoom capability
    if (window.innerWidth < 768) {
      const viewport = document.querySelector("meta[name=viewport]");
      if (viewport) {
        viewport.setAttribute("content", "width=device-width, initial-scale=1");
      }
    }
  };

  const handleOfferPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      setError(null);
      onOfferPriceChange(value);
      return;
    }

    // Allow only numbers and at most one decimal point
    if (!/^\d*\.?\d*$/.test(value)) return;

    if (parseFloat(value) > 1000) {
      setError("Maximum offer value is 1000 BTC");
      return;
    }
    if (value.includes(".")) {
      const decimals = value.split(".")[1];
      if (decimals && decimals.length > 8) {
        setError("Maximum 8 decimal places allowed");
        return;
      }
    }

    onOfferPriceChange(value);

    const satsPrice = convertBtcToSats(value);
    if (!!connectedAccount && satsPrice > walletBalance) {
      setError("Insufficient balance");
    } else {
      setError(null);
    }
  };

  return (
    <ShadowContainer
      className={cn("flex-1 mt-3 transition-all duration-300", {
        "!border-red-500 ring-2 ring-red-500/20": error !== null,
      })}
    >
      <div
        className={cn(
          "w-full flex items-center justify-between transition-all duration-300 flex items-center bg-white focus-within:ring-4 focus-within:ring-[#f7931a]/20 p-4 rounded-[14px]",
          {
            "ring-4 ring-[#f7931a]/10 shadow-inner": offerPrice.length > 0,
          }
        )}
      >
        <div className="flex items-center gap-x-1">
          <span
            ref={spanRef}
            className="invisible absolute whitespace-pre font-bold text-lg"
            style={{ fontFamily: "inherit" }}
          >
            {offerPrice || "0.00 BTC"}
          </span>
          <input
            type="text"
            inputMode="decimal"
            pattern="^\d*\.?\d*$"
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={cn(
              "w-min field-sizing-content bg-transparent text-black font-bold placeholder:font-medium placeholder-neutral-400 focus:outline-none transition-colors",
              "text-lg sm:text-xl"
            )}
            style={{ width: inputWidth }}
            placeholder="0.00 BTC"
            value={offerPrice}
            onChange={handleOfferPriceChange}
            disabled={disabled}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {offerPrice.length > 0 && (
            <p className="text-16 font-bold text-black">BTC</p>
          )}
        </div>
        <span className="text-sm font-medium text-neutral-500">
          {formatPrice(
            convertSatsToUsd(convertBtcToSats(offerPrice)),
            8,
            "USD"
          )}
        </span>
      </div>
    </ShadowContainer>
  );
};
