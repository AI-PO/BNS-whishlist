"use client";

import { ColumnDef } from "@tanstack/react-table";
import { addDays, format, isBefore } from "date-fns";

import { cn } from "@/lib/utils";

import { ActionsCell } from "./components/ActionsCell";

export type DomainTableRow = {
  id: number;
  domain: string;
  contractId: string;
  expiry_date: Date;
  transferable: boolean;
  status?: string;
};

export const columns: ColumnDef<DomainTableRow>[] = [
  {
    accessorKey: "domain",
    header: () => <div className="max-w-[300px]"></div>,
    size: 300,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div
          className={cn(
            "max-w-[300px] font-semibold text-20 sm:text-24 flex items-center gap-2",
            {
              "opacity-50": status && status !== "active",
            },
          )}
        >
          {row.getValue("domain")}
          {status && (
            <span
              className={cn(
                "rounded px-2 py-0.5 text-xs! font-medium",
                status === "pending"
                  ? "text-yellow-800"
                  : status === "paused"
                    ? "text-gray-600"
                    : status === "expired"
                      ? "text-red-700"
                      : "text-green-700",
              )}
              title={status.charAt(0).toUpperCase() + status.slice(1)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "expiry_date",
    size: 223,
    header: () => {
      return (
        <p className="w-[223px] text-14 sm:text-16 text-neutral-500 font-normal">
          Expiry date
        </p>
      );
    },
    cell: ({ row }) => {
      const dateValue = row.getValue("expiry_date");
      const expiryDate =
        dateValue instanceof Date ? dateValue : new Date(dateValue as string);

      const today = new Date();
      const thirtyDaysFromNow = addDays(today, 30);
      const isExpiringSoon =
        isBefore(expiryDate, thirtyDaysFromNow) && !isBefore(expiryDate, today); // Check if it's in the future but within 30 days

      const formatted = format(expiryDate, "yyyy-MM-dd");
      return (
        <div
          className={cn("flex items-center gap-0.5 w-[223px]", {
            "opacity-50":
              row.original.status && row.original.status !== "active",
          })}
        >
          <div
            className={cn(
              "font-semibold text-[length:20px] sm:text-[length:24px]",
              {
                "text-orange-500": isExpiringSoon,
              },
            )}
          >
            {formatted}
          </div>
          {isExpiringSoon && (
            <button className="p-3 text-16 font-medium text-shadow-[0_6px_10px_rgba(51,54,67,1)]/40 text-shadow-white">
              Renew
            </button>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "",
    size: 100,
    cell: ({ row }) => (
      <ActionsCell
        row={row}
        disabled={!!row.original.status && row.original.status !== "active"}
      />
    ),
  },
];
