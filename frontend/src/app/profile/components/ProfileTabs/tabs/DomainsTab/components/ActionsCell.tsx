import { Row } from "@tanstack/react-table";
import { format, isBefore, subDays } from "date-fns";
import { useState } from "react";

import { Tooltip } from "@/common/components/Tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover";
import { cn } from "@/lib/utils";

import { TransferDomainDialog } from "./TransferDomainDialog";
import { DomainTableRow } from "../columns";
import { DeleteDomainDialog } from "./DeleteDomainDialog";
import { RenewDomainDialog } from "./RenewDomainDialog";

export const ActionsCell = ({
  row,
  disabled,
}: {
  row: Row<DomainTableRow>;
  disabled: boolean;
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const dateValue = row.getValue("expiry_date");
  const expiryDate =
    dateValue instanceof Date ? dateValue : new Date(dateValue as string);

  const today = new Date();
  const renewalDate = subDays(expiryDate, 30);
  const isExpiringSoon =
    !isBefore(today, renewalDate) && !isBefore(expiryDate, today);

  const formattedRenewalData = format(renewalDate, "yyyy-MM-dd");

  const closePopover = () => {
    setIsPopoverOpen(false);
  };

  return (
    <div className="flex justify-end w-full">
      <Popover
        open={isPopoverOpen}
        onOpenChange={(open) => !disabled && setIsPopoverOpen(open)}
      >
        <PopoverTrigger disabled={disabled}>
          <div
            className={cn(
              "button button-secondary text-neutral-600 shadow-sm hover:shadow-md",
              {
                "opacity-50": disabled,
              },
            )}
          >
            Options
          </div>
        </PopoverTrigger>
        <PopoverContent
          sideOffset={10}
          side="bottom"
          align="start"
          className="w-[230px] p-4"
        >
          <div className="flex flex-col">
            {/* <button className="text-16 font-medium py-3 text-start">
              Settings
            </button> */}
            <TransferDomainDialog
              supabaseDomainId={row.original.id}
              disabled={!row.original.transferable}
              contractId={row.original.contractId}
              domainName={row.original.domain}
              onCloseDialog={closePopover}
            />
            <Tooltip
              triggerAsChild
              disabled={!isExpiringSoon}
              trigger={
                <div>
                  <RenewDomainDialog
                    supabaseDomainId={row.original.id}
                    contractId={row.original.contractId}
                    domainName={row.original.domain}
                    expiryDate={expiryDate}
                    disabled={!isExpiringSoon}
                    onCloseDialog={closePopover}
                  />
                </div>
              }
              content={`Possible from ${formattedRenewalData}`}
            />
            <DeleteDomainDialog
              supabaseDomainId={row.original.id}
              disabled={!row.original.transferable}
              contractId={row.original.contractId}
              domainName={row.original.domain}
              onCloseDialog={closePopover}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
