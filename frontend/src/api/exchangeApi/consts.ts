import axios from "axios";

import {
  NEXT_PUBLIC_BLOCK_EXPLORER_URL,
  NEXT_PUBLIC_EXCHANGE_URL,
  NEXT_PUBLIC_SCL_NODE_URL,
} from "@/env";

export const EXCHANGE_URL = NEXT_PUBLIC_EXCHANGE_URL;
export const BLOCK_EXPLORER_URL = NEXT_PUBLIC_BLOCK_EXPLORER_URL;
export const SCL_NODE_URL = NEXT_PUBLIC_SCL_NODE_URL;

export const axiosCryptoExchange = axios.create({
  baseURL: EXCHANGE_URL,
});

export const axiosBlockExplorer = axios.create({
  baseURL: BLOCK_EXPLORER_URL,
});

export const axiosSclNode = axios.create({
  baseURL: SCL_NODE_URL,
});
