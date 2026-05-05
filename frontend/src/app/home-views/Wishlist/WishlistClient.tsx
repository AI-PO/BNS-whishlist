/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { submitWishlist } from "@/app/actions/wishlist";
import { SnapScrollHandler } from "@/common/components/SnapScrollHandler";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full py-4 px-6 md:px-8 bg-black text-white text-lg font-bold rounded-2xl transition-all hover:bg-neutral-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-black/20 ${
        pending ? "opacity-70 cursor-not-allowed transform-none" : ""
      }`}
    >
      {pending ? "Processing..." : "Reserve my .btc name \u2192"}
    </button>
  );
};

const WaitlistForm = ({
  state,
  formAction,
  idPrefix = "top",
}: {
  state: any;
  formAction: any;
  idPrefix?: string;
}) => {
  return (
    <form
      action={formAction}
      className="w-full max-w-[700px] mx-auto flex flex-col items-center group relative z-20 px-4"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-[#f7931a]/20 to-orange-400/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 pointer-events-none"></div>

      {state?.error && (
        <div className="bg-red-50 text-red-600 p-4 mb-4 w-full rounded-2xl text-sm border border-red-100 font-bold flex items-center justify-center gap-2 shadow-sm relative z-10 text-center">
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {state.error}
        </div>
      )}

      {/* Pill container stacked */}
      <div className="relative flex flex-col w-full bg-white/60 backdrop-blur-2xl border-[2px] border-white/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] focus-within:ring-4 focus-within:ring-[#f7931a]/20 focus-within:border-[#f7931a]/60 transition-all p-2 gap-1 z-10">
        <div className="relative flex items-center min-w-0 transition-colors">
          <input
            type="text"
            id={`domain-${idPrefix}`}
            name="domain"
            placeholder="Requested Name"
            pattern="[a-zA-Z0-9\-]+"
            className="w-full px-6 pr-3 py-5 bg-transparent border-none focus:outline-none placeholder-neutral-400 font-bold text-xl min-w-0"
          />
          <div className="text-[#f7931a] opacity-50 pointer-events-none font-bold text-xl pr-6">
            .btc
          </div>
        </div>

        <div className="w-[calc(100%-2rem)] mx-auto h-[2px] bg-neutral-100/80 rounded-full"></div>

        <div className="relative flex items-center min-w-0 transition-colors">
          <input
            type="email"
            id={`email-${idPrefix}`}
            name="email"
            required
            placeholder="Email address *"
            className="w-full px-6 py-5 bg-transparent border-none focus:outline-none placeholder-neutral-400 font-bold text-xl min-w-0"
          />
        </div>

        <div className="w-full flex mt-1">
          <SubmitButton />
        </div>
      </div>

      <p className="text-xs font-semibold text-neutral-400 mt-4 mb-2 text-center w-full">
        Letters, numbers, and hyphens only. No spaces.
      </p>

      {/* Checkbox Legal Disclaimer */}
      <div className="mt-2 flex items-start gap-4 text-left w-full bg-neutral-50/80 p-5 rounded-2xl border border-neutral-100 relative z-10 transition-all hover:bg-neutral-50">
        <div className="relative flex items-center mt-1 shrink-0">
          <input
            type="checkbox"
            id={`consent-${idPrefix}`}
            name="consent"
            required
            className="w-6 h-6 appearance-none rounded-md border-2 border-neutral-300 checked:bg-black checked:border-black focus:outline-none focus:ring-4 focus:ring-black/20 transition-all cursor-pointer bg-white"
          />
          <svg
            className="w-4 h-4 text-white absolute top-1 left-1 pointer-events-none opacity-0 checked-svg pointer-events-none"
            style={{ opacity: 0 }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <style>{`
            #consent-${idPrefix}:checked + svg { opacity: 1 !important; }
          `}</style>
        </div>
        <label
          htmlFor={`consent-${idPrefix}`}
          className="text-[0.8rem] text-neutral-500 font-medium leading-[1.65] cursor-pointer"
        >
          I agree that BTC Domains (operated by Dark Fusion Technologies Ltd via
          the Orobit platform) may store my email address and, if provided, my
          requested domain name, for the sole purpose of notifying me when BTC
          Domains launches. My data will not be used for any other purpose, will
          not be sold, and will not be shared with third parties. I may withdraw
          this consent at any time by contacting privacy@orobit.ai. This consent
          is required to join the waitlist.
        </label>
      </div>
    </form>
  );
};

const WishlistClient = () => {
  const [state, formAction] = useActionState(submitWishlist, null);

  const scrollToForm = () => {
    document
      .getElementById("waitlist-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (state?.success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#f7931a] opacity-[0.15] blur-[100px] pointer-events-none"></div>

        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8 relative z-10 shadow-2xl shadow-green-500/20 border border-green-100">
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tighter relative z-10">
          You&apos;re on the list.
        </h1>
        {state.domain ? (
          <p className="text-lg md:text-xl text-neutral-500 max-w-xl mx-auto leading-relaxed font-medium relative z-10">
            Your interest in{" "}
            <strong className="text-black font-extrabold bg-[#f7931a]/10 px-2 py-0.5 rounded-md">
              {state.domain}
            </strong>{" "}
            is noted. We&apos;ll notify you the moment BTC Domains goes live.
          </p>
        ) : (
          <p className="text-lg md:text-xl text-neutral-500 max-w-xl mx-auto leading-relaxed font-medium relative z-10">
            We&apos;ll notify you the moment BTC Domains goes live. You just secured
            priority access to the first drop.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <SnapScrollHandler />

      <div
        className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-[#fafafa] font-sans text-neutral-900"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* SECTION 1: HERO */}
        <section id="hero" className="min-h-[100dvh] w-full snap-start relative flex flex-col pt-4 px-4 lg:px-8 selection:bg-[#f7931a]/20 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[50vh] w-[80vw] rounded-full bg-[#f7931a] opacity-[0.04] blur-[100px] pointer-events-none"></div>

          {/* Navbar */}
          <nav className="w-full max-w-[1280px] mx-auto flex justify-between items-center z-50 py-3 relative">
            <Image src="/navbar_logo.svg" alt="BTC Domains Logo" width={190} height={50} className="w-[150px] h-10 md:w-[190px] md:h-[50px]" />

            <button
              onClick={scrollToForm}
              className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm md:text-base hover:bg-neutral-800 transition-all shadow hover:-translate-y-0.5"
            >
              Get your @Name
            </button>
          </nav>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto w-full z-10 py-10 lg:py-0">
            <h1 className="text-[clamp(3.5rem,8vw,6.5rem)] font-black text-black tracking-tighter leading-[1.02] mb-8">
              Claim your name
              <br />
              <span className="text-[#f7931a]">on Bitcoin.</span>
            </h1>

            <p className="text-[clamp(1.1rem,2.5vw,1.65rem)] text-neutral-500 max-w-[800px] mx-auto mb-12 leading-[1.6] font-medium px-4">
              The identity layer Bitcoin has never had. Be among the first to
              secure yourname.btc &mdash;{" "}
              <strong className="text-black font-extrabold">
                built for the post-quantum era.
              </strong>
            </p>

            <button
              onClick={scrollToForm}
              className="px-8 py-4 md:px-10 md:py-5 bg-black text-white text-xl md:text-2xl font-bold rounded-full transition-all hover:bg-neutral-800 shadow-[0_10px_40px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.25)] hover:-translate-y-1 flex items-center gap-3"
            >
              Reserve your name
              <svg
                className="w-5 h-5 md:w-6 md:h-6 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full flex flex-col items-center gap-2 z-10 pointer-events-none lg:pointer-events-auto mt-auto pb-4">
            <span className="text-[11px] md:text-xs font-black text-neutral-400 tracking-wider uppercase">
              Discover More
            </span>
            <a
              href="#opportunity"
              className="text-neutral-300 hover:text-black transition-colors pointer-events-auto mt-1"
            >
              <svg
                className="w-5 h-5 md:w-6 md:h-6 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </a>
          </div>
        </section>

        {/* SECTION 2: THE OPPORTUNITY (INFOGRAPHIC RECEREATION) */}
        <section
          id="opportunity"
          className="min-h-[100dvh] w-full snap-start relative flex flex-col items-center justify-center px-6 lg:px-12 bg-[#fafafa] py-16 border-t border-neutral-200 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#f7931a] opacity-[0.015] bg-[radial-gradient(#f7931a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

          <div className="max-w-[1280px] mx-auto w-full grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center z-10 h-full">
            <div className="flex flex-col gap-6 text-left order-2 lg:order-1 relative">
              <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black text-black tracking-tighter leading-[1.02]">
                The .com
                <br />
                Moment.
              </h2>
              <div className="w-24 h-1.5 bg-[#f7931a] rounded-full"></div>
              <p className="text-xl lg:text-2xl text-neutral-600 leading-snug font-medium">
                Early movers who registered{" "}
                <span className="text-black font-extrabold px-2 py-0.5 bg-yellow-100 rounded-[0.4rem] shadow-sm whitespace-nowrap">
                  gold.com
                </span>{" "}
                and{" "}
                <span className="text-black font-extrabold px-2 py-0.5 bg-blue-100 rounded-[0.4rem] shadow-sm whitespace-nowrap">
                  bank.com
                </span>{" "}
                in the 1990s held assets worth millions decades later.
              </p>
              <p className="text-xl lg:text-2xl text-neutral-600 leading-snug font-medium">
                Bitcoin names are at that same stage right now. Premium names
                are still available at mint prices. That window will not stay
                open.
              </p>
            </div>

            {/* The Visual Illustration Recreated */}
            <div className="relative w-full h-[500px] lg:h-full flex flex-col items-center justify-center p-4 lg:p-8 order-1 lg:order-2">
              {/* Fake blurred glow behind the illustration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#f7931a] opacity-[0.06] blur-[100px] rounded-[100%] pointer-events-none"></div>

              <div className="flex flex-col items-center justify-center gap-4 md:gap-5 w-full max-w-[600px] relative z-10 transition-transform hover:scale-[1.02] duration-500">
                {/* 1. Crypto Address Pill */}
                <div className="bg-[#fbefdf] text-black font-mono text-center tracking-[0.2em] break-all leading-relaxed text-sm md:text-base font-bold px-6 md:px-10 py-5 rounded-2xl shadow-sm border border-[#f5d9b5] w-full relative cursor-default">
                  <div className="absolute inset-0 bg-white opacity-40 rounded-2xl mix-blend-overlay pointer-events-none"></div>
                  <span className="relative z-10 leading-[2rem]">
                    54baae98982g34840220f12
                    <br className="hidden sm:block" />
                    b2f4hsj34be534nd93n332e
                  </span>
                </div>

                {/* 2. Down Arrow */}
                <div className="text-[#f7931a] flex justify-center py-1 relative z-10">
                  <svg
                    className="w-12 h-12 animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>

                {/* 3. The massive @YourName Pill */}
                <div className="bg-[#f7931a] text-white text-[clamp(2rem,5vw,3.5rem)] font-black px-10 md:px-20 py-6 md:py-8 rounded-[2.5rem] shadow-[0_15px_40px_rgba(247,147,26,0.3)] border border-[#f9a62a]/50 w-[95%] sm:w-auto text-center relative overflow-hidden z-20 cursor-default">
                  <div className="absolute inset-0 bg-white/20 [mask-image:linear-gradient(45deg,transparent,white,transparent)] -translate-x-full hover:translate-x-full duration-1000 transition-transform pointer-events-none"></div>
                  @YourName
                </div>

                {/* 4. Floating Extensions Cluster */}
                <div className="flex flex-wrap justify-center items-center gap-2.5 md:gap-4 mt-3 px-2 select-none relative z-10 w-full max-w-[500px]">
                  <div className="hidden sm:block bg-white/60 backdrop-blur px-5 py-3 rounded-full text-lg md:text-xl font-bold text-neutral-400">
                    <span className="text-neutral-700">YourName</span>
                    <span className="text-[#f7931a]">.home</span>
                  </div>

                  <div className="bg-white/60 backdrop-blur-md border px-6 py-3 rounded-full text-lg md:text-xl font-bold shadow-sm border border-neutral-100">
                    <span className="text-neutral-800">YourName</span>
                    <span className="text-[#f7931a]">.nft</span>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl border px-8 py-4 rounded-full text-xl md:text-2xl font-black shadow-md border-[2px] border-[#f7931a] transform -translate-y-1 relative z-30">
                    <span className="text-black">YourName</span>
                    <span className="text-[#f7931a]">.btc</span>
                  </div>

                  <div className="bg-white/60 backdrop-blur-md border px-6 py-3 rounded-full text-lg md:text-xl font-bold shadow-sm border border-neutral-100">
                    <span className="text-neutral-800">YourName</span>
                    <span className="text-[#f7931a]">.site</span>
                  </div>

                  <div className="hidden sm:block bg-white/80 px-5 py-3 rounded-full text-lg md:text-xl font-bold shadow-sm border border-neutral-100 mt-1 sm:-ml-6">
                    <span className="text-neutral-800">YourName</span>
                    <span className="text-[#f7931a]">.blog</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: QUANTUM SECURITY */}
        <section id="quantum-security" className="min-h-[100dvh] w-full snap-start relative flex flex-col items-center justify-center px-6 lg:px-12 bg-[#0a0a0a] text-white overflow-hidden py-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(247,147,26,0.15)_0%,transparent_60%)] pointer-events-none"></div>

          <div className="max-w-[1280px] mx-auto w-full z-10 relative flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-center h-full">
            <div className="w-full lg:w-[45%] flex flex-col gap-6 lg:gap-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 font-bold text-xs tracking-widest uppercase w-fit border border-red-500/20">
                <span className="flex-none w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="whitespace-break-spaces">Quantum computers are coming for Bitcoin wallets.</span>
              </div>
              <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black text-white tracking-tighter leading-[1.02]">
                Quantum
                <br />
                Security.
              </h2>
              <div className="w-24 h-1.5 bg-white rounded-full"></div>
              <p className="text-xl lg:text-2xl text-neutral-400 leading-snug font-medium">
                Between 4 and 10 million BTC sits in wallet addresses vulnerable
                to quantum attacks - private keys that can be derived once
                quantum computing matures. The European Commission has set a
                hard deadline: critical infrastructure must adopt
                quantum-resistant encryption by 2030. NIST finalised its first
                post-quantum cryptography standards in August 2024.
              </p>
              <p className="text-xl lg:text-2xl text-white font-bold leading-snug border-l-4 border-[#f7931a] pl-6 bg-white/5 py-6 rounded-r-2xl pr-4 shadow-xl backdrop-blur-sm">
                Every name registered on BTC Domains is secured with hybrid
                Taproot and post-quantum cryptography from day one. Your
                ownership survives the transition - not despite it.
              </p>
            </div>

            <div className="w-full lg:w-[55%] flex flex-col gap-6 lg:gap-8">
              <div className="flex items-center p-8 md:p-10 border-l-[8px] border-[#f7931a] bg-gradient-to-r from-white/[0.05] to-transparent backdrop-blur-xl rounded-r-3xl shadow-xl border-y border-r border-white/10 hover:bg-white/[0.08] transition-colors group">
                <div className="flex-1">
                  <span className="block text-[clamp(2.5rem,6vw,5.5rem)] font-black text-white leading-none mb-3 group-hover:scale-[1.02] origin-left transition-transform tracking-tight drop-shadow-md">
                    500M+
                  </span>
                  <span className="text-sm md:text-base text-neutral-400 font-bold uppercase tracking-[0.15em]">
                    Bitcoin holders worldwide
                  </span>
                </div>
              </div>
              <div className="flex items-center p-8 md:p-10 border-l-[8px] border-white bg-gradient-to-r from-white/[0.05] to-transparent backdrop-blur-xl rounded-r-3xl shadow-xl border-y border-r border-white/10 hover:bg-white/[0.08] transition-colors group">
                <div className="flex-1">
                  <span className="block text-[clamp(2.5rem,6vw,5.5rem)] font-black text-white leading-none mb-3 group-hover:scale-[1.02] origin-left transition-transform tracking-tight drop-shadow-md">
                    0
                  </span>
                  <span className="text-sm md:text-base text-neutral-400 font-bold uppercase tracking-[0.15em]">
                    Native identity standards on Bitcoin (until now)
                  </span>
                </div>
              </div>
              <div className="flex items-center p-8 md:p-10 border-l-[8px] border-neutral-600 bg-gradient-to-r from-white/[0.05] to-transparent backdrop-blur-xl rounded-r-3xl shadow-xl border-y border-r border-white/10 hover:bg-white/[0.08] transition-colors group">
                <div className="flex-1">
                  <span className="block text-[clamp(2.5rem,6vw,5.5rem)] font-black text-white leading-none mb-3 group-hover:scale-[1.02] origin-left transition-transform tracking-tight drop-shadow-md">
                    2030
                  </span>
                  <span className="text-sm md:text-base text-neutral-400 font-bold uppercase tracking-[0.15em]">
                    EU deadline for quantum-resistant infrastructure
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: CTA / FOOTER */}
        <section
          id="waitlist-form"
          className="min-h-[100dvh] w-full snap-start relative flex flex-col items-center justify-center px-6 lg:px-12 overflow-hidden py-16"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

          <div className="max-w-[800px] mx-auto w-full z-10 flex-grow flex flex-col items-center justify-center text-center">
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black text-black tracking-tighter leading-[1.02] mb-6">
              Reserve your name
              <br />
              <span className="text-[#f7931a]">before the doors open.</span>
            </h2>

            <p className="text-xl md:text-2xl text-neutral-500 max-w-2xl mx-auto mb-12 leading-snug font-medium">
              Join the waitlist and get priority access to the first drop.
            </p>

            <WaitlistForm
              state={state}
              formAction={formAction}
              idPrefix="bottom"
            />
          </div>

          <footer className="w-full max-w-4xl mx-auto mt-auto text-center pt-10">
            <div className="w-full h-px bg-neutral-200 mb-8 blur-[1px]"></div>
            <p className="text-xs md:text-sm text-neutral-400 font-medium leading-relaxed max-w-3xl mx-auto">
              BTC Domains is built on the Orobit protocol &mdash; Bitcoin-native
              smart contracts with hybrid post-quantum cryptography. All
              registered names are Bitcoin-native NFTs, fully tradeable on the
              Orobit marketplace.
            </p>
          </footer>
        </section>
      </div>
    </>
  );
};

export default WishlistClient;
