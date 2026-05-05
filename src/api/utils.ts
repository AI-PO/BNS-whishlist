/**
 * This creates a unique Array key for cache
 * First entry is endpoint with queries removed
 * Second is base URL of grouped, example orders, users, addresses
 * third is unique for that exact endpoint with  all details
 * @param url
 * @param method
 * @param body
 * @returns Array of 3 strings to uniquely identify cache
 */
export function apiCacheKey(
  url: string,
  method: "get" | "post" | "delete" = "get",
  body?: Record<string, unknown> | string[]
): Array<string> {
  //update so we return array of keys, first being the starting API call ie /[type]/whatever, then URL, then the normal body
  return [
    ...url.split("?")[0].split("/"),
    `${method}${url}${body ? JSON.stringify(body) : ""}`.replaceAll(
      /[^a-zA-Z0-9 -]/g,
      ""
    ),
  ];
}
