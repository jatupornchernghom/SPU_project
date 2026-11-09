import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { Restaurant } from "@/models/Restaurant";
import { ApiError, handleApiError, requireRole } from "@/lib/api";
import { serializeRestaurant } from "@/lib/serialize";

type Params = { params: Promise<{ id: string }> };

const statusSchema = z.object({ isOpen: z.boolean() });

/** Lets a restaurant's own staff open/close their stall (admins can too). */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireRole(["RESTAURANT_STAFF", "ADMIN"]);
    const { id } = await params;

    if (session.user.role === "RESTAURANT_STAFF" && session.user.restaurantId !== id) {
      throw new ApiError("คุณไม่มีสิทธิ์เข้าถึงร้านนี้", 403);
    }

    const body = await request.json();
    const { isOpen } = statusSchema.parse(body);

    await connectToDatabase();
    const restaurant = await Restaurant.findByIdAndUpdate(id, { isOpen }, { new: true });
    if (!restaurant) throw new ApiError("ไม่พบร้านอาหารนี้", 404);

    return NextResponse.json({ restaurant: serializeRestaurant(restaurant) });
  } catch (error) {
    return handleApiError(error);
  }
}
