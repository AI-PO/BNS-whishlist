"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";
import { ToastContainer } from "react-toastify";

import { OrobitContextProvider } from "@/orobit-sdk/context/OrobitContextProvider";
import { AppContextProvider } from "@/providers/AppContextProvider";
import { WalletAccount } from "@/providers/walletContext";
import { WalletContextProvider } from "@/providers/WalletContextProvider";

import { MotionProvider } from "../bn";
import { CursorDecorator } from "./CursorDecorator";

const queryClient = new QueryClient();

type Props = {
  cookieConnectedAccount: WalletAccount | null;
};

export const LayoutClientProvider: React.FC<PropsWithChildren<Props>> = ({
  cookieConnectedAccount,
  children,
}) => {
  const pathname = usePathname();
  // scroll to the element with the ID from the URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  useEffect(() => {
    // Function to set viewport height for mobile browsers
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Set initial value
    setVH();

    // Listen for resize events
    window.addEventListener("resize", setVH);
    window.addEventListener("orientationchange", setVH);

    // Clean up event listeners
    return () => {
      window.removeEventListener("resize", setVH);
      window.removeEventListener("orientationchange", setVH);
    };
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll("section[id]");

    const observers = new Map<number, IntersectionObserver>();

    elements.forEach((element) => {
      const thresholdAttr = element.getAttribute("data-intersection-threshold");
      const threshold = thresholdAttr ? parseFloat(thresholdAttr) : 0.1;

      let observer = observers.get(threshold);

      if (!observer) {
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                window.history.replaceState(null, "", `#${entry.target.id}`);
                break;
              }
            }
          },
          { threshold },
        );
        observers.set(threshold, observer);
      }

      observer.observe(element);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <>
      <div>
        <QueryClientProvider client={queryClient}>
          <AppContextProvider>
            <OrobitContextProvider>
              <WalletContextProvider
                init={{ connectedAccount: cookieConnectedAccount }}
              >
                <MotionProvider>
                  {pathname !== "/" && <CursorDecorator />}
                  {children}
                </MotionProvider>
              </WalletContextProvider>
            </OrobitContextProvider>
          </AppContextProvider>
        </QueryClientProvider>
      </div>
      <ToastContainer
        position="bottom-left"
        hideProgressBar
        autoClose={8000}
        className="toast-container-override"
        style={{
          zIndex: 99999,
        }}
        toastStyle={{
          background: "rgba(255, 255, 255, 0.92)",
          color: "#0A0A0A",
          borderRadius: "16px",
          border: "1px solid #D4D4D4",
          boxShadow: "0 14px 36px rgba(10, 10, 10, 0.12)",
          backdropFilter: "blur(12px)",
          zIndex: 99999,
        }}
      />
    </>
  );
};
