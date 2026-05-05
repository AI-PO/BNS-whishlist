export interface ContractHeader {
  contract_id: string;
  ticker: string;
  rest_url: string;
  contract_type: string;
  decimals: number;
}

export interface ContractSummary extends ContractHeader {
  average_listing_price: number;
  average_traded_price: number;
  contract_id: string;
  contract_interactions: number;
  contract_type: string;
  current_bids: number;
  current_listings: number;
  decimals: number;
  rest_url: string;
  supply: number;
  max_supply: number;
  ticker: string;
  total_burns: number;
  total_listed: number;
  total_owners: number;
  total_traded: number;
  total_transfers: number;
  airdrop_amount?: number;
  available_airdrops?: number;
  rank?: number;
}

export interface ContractListSummary extends ContractHeader {
  listing_summaries: ListSummary[];
}

export type ContractListSummaries = ContractListSummary[];

export interface ListSummary {
  bid_count: number;
  highest_bid: number;
  list_price: number;
  quantity: number;
  listing_utxo: string;
  pending_listing?: boolean;
}
