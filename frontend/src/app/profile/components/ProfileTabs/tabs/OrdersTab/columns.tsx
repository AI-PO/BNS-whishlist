"use client";

import { Info } from "@phosphor-icons/react/dist/ssr";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Button } from "@/common/components/Button";
import { Tooltip } from "@/common/components/Tooltip";
import { TruncatedText } from "@/common/components/TruncatedText";
import { OrderType } from "@/common/types/business";
import { cn } from "@/lib/utils";

import { OrderEventStatus, OrderTableRow } from "./types";

export const columns: ColumnDef<OrderTableRow>[] = [
  {
    accessorKey: "event",
    size: 300,
    header: () => {
      return (
        <p className="w-[300px] text-14 sm:text-16 text-neutral-500 font-normal">
          Event
        </p>
      );
    },
    cell: ({ row }) => {
      const event = row.getValue("event");
      const domainName = (
        <TruncatedText
          name={row.original.domainName}
          truncateLengthThreshold={10}
          charsAtStart={4}
          charsAtEnd={7}
          fullScreen
          tooltip
        />
      );
      const createdAtValue = row.original.createdAt;
      const createdAt =
        createdAtValue instanceof Date
          ? createdAtValue
          : new Date(createdAtValue as string);

      let formattedCreatedAt;

      try {
        formattedCreatedAt = format(createdAt, "dd.MM.yyyy HH:mm");
      } catch (error) {
        console.error("Error formatting date:", error);
        return <p className="text-red-500">Invalid date</p>;
      }

      const eventText = (() => {
        switch (event) {
          case OrderType.PURCHASE:
            return <span>Purchase ({domainName})</span>;
          case OrderType.TRANSFER:
            return <span>Transfer ({domainName})</span>;
          case OrderType.RECEIVE:
            return <span>Transfer ({domainName})</span>;
          case OrderType.SALE:
            return <span>Sale ({domainName})</span>;
          case OrderType.BUY:
            return <span>Purchase ({domainName})</span>;
          case OrderType.RENEW:
            return <span>Renew ({domainName})</span>;
          case OrderType.PAUSE:
            return <span>Pause ({domainName})</span>;
          case OrderType.DELETE:
            return <span>Delete ({domainName})</span>;
          default:
            return `Unknown event for domain ${domainName}`;
        }
      })();

      return (
        <div className="flex items-center gap-x-1.5">
          <Tooltip
            trigger={<Info size={12} />}
            content={
              <div className="w-[215px] text-16">
                <p>{formattedCreatedAt}</p>
              </div>
            }
          />
          <p className="text-20 font-semibold">{eventText}</p>
        </div>
      );
    },
  },
  // TODO: Uncomment when Stripe integration is ready
  // {
  //   accessorKey: "paymentMethod",
  //   size: 100,
  //   header: () => {
  //     return (
  //       <p className="w-[223px] text-14 sm:text-16 text-neutral-500 font-normal">
  //         Payment
  //       </p>
  //     );
  //   },
  //   cell: ({ row }) => {
  //     const paymentMethod = row.getValue("paymentMethod");

  //     return (
  //       <p className="text-20 font-medium">
  //         {paymentMethod === OrderPaymentMethod.CREDIT_CARD ? "Card" : "Crypto"}
  //       </p>
  //     );
  //   },
  // },
  {
    accessorKey: "status",
    header: () => {
      return (
        <p className="w-[223px] text-14 sm:text-16 text-neutral-500 font-normal">
          Status
        </p>
      );
    },
    size: 150,
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <div
          className={cn("text-20 font-medium", {
            "text-green-700": status === OrderEventStatus.SUCCESSFUL,
            "text-yellow-800":
              status === OrderEventStatus.PENDING ||
              status === OrderEventStatus.UNPAID,
            "text-negative-red": status === OrderEventStatus.FAILED,
          })}
        >
          {status === OrderEventStatus.SUCCESSFUL && "Successful"}
          {status === OrderEventStatus.PENDING && "Pending"}
          {status === OrderEventStatus.UNPAID && "Unpaid"}
          {status === OrderEventStatus.FAILED && "Failed"}
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "",
    size: 90,
    cell: ({ row }) => {
      const status = row.getValue("status");

      if (status !== OrderEventStatus.UNPAID)
        return <div className="h-[46px]" />; // placeholder for alignment

      return (
        <div className="flex justify-end w-full">
          <Button variant="secondary" size="S">
            Pay now
          </Button>
        </div>
      );
    },
  },
];
