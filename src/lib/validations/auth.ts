import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล"),
  email: z
    .string()
    .email("อีเมลไม่ถูกต้อง")
    .refine((v) => v.endsWith("@spu.ac.th"), "กรุณาใช้อีเมล @spu.ac.th"),
  studentId: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
  phone: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined))
    .refine((v) => !v || /^0[0-9]{9}$/.test(v), "เบอร์โทรไม่ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
  role: z.enum(["STUDENT", "STAFF"]).default("STUDENT"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
