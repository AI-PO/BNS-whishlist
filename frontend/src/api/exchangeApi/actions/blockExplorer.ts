"use server";

import { NEXT_PUBLIC_BLOCK_EXPLORER_URL } from "@/env";

import { TransactionInfo } from "../types/api.address.types";

export const blockExplorerRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${NEXT_PUBLIC_BLOCK_EXPLORER_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache",
  };

  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Block explorer API error response:", errorData);
      throw new Error(
        `API request failed with status ${response.status}: ${response.statusText}`
      );
    }

    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  } catch (error) {
    console.error("Failed to fetch", error);
    throw new Error(
      `Failed to fetch from block explorer: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

const parseBlockHeight = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if (obj.height !== undefined) {
      return parseBlockHeight(obj.height);
    }
    if (obj.block_height !== undefined) {
      return parseBlockHeight(obj.block_height);
    }
    if (obj.status !== undefined) {
      return parseBlockHeight(obj.status);
    }
  }
  return undefined;
};

export const getLatestBlockHeight = async (): Promise<number | undefined> => {
  const endpoints = [
    "/blocks/tip/height",
    "/block/tip",
    "/block/latest",
    "/blocks/latest",
    "/headers/tip/height",
  ];

  for (const endpoint of endpoints) {
    try {
      const raw = await blockExplorerRequest<unknown>(endpoint);
      const height = parseBlockHeight(raw);
      if (height !== undefined) {
        return height;
      }
    } catch (error) {
      console.debug(`Block explorer height lookup failed for ${endpoint}:`, error);
    }
  }

  return undefined;
};

export const getTxInfo = async (txId: string) => {
  return blockExplorerRequest<TransactionInfo>(`/tx/${txId}`);
};
