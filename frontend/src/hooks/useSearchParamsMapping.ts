import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
/**
 * Ensures search params maps given key and value.
 * It cleans it up on unmount.
 */
export const useSearchParamsMapping = (data: {
  [key: string]: string | number | boolean | string[];
}) => {
  const currSearchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(currSearchParams);
    Object.entries(data).forEach(([key, value]) => {
      const stringValue = value?.toString();
      if (!stringValue) {
        searchParams.delete(key);
      } else if (searchParams.get(key) !== stringValue) {
        searchParams.set(key, stringValue);
      }
    });
    replace(`${pathname}?${searchParams.toString()}`);
  }, [JSON.stringify(data)]);
};
