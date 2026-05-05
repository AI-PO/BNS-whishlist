"use client";

import { EmptyTableInfo } from "@/common/components/EmptyTableInfo";
import { DataTable } from "@/common/components/ui/data-table";
import { OrderStatus, OrderWithDomain } from "@/common/types/business";

import { columns } from "./columns";
import { OrderEventStatus, OrderPaymentMethod, OrderTableRow } from "./types";

export const OrdersTab: React.FC<{
  orders: OrderWithDomain[];
}> = ({ orders }) => {
  const data: OrderTableRow[] = orders.map((order) => {
    const status =
      order.status === OrderStatus.COMPLETED
        ? OrderEventStatus.SUCCESSFUL
        : OrderEventStatus.PENDING;

    const paymentMethod = OrderPaymentMethod.CRYPTO;

    return {
      id: order.id,
      createdAt: new Date(order.created_at),
      event: order.type,
      domainName: order.domains.domain,
      paymentMethod,
      status,
      actions: <div />,
    };
  });

  if (!orders.length) {
    return (
      <div className="my-[60px]">
        <EmptyTableInfo title={<span>You have no orders yet.</span>} />
      </div>
    );
  }

  return (
    <div className="max-w-[820px] h-full min-h-0 flex-1 flex flex-col relative overflow-auto">
      <DataTable columns={columns} data={data} />
    </div>
  );
};
