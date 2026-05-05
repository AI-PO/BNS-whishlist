"use client";

import { NEXT_PUBLIC_WALLET_URL } from "@/env";

import {
  AcceptBidRequest,
  AcceptBidResponse,
  CancelBidRequest,
  CancelBidResponse,
  CancelListingRequest,
  CancelListingResponse,
  ConnectRequest,
  ConnectResponse,
  MintNFTRequest,
  MintNFTResponse,
  OrobitProvider,
  OrobitRequest,
  OrobitRequestType,
  OrobitResponse,
  OrobitResponseType,
  PlaceBidRequest,
  PlaceBidResponse,
  PlaceListingRequest,
  PlaceListingResponse,
  SendTransactionRequest,
  SendTransactionResponse,
  CallContractRequest,
  CallContractResponse,
} from "./types";

enum OrobitDappPathname {
  CONNECT = "dapp/connect",
  SEND_TX = "dapp/send-tx",
  CONFIRM_TRANSACTION = "dapp/confirm-transaction",
}

export class OrobitBrowserProvider implements OrobitProvider {
  private walletUrl: string;
  private messageHandler?: (event: MessageEvent) => void;

  constructor() {
    this.walletUrl = NEXT_PUBLIC_WALLET_URL;
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private openPopup(
    pathname: OrobitDappPathname,
    features = "width=400,height=600"
  ) {
    const name = `orobit-${pathname}`;
    const popup = window.open(`${this.walletUrl}/${pathname}`, name, features);
    if (!popup) {
      throw new Error("Failed to open popup window");
    }
    return popup;
  }

  private openPopupAndWaitReady(
    pathname: OrobitDappPathname,
    features = "width=400,height=600"
  ): Promise<Window> {
    return new Promise((resolve, reject) => {
      const popup = this.openPopup(pathname, features);

      // Wait for the popup to be ready
      const readyListener = (event: MessageEvent) => {
        if (event.origin !== new URL(this.walletUrl).origin) return;
        if (event.source !== popup) return;
        if (event.data?.type === "POPUP_READY") {
          cleanup();
          resolve(popup);
        }
      };

      // Polling to check if popup is closed
      const closedCheckInterval = setInterval(() => {
        if (popup.closed) {
          cleanup();
          reject(new Error("User closed the wallet window before ready"));
        }
      }, 300);

      const cleanup = () => {
        window.removeEventListener("message", readyListener);
        clearInterval(closedCheckInterval);
        clearTimeout(fallbackCloseTimeout);
      };

      window.addEventListener("message", readyListener);

      // Fallback if popup does not become ready in time
      const fallbackCloseTimeout = setTimeout(() => {
        cleanup();
        if (!popup.closed) {
          popup.close();
        }
        reject(new Error("Wallet is not responding. Please try again later."));
      }, 10000);
    });
  }

  private handlePopupClose(
    popup: Window | null,
    reject: (reason?: unknown) => void
  ) {
    const interval = setInterval(() => {
      if (popup && popup.closed) {
        closePopup("User closed the wallet window");
      }
    }, 300);

    const closePopup = (error?: string) => {
      clearInterval(interval);
      window.removeEventListener("message", this.messageHandler!);
      popup?.close();
      if (error) {
        reject(new Error(error));
      }
    };
    return closePopup;
  }

  private isResponseToDappRequest = (
    event: MessageEvent,
    requestId: string,
    responseType: OrobitResponseType
  ) =>
    event.origin === new URL(this.walletUrl).origin &&
    event.data.requestId === requestId &&
    event.data.type === responseType;

  private async sendRequestWithReply<
    TRequest extends OrobitRequest,
    TResponse extends OrobitResponse,
  >(
    pathname: OrobitDappPathname,
    requestType: OrobitRequestType,
    responseType: OrobitResponseType,
    data?: TRequest["data"]
  ): Promise<TResponse["result"]> {
    const requestId = this.generateRequestId();
    const popup = await this.openPopupAndWaitReady(pathname);

    return new Promise((resolve, reject) => {
      const closePopup = this.handlePopupClose(popup, reject);

      this.messageHandler = (event: MessageEvent<TResponse>) => {
        if (!this.isResponseToDappRequest(event, requestId, responseType))
          return;

        if (event.data.result.error) {
          closePopup(event.data.result.error);
          return;
        }

        closePopup();
        resolve(event.data.result);
      };

      window.addEventListener("message", this.messageHandler);

      popup.postMessage(
        {
          type: requestType,
          requestId,
          data,
        },
        new URL(this.walletUrl).origin
      );
    });
  }

  async connect(): Promise<ConnectResponse["result"]> {
    return this.sendRequestWithReply<ConnectRequest, ConnectResponse>(
      OrobitDappPathname.CONNECT,
      OrobitRequestType.CONNECT,
      OrobitResponseType.CONNECT_RESPONSE
    );
  }

  async disconnect(): Promise<void> {
    // Implement disconnect logic if needed
  }

  async sendTransaction(
    data: SendTransactionRequest["data"]
  ): Promise<SendTransactionResponse["result"]> {
    return this.sendRequestWithReply<
      SendTransactionRequest,
      SendTransactionResponse
    >(
      OrobitDappPathname.SEND_TX,
      OrobitRequestType.SEND_TRANSACTION,
      OrobitResponseType.SEND_TRANSACTION_RESPONSE,
      data
    );
  }

  async mintNFT(
    data: MintNFTRequest["data"]
  ): Promise<MintNFTResponse["result"]> {
    return this.sendRequestWithReply<MintNFTRequest, MintNFTResponse>(
      OrobitDappPathname.CONFIRM_TRANSACTION,
      OrobitRequestType.MINT_NFT,
      OrobitResponseType.MINT_NFT_RESPONSE,
      data
    );
  }
  async placeListing(
    data: PlaceListingRequest["data"]
  ): Promise<PlaceListingResponse["result"]> {
    return this.sendRequestWithReply<PlaceListingRequest, PlaceListingResponse>(
      OrobitDappPathname.CONFIRM_TRANSACTION,
      OrobitRequestType.PLACE_LISTING,
      OrobitResponseType.PLACE_LISTING_RESPONSE,
      data
    );
  }

  async cancelListing(
    data: CancelListingRequest["data"]
  ): Promise<CancelListingResponse["result"]> {
    return this.sendRequestWithReply<
      CancelListingRequest,
      CancelListingResponse
    >(
      OrobitDappPathname.CONFIRM_TRANSACTION,
      OrobitRequestType.CANCEL_LISTING,
      OrobitResponseType.CANCEL_LISTING_RESPONSE,
      data
    );
  }

  async placeBid(
    data: PlaceBidRequest["data"]
  ): Promise<PlaceBidResponse["result"]> {
    return this.sendRequestWithReply<PlaceBidRequest, PlaceBidResponse>(
      OrobitDappPathname.CONFIRM_TRANSACTION,
      OrobitRequestType.PLACE_BID,
      OrobitResponseType.PLACE_BID_RESPONSE,
      data
    );
  }

  async acceptBid(
    data: AcceptBidRequest["data"]
  ): Promise<AcceptBidResponse["result"]> {
    return this.sendRequestWithReply<AcceptBidRequest, AcceptBidResponse>(
      OrobitDappPathname.CONFIRM_TRANSACTION,
      OrobitRequestType.ACCEPT_BID,
      OrobitResponseType.ACCEPT_BID_RESPONSE,
      data
    );
  }

  async cancelBid(
    data: CancelBidRequest["data"]
  ): Promise<CancelBidResponse["result"]> {
    return this.sendRequestWithReply<CancelBidRequest, CancelBidResponse>(
      OrobitDappPathname.CONFIRM_TRANSACTION,
      OrobitRequestType.CANCEL_BID,
      OrobitResponseType.CANCEL_BID_RESPONSE,
      data
    );
  }

  async callContract(
    data: CallContractRequest["data"]
  ): Promise<CallContractResponse["result"]> {
    return this.sendRequestWithReply<CallContractRequest, CallContractResponse>(
      OrobitDappPathname.CONFIRM_TRANSACTION,
      OrobitRequestType.CALL_CONTRACT,
      OrobitResponseType.CALL_CONTRACT_RESPONSE,
      data
    );
  }
}
