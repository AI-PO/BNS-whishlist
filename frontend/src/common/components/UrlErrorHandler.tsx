"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

/**
 * UrlErrorHandler component listens for error messages in the URL search params
 * and displays them as toast notifications. It also clears the error from the URL
 * to prevent it from showing again.
 */
export const UrlErrorHandler: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // listen for error messages in the URL search params
  useEffect(() => {
    const errorMessage = searchParams.get("error");
    const errorDetails = searchParams.get("error_details");

    if (errorMessage) {
      toast(errorMessage);
      console.error("Error:", errorMessage, "Details:", errorDetails);

      // Clear the error from the URL to prevent it from showing again
      const searchParamsWithoutError = new URLSearchParams(searchParams);
      searchParamsWithoutError.delete("error");
      searchParamsWithoutError.delete("error_details");
      const newUrl = `${pathname}?${searchParamsWithoutError.toString()}`;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams]);

  return null;
};
