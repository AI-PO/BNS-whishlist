import { ContractSummary } from "./api.contract.types";

export interface Address {
  address: string;
  chain_stats: ChainStats;
  mempool_stats: MempoolStats;
}

export interface Utxo {
  txid: string;
  vout: number;
  status: Status;
  value: number;
}

export interface CheckUtxos {
  balances: ContractBalance[];
  summaries: ContractSummary[];
}

export interface ContractBalance {
  balance_types: string;
  balance_value: string;
  btc_price: number;
  contract_id: string;
  value: number;
}

export interface ContractBalanceSummary
  extends ContractBalance,
    ContractSummary {
  utxo?: string;
}

export interface Status {
  confirmed: boolean;
  blockHeight: number;
  blockHash: string;
  blockTime: number;
}

export interface ChainStats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}

export interface MempoolStats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}

export type Addresses = Address[];

export type TransactionInfo = {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    prevout: {
      scriptpubkey: string;
      scriptpubkey_asm: string;
      scriptpubkey_type: string;
      scriptpubkey_address: string;
      value: number;
    };
    scriptsig: string;
    scriptsig_asm: string;
    witness: string[];
    is_coinbase: boolean;
    sequence: number;
  }>;
  vout: Array<{
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address?: string;
    value: number;
  }>;
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: boolean;
  };
};
