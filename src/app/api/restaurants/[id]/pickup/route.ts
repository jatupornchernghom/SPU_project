import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiError, handleApiError, requireRole } from "@/lib/api";
import { completeOrderByPickupCode } from "@/services/order.service";

type Params = { params: Promise<{ id: string }> };

const pickupSchema = z.object({ pickupCode: z.string().length(6) });

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireRole(["RESTAURANT_STAFF", "ADMIN"]);
    const { id } = await params;

    if (session.user.role === "RESTAURANT_STAFF" && session.user.restaurantId !== id) {
      throw new ApiError("คุณไม่มีสิทธิ์เข้าถึงร้านนี้", 403);
    }

    const body = await request.json();
    const { pickupCode } = pickupSchema.parse(body);

    const order = await completeOrderByPickupCode(id, pickupCode);
    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
