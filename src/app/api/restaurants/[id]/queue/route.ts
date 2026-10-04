import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Queue } from "@/models/Queue";
import { ApiError, handleApiError, requireRole } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await requireRole(["RESTAURANT_STAFF", "ADMIN"]);
    const { id } = await params;

    if (session.user.role === "RESTAURANT_STAFF" && session.user.restaurantId !== id) {
      throw new ApiError("คุณไม่มีสิทธิ์เข้าถึงคิวของร้านนี้", 403);
    }

    await connectToDatabase();
    const queue = await Queue.find({
      restaurantId: id,
      status: { $in: ["ORDER_RECEIVED", "PREPARING", "READY_FOR_PICKUP"] as const },
    }).sort({ createdAt: 1 });

    return NextResponse.json({
      queue: queue.map((q) => ({
        id: q._id.toString(),
        orderId: q.orderId.toString(),
        queueNumber: q.queueNumber,
        status: q.status,
        estimatedWaitTime: q.estimatedWaitTime,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
