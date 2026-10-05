import { NextResponse } from "next/server";
import { handleApiError, requireSession } from "@/lib/api";
import { markAllNotificationsRead } from "@/services/notification.service";
import { connectToDatabase } from "@/lib/mongodb";

export async function PATCH() {
  try {
    const session = await requireSession();
    await connectToDatabase();
    await markAllNotificationsRead(session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
