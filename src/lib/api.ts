import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import type { UserRole } from "@/types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError("กรุณาเข้าสู่ระบบ", 401);
  }
  return session;
}

export async function requireRole(roles: UserRole[]) {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) {
    throw new ApiError("คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้", 403);
  }
  return session;
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "ข้อมูลไม่ถูกต้อง", details: error.flatten() },
      { status: 400 }
    );
  }
  const err = error as { status?: number; message?: string };
  if (typeof err?.status === "number") {
    return NextResponse.json({ error: err.message ?? "เกิดข้อผิดพลาด" }, { status: err.status });
  }
  console.error(error);
  return NextResponse.json({ error: "เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
}
