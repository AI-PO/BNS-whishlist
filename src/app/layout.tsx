import type { Metadata } from "next";
import { Hubot_Sans, Source_Code_Pro } from "next/font/google";
import { ReactNode, Suspense } from "react";

import { getWalletAddressFromCookies } from "@/app/actions/walletAddressInCookies";
import { LayoutClientProvider } from "@/common/components/layouts/LayoutClientProvider";
import { UrlErrorHandler } from "@/common/components/UrlErrorHandler";
import { ViewportHandler } from "@/common/components/ViewportHandler";
import { NavBar } from "@/common/navigation/NavBar";
import { NavBarWrapper } from "@/common/navigation/NavBarWrapper";
import { cn } from "@/lib/utils";
import "./globals.css";

const hubotSans = Hubot_Sans({
  variable: "--font-hubot-sans",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Bitcoin Names",
  description:
    "Bitcoin-native name registry. Quantum-secure. Powered by Orobit.",
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: ReactNode;
}>) => {
  const connectedWalletAccount = await getWalletAddressFromCookies();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          hubotSans.variable,
          sourceCodePro.variable,
          "antialiased min-h-screen-safe touch-pan-y bg-bn-page text-bn-ink overflow-x-hidden",
        )}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(10,10,10,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,10,10,0.05) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            backgroundPosition: "center center",
            maskImage:
              "radial-gradient(ellipse 85% 70% at 50% 45%, black 30%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 85% 70% at 50% 45%, black 30%, transparent 85%)",
          }}
        />
        <div className="pointer-events-none fixed inset-0 -z-10 bn-dot-grid opacity-35" />
        <div className="pointer-events-none fixed -z-10 left-[-16%] top-[-12%] h-[46vh] w-[46vw] rounded-full bn-orange-glow-soft blur-2xl" />
        <div className="pointer-events-none fixed -z-10 right-[-22%] top-[10%] h-[56vh] w-[46vw] rounded-full bn-orange-glow-soft blur-2xl" />

        <ViewportHandler />

        <LayoutClientProvider cookieConnectedAccount={connectedWalletAccount}>
          {/* <div className="relative min-h-screen-safe safe-area-container"> */}
          {/* <NavBar /> */}
          {/* <main className="pb-safe">{children}</main> */}
          <div className="relative z-10 min-h-screen-safe safe-area-container w-full h-full flex flex-col">
            <NavBarWrapper>
              <NavBar />
            </NavBarWrapper>
            <main className="pb-safe flex-1">{children}</main>
          </div>
        </LayoutClientProvider>

        <Suspense>
          <UrlErrorHandler />
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
