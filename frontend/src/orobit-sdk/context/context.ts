import {
  AcceptBidRequest,
  AcceptBidResponse,
  CallContractRequest,
  CallContractResponse,
  CancelBidRequest,
  CancelBidResponse,
  CancelListingRequest,
  CancelListingResponse,
  ConnectResponse,
  MintNFTRequest,
  MintNFTResponse,
  PlaceBidRequest,
  PlaceBidResponse,
  PlaceListingRequest,
  PlaceListingResponse,
  SendTransactionRequest,
  SendTransactionResponse,
  SetState,
} from "../types";
import { createSafeContext } from "../utils/createSafeContext";

export interface IOrobitContext {
  account?: string;
  isConnected: boolean;
  setAccount: SetState<string | undefined>;
  connect: () => Promise<ConnectResponse["result"]>;
  disconnect: () => Promise<void>;
  sendTx: (
    data: SendTransactionRequest["data"]
  ) => Promise<SendTransactionResponse["result"]>;
  mintNFT: (data: MintNFTRequest["data"]) => Promise<MintNFTResponse["result"]>;
  placeListing: (
    data: PlaceListingRequest["data"]
  ) => Promise<PlaceListingResponse["result"]>;
  cancelListing: (
    data: CancelListingRequest["data"]
  ) => Promise<CancelListingResponse["result"]>;
  placeBid: (
    data: PlaceBidRequest["data"]
  ) => Promise<PlaceBidResponse["result"]>;
  acceptBid: (
    data: AcceptBidRequest["data"]
  ) => Promise<AcceptBidResponse["result"]>;
  cancelBid: (
    data: CancelBidRequest["data"]
  ) => Promise<CancelBidResponse["result"]>;
  callContract: (
    data: CallContractRequest["data"]
  ) => Promise<CallContractResponse["result"]>;
}

export const [OrobitContext, useOrobitContext] =
  createSafeContext<IOrobitContext>("Orobit");
