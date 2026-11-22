import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { PushSubscription } from "@/models/PushSubscription";
import { ApiError, handleApiError, requireSession } from "@/lib/api";
import { vapidPublicKey } from "@/lib/web-push";

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({ p256dh: z.string().min(1).max(200), auth: z.string().min(1).max(100) }),
});

/** The public VAPID key the browser subscribes with (null = push not configured). */
export async function GET() {
  return NextResponse.json({ publicKey: vapidPublicKey });
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!vapidPublicKey) throw new ApiError("ระบบแจ้งเตือนยังไม่ได้ตั้งค่า", 503);
    const { endpoint, keys } = subscriptionSchema.parse(await request.json());

    await connectToDatabase();
    // A device that re-subscribes (or changes account) moves to the current user.
    await PushSubscription.updateOne(
      { endpoint },
      { $set: { userId: session.user.id, keys } },
      { upsert: true }
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireSession();
    const { endpoint } = z.object({ endpoint: z.string() }).parse(await request.json());

    await connectToDatabase();
    await PushSubscription.deleteOne({ endpoint, userId: session.user.id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
