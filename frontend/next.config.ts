import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@supabase/supabase-js"],
  // Temporarily enable detailed errors for debugging
  ...(process.env.NODE_ENV === "production" && {
    productionBrowserSourceMaps: true,
    compiler: {
      removeConsole: false,
    }
  })
};

export default nextConfig;
