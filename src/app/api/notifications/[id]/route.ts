import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { ApiError, handleApiError, requireSession } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;

    await connectToDatabase();
    const deleted = await Notification.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!deleted) throw new ApiError("ไม่พบการแจ้งเตือนนี้", 404);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
