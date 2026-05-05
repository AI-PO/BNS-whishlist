import { useEffect, useState } from "react";

import {
  NEXT_PUBLIC_NETWORK,
  NEXT_PUBLIC_SCL_NODE_URL,
  NEXT_PUBLIC_TOKEN_FAUCET_CONTRACT_ID,
} from "@/env";
import { callViewFunctionDirect } from "@/lib/contract/nodeQuery";
import { extractSclResponse } from "@/lib/contract/sclResponseParser";

export const useGovernanceTokenBalance = (address?: string) => {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const res = await callViewFunctionDirect(
          {
            nodeUrl: NEXT_PUBLIC_SCL_NODE_URL,
            network: NEXT_PUBLIC_NETWORK,
            contractId: NEXT_PUBLIC_TOKEN_FAUCET_CONTRACT_ID,
            functionName: "get_all_balances",
            callerPubkey:
              "020000000000000000000000000000000000000000000000000000000000000000",
            args: [],
          },
          true,
        );
        console.log("Balances:", res.response?.result);
        return extractSclResponse<{ key: string; value: number }[]>(
          res.response?.result,
        );
      } catch (err) {
        console.error("[Client] Error fetching balances:", err);
      }
    };

    (async () => {
      setIsLoading(true);

      const balances = await fetchBalances();
      const userBalance = balances?.find((b) => b.key === address)?.value || 0;
      console.log("User balance:", userBalance, balances, address);
      setBalance(userBalance);
      setIsLoading(false);
    })();
  }, [address]);

  return { balance: balance, isLoading };
};
