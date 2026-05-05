import { RevealOnView, SectionEyebrow } from "@/common/components/bn";

import { WaitlistForm } from "./WaitlistForm";

export const FinalCTA = () => (
  <section
    id="waitlist"
    className="relative bg-bn-bg text-bn-text py-20 md:py-36 overflow-hidden"
  >
    <div
      aria-hidden
      className="absolute inset-0 bn-grid-dark bn-grid-fade pointer-events-none opacity-60"
    />
    <div
      aria-hidden
      className="absolute inset-0 bn-orange-glow opacity-80 pointer-events-none"
    />

    <div className="relative mx-auto max-w-[720px] px-5 lg:px-10 text-center">
      <RevealOnView className="mb-8 flex justify-center">
        <SectionEyebrow chapter="06" label="Reserve" tone="dark" />
      </RevealOnView>

      <RevealOnView delay={0.05}>
        <h2 className="bn-section-title text-bn-text mb-5">
          Your name. On Bitcoin.{" "}
          <span className="text-bn-accent">Forever.</span>
        </h2>
      </RevealOnView>

      <RevealOnView delay={0.12}>
        <p className="bn-sub text-bn-text-2 mb-12 max-w-[520px] mx-auto">
          Join the waitlist. Priority access to the first drop goes to names
          reserved here.
        </p>
      </RevealOnView>

      <RevealOnView delay={0.2}>
        <div className="text-left">
          <WaitlistForm />
        </div>
      </RevealOnView>
    </div>
  </section>
);
