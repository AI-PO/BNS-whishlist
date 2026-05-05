"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

import {
  createDomainAndPurchaseOrderInSupabase,
  finalizeDomainPurchase,
} from "@/app/actions/domains";
import { revalidateProfile } from "@/app/profile/actions";
import { Spinner } from "@/common/components/bn";
import { Button } from "@/common/components/Button";
import { ConnectWallet } from "@/common/components/ConnectWallet";
import { GOVERNANCE_TOKEN } from "@/config/token";
import {
  NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ID,
  NEXT_PUBLIC_SCL_NODE_URL,
} from "@/env";
import { useFormatBalance } from "@/hooks/useFormatBalance";
import { useGovernanceTokenBalance } from "@/hooks/useGovernanceTokenBalance";
import { callViewFunctionDirect } from "@/lib/contract/nodeQuery";
import { cn } from "@/lib/utils";
import { useOrobitContext } from "@/orobit-sdk/context/context";
import { useAppContext } from "@/providers/appContext";
import { useWalletContext } from "@/providers/walletContext";
import { getStripe } from "@/utils/stripe/client";
import { usePrice } from "@/utils/usePrice";

import { useRegisterContext } from "../context";

export const RegisterButton: React.FC = () => {
  const router = useRouter();
  const { formatPrice, convertSatsToBtc } = usePrice();
  const { formatBalance } = useFormatBalance();

  const { supabaseUser } = useAppContext();
  const { address, domainName, currency, prices, claimYears } =
    useRegisterContext();
  const { sendTransaction, isConnected } = useWalletContext();
  const { mintNFT, callContract } = useOrobitContext();
  const [isLoading, setIsLoading] = useState(false);

  const { balance } = useGovernanceTokenBalance(address.value);

  const handlePayWithStripe = async () => {
    // TODO: adjust it to not google integration
    try {
      const stripe = await getStripe();
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address.value,
          email: supabaseUser!.email,
          claimYears,
          items: [
            {
              name: domainName,
              price: prices.total,
              quantity: 1,
            },
          ],
        }),
      });
      const { sessionId } = await response.json();
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to process payment");
      } else {
        throw new Error("Failed to process payment");
      }
    }
  };

  const handlePayWithBtc = async () => {
    try {
      const res = await sendTransaction({
        amount: convertSatsToBtc(prices.total).toString(),
        contractId: "BTC",
        toAddress: address.value, // TODO: reaplce with actual address
      });
      console.log("Transaction sent:", res);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to pay with BTC");
      } else {
        throw new Error("Failed to pay with BTC");
      }
    }
  };

  const registerDomain = async () => {
    if (!address.isValid) {
      throw new Error("Please connect your wallet to mint the domain NFT.");
    }
    try {
      // const { response } = await callViewFunctionDirect({
      //   nodeUrl: NEXT_PUBLIC_SCL_NODE_URL!,
      //   network: NETWORK,
      //   contractId: env.NEXT_PUBLIC_DELEGATE_STAKING_CONTRACT_ID,
      //   functionName: "get_withdraw_unlock_height",
      //   callerPubkey: CALLER_PUBKEY,
      //   args: [{ type: "str", value: user }],
      // });
      // const res2 = await callViewFunctionDirect({
      //   nodeUrl: process.env.NEXT_PUBLIC_SCL_NODE_URL,
      //   contractId: process.env.NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ID,
      //   network: process.env.NEXT_PUBLIC_NETWORK,
      //   callerPubkey:
      //     "020000000000000000000000000000000000000000000000000000000000000000",
      //   functionName: "get_all_tokens",
      //   args: [],
      // });
      // console.log("Existing domain NFTs:", res2);
      const res = await callContract({
        nodeUrl: NEXT_PUBLIC_SCL_NODE_URL,
        contractId: NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ID,
        functionName: "buy_domain",
        argsJson: JSON.stringify([
          { type: "str", value: domainName },
          { type: "int", value: claimYears },
        ]),
        isView: false,
      });
      console.log(res);
      return res.data?.result.txid;
    } catch (error) {
      console.log("Error registering domain:", error);
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to register domain");
      } else {
        throw new Error("Failed to register domain");
      }
    }
  };

  const mintDomainNFT = async () => {
    if (!address.isValid) {
      throw new Error("Please connect your wallet to mint the domain NFT.");
    }

    try {
      const { error, data } = await mintNFT({
        nftData: {
          image: "",
          name: domainName,
          attributes: [],
          description: `Domain NFT for ${domainName}`,
        },
      });
      if (error) throw error;
      if (!data?.contractId) {
        throw new Error("Failed to mint domain NFT: contract ID is missing.");
      }
      return data.contractId;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message || "Failed to mint domain NFT");
      } else {
        throw new Error("Failed to mint domain NFT");
      }
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);

    if (!address.isValid) {
      toast.error("Please enter a valid Bitcoin address.");
      setIsLoading(false);
      return;
    }

    try {
      // if (currency === "USD") {
      //   // stripe redirects automatically to registration success page
      //   return await handlePayWithStripe();
      // }

      if (currency === "BTC") {
        // await handlePayWithBtc();

        // TODO: register only if payment is confirmed on blockchain
        // It should be done in the backend listener
        const txId = await registerDomain();
        console.log("Domain registration transaction ID:", txId);
        if (txId) {
          // fire-and-forget server action: finalize once tx is confirmed
          try {
            // pass claimYears so expiry can be computed server-side
            console.log("Finalizing domain purchase with:", {
              txId,
              domain: domainName,
              btcAddress: address.value,
              claimYears,
              contractId: NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ID,
            });
            await finalizeDomainPurchase({
              txId,
              domain: domainName,
              btcAddress: address.value,
              claimYears,
              contractId: NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ID,
            });
            console.log("Domain purchase finalized for tx:", txId);
          } catch (err) {
            console.warn("finalizeDomainPurchase failed:", err);
          }

          toast("Processing your domain registration.");
          router.push(`/register/${domainName}/success`);
        }
        return;
      }
      throw new Error("Please connect your wallet to register a domain.");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to register domain");
      } else {
        toast.error("Failed to register domain");
      }
    }

    setIsLoading(false);
  };

  const domainCost = prices.domain * claimYears;
  const hasEnoughBalance = balance >= domainCost;

  const ctaButtonText =
    hasEnoughBalance || !isConnected
      ? `Buy a domain for ${formatBalance(
          domainCost,
          GOVERNANCE_TOKEN.decimals,
          GOVERNANCE_TOKEN.symbol,
        )}`
      : "Insufficient balance";

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleRegister}
        variant="cta"
        className={cn("w-full", {
          "opacity-50 cursor-normal":
            !address.isValid || !isConnected || isLoading,
        })}
        size="M"
        disabled={!address.isValid || isLoading || !isConnected}
      >
        {isLoading ? (
          <div className="w-fit m-auto">
            <Spinner size={30} color="#2D2B37" />
          </div>
        ) : (
          ctaButtonText
        )}
      </Button>
      {isConnected && address.isValid && !hasEnoughBalance && (
        <div className="text-sm text-bn-accent">
          Your balance is:{" "}
          {formatBalance(
            balance,
            GOVERNANCE_TOKEN.decimals,
            GOVERNANCE_TOKEN.symbol,
          )}.
        </div>
      )}
    </div>
  );
};
