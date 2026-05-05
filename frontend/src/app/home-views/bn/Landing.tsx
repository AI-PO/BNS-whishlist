import { ComMoment } from "./ComMoment/ComMoment";
import { FinalCTA } from "./FinalCTA/FinalCTA";
import { Footer } from "./Footer/Footer";
import { Hero } from "./Hero/Hero";
import { HowItWorks } from "./HowItWorks/HowItWorks";
import { MarketplacePreview } from "./MarketplacePreview/MarketplacePreview";
import { StickyNav } from "./Nav/StickyNav";
import { PremiumNames } from "./PremiumNames/PremiumNames";
import { ProofRow } from "./ProofRow/ProofRow";
import { Quantum } from "./Quantum/Quantum";

export const Landing = () => (
  <>
    <StickyNav />
    <Hero />
    <ProofRow />
    <ComMoment />
    <HowItWorks />
    <Quantum />
    <MarketplacePreview />
    <PremiumNames />
    <FinalCTA />
    <Footer />
  </>
);
