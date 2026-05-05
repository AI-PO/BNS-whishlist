export interface Bid {
  accept_tx: string;
  bid_amount: number;
  bid_price: number;
  fulfill_tx: string;
  fullfilment_utxos: string[];
  order_id: string;
  reseved_utxo: string;
  is_pending: boolean;
  is_cancelled: boolean;
}

export interface BidString {
  accept_tx: string;
  bid_amount: string;
  bid_price: string;
  fulfill_tx: string;
  fullfilment_utxos: string[];
  order_id: string;
  reseved_utxo: string;
}

export interface Listing {
  contract_id: string;
  ticker: string;
  is_pending: boolean;
  listings: [
    string,
    {
      change_utxo: string;
      list_amt: number;
      list_utxo: string;
      price: number;
      rec_addr: string;
      valid_bid_block: string | null;
    },
  ][];
}

export type BidSummary = {
  txid: string;
  version: number;
  locktime: number;
  vin: {
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
  }[];
  vout: {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address?: string;
    value: number;
  }[];
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
};
