import { z } from "zod";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/types";

export const PICKUP_TIME_OPTIONS = ["ASAP", "11:30", "11:45", "12:00", "12:15", "12:30"] as const;

export const createOrderSchema = z.object({
  restaurantId: z.string().min(1),
  items: z
    .array(
      z.object({
        menuId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
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
