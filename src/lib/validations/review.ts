import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, "กรุณาให้คะแนน").max(5),
  comment: z.string().trim().max(300, "รีวิวยาวเกิน 300 ตัวอักษร").default(""),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
