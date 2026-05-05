export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

export enum OrobitRequestType {
  CONNECT = "CONNECT",
  DISCONNECT = "DISCONNECT",
  IS_CONNECTED = "IS_CONNECTED",
  SEND_TRANSACTION = "SEND_TRANSACTION",
  MINT_NFT = "MINT_NFT",
  PLACE_LISTING = "PLACE_LISTING",
  PLACE_BID = "PLACE_BID",
  CANCEL_LISTING = "CANCEL_LISTING",
  CANCEL_BID = "CANCEL_BID",
  ACCEPT_BID = "ACCEPT_BID",
  CALL_CONTRACT = "CALL_CONTRACT",
}
export enum OrobitResponseType {
  CONNECT_RESPONSE = "CONNECT_RESPONSE",
  DISCONNECT_RESPONSE = "DISCONNECT_RESPONSE",
  IS_CONNECTED_RESPONSE = "IS_CONNECTED_RESPONSE",
  SEND_TRANSACTION_RESPONSE = "SEND_TRANSACTION_RESPONSE",
  MINT_NFT_RESPONSE = "MINT_NFT_RESPONSE",
  PLACE_LISTING_RESPONSE = "PLACE_LISTING_RESPONSE",
  PLACE_BID_RESPONSE = "PLACE_BID_RESPONSE",
  CANCEL_LISTING_RESPONSE = "CANCEL_LISTING_RESPONSE",
  CANCEL_BID_RESPONSE = "CANCEL_BID_RESPONSE",
  ACCEPT_BID_RESPONSE = "ACCEPT_BID_RESPONSE",
  CALL_CONTRACT_RESPONSE = "CALL_CONTRACT_RESPONSE",
}

interface BaseOrobitRequest<T extends OrobitRequestType, R = never> {
  type: T;
  requestId: string;
  data?: R;
}

interface BaseOrobitResponse<T extends OrobitResponseType, R = object> {
  type: T;
  requestId: string;
  result: {
    error?: string;
    data?: R;
  };
}

export type ConnectRequest = BaseOrobitRequest<OrobitRequestType.CONNECT>;

export type ConnectResponse = BaseOrobitResponse<
  OrobitResponseType.CONNECT_RESPONSE,
  { address: string }
>;

export type IsConnectedRequest =
  BaseOrobitRequest<OrobitRequestType.IS_CONNECTED>;

export type IsConnectedResponse = BaseOrobitResponse<
  OrobitResponseType.IS_CONNECTED_RESPONSE,
  {
    isConnected: boolean;
    address?: string; // Optional, only if connected
  }
>;

export type SendTransactionRequest = BaseOrobitRequest<
  OrobitRequestType.SEND_TRANSACTION,
  {
    toAddress: string;
    amount: string; // Amount in satoshis
    contractId: string; // BTC || contract_id
  }
>;
export const isSendTransactionRequest = (
  request?: OrobitRequest
): request is SendTransactionRequest => {
  return request?.type === OrobitRequestType.SEND_TRANSACTION;
};
export type SendTransactionResponse = BaseOrobitResponse<
  OrobitResponseType.SEND_TRANSACTION_RESPONSE,
  {
    transactionId?: string; // Optional, if transaction was sent successfully
  }
>;

export type MintNFTRequest = BaseOrobitRequest<
  OrobitRequestType.MINT_NFT,
  {
    nftData: INFT;
  }
>;
export const isMintNFTRequest = (
  request?: OrobitRequest
): request is MintNFTRequest => {
  return request?.type === OrobitRequestType.MINT_NFT;
};
export type MintNFTResponse = BaseOrobitResponse<
  OrobitResponseType.MINT_NFT_RESPONSE,
  {
    contractId: string; // ID of the created NFT contract
  }
>;

export type PlaceListingRequest = BaseOrobitRequest<
  OrobitRequestType.PLACE_LISTING,
  {
    contractId: string;
    price: string; // Price in sats
    amount: string; // Amount of tokens to list
  }
>;
export const isPlaceListingRequest = (
  request?: OrobitRequest
): request is PlaceListingRequest => {
  return request?.type === OrobitRequestType.PLACE_LISTING;
};
export type PlaceListingResponse = BaseOrobitResponse<
  OrobitResponseType.PLACE_LISTING_RESPONSE,
  {
    listingId: string; // ID of the created listing
  }
>;

export type CancelListingRequest = BaseOrobitRequest<
  OrobitRequestType.CANCEL_LISTING,
  {
    listingUtxo: string;
    contractId: string;
  }
>;
export const isCancelListingRequest = (
  request?: OrobitRequest
): request is CancelListingRequest => {
  return request?.type === OrobitRequestType.CANCEL_LISTING;
};
export type CancelListingResponse = BaseOrobitResponse<
  OrobitResponseType.CANCEL_LISTING_RESPONSE,
  {
    transactionId?: string;
  }
>;
export type PlaceBidRequest = BaseOrobitRequest<
  OrobitRequestType.PLACE_BID,
  {
    contractId: string; // ID of the contract to bid on
    amount: string; // Amount of tokens to bid
    price: string; // Price in sats per token
    listingUtxo: string;
    payAddress: string;
    orderId: string;
  }
>;
export const isPlaceBidRequest = (
  request?: OrobitRequest
): request is PlaceBidRequest => {
  return request?.type === OrobitRequestType.PLACE_BID;
};
export type PlaceBidResponse = BaseOrobitResponse<
  OrobitResponseType.PLACE_BID_RESPONSE,
  {
    bidId: string; // ID of the created bid
  }
>;
export type CancelBidRequest = BaseOrobitRequest<
  OrobitRequestType.CANCEL_BID,
  {
    bidUtxo: string;
    contractId: string;
  }
>;
export const isCancelBidRequest = (
  request?: OrobitRequest
): request is CancelBidRequest => {
  return request?.type === OrobitRequestType.CANCEL_BID;
};
export type CancelBidResponse = BaseOrobitResponse<
  OrobitResponseType.CANCEL_BID_RESPONSE,
  {
    transactionId?: string;
  }
>;

export type AcceptBidRequest = BaseOrobitRequest<
  OrobitRequestType.ACCEPT_BID,
  {
    acceptTx: string;
    fulfillTx: string;
    contractId: string;
    amount: string;
  }
>;
export const isAcceptBidRequest = (
  request?: OrobitRequest
): request is AcceptBidRequest => {
  return request?.type === OrobitRequestType.ACCEPT_BID;
};
export type AcceptBidResponse = BaseOrobitResponse<
  OrobitResponseType.ACCEPT_BID_RESPONSE,
  {
    transactionId?: string; // Optional, if the bid was accepted successfully
  }
>;

export type CallContractRequest = BaseOrobitRequest<
  OrobitRequestType.CALL_CONTRACT,
  {
    nodeUrl: string;
    contractId: string;
    functionName: string;
    argsJson: string;
    isView: boolean;
  }
>;

export const isCallContractRequest = (
  request?: OrobitRequest
): request is CallContractRequest => {
  return request?.type === OrobitRequestType.CALL_CONTRACT;
};

export type CallContractResponse = BaseOrobitResponse<
  OrobitResponseType.CALL_CONTRACT_RESPONSE,
  {
    result: {
      callId: string;
      nodeResponse: object;
      payloadBase64: string;
      payloadHash: string;
      payloadHex: string;
      txid: string | null; // Will be null for view calls, and a string for state-changing calls
    };
  }
>;

export type OrobitRequest =
  | ConnectRequest
  | IsConnectedRequest
  | SendTransactionRequest
  | MintNFTRequest
  | PlaceListingRequest
  | CancelListingRequest
  | PlaceBidRequest
  | CancelBidRequest
  | AcceptBidRequest
  | CallContractRequest;
export type OrobitResponse =
  | ConnectResponse
  | IsConnectedResponse
  | SendTransactionResponse
  | MintNFTResponse
  | PlaceListingResponse
  | CancelListingResponse
  | PlaceBidResponse
  | CancelBidResponse
  | AcceptBidResponse
  | CallContractResponse;

export interface OrobitProvider {
  connect(): Promise<ConnectResponse["result"]>;
  disconnect(): Promise<void>;
  sendTransaction(
    data: SendTransactionRequest["data"]
  ): Promise<SendTransactionResponse["result"]>;
}
export interface INFT {
  name: string;
  description?: string | null;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number | boolean;
  }> | null;
}
