import Image from "next/image";

import { 
  Concept1_3DExtrusion,
  Concept2_CryptoGlitch,
  Concept3_LiquidGold,
  Concept4_Interactive3D,
  Concept5_GlassEngraved
} from "./IdentityTextConcepts";
import { RegisterDomainForm } from "./RegisterDomainForm";

export const RegisterDomainView: React.FC = () => {
  return (
    <section
      id="domains"
      data-intersection-threshold={0.5}
      className={
        "relative h-screen-fixed flex flex-col justify-center items-center snap-start w-full overflow-hidden bg-transparent"
      }
    >
      {/* Soft orange aura background */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[50vh] w-[80vw] rounded-full bg-[#f7931a] opacity-[0.04] blur-[100px] pointer-events-none"></div>

      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto w-full z-10 py-10 lg:py-0">
        <h1 className="text-[clamp(3.5rem,8vw,6.5rem)] font-black text-black tracking-tighter leading-[1.02] mb-4">
          Find your{" "}
          {/* USER TESTING:  Uncomment exactly one of these concepts below to test its visual effect! */}
          
          {/* <Concept1_3DExtrusion /> */}
          {/* <Concept2_CryptoGlitch /> */}
          <Concept3_LiquidGold />
          {/* <Concept4_Interactive3D /> */}
          {/* <Concept5_GlassEngraved /> */}
        </h1>
        <h2 className="text-[clamp(1.1rem,2.5vw,1.65rem)] text-neutral-500 max-w-[800px] mx-auto mb-[60px] leading-[1.6] font-medium px-4">
          Register your own .btc domain
        </h2>
        <RegisterDomainForm />
      </div>

      <div className="absolute bottom-[35px] left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10">
        <p className="text-sm md:text-base text-neutral-400 text-center font-bold tracking-wider uppercase mb-2">
          or find your favorite on Marketplace
        </p>
        <svg
          className="w-5 h-5 md:w-6 md:h-6 animate-bounce text-neutral-300 hover:text-black transition-colors"
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
    </section>
  );
};
