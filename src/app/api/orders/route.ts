import { NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validations/order";
import { handleApiError, requireRole, requireSession } from "@/lib/api";
import { createOrder, listOrdersForRestaurant, listOrdersForUser } from "@/services/order.service";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const url = new URL(request.url);
    const restaurantId = url.searchParams.get("restaurantId");

    if (restaurantId) {
      await requireRole(["RESTAURANT_STAFF", "ADMIN"]);
      const orders = await listOrdersForRestaurant(restaurantId);
      return NextResponse.json({ orders });
    }

    const orders = await listOrdersForUser(session.user.id);
    return NextResponse.json({ orders });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const input = createOrderSchema.parse(body);

    const order = await createOrder(session.user.id, input);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
