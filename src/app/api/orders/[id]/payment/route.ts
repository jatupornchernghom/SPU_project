import { NextResponse } from "next/server";
import { handleApiError, requireRole } from "@/lib/api";
import { confirmPayment } from "@/services/order.service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const session = await requireRole(["RESTAURANT_STAFF", "ADMIN"]);
    const { id } = await params;

    const order = await confirmPayment(id, {
      role: session.user.role,
      restaurantId: session.user.restaurantId,
    });

    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
