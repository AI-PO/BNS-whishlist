import { EmptyTableInfo } from "@/common/components/EmptyTableInfo";
import { DataTable } from "@/common/components/ui/data-table";
import { Domain, Listing, SupabaseStatus } from "@/common/types/business";

import { columns, DomainTableRow } from "./columns";

export const DomainsTab: React.FC<{
  userListings: Listing[];
  userDomains: Domain[];
}> = ({ userListings, userDomains }) => {
  if (!userDomains.length)
    return (
      <div className="my-[60px]">
        <EmptyTableInfo title={<span>You have no domains yet.</span>} />
      </div>
    );

  const data: DomainTableRow[] = userDomains.map((domain) => {
    return {
      id: domain.id,
      domain: domain.domain,
      expiry_date: new Date(domain.expiry),
      contractId: domain.contract_id,
      transferable: !userListings.some(
        (listing) =>
          listing.contractId === domain.contract_id &&
          listing.status !== SupabaseStatus.ENDED
      ) && domain.status === "active",
      status: domain.status,
    };
  });

  return (
    <div className="max-w-[760px] h-full min-h-0 flex-1 flex flex-col relative overflow-auto">
      <DataTable columns={columns} data={data} />
    </div>
  );
};
