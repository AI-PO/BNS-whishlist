"use server";

import { BLOCK_EXPLORER_URL, SCL_NODE_URL } from "../consts";
import {
  CheckUtxos,
  ContractBalance,
  ContractBalanceSummary,
  Utxo,
} from "../types/api.address.types";
import { ContractSummary } from "../types/api.contract.types";

export const getContractSummaries = async (
  contractIds: string[]
): Promise<ContractSummary[]> => {
  if (!contractIds || contractIds.length === 0) {
    return [];
  }
  
  console.log("[getContractSummaries] Request:", {
    contractIds,
    url: `${SCL_NODE_URL}/summaries`,
    sclNodeUrl: SCL_NODE_URL
  });
  
  try {
    const response = await fetch(`${SCL_NODE_URL}/summaries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contractIds),
      cache: "no-cache",
    });
    
    console.log("[getContractSummaries] Response:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      let errorDetails = "";
      try {
        const errorBody = await response.text();
        console.log("[getContractSummaries] Error body:", errorBody);
        errorDetails = ` | Body: ${errorBody}`;
      } catch {
        console.log("[getContractSummaries] Could not read error body");
      }
      
      throw new Error(
        `Failed to fetch contract summaries: ${response.status} ${response.statusText}${errorDetails}`
      );
    }
    
    // First get the raw response as text to see what we're actually getting
    const responseText = await response.text();
    console.log("[getContractSummaries] Raw response text:", responseText);
    console.log("[getContractSummaries] Response content-type:", response.headers.get("content-type"));
    
    let data: ContractSummary[];
    try {
      data = JSON.parse(responseText) as ContractSummary[];
    } catch (parseError) {
      console.error("[getContractSummaries] JSON parse error:", parseError);
      console.log("[getContractSummaries] Attempting to handle as plain text response");
      // If it's an empty array as plain text, return empty array
      if (responseText.trim() === "[]") {
        data = [];
      } else {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
    }
    
    console.log("[getContractSummaries] Success:", {
      dataLength: data.length,
      firstResult: data[0] ? { contract_id: data[0].contract_id, ticker: data[0].ticker } : null
    });
    
    return data;
  } catch (error) {
    console.error("[getContractSummaries] Error:", error);
    throw error;
  }
};

export const getContractPendingSummary = async (
  contractId: string
): Promise<ContractSummary | null> => {
  if (!contractId) {
    return null;
  }
  const response = await fetch(`${SCL_NODE_URL}/${contractId}/pending-summary`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache",
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch contract summary for ${contractId}: ${response.statusText}`
    );
  }
  const data = (await response.json()) as ContractSummary;
  if (data.contract_id === "") {
    return null; // No summary found for the contract
  }
  return data;
};

export const getUserNftTokens = async (address: string) => {
  const userUtxo = (await (
    await fetch(`${BLOCK_EXPLORER_URL}/address/${address}/utxo`)
  ).json()) as Utxo[];

  const checkUtxoData = (await (
    await fetch(`${SCL_NODE_URL}/check_utxos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contract_ids: [],
        utxos: userUtxo.map((utxo) => `${utxo.txid}:${utxo.vout}`),
      }),
      cache: "no-cache",
    })
  ).json()) as CheckUtxos;

  let contractBalances: ContractBalance[] = [];

  if (checkUtxoData) {
    contractBalances = checkUtxoData.balances.reduce(
      (accumulator: ContractBalance[], contractBalance) => {
        if (contractBalance.contract_id !== "") {
          const existingBalance = accumulator.find(
            (item) => item.contract_id === contractBalance.contract_id
          );
          if (existingBalance) {
            existingBalance.value += Number(contractBalance.balance_value);
          } else {
            accumulator.push({
              ...contractBalance,
              value: Number(contractBalance.balance_value),
            });
          }
        }

        return accumulator;
      },
      []
    );
  }

  const contractSummaries = await getContractSummaries(
    contractBalances?.map((contractId) => contractId.contract_id)
  );

  const contractBalanceSummaries = contractBalances?.map((balance) => {
    const matchingSummary = contractSummaries?.find(
      (summary) => summary.contract_id === balance.contract_id
    );

    if (matchingSummary) {
      const merged: ContractBalanceSummary = {
        ...balance,
        ...matchingSummary,
      };
      return merged;
    }
    return balance as ContractBalanceSummary;
  });

  return contractBalanceSummaries || [];
};
