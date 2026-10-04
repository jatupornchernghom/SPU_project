import type { OrderStatus, PaymentStatus } from "@/types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  ORDER_RECEIVED: "รับออเดอร์แล้ว",
  PREPARING: "กำลังปรุง",
  READY_FOR_PICKUP: "พร้อมรับ",
  COMPLETED: "รับอาหารแล้ว",
  CANCELLED: "ยกเลิก",
};

export const ORDER_STATUS_STYLE: Record<OrderStatus, { fg: string; bg: string }> = {
  ORDER_RECEIVED: { fg: "var(--status-waiting-fg)", bg: "var(--status-waiting-bg)" },
  PREPARING: { fg: "var(--status-preparing-fg)", bg: "var(--status-preparing-bg)" },
  READY_FOR_PICKUP: { fg: "var(--status-ready-fg)", bg: "var(--status-ready-bg)" },
  COMPLETED: { fg: "var(--status-ready-fg)", bg: "var(--status-ready-bg)" },
  CANCELLED: { fg: "var(--status-cancelled-fg)", bg: "var(--status-cancelled-bg)" },
};

export const ORDER_STATUS_STEPS: OrderStatus[] = [
  "ORDER_RECEIVED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "COMPLETED",
];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "รอชำระเงิน",
  PAID: "ชำระเงินแล้ว",
  FAILED: "ชำระเงินไม่สำเร็จ",
  REFUNDED: "คืนเงินแล้ว",
};
