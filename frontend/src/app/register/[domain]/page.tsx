 
import { isDomainAvailable } from "@/app/actions/domains";
import { checkIsDomainValid } from "@/utils/checkIsDomainValid";

import { DomainInvalidView } from "./components/DomainInvalidView";
import { DomainNotAvailableView } from "./components/DomainNotAvailableView";
import { RegisterPageHeader } from "./components/RegisterPageHeader";
import { RegisterPageContent } from "./RegisterPageContent";

const RegisterDomainPage = async ({
  params,
}: {
  params: Promise<{ domain: string }>;
  }) => {
  const domainName = decodeURIComponent((await params).domain);
  const domainAvailable = await isDomainAvailable(domainName);

  if (!domainAvailable) {
    return <DomainNotAvailableView domainName={domainName} />;
  }

  const { isValid } = checkIsDomainValid(domainName.split(".")[0]);
  if (!isValid) {
    return <DomainInvalidView domainName={domainName} />;
  }

  return (
    <div className="relative h-full max-w-190 w-full md:w-fit md:max-w-none flex flex-col m-auto pt-[96px] sm:pt-[136px] pb-8 px-4 gap-y-[26px]">
      <div className="pointer-events-none absolute inset-0 -z-10 bn-dot-grid opacity-30" />
      <RegisterPageHeader domainName={domainName} />
      <RegisterPageContent domainName={domainName} />
    </div>
  );
};

export default RegisterDomainPage;
