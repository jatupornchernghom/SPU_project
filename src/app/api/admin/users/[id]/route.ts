import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { ApiError, handleApiError, requireRole } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await requireRole(["ADMIN"]);
    const { id } = await params;
    if (!isValidObjectId(id)) throw new ApiError("ไม่พบผู้ใช้นี้", 404);
    if (id === session.user.id) throw new ApiError("ลบบัญชีของตัวเองไม่ได้", 400);

    await connectToDatabase();
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new ApiError("ไม่พบผู้ใช้นี้", 404);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
