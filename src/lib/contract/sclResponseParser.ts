export type SCLExtractObj = string | number | boolean | unknown[] | Record<string, unknown> | null;

export function extractSclResponse<T = SCLExtractObj>(data: unknown): T {
  if (data === null || data === undefined) return null as T;

  // Handle nested objects
  if (typeof data === "object" && !Array.isArray(data)) {
    if ("Int" in data) {
      if (typeof data.Int === "number") return data.Int as T;
      if (typeof data.Int === "string") return Number(data.Int) as T;
      if (typeof data.Int === "bigint") return Number(data.Int) as T; // or keep as string if we want to avoid precision loss, but instructions say number
    }
    if ("Str" in data) return String(data.Str) as T;
    if ("String" in data) return String(data.String) as T;
    
    if ("List" in data) {
      if (Array.isArray(data.List)) {
        return data.List.map((item: unknown) => extractSclResponse<unknown>(item)) as T;
      }
      return extractSclResponse<unknown>(data.List) as T;
    }
    
    if ("Map" in data) {
      // Handles {Map: {key: {Str: "k"}, value: {Int: 1}}}
      const mapObj = data.Map as { key: unknown; value: unknown };
      return {
        key: extractSclResponse<unknown>(mapObj.key),
        value: extractSclResponse<unknown>(mapObj.value),
      } as T;
    }

    // Default object fallback if we receive unhandled nested dictionaries
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(data)) {
      output[key] = extractSclResponse<unknown>((data as Record<string, unknown>)[key]);
    }
    return output as T;
  }

  return data as T;
}
