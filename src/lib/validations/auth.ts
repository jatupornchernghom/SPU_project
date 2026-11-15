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
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]+@spumail\.net$/, "กรุณาใช้อีเมล @spumail.net (ใช้ได้เฉพาะ a-z, 0-9, . _ -)"),
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

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน"),
  newPassword: z.string().min(8, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
