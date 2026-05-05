# Endpoints Used in listings.ts and getUserSclTokens.ts

## In `listings.ts`

These endpoints interact with `SCL_NODE_URL`:

- **GET** `${SCL_NODE_URL}/{contractId}/listings`
  - Used in `getContractListings` to fetch finalized listings for a specific contract.
- **GET** `${SCL_NODE_URL}/{contractId}/pending-listings`
  - Used in `getContractPendingListings` to fetch pending listings for a specific contract.
- **GET** `${SCL_NODE_URL}/{contractId}/bids_on_listing/{listingUtxo}`
  - Used in `getListingBids` to fetch finalized bids on a specific listing.
- **GET** `${SCL_NODE_URL}/{contractId}/pending-bids_on_listing/{listingUtxo}`
  - Used in `getListingBids` to fetch pending bids on a specific listing.

## In `getUserSclTokens.ts`

These endpoints interact with both `SCL_NODE_URL` and `BLOCK_EXPLORER_URL`:

- **POST** `${SCL_NODE_URL}/summaries`
  - Used in `getContractSummaries` to fetch summaries for multiple contracts given an array of contract IDs.
- **GET** `${SCL_NODE_URL}/{contractId}/pending-summary`
  - Used in `getContractPendingSummary` to fetch a pending summary for a specific contract.
- **GET** `${BLOCK_EXPLORER_URL}/address/{address}/utxo`
  - Used in `getUserNftTokens` to fetch unspent transaction outputs (UTXOs) for a specific address from the block explorer.
- **POST** `${SCL_NODE_URL}/check_utxos`
  - Used in `getUserNftTokens` to resolve UTXOs into contract balances.