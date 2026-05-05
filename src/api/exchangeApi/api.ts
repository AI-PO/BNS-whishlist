import {
  QueryObserverResult,
  RefetchOptions,
  useQuery,
} from "@tanstack/react-query";

import { ExtractRouteParams, generatePath } from "@/utils/routes/generatePath";

import { apiCacheKey } from "../utils";
import {
  axiosBlockExplorer,
  axiosCryptoExchange,
  axiosSclNode,
} from "./consts";

type ApiOptions = {
  server: "explorer" | "node";
  url: string;
  method?: "get" | "post";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: Record<string, unknown> | any[];
  keepPreviousData?: boolean;
  gcTime?: number;
  staleTime?: number;
  retry?: number;
  retryDelay?: number;
  refetchInterval?: number;
  enabled?: boolean;
};

/**
 * wraps the UseQuery function for the API
 * @param url URL to fetch from
 * @param method Request Method
 * @param body Request Body
 * @returns UseQuery Object
 */
function useApi<T>(options: ApiOptions): {
  data: T | undefined;
  error: Error | null;
  isFetching: boolean;
  isLoading: boolean;
  isError: boolean;
  dataUpdatedAt: number;
  refetch: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<T, Error>>;
  isFetched: boolean;
} {
  const { server, url, method = "get", body, ...config } = options;

  const cleanUrl = `/${url}`;
  const call = (server === "explorer" ? axiosBlockExplorer : axiosSclNode)?.[
    method === "get" ? "get" : "post"
  ];
  const {
    data,
    error,
    isFetching,
    isLoading,
    isError,
    dataUpdatedAt,
    refetch,
    isFetched,
  } = useQuery<T>({
    queryKey: apiCacheKey(cleanUrl, method, body),
    queryFn: async () => {
      try {
        return call(cleanUrl, body).then((response) => {
          //set the return for all success, all data is wrapped in data object if not then we wrap it in data
          // all paginated pages are also wrapped in data which will have its own data and meta data
          if (
            Object.prototype.hasOwnProperty.call(response?.data, "data") &&
            !Object.prototype.hasOwnProperty.call(response?.data, "meta")
          ) {
            return response.data.data;
          } else {
            return response.data;
          }
        });
        //all error are caught and the full Axios Response is returned in error, with Data null, each endpoint handles its own error for example 422 for missing data.
      } catch (error) {
        console.error(error);
        return Promise.reject(error);
      }
    },
    ...config,
  });

  return {
    data,
    error,
    isFetching,
    isLoading,
    isError,
    dataUpdatedAt,
    isFetched,
    refetch,
  };
}

type ExplorerApiUrls = "address/:address" | "address/:address/utxo" | "tx/:tx" | string;

export const useExplorerApi = <R, T extends ExplorerApiUrls = ExplorerApiUrls>(
  options: Omit<ApiOptions, "server" | "url"> & {
    url: T;
    params: ExtractRouteParams<T>;
  }
) => {
  const url = generatePath(options.url, options.params);

  return useApi<R>({ ...options, url, server: "explorer" });
};

type SclNodeApiUrls = "check_utxos" | "summaries" | string;

export const useSclNodeApi = <R, T extends SclNodeApiUrls = SclNodeApiUrls>(
  options: Omit<ApiOptions, "server" | "url"> & {
    url: T;
    params: ExtractRouteParams<T>;
  }
) => {
  const url = generatePath(options.url, options.params);

  return useApi<R>({ ...options, url, server: "node" });
};

/**
 * wraps the UseQuery function for the API
 * @param url URL to fetch from
 * @param method Request Method
 * @param body Request Body
 * @returns UseQuery Object
 */
export function useCurrencyApi(
  options: {
    gcTime?: number;
    staleTime?: number;
    retry?: number;
    retryDelay?: number;
    refetchInterval?: number;
    keepPreviousData?: boolean;
  } = {}
) {
  const { keepPreviousData = true, ...config } = options;

  const {
    data,
    error,
    isFetching,
    isLoading,
    isError,
    dataUpdatedAt,
    refetch,
  } = useQuery<number | undefined>({
    queryKey: apiCacheKey("BTC_TO_USD", "get"),
    queryFn: async () => {
      try {
        return axiosCryptoExchange.get("/price").then((response) => {
          if (response.data?.btc_price) {
            return parseFloat(response.data.btc_price);
          }
          return undefined;
        });
      } catch (error) {
        console.error("Second API call error:", error);
        Promise.reject(error);
      }
    },
    placeholderData: keepPreviousData
      ? (previousValue) => {
          return previousValue;
        }
      : undefined,
    ...config,
  });

  return {
    data,
    error,
    isFetching,
    isLoading,
    isError,
    dataUpdatedAt,
    refetch,
  };
}
