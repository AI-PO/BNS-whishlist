"use client";

import { Section } from "@/common/components/Section";

import { RegisterButton } from "./components/RegisterButton";
import { RegisterDetailsSection } from "./components/RegisterDetailsSection";
import { RegisterOrderSummarySection } from "./components/RegisterOrderSummarySection";
import { RegisterContextProvider } from "./context/RegisterContextProvider";

type Props = {
  domainName: string;
};

export const RegisterPageContent: React.FC<Props> = ({ domainName }) => {
  return (
    <RegisterContextProvider domainName={domainName}>
      <div className="hidden xl:block">
        <DesktopView />
      </div>
      <div className="xl:hidden">
        <MobileView />
      </div>
    </RegisterContextProvider>
  );
};

const DesktopView: React.FC = () => {
  return (
    <div className="flex gap-x-10">
      <Section label="Details">
        <div className="flex flex-col gap-y-[45px] w-[500px]">
          <RegisterDetailsSection />
        </div>
      </Section>
      <div className="flex flex-col gap-y-6">
        <Section label="Order summary">
          <RegisterOrderSummarySection />
        </Section>
        <RegisterButton />
      </div>
    </div>
  );
};

const MobileView: React.FC = () => {
  return (
    <div className="flex flex-col gap-y-[45px] w-full max-w-[660px] md:w-[660px]">
      <Section label="Details">
        <div className="flex flex-col gap-y-[40px]">
          <RegisterDetailsSection />
        </div>
      </Section>
      <Section label="Order summary">
        <RegisterOrderSummarySection />
      </Section>
      <RegisterButton />
    </div>
  );
};
