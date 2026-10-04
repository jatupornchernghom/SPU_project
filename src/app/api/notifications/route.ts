import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { handleApiError, requireSession } from "@/lib/api";
import { serializeNotification } from "@/lib/serialize";

export async function GET() {
  try {
    const session = await requireSession();
    await connectToDatabase();

    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ notifications: notifications.map(serializeNotification) });
  } catch (error) {
    return handleApiError(error);
  }
}
