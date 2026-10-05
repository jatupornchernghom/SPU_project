import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { changePasswordSchema } from "@/lib/validations/auth";
import { ApiError, handleApiError, requireSession } from "@/lib/api";

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    await connectToDatabase();
    const user = await User.findById(session.user.id);
    if (!user) throw new ApiError("ไม่พบผู้ใช้งาน", 404);

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new ApiError("รหัสผ่านปัจจุบันไม่ถูกต้อง", 400);

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
