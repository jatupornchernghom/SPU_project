import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { handleApiError, requireSession } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;

    await connectToDatabase();
    await Notification.updateOne({ _id: id, userId: session.user.id }, { isRead: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
