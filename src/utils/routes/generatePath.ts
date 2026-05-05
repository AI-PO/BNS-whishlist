export type ExtractRouteParams<T extends string> =
  // Optional param with more to follow: e.g., /:param?/rest
  T extends `${string}:${infer Param}?/${infer Rest}`
    ? { [K in Param]?: string } & ExtractRouteParams<Rest>
    : // Required param with more to follow: e.g., /:param/rest
      T extends `${string}:${infer Param}/${infer Rest}`
      ? { [K in Param]: string } & ExtractRouteParams<Rest>
      : // Optional param at the end: e.g., /:param?
        T extends `${string}:${infer Param}?`
        ? { [K in Param]?: string }
        : // Required param at the end: e.g., /:param
          T extends `${string}:${infer Param}`
          ? { [K in Param]: string }
          : // Base case: no more parameters
            object; // Changed from {} to object to satisfy linter, or use Record<string, never> for truly empty

// Function with typed params based on pattern
export const generatePath = <T extends string>(
  pattern: T,
  params: ExtractRouteParams<T>
): string => {
  if (!pattern) return "/";

  let path = pattern;

  // Handle parameters (:param)
  const paramMatches = pattern.match(/:(\w+)/g);
  if (paramMatches) {
    for (const match of paramMatches) {
      const paramName = match.substring(1); // Remove the : to get the param name

      if (!(paramName in params)) {
        throw new Error(
          `Missing required parameter "${paramName}" for route "${pattern}"`
        );
      }

      path = path.replace(
        match,
        encodeURIComponent(String(params[paramName as keyof typeof params]))
      ) as T;
    }
  }

  return path;
};
