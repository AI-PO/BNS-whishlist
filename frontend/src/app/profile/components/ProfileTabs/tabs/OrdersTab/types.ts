import { OrderType } from "@/common/types/business";

export enum OrderEventStatus {
  SUCCESSFUL = "SUCCESSFUL",
  PENDING = "PENDING",
  UNPAID = "UNPAID",
  FAILED = "FAILED",
}

export enum OrderPaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  CRYPTO = "CRYPTO",
}

export type OrderTableRow = {
  id: number;
  event: OrderType;
  paymentMethod: OrderPaymentMethod;
  status: OrderEventStatus;
  createdAt: Date;
  domainName: string;
  actions: React.ReactNode;
};
