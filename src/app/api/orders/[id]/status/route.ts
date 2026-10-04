import { NextResponse } from "next/server";
import { updateOrderStatusSchema } from "@/lib/validations/order";
import { handleApiError, requireRole } from "@/lib/api";
import { updateOrderStatus } from "@/services/order.service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireRole(["RESTAURANT_STAFF", "ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const { status } = updateOrderStatusSchema.parse(body);

    const order = await updateOrderStatus(id, status, {
      role: session.user.role,
      restaurantId: session.user.restaurantId,
    });

    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
