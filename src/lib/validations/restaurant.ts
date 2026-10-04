import { z } from "zod";
import { isValidPromptPayId } from "@/lib/promptpay";

export const restaurantInputSchema = z.object({
  name: z.string().min(2),
  description: z.string(),
  image: z.string(),
  location: z.string().min(1),
  category: z.string().min(1),
  isOpen: z.boolean(),
  openingHours: z.string(),
  averagePreparationTime: z.number().int().min(1),
  rating: z.number().min(0).max(5),
  queuePrefix: z
    .string()
    .min(1)
    .max(2)
    .transform((v) => v.toUpperCase()),
  promptPayId: z
    .string()
    .min(1, "กรุณากรอก PromptPay ID ของร้าน")
    .refine(isValidPromptPayId, "ต้องเป็นเบอร์โทร 10 หลัก, เลขบัตรประชาชน 13 หลัก, หรือ e-Wallet ID 15 หลัก"),
});

export const restaurantUpdateSchema = restaurantInputSchema.partial();

export const menuInputSchema = z.object({
  restaurantId: z.string().min(1),
  name: z.string().min(2),
  description: z.string(),
  image: z.string(),
  price: z.number().min(0),
  category: z.string().min(1),
  rating: z.number().min(0).max(5),
  isAvailable: z.boolean(),
  preparationTime: z.number().int().min(1),
  popular: z.boolean(),
});

export const menuUpdateSchema = menuInputSchema.partial().omit({ restaurantId: true });
