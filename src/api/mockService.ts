/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContractBalanceSummary } from "@/api/exchangeApi/types/api.address.types";
import { readMockDb, updateMockDb } from "@/api/githubDbStorage";
import { MockDB } from "@/api/mockDbSchema";
import { getWalletAddressFromCookies } from "@/app/actions/walletAddressInCookies";
import {
  Domain,
  Order,
  OrderStatus,
  OrderType,
  OrderWithDomain,
  SupabaseBid,
  SupabaseBidWithListing,
  SupabaseListing,
  Listing,
  ListingBid,
  SupabaseStatus,
} from "@/common/types/business";
import { PartialKeys } from "@/common/types/generic";

class MockApiService {
  private async readDB(): Promise<MockDB> {
    return readMockDb();
  }

  private async withDBMutation(
    mutate: (db: MockDB) => boolean,
    commitMessage: string,
  ): Promise<MockDB> {
    return updateMockDb((db) => {
      const update = mutate(db);
      return { db, update };
    }, commitMessage);
  }

  // --- DOMAINS ---
  async isDomainAvailable(domainName: string): Promise<boolean> {
    const db = await this.readDB();
    // Return true if the domain is NOT in the db
    return !db.domains.some((d) => d.domain === domainName);
  }

  async selectUserDomains(userAddress: string): Promise<Domain[]> {
    const db = await this.readDB();
    return db.domains.filter((d) => d.address === userAddress);
  }

  async isDomainAvailableOnMarketplace(
    domainName: string,
  ): Promise<string | undefined> {
    const db = await this.readDB();
    const listing = db.listings.find(
      (l) => l.name === domainName && l.status === SupabaseStatus.ACTIVE,
    );
    return listing?.list_utxo;
  }

  async getUserNotListedContracts(
    address: string,
  ): Promise<ContractBalanceSummary[]> {
    const db = await this.readDB();
    const endedStatus = SupabaseStatus.ENDED;

    const userDomains = db.domains.filter((d) => d.address === address);

    const notListedDomains = userDomains.filter((domain) => {
      const listing = db.listings.find(
        (l) =>
          l.contract_id === domain.contract_id &&
          l.owner === address &&
          l.status !== endedStatus,
      );

      return !listing;
    });

    return notListedDomains
      .map((domain) => ({
        balance_types: "mock",
        balance_value: "1",
        btc_price: 0,
        value: 1,
        contract_id: domain.contract_id,
        ticker: domain.domain,
        rest_url: "",
        contract_type: "NFT",
        decimals: 0,
        average_listing_price: 0,
        average_traded_price: 0,
        contract_interactions: 0,
        current_bids: 0,
        current_listings: 0,
        supply: 1,
        max_supply: 1,
        total_burns: 0,
        total_listed: 0,
        total_owners: 1,
        total_traded: 0,
        total_transfers: 0,
      }))
      .sort((a, b) =>
        a.ticker.toUpperCase() < b.ticker.toUpperCase() ? -1 : 1,
      );
  }

  selectUserDomainsFromDb(db: MockDB, userAddress: string): Domain[] {
    return db.domains.filter((d) => d.address === userAddress);
  }

  // --- ORDERS ---
  async selectUserOrders(userAddress: string): Promise<OrderWithDomain[]> {
    const db = await this.readDB();
    return db.orders.filter((o) => o.address === userAddress);
  }

  selectUserOrdersFromDb(db: MockDB, userAddress: string): OrderWithDomain[] {
    return db.orders.filter((o) => o.address === userAddress);
  }

  async createDomainAndPurchaseOrderInSupabase(body: {
    domain: string;
    btcAddress: string;
    contractId: string;
    expiryDate?: string;
    txId?: string;
    claimYears?: number;
  }): Promise<void> {
    console.log(
      "[MockService] Mocking create domain & purchase order...",
      body,
    );
    await this.withDBMutation((db) => {
      // compute expiry from provided expiryDate or claimYears fallback
      let expiryIso = body.expiryDate;
      if (!expiryIso && body.claimYears) {
        expiryIso = new Date(
          Date.now() + (body.claimYears as number) * 365 * 24 * 60 * 60 * 1000,
        ).toISOString();
      }

      // Dedup: update existing domain rather than creating a duplicate
      const existingDomain = db.domains.find((d) => d.domain === body.domain);

      let changed = false;
      let domainId: number;

      if (existingDomain) {
        domainId = existingDomain.id;
        const newStatus = body.txId ? "pending" : "active";
        if (expiryIso && existingDomain.expiry !== expiryIso) {
          existingDomain.expiry = expiryIso;
          changed = true;
        }
        if (existingDomain.status !== newStatus) {
          existingDomain.status = newStatus;
          changed = true;
        }
      } else {
        domainId = db.domains.length + 1;
        db.domains.push({
          id: domainId,
          created_at: new Date().toISOString(),
          address: body.btcAddress,
          domain: body.domain,
          contract_id: body.contractId,
          expiry: expiryIso || new Date().toISOString(),
          status: body.txId ? "pending" : "active",
        });
        changed = true;
      }

      // Dedup: skip order if the same transaction is already recorded
      const txForOrder = body.txId || `mock_tx_${Date.now()}`;
      const orderExists =
        !!body.txId && db.orders.some((o) => o.transaction_id === body.txId);

      if (!orderExists) {
        db.orders.push({
          id: db.orders.length + 1,
          created_at: new Date().toISOString(),
          address: body.btcAddress,
          transaction_id: txForOrder,
          domain_id: domainId,
          email: "mocked@email.com",
          status: body.txId
            ? (OrderStatus.PROCESSING as any)
            : (OrderStatus.COMPLETED as any),
          type: OrderType.PURCHASE,
          domains: { domain: body.domain },
        });
        changed = true;
      }

      return changed;
    }, "mock-db: create domain and purchase order");
  }

  async createTransferSaleOrderInSupabase(body: {
    type: OrderType;
    sender?: string;
    receiver: string;
    transactionId: string;
    supabaseDomainId: number;
    renewalYears?: number;
  }): Promise<void> {
    console.log(
      "[MockService] Mocking transfer/sale/renew/pause order...",
      body,
    );
    await this.withDBMutation((db) => {
      const domain = db.domains.find((d) => d.id === body.supabaseDomainId);
      const orderId = db.orders.length + 1;
      const newOrder: OrderWithDomain = {
        id: orderId,
        created_at: new Date().toISOString(),
        address:
          body.type === OrderType.SALE ? body.sender || "" : body.receiver,
        transaction_id: body.transactionId,
        domain_id: body.supabaseDomainId,
        email: "mocked@email.com",
        status: OrderStatus.PROCESSING,
        type: body.type,
        domains: { domain: domain?.domain || "mocked" },
      };
      let senderOrder: OrderWithDomain | null = null;
      if (body.sender && body.type === OrderType.TRANSFER) {
        senderOrder = {
          id: orderId + 1,
          created_at: new Date().toISOString(),
          address: body.sender,
          transaction_id: body.transactionId,
          domain_id: body.supabaseDomainId,
          email: "mocked@email.com",
          status: OrderStatus.PROCESSING,
          type: body.type,
          domains: { domain: domain?.domain || "mocked" },
        };
      }
      db.orders.push(newOrder);
      if (senderOrder) {
        db.orders.push(senderOrder);
      }
      // Set domain status to pending for transfer/renew/pause.
      // Do NOT update domain.address here — the address is only updated once
      // the tx confirms (via reconcilePendingOrders / reconcileAllOnChainState).
      if (
        domain &&
        [OrderType.TRANSFER, OrderType.RENEW, OrderType.PAUSE].includes(
          body.type,
        )
      ) {
        domain.status = "pending";

        if (body.type === OrderType.TRANSFER) {
          domain.address = body.receiver;
        } else if (body.type === OrderType.RENEW) {
          const years = Math.max(1, Math.min(4, body.renewalYears ?? 1));
          domain.expiry = new Date(
            Date.now() + years * 365 * 24 * 60 * 60 * 1000,
          ).toISOString();
        } else if (body.type === OrderType.PAUSE) {
          domain.status = "paused";
        }
      }
      return true;
    }, "mock-db: create transfer/renew/pause order");
  }

  async updateSingleOrderInSupabase(orderId: number): Promise<void> {
    await this.withDBMutation((db) => {
      const orderIndex = db.orders.findIndex((o) => o.id === orderId);
      if (orderIndex >= 0) {
        db.orders[orderIndex].status = "completed" as any;
      }
      return orderIndex >= 0;
    }, "mock-db: update single order status");
  }

  async updateOrdersSupabase(orders: Order[]): Promise<void> {
    // await this.withDBMutation((db) => {
    //   let shouldUpdateDomainStatus = false;
    //   for (const order of orders) {
    //     const idx = db.orders.findIndex((o) => o.id === order.id);
    //     if (idx >= 0) {
    //       if (db.orders[idx].status !== order.status) {
    //         db.orders[idx].status = order.status;
    //         shouldUpdateDomainStatus = true;
    //       }
    //     }
    //   }
    //   console.log(
    //     `Mock updated ${orders.length} orders. Domain status update needed: ${shouldUpdateDomainStatus}, orders:`,
    //     orders,
    //   );
    //   return shouldUpdateDomainStatus;
    // }, "mock-db: bulk update orders");
  }

  // --- LISTINGS ---
  async selectAllListingsFromSupabase(): Promise<SupabaseListing[]> {
    const db = await this.readDB();
    return db.listings;
  }

  async selectAllUserListingsFromSupabase(
    address: string,
  ): Promise<SupabaseListing[]> {
    const db = await this.readDB();
    return db.listings.filter((l) => l.owner === address);
  }

  async getContractListingFromSupabase(
    contractId: string,
  ): Promise<SupabaseListing | null> {
    const db = await this.readDB();
    return db.listings.find((l) => l.contract_id === contractId) || null;
  }

  async createOrUpdateListingSupabase(body: {
    contractId: string;
    bidCount?: number;
    bestBid?: number;
    price?: number;
    owner?: string;
    listingUtxo?: string;
    orderId?: string;
    name?: string;
    status?: SupabaseStatus;
  }): Promise<SupabaseListing> {
    let responseListing: SupabaseListing | null = null;

    await this.withDBMutation((db) => {
      let listing = db.listings.find((l) => l.contract_id === body.contractId);
      const domain = db.domains.find((d) => d.contract_id === body.contractId);
      const listingName = domain?.domain || body.name || body.contractId;
      const listingOwner = body.owner || domain?.address || "mocked_owner";
      const listingUtxo = body.listingUtxo || `mock_list_${Date.now()}:0`;
      const orderId = body.orderId || listingUtxo.split(":")[0];

      if (!listing) {
        listing = {
          id: db.listings.length + 1,
          created_at: new Date().toISOString(),
          contract_id: body.contractId,
          list_utxo: listingUtxo,
          order_id: orderId,
          price: body.price ?? 0,
          owner: listingOwner,
          name: listingName,
          best_bid: body.bestBid || 0,
          bid_count: body.bidCount || 0,
          status: SupabaseStatus.ACTIVE,
          domains: {
            id: domain?.id || 1,
            expiry: domain?.expiry || new Date().toISOString(),
          },
        };
        db.listings.push(listing);
      } else {
        if (body.bestBid !== undefined) listing.best_bid = body.bestBid;
        if (body.bidCount !== undefined) listing.bid_count = body.bidCount;
        if (body.price !== undefined) listing.price = body.price;
        if (body.owner) listing.owner = body.owner;
        if (body.listingUtxo) listing.list_utxo = body.listingUtxo;
        if (body.orderId) listing.order_id = body.orderId;
        if (body.name) listing.name = body.name;
        if (body.status !== undefined) listing.status = body.status;

        if (!listing.domains?.id || !listing.domains?.expiry) {
          listing.domains = {
            id: domain?.id || 1,
            expiry: domain?.expiry || new Date().toISOString(),
          };
        }
      }

      responseListing = listing;
      return true;
    }, "mock-db: create or update listing");

    if (!responseListing) {
      throw new Error("Failed to create or update listing in mock DB.");
    }

    return responseListing;
  }

  async updateListingsSupabase(listings: Listing[]): Promise<void> {
    if (!listings || listings.length === 0) return;
    await this.withDBMutation((db) => {
      let changed = false;
      for (const listing of listings) {
        const stored = db.listings.find(
          (l) =>
            l.contract_id === listing.contractId &&
            l.list_utxo === listing.listingUtxo,
        );
        if (!stored) continue;
        if (stored.status !== listing.status) {
          stored.status = listing.status;
          changed = true;
        }
        if (stored.best_bid !== listing.bestBid) {
          stored.best_bid = listing.bestBid;
          changed = true;
        }
        if (stored.bid_count !== listing.bidCount) {
          stored.bid_count = listing.bidCount;
          changed = true;
        }
        if (stored.price !== listing.price) {
          stored.price = listing.price;
          changed = true;
        }
      }
      return changed;
    }, "mock-db: bulk update listings");
  }

  // --- BIDS ---
  async getBidsForListing(
    contractId: string,
    listingUtxo: string,
    supabaseListingId: number,
    supabaseDomainId: number,
  ): Promise<ListingBid[]> {
    const db = await this.readDB();
    const supabaseBids = db.bids.filter(
      (b) => b.contract_id === contractId && b.list_utxo === listingUtxo,
    );

    return supabaseBids.map((b) => ({
      amount: 1, // mock amount
      price: b.price || 0,
      bidder: b.owner,
      createdAt: b.created_at,
      acceptTx: "mock_accept_tx",
      fulfillTx: "mock_fulfill_tx",
      listingUtxo,
      supabaseListingId,
      supabaseDomainId,
      contractId,
      resevedUtxo: b.bid_utxo + ":0",
      orderId: "mock_order_id",
      fullfilmentUtxos: [],
      isPending: b.status === SupabaseStatus.PENDING,
      isCancelled: b.status === SupabaseStatus.ENDED,
    }));
  }

  async getUserBidsFromSupabase(
    userAddress: string,
  ): Promise<SupabaseBidWithListing[]> {
    const db = await this.readDB();
    return db.bids.filter((b) => b.owner === userAddress);
  }

  async createOrUpdateBidSupabase(body: {
    contractId: string;
    listingUtxo: string;
    bidUtxo: string;
    owner: string;
    price?: number;
  }): Promise<SupabaseBid> {
    let responseBid: SupabaseBid | null = null;

    await this.withDBMutation((db) => {
      let bid = db.bids.find(
        (b) => b.contract_id === body.contractId && b.bid_utxo === body.bidUtxo,
      );
      if (!bid) {
        const listing = db.listings.find(
          (l) => l.list_utxo === body.listingUtxo,
        );
        const newBid: SupabaseBidWithListing = {
          id: db.bids.length + 1,
          created_at: new Date().toISOString(),
          contract_id: body.contractId,
          list_utxo: body.listingUtxo,
          bid_utxo: body.bidUtxo,
          owner: body.owner,
          price: body.price || 0,
          status: SupabaseStatus.PENDING,
          listings: listing
            ? {
                list_utxo: listing.list_utxo,
                name: listing.name,
              }
            : { list_utxo: "", name: "" },
        };
        db.bids.push(newBid);
        bid = newBid;
      } else {
        if (body.price !== undefined) {
          bid.price = body.price;
        }
      }

      responseBid = bid;
      return true;
    }, "mock-db: create or update bid");

    if (!responseBid) {
      throw new Error("Failed to create or update bid in mock DB.");
    }

    return responseBid;
  }

  async updateBidsSupabase(
    bids: PartialKeys<SupabaseBidWithListing, "id">[],
  ): Promise<void> {
    if (!bids || bids.length === 0) return;
    await this.withDBMutation((db) => {
      let changed = false;
      for (const bid of bids) {
        const stored = db.bids.find(
          (b) =>
            b.contract_id === bid.contract_id && b.bid_utxo === bid.bid_utxo,
        );
        if (!stored) continue;
        if (bid.status !== undefined && stored.status !== bid.status) {
          stored.status = bid.status;
          changed = true;
        }
        if (bid.price !== undefined && stored.price !== bid.price) {
          stored.price = bid.price;
          changed = true;
        }
      }
      return changed;
    }, "mock-db: bulk update bids");
  }

  // --- WISHLIST ---
  async addWishlist(
    email: string,
    domain: string | null,
  ): Promise<{ error?: string }> {
    let uniqueViolation = false;

    await this.withDBMutation((db) => {
      if (db.wishlist.some((w) => w.email === email)) {
        uniqueViolation = true;
        return false;
      }
      db.wishlist.push({ email, domain });
      return true;
    }, "mock-db: add wishlist entry");

    if (uniqueViolation) {
      return { error: "23505" };
    }

    return {};
  }

  async createBurnOrderInSupabase(body: {
    domain: string;
    btcAddress: string;
    contractId: string;
    txId: string;
    supabaseDomainId: number;
  }): Promise<void> {
    console.log("[MockService] Mocking burn order...", body);
    const connectedWalletAccount = await getWalletAddressFromCookies();

    await this.withDBMutation((db) => {
      // Remove the domain from the domains list
      db.domains = db.domains.filter((d) => d.id !== body.supabaseDomainId);

      // Create a burn order
      const orderId = db.orders.length + 1;
      const newOrder: OrderWithDomain = {
        id: orderId,
        created_at: new Date().toISOString(),
        address: connectedWalletAccount!.address,
        transaction_id: body.txId,
        domain_id: body.supabaseDomainId,
        email: "mocked@email.com",
        status: OrderStatus.PROCESSING as any,
        type: OrderType.DELETE as any,
        domains: { domain: body.domain },
      };
      db.orders.push(newOrder);
      return true;
    }, "mock-db: create burn order and remove domain");
  }
}

export const mockApiService = new MockApiService();
