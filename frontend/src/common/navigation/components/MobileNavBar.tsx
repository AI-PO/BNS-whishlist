"use client";

import { Fade as Hamburger } from "hamburger-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import { WalletAccount } from "@/providers/walletContext";

import { WalletConnection } from "./WalletConnection";

type Props = { account: WalletAccount | null };

export const MobileNavBar: React.FC<Props> = ({ account }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleRedirect = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    e.preventDefault();
    router.push(path);
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  return (
    <div>
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full h-[68px] px-5 flex items-center justify-between border-b border-bn-line transition-colors duration-400 ease-out text-bn-ink",
          {
            "bg-white/70 backdrop-blur-xl": !isOpen,
            "bg-white/95 backdrop-blur-xl": isOpen,
          },
        )}
      >
        <Link href="/" onClick={(e) => handleRedirect(e, "/")}>
          <Image src="/navbar_logo.svg" height={31} width={122} alt={"Bitcoin Names"} className="h-[38px] w-auto" />
        </Link>
        <Hamburger toggled={isOpen} toggle={setIsOpen} color="#000000" />
      </div>
      <div
        className={cn(
          "fixed z-40 inset-0 h-[100dvh] w-screen pt-[76px] transition-all origin-top duration-[320ms] ease-in-out bg-bn-page overflow-y-auto text-bn-ink",
          {
            "opacity-0 pointer-events-none translate-y-[-10px] scale-95":
              !isOpen,
            "opacity-100 pointer-events-auto translate-y-0 scale-100": isOpen,
          },
        )}
      >
        <div className="pointer-events-none absolute inset-0 bn-grid-light opacity-70" />
        <div className="pointer-events-none absolute inset-0 bn-dot-grid opacity-30" />
        <div className="h-full flex flex-col justify-between pb-[60px] px-4">
          <nav className="flex flex-col gap-y-4">
            <Link
              href="/#domains"
              onClick={(e) => handleRedirect(e, "/#domains")}
              className="text-4 font-bold p-3 text-bn-ink transition-colors hover:text-black rounded-2xl bg-white/60 border border-bn-line hover:bg-white/90 backdrop-blur-md"
            >
              Register
            </Link>
            <Link
              href="/#marketplace"
              onClick={(e) => handleRedirect(e, "/#marketplace")}
              className="text-4 font-bold p-3 text-bn-ink transition-colors hover:text-black rounded-2xl bg-white/60 border border-bn-line hover:bg-white/90 backdrop-blur-md"
            >
              Marketplace
            </Link>
            {account && (
              <Link
                href="/profile"
                onClick={(e) => handleRedirect(e, "/profile")}
                className="text-4 font-bold p-3 text-bn-ink transition-colors hover:text-black rounded-2xl bg-white/60 border border-bn-line hover:bg-white/90 backdrop-blur-md"
              >
                My Profile
              </Link>
            )}
          </nav>
          <div className="flex flex-col gap-y-5">
            <WalletConnection />
          </div>
        </div>
      </div>
    </div>
  );
};
