import { Metadata } from "next";

import { Landing } from "@/app/home-views/bn/Landing";
import { MotionProvider } from "@/common/components/bn";

export const metadata: Metadata = {
  title: "Bitcoin Names — Claim your name on Bitcoin | Powered by Orobit",
  description: "Claim your Bitcoin name before the doors open. Quantum-secure. Bitcoin-native. Powered by Orobit.",
  openGraph: {
    title: "The .com moment for Bitcoin is here.",
    description: "Claim your Bitcoin name before the doors open. Quantum-secure. Bitcoin-native. Powered by Orobit.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The .com moment for Bitcoin is here.",
    description: "Claim your Bitcoin name before the doors open. Quantum-secure. Bitcoin-native. Powered by Orobit.",
  },
};

const Page = () => (
  <MotionProvider>
    <Landing />
  </MotionProvider>
);

export default Page;
