import { NextResponse } from "next/server";
import { ApiError, handleApiError, requireSession } from "@/lib/api";
import { getOrderById } from "@/services/order.service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const order = await getOrderById(id, {
      id: session.user.id,
      role: session.user.role,
      restaurantId: session.user.restaurantId,
    });
    if (!order) throw new ApiError("ไม่พบคำสั่งซื้อนี้", 404);

    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
