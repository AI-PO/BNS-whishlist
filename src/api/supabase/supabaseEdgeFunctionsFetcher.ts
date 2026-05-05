import { OrderType } from "@/common/types/business";
import { NEXT_PUBLIC_SUPABASE_URL } from "@/env";

type EdgeFunctionData =
  | {
      functionName: "add-order";
      body:
        | {
            type: OrderType.PURCHASE;
            address: string;
            domain: {
              domain: string;
              contract_id: string;
              expiry: string;
            };
          }
        | {
            type: OrderType.TRANSFER | OrderType.SALE;
            address: string;
            receiver: string;
            transaction_id: string;
            domain: {
              id: number;
            };
          };
    }
  | {
      functionName: "edit-order";
      body: {
        order_id: number;
      };
    }
  | {
      functionName: "add-listing";
      body: {
        contract_id: string;
        best_bid?: number;
        bid_count?: number;
      };
    }
  | {
      functionName: "add-bid";
      body: {
        contract_id: string;
        list_utxo: string;
        bid_utxo: string;
        owner: string;
        price?: number;
      };
    };

export const supabaseEdgeFunctionFetcher = async <T = void>(
  fetchData: EdgeFunctionData,
  retryCount = 0
): Promise<T> => {
  const response = await fetch(
    `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${fetchData.functionName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(fetchData.body),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    const detailedError = errorData.error || response.statusText;
    if (retryCount < 3) {
      console.warn(`Retrying ${fetchData.functionName} (${retryCount + 1}/3)`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return supabaseEdgeFunctionFetcher(fetchData, retryCount + 1);
    }
    throw new Error(`Failed to call edge function: ${detailedError}`);
  }
  const data = await response.json();
  return data;
};
