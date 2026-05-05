"use client";

import { useEffect } from "react";

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    // Send error to server logs if possible
    if (typeof window !== "undefined") {
      console.error("Client-side error details:", {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    }
  }, [error]);

  return (
    <div className="h-full max-w-[660px] w-full flex flex-col m-auto pt-[90px] sm:pt-[145px] pb-4 px-4 gap-y-[30px]">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-red-500">
          🚨 Marketplace Error
        </h2>
        <p className="text-gray-600">Error loading marketplace listing</p>

        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          🔄 Try again
        </button>
      </div>
    </div>
  );
};

export default Error;
