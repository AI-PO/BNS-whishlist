import { getTxInfo } from "@/api/exchangeApi/actions/blockExplorer";
import { getContractPendingSummary } from "@/api/exchangeApi/actions/getUserSclTokens";
import { getContractPendingBids } from "@/api/exchangeApi/actions/listings";
import { NEXT_PUBLIC_USE_MOCK_API } from "@/env";

export const waitForTxBeingPending = async (
  txType:
    | "send-tx"
    | "place-listing"
    | "end-listing"
    | "place-bid"
    | "cancel-bid"
    | "accept-bid",
  contractId: string,
  txId?: string
) => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    // Quickly resolve dummy delay for mocks so UI feels natural
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
  }

  const maxRetries = 10; // Maximum number of retries
  const retryInterval = 2000; // Retry every 2 seconds
  let attempts = 0;

  while (attempts < maxRetries) {
    if (txType === "send-tx") {
      try {
        const res = await getTxInfo(txId!);
        console.log("Transaction info:", res);
        if (res) return;
      } catch (error) {
        console.error("Error fetching transaction info:", error);
      }
    } else if (txType === "place-listing") {
      const contract = await getContractPendingSummary(contractId);
      if (contract?.current_listings === 1) {
        return;
      }
    } else if (txType === "end-listing" || txType === "accept-bid") {
      // wait for listing to be ended
      const contract = await getContractPendingSummary(contractId);
      if (contract?.current_listings === 0) {
        return;
      }
    } else if (txType === "place-bid" && txId) {
      const contractBids = await getContractPendingBids(contractId);
      const bid = contractBids?.find(
        (bid) => bid.reseved_utxo.split(":")[0] === txId
      );
      if (bid) return;
    } else if (txType === "cancel-bid" && txId) {
      const contractBids = await getContractPendingBids(contractId);
      const bid = contractBids?.find(
        (bid) => bid.reseved_utxo.split(":")[0] === txId
      );
      if (!bid) return; // If the bid is not found, it means it was cancelled
    }
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }
  return;
};
