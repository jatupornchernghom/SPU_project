import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { registerSchema } from "@/lib/validations/auth";
import { ApiError, handleApiError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = registerSchema.parse(body);

    await connectToDatabase();
    const existing = await User.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new ApiError("อีเมลนี้ถูกใช้งานแล้ว", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await User.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      studentId: input.studentId,
      phone: input.phone || undefined,
      role: input.role,
    });

    return NextResponse.json({ id: user._id.toString() }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
