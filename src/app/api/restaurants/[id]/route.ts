import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Restaurant } from "@/models/Restaurant";
import { getRestaurantById } from "@/services/restaurant.service";
import { restaurantUpdateSchema } from "@/lib/validations/restaurant";
import { ApiError, handleApiError, requireRole } from "@/lib/api";
import { serializeRestaurant } from "@/lib/serialize";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const restaurant = await getRestaurantById(id);
    if (!restaurant) throw new ApiError("ไม่พบร้านอาหารนี้", 404);
    return NextResponse.json({ restaurant });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const input = restaurantUpdateSchema.parse(body);

    await connectToDatabase();
    const restaurant = await Restaurant.findByIdAndUpdate(id, input, { new: true });
    if (!restaurant) throw new ApiError("ไม่พบร้านอาหารนี้", 404);

    return NextResponse.json({ restaurant: serializeRestaurant(restaurant) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;

    await connectToDatabase();
    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) throw new ApiError("ไม่พบร้านอาหารนี้", 404);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
