import { z } from "zod";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/types";

/** Per-dish cap. The cart enforces the same number so checkout never fails on it. */
export const MAX_ITEM_QUANTITY = 50;

export const PICKUP_TIME_OPTIONS = ["ASAP", "11:30", "11:45", "12:00", "12:15", "12:30"] as const;

export const createOrderSchema = z.object({
  restaurantId: z.string().min(1),
  items: z
    .array(
      z.object({
        menuId: z.string().min(1),
        quantity: z
          .number()
          .int()
          .min(1, "จำนวนต้องอย่างน้อย 1")
          .max(MAX_ITEM_QUANTITY, `สั่งได้สูงสุด ${MAX_ITEM_QUANTITY} จานต่อเมนู`),
        note: z.string().trim().max(100, "หมายเหตุยาวเกิน 100 ตัวอักษร").optional(),
      })
    )
    .min(1, "ตะกร้าว่างเปล่า"),
  pickupTime: z.enum(PICKUP_TIME_OPTIONS),
  paymentMethod: z.enum(PAYMENT_METHODS),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});
