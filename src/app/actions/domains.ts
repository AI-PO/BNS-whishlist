"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import {
  getTxInfo,
  getLatestBlockHeight,
} from "@/api/exchangeApi/actions/blockExplorer";
import { mockApiService } from "@/api/mockService";
import {
  Order,
  Domain,
  OrderType,
  OrderStatus,
  OrderWithDomain,
} from "@/common/types/business";
import {
  NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ID,
  NEXT_PUBLIC_NETWORK,
  NEXT_PUBLIC_SCL_NODE_URL,
  NEXT_PUBLIC_USE_MOCK_API,
} from "@/env";

const PENDING_SYNC_FALLBACK_MS = 5 * 60 * 1000;
const FULL_SYNC_FALLBACK_MS = 60 * 60 * 1000;
const PENDING_SYNC_BLOCK_DELTA = 1;
const FULL_SYNC_BLOCK_DELTA = 6;

// Handles transfer, renew, and pause flows: creates a pending order and domain update, to be reconciled after tx confirmation
export const finalizeDomainTransferOrRenewal = async (opts: {
  txId: string;
  domain: string;
  btcAddress: string; // new owner or renewer
  contractId: string;
  type: OrderType.TRANSFER | OrderType.RENEW | OrderType.PAUSE;
  supabaseDomainId: number;
  renewalYears?: number;
}): Promise<void> => {
  const {
    txId,
    domain,
    btcAddress,
    contractId,
    type,
    supabaseDomainId,
    renewalYears,
  } = opts;
  try {
    if (NEXT_PUBLIC_USE_MOCK_API === "true") {
      await mockApiService.createTransferSaleOrderInSupabase({
        type,
        sender: type === OrderType.TRANSFER ? undefined : btcAddress,
        receiver: btcAddress,
        transactionId: txId,
        supabaseDomainId,
        renewalYears,
      });
    } else {
      console.log(
        "MOCKED finalizeDomainTransferOrRenewal (non-mock mode):",
        opts,
      );
    }
    revalidatePath("/profile");
  } catch (err) {
    console.error(
      "Failed to create pending transfer/renewal after tx sent:",
      err,
    );
    throw err;
  }
};

export const finalizeDomainRenewal = async (opts: {
  txId: string;
  domain: string;
  btcAddress: string;
  contractId: string;
  supabaseDomainId: number;
  renewalYears: number;
}): Promise<void> => {
  await finalizeDomainTransferOrRenewal({
    ...opts,
    type: OrderType.RENEW,
  });
};

export const createDomainAndPurchaseOrderInSupabase = async (body: {
  domain: string;
  btcAddress: string;
  contractId: string;
  expiryDate: string;
}): Promise<void> => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.createDomainAndPurchaseOrderInSupabase(body);
  }
  // MOCKED
  console.log("MOCKED createDomainAndPurchaseOrderInSupabase", body);
  return Promise.resolve();
};

// Waits for transaction confirmation (at least 1 confirmation) and then
// creates the domain + purchase order in the mock GitHub JSON (used as cache).
export const finalizeDomainPurchase = async (opts: {
  txId: string;
  domain: string;
  btcAddress: string; // owner / buyer address
  claimYears: number;
  contractId: string;
}): Promise<void> => {
  const { txId, domain, btcAddress, claimYears, contractId } = opts;

  // Instead of blocking and polling here, create a pending domain+order
  // entry immediately in the mock DB. A separate reconciler will check
  // pending orders (every ~10m when the DB is accessed) and mark them
  // completed once the tx is confirmed on-chain.
  try {
    const expiryDate = new Date(
      Date.now() + claimYears * 365 * 24 * 60 * 60 * 1000,
    ).toISOString();

    if (NEXT_PUBLIC_USE_MOCK_API === "true") {
      await mockApiService.createDomainAndPurchaseOrderInSupabase({
        domain,
        btcAddress,
        contractId,
        expiryDate,
        txId,
        claimYears,
      });
    } else {
      console.log("MOCKED finalizeDomainPurchase (non-mock mode):", {
        domain,
        btcAddress,
        contractId,
        expiryDate,
        txId,
      });
    }
  } catch (err) {
    console.error("Failed to create pending domain after tx sent:", err);
    throw err;
  }
};

export const selectUserOrders = async (userAddress: string) => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    try {
      const { readMockDb } = await import("@/api/githubDbStorage");
      const db = await readMockDb();
      const latestBlockHeight = await getLatestBlockHeight();
      const now = Date.now();
      const lastPendingSync =
        db.last_pending_sync ?? db.last_sync ?? new Date(0).toISOString();
      const lastFullSync =
        db.last_full_sync ?? db.last_sync ?? new Date(0).toISOString();
      const pendingByTime =
        now - new Date(lastPendingSync).getTime() > PENDING_SYNC_FALLBACK_MS;
      const fullByTime =
        now - new Date(lastFullSync).getTime() > FULL_SYNC_FALLBACK_MS;
      const pendingByBlock =
        latestBlockHeight !== undefined &&
        db.last_pending_sync_block !== undefined
          ? latestBlockHeight - db.last_pending_sync_block >=
            PENDING_SYNC_BLOCK_DELTA
          : false;
      const fullByBlock =
        latestBlockHeight !== undefined && db.last_full_sync_block !== undefined
          ? latestBlockHeight - db.last_full_sync_block >= FULL_SYNC_BLOCK_DELTA
          : false;
      console.log(
        "pendingByBlock",
        pendingByBlock,
        "pendingByTime",
        pendingByTime,
        "fullByBlock",
        fullByBlock,
        "fullByTime",
        fullByTime,
      );
      if (pendingByBlock || pendingByTime) {
        after(() => reconcilePendingOrders().catch((e) => console.warn(e)));
      }
      if (fullByBlock || fullByTime) {
        after(() => reconcileAllOnChainState().catch((e) => console.warn(e)));
      }
      // Reuse the already-loaded DB — no second GitHub GET
      return mockApiService.selectUserOrdersFromDb(db, userAddress);
    } catch (e) {
      console.warn("Failed to load orders from mock DB:", e);
      return [] as OrderWithDomain[];
    }
  }
  // MOCKED
  console.log("MOCKED selectUserOrders", userAddress);
  return [] as OrderWithDomain[];
};

export const selectUserDomains = async (userAddress: string) => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    try {
      const { readMockDb } = await import("@/api/githubDbStorage");
      const db = await readMockDb();
      const last = db.last_sync ? new Date(db.last_sync).getTime() : 0;
      const now = Date.now();
      // if (now - last > 10 * 60 * 1000) {
      //   reconcilePendingOrders().catch((e) => console.warn(e));
      // }
      // if (now - last > 60 * 60 * 1000) {
      //   reconcileAllOnChainState().catch((e) => console.warn(e));
      // }
      // Reuse the already-loaded DB — no second GitHub GET
      return mockApiService.selectUserDomainsFromDb(db, userAddress);
    } catch (e) {
      console.warn("Failed to load domains from mock DB:", e);
      return [] as Domain[];
    }
  }
  // MOCKED
  console.log("MOCKED selectUserDomains", userAddress);
  return [] as Domain[];
};

export const isDomainAvailable = async (domainName: string) => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.isDomainAvailable(domainName);
  }
  // MOCKED: returning true for tests
  console.log("MOCKED isDomainAvailable", domainName);
  return true;
};

export const isDomainAvailableOnMarketplace = async (
  domainName: string,
): Promise<string | undefined> => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.isDomainAvailableOnMarketplace(domainName);
  }
  // MOCKED: no listings
  console.log("MOCKED isDomainAvailableOnMarketplace", domainName);
  return undefined;
};

export const createTransferSaleOrderInSupabase = async (body: {
  type: OrderType.TRANSFER | OrderType.SALE;
  sender: string;
  receiver: string;
  transactionId: string;
  supabaseDomainId: number;
  renewalYears?: number;
}): Promise<void> => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    await mockApiService.createTransferSaleOrderInSupabase(body);
    revalidatePath("/profile");
  }
  // MOCKED
  console.log("MOCKED createTransferSaleOrderInSupabase", body);
  return Promise.resolve();
};

export const updateSingleOrderInSupabase = async (
  orderId: number,
): Promise<void> => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.updateSingleOrderInSupabase(orderId);
  }
  // MOCKED
  console.log("MOCKED updateSingleOrderInSupabase", orderId);
  return Promise.resolve();
};

export const updateOrdersSupabase = async (orders: Order[]) => {
  if (NEXT_PUBLIC_USE_MOCK_API === "true") {
    return mockApiService.updateOrdersSupabase(orders);
  }
  // MOCKED
  console.log("MOCKED updateOrdersSupabase", orders.length);
  return Promise.resolve();
};

const updatePendingOrdersStatus = async (orders: Order[]) => {
  const pendingOrders = orders.filter(
    (order) => order.status === OrderStatus.PROCESSING,
  );
  if (pendingOrders.length === 0) return false;

  const updates = await Promise.all(
    pendingOrders.map(async (order) => {
      const txInfo = await getTxInfo(order.transaction_id);
      if (!txInfo || !txInfo.status.confirmed) {
        console.warn(
          `No transaction info found for ${order.transaction_id}. Skipping update. Tx info: ${txInfo.status.confirmed}`,
        );
        return Promise.resolve();
      }

      await updateSingleOrderInSupabase(order.id);
      return Promise.resolve(1);
    }),
  );

  // Filter out any undefined updates
  const filteredUpdates = updates.filter((update) => update !== undefined);

  return filteredUpdates.length > 0;
};

// Module-level promise guard: if reconciliation is already running (e.g. triggered
// concurrently by both selectUserOrders and selectUserDomains on the same page load)
// all callers share the single in-flight promise instead of racing for the same SHA.
let activeReconcile: Promise<boolean> | null = null;

// Reconcile pending orders in the mock DB by checking tx status via block explorer
export const reconcilePendingOrders = async (): Promise<boolean> => {
  if (activeReconcile) {
    return activeReconcile;
  }
  activeReconcile = _doReconcilePendingOrders().finally(() => {
    activeReconcile = null;
  });
  return activeReconcile;
};

const _doReconcilePendingOrders = async (): Promise<boolean> => {
  if (NEXT_PUBLIC_USE_MOCK_API !== "true") {
    console.log("reconcilePendingOrders: non-mock mode not implemented");
    return false;
  }

  const { readMockDb, updateMockDb } = await import("@/api/githubDbStorage");
  const db = await readMockDb();

  const pendingOrders = db.orders.filter(
    (o) =>
      o.status === OrderStatus.PROCESSING &&
      !o.transaction_id.startsWith("mock_tx"),
  );

  if (pendingOrders.length === 0) {
    // Update pending-sync markers so the throttle advances even when nothing is pending.
    // Skip the write entirely if pending sync was already updated very recently
    // (within the same minute) to avoid pointless SHA-racing commits.
    const lastPendingSyncAge =
      Date.now() -
      new Date(db.last_pending_sync ?? db.last_sync ?? 0).getTime();
    if (lastPendingSyncAge > 60_000) {
      const latestBlockHeight = await getLatestBlockHeight();
      await updateMockDb((d) => {
        const nowIso = new Date().toISOString();
        d.last_sync = nowIso;
        d.last_pending_sync = nowIso;
        if (latestBlockHeight !== undefined) {
          d.last_pending_sync_block = latestBlockHeight;
        }
        return { db: d, update: true };
      }, "mock-db: pending reconciliation (no pending orders)");
    }
    return false;
  }

  // Check all pending tx statuses in parallel, then apply a single atomic commit
  const txResults = await Promise.allSettled(
    pendingOrders.map(async (order) => {
      const txInfo = await getTxInfo(order.transaction_id);
      return { order, confirmed: !!txInfo?.status?.confirmed };
    }),
  );

  const confirmedOrders = txResults
    .filter(
      (
        r,
      ): r is PromiseFulfilledResult<{
        order: OrderWithDomain;
        confirmed: boolean;
      }> => r.status === "fulfilled" && r.value.confirmed,
    )
    .map((r) => r.value.order);

  if (confirmedOrders.length > 0) {
    console.log(
      `reconcilePendingOrders: ${confirmedOrders.length} order(s) confirmed`,
    );
  }

  const latestBlockHeight = await getLatestBlockHeight();

  // Single atomic commit: mark all confirmed orders + update domain statuses + pending-sync markers
  await updateMockDb(
    (d) => {
      const nowIso = new Date().toISOString();
      for (const order of confirmedOrders) {
        const ord = d.orders.find((o) => o.id === order.id);
        if (ord && ord.status !== OrderStatus.COMPLETED) {
          ord.status = OrderStatus.COMPLETED;
        }
        const dom = d.domains.find((x) => x.id === order.domain_id);
        if (dom) {
          dom.status = order.type === OrderType.PAUSE ? "paused" : "active";
        }
      }
      d.last_sync = nowIso;
      d.last_pending_sync = nowIso;
      if (latestBlockHeight !== undefined) {
        d.last_pending_sync_block = latestBlockHeight;
      }
      return { db: d, update: true };
    },
    confirmedOrders.length > 0
      ? `mock-db: confirm ${confirmedOrders.length} order(s), sync`
      : "mock-db: pending reconciliation completed",
  );

  if (confirmedOrders.length > 0) {
    revalidatePath("/profile");
  }

  return confirmedOrders.length > 0;
};

const BLOCK_DURATION_MS = 10 * 60 * 1000;

const normalizeViewResponse = (res: unknown): unknown => {
  if (res == null) return null;
  if (Array.isArray(res)) return res;
  if (typeof res === "object") {
    const payload = res as Record<string, unknown>;
    if (payload.response !== undefined)
      return normalizeViewResponse(payload.response);
    if (payload.data !== undefined) return normalizeViewResponse(payload.data);
    if (payload.result !== undefined)
      return normalizeViewResponse(payload.result);
  }
  return res;
};

const getDomainItemsFromView = (
  raw: unknown,
): Array<{ key: string; value: unknown }> => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (item == null || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const key =
        typeof record.key === "string"
          ? record.key
          : Array.isArray(item)
            ? String(item[0])
            : undefined;
      const value = record.value ?? (Array.isArray(item) ? item[1] : undefined);
      if (!key) return null;
      return { key, value };
    })
    .filter(
      (entry): entry is { key: string; value: unknown } => entry !== null,
    );
};

const computeExpiryIso = (
  expiryBlock: number,
  currentBlockHeight?: number,
  existingExpiry?: string,
): string | undefined => {
  if (!expiryBlock || expiryBlock <= 0) {
    return existingExpiry;
  }

  if (currentBlockHeight !== undefined) {
    const delta = expiryBlock - currentBlockHeight;
    return new Date(Date.now() + delta * BLOCK_DURATION_MS).toISOString();
  }

  return existingExpiry;
};

// Full reconciliation: read on-chain token owners and expiries and update mock DB.
export const reconcileAllOnChainState = async (): Promise<boolean> => {
  if (NEXT_PUBLIC_USE_MOCK_API !== "true") {
    console.log("reconcileAllOnChainState: non-mock mode not implemented");
    return false;
  }

  const { readMockDb, updateMockDb } = await import("@/api/githubDbStorage");
  const { callViewFunctionDirect } = await import("@/lib/contract/nodeQuery");

  const nodeUrl = NEXT_PUBLIC_SCL_NODE_URL;
  const contractId = NEXT_PUBLIC_DOMAIN_NFT_CONTRACT_ID;
  const network = NEXT_PUBLIC_NETWORK;
  const callerPubkey =
    "020000000000000000000000000000000000000000000000000000000000000000";

  try {
    const db = await readMockDb();
    const currentBlockHeight = await getLatestBlockHeight();

    const tokensRes = await callViewFunctionDirect({
      nodeUrl,
      contractId,
      network,
      callerPubkey,
      functionName: "get_all_tokens",
      args: [],
    });
    console.log("Tokens view response:", tokensRes);

    const expiriesRes = await callViewFunctionDirect({
      nodeUrl,
      contractId,
      network,
      callerPubkey,
      functionName: "get_all_expiries",
      args: [],
    });

    const tokens = getDomainItemsFromView(
      normalizeViewResponse(tokensRes?.response),
    );
    const expiries = getDomainItemsFromView(
      normalizeViewResponse(expiriesRes?.response),
    );

    await updateMockDb((d) => {
      try {
        for (const item of tokens) {
          const token = item.key;
          const owner = typeof item.value === "string" ? item.value : undefined;
          if (!token) continue;

          const existing = d.domains.find((x) => x.domain === token);
          if (existing) {
            existing.address = owner || existing.address;
            if (existing.status !== "pending") {
              existing.status = "active";
            }
          } else {
            d.domains.push({
              id: d.domains.length + 1,
              created_at: new Date().toISOString(),
              address: owner || "",
              domain: token,
              contract_id: contractId,
              expiry: new Date().toISOString(),
              status: "active",
            });
          }
        }

        for (const item of expiries) {
          const token = item.key;
          const expiryBlock = Number(item.value ?? 0);
          if (!token) continue;
          const existing = d.domains.find((x) => x.domain === token);
          if (existing) {
            existing.expiry_block = expiryBlock;
            const computed = computeExpiryIso(
              expiryBlock,
              currentBlockHeight,
              existing.expiry,
            );
            if (computed) {
              existing.expiry = computed;
            }
            if (currentBlockHeight !== undefined) {
              existing.status =
                expiryBlock > currentBlockHeight ? "active" : "expired";
            }
          } else {
            d.domains.push({
              id: d.domains.length + 1,
              created_at: new Date().toISOString(),
              address: "",
              domain: token,
              contract_id: contractId,
              expiry: currentBlockHeight
                ? new Date(
                    Date.now() +
                      Math.max(0, expiryBlock - currentBlockHeight) *
                        BLOCK_DURATION_MS,
                  ).toISOString()
                : new Date().toISOString(),
              expiry_block: expiryBlock,
              status: currentBlockHeight
                ? expiryBlock > currentBlockHeight
                  ? "active"
                  : "expired"
                : "active",
            });
          }
        }
      } catch (err) {
        console.warn("reconcileAllOnChainState: merge error", err);
      }

      const nowIso = new Date().toISOString();
      d.last_sync = nowIso;
      d.last_full_sync = nowIso;
      if (currentBlockHeight !== undefined) {
        d.last_full_sync_block = currentBlockHeight;
      }
      return { db: d, update: true };
    }, "mock-db: full on-chain reconciliation");

    return true;
  } catch (err) {
    console.warn("reconcileAllOnChainState failed", err);
    return false;
  }
};

// Handles burn flow: creates a pending burn order and removes the domain from the DB, to be reconciled after tx confirmation
export const finalizeDomainBurn = async (opts: {
  txId: string;
  domain: string;
  btcAddress: string;
  contractId: string;
  supabaseDomainId: number;
}): Promise<void> => {
  const { txId, domain, btcAddress, contractId, supabaseDomainId } = opts;
  try {
    if (NEXT_PUBLIC_USE_MOCK_API === "true") {
      await mockApiService.createBurnOrderInSupabase({
        domain,
        btcAddress,
        contractId,
        txId,
        supabaseDomainId,
      });
      revalidatePath("/profile");
    } else {
      console.log("MOCKED finalizeDomainBurn (non-mock mode):", opts);
    }
  } catch (err) {
    console.error("Failed to create pending burn order after tx sent:", err);
    throw err;
  }
};
